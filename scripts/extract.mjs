#!/usr/bin/env node

/**
 * Scholarship data extraction script.
 *
 * 1. Fetches all scholarships from the UVic API
 * 2. Parses and cleans the raw HTML data
 * 3. Batches scholarships and sends them to an LLM (via opencode CLI)
 *    to extract structured application requirements
 * 4. Writes enriched data to data/scholarships.json
 *
 * Supports resuming - if data/scholarships.json already exists with
 * some enriched entries, it will skip those and continue from where it left off.
 *
 * Usage:
 *   node scripts/extract.mjs
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const OUTPUT_FILE = join(DATA_DIR, "scholarships.json");
const RAW_CACHE_FILE = join(DATA_DIR, "raw-api-response.json");

const API_URL = "https://webfilters.uvic.ca/api/scholarships";
const BATCH_SIZE = 15;
const MODEL = "ollama/glm-5:cloud";

// ── Helpers ──────────────────────────────────────────────────────────

function stripHtml(html) {
  return html
    .replace(/<a[^>]*href=['"]([^'"]*)['"'][^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractNameAndUrl(html) {
  const match = html.match(/<a[^>]*href=['"]([^'"]*)['"'][^>]*>(.*?)<\/a>/i);
  if (match) {
    return {
      name: match[2]
        .replace(/<[^>]+>/g, "")
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&")
        .trim(),
      url: match[1],
    };
  }
  return { name: stripHtml(html), url: null };
}

function extractDescription(html) {
  const match = html.match(/<\/a>(.*)/is);
  if (match) {
    return stripHtml(match[1]);
  }
  return stripHtml(html);
}

function parseScholarship(row, index) {
  const nameCell = row[0]?.text || "";
  const { name, url } = extractNameAndUrl(nameCell);
  const description = extractDescription(nameCell);
  const deadline = row[1]?.text || "";
  const amount = row[2]?.text || "";
  const departments = row[3]?.tags || [];
  const applicationRequired = row[4]?.tags || [];
  const renewable = row[5]?.tags || [];
  const studentFocus = row[6]?.tags || [];
  const awardType = row[7]?.tags || [];

  return {
    id: index,
    name,
    url,
    description,
    deadline: deadline.trim(),
    amount: amount.trim(),
    departments,
    applicationRequired:
      applicationRequired.includes("Required") ? true :
      applicationRequired.includes("Not Required") ? false :
      null,
    renewable: renewable.includes("Yes"),
    studentFocus,
    awardType,
    // Enriched fields - to be filled by LLM
    enriched: null,
  };
}

// ── LLM Extraction ──────────────────────────────────────────────────

function buildPrompt(batch) {
  const scholarshipData = batch.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    deadline: s.deadline,
    amount: s.amount,
    applicationRequired: s.applicationRequired,
    departments: s.departments,
  }));

  return `You are a data extraction assistant. Given the following scholarship descriptions from the University of Victoria, extract structured information for each one.

For EACH scholarship, return a JSON object with these fields:
- "id": the scholarship id (pass through from input)
- "documents": string array of required documents (e.g. ["Letter of reference (400 words max)", "Cover letter (500 words max)", "Coach's reference letter", "Practica reports"]). If no specific documents are mentioned, return an empty array [].
- "whereToApply": one of: "UVic Online Tools", "Faculty website", "Department", "Automatic - no application needed", or a specific description if mentioned
- "applyUrl": a direct URL if one is mentioned in the description, otherwise null
- "eligibilitySummary": a 1-2 sentence plain-English summary of who qualifies (year, program, criteria)
- "financialNeed": boolean, true if financial need is mentioned as a preference or requirement
- "yearRequirement": string like "3rd or 4th year", "entering final year", "2nd year", etc. or null if not specified

IMPORTANT:
- Return ONLY a valid JSON array, no markdown fencing, no explanation
- If the scholarship says "No application required", set whereToApply to "Automatic - no application needed" and documents to []
- Be precise about document requirements - only include what is explicitly mentioned

Here are the scholarships:

${JSON.stringify(scholarshipData, null, 2)}

Return the JSON array now:`;
}

function callLLM(prompt) {
  const escapedPrompt = prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  const tmpFile = join(DATA_DIR, "tmp-prompt.txt");
  writeFileSync(tmpFile, prompt, "utf-8");

  try {
    const result = execSync(
      `opencode run -m "${MODEL}" "$(cat "${tmpFile}")"`,
      {
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 10,
        timeout: 120000,
        cwd: join(__dirname, ".."),
      }
    );
    return result;
  } catch (err) {
    console.error("LLM call failed:", err.message);
    return null;
  }
}

function extractJsonFromResponse(response) {
  if (!response) return null;

  // Try to find a JSON array in the response
  // First, try the whole thing
  try {
    const parsed = JSON.parse(response.trim());
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Try to find [...] in the response
  const arrayMatch = response.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {}
  }

  // Try to find it within markdown code fences
  const fenceMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }

  return null;
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("=== UVic Scholarship Data Extraction ===\n");

  // Step 1: Fetch raw data (or use cache)
  let rawData;
  if (existsSync(RAW_CACHE_FILE)) {
    console.log("Using cached API response...");
    rawData = JSON.parse(readFileSync(RAW_CACHE_FILE, "utf-8"));
  } else {
    console.log("Fetching scholarships from UVic API...");
    const response = await fetch(API_URL);
    rawData = await response.json();
    writeFileSync(RAW_CACHE_FILE, JSON.stringify(rawData, null, 2));
    console.log(`Cached API response to ${RAW_CACHE_FILE}`);
  }

  const totalCount = rawData.display?.total || rawData.data?.length || 0;
  console.log(`Total scholarships: ${totalCount}\n`);

  // Step 2: Parse all scholarships
  const scholarships = rawData.data.map((row, i) => parseScholarship(row, i));
  console.log(`Parsed ${scholarships.length} scholarships\n`);

  // Step 3: Load existing progress
  let existing = [];
  if (existsSync(OUTPUT_FILE)) {
    existing = JSON.parse(readFileSync(OUTPUT_FILE, "utf-8"));
    console.log(`Found existing data with ${existing.length} entries`);
  }

  const enrichedIds = new Set(
    existing.filter((s) => s.enriched !== null).map((s) => s.id)
  );
  console.log(`Already enriched: ${enrichedIds.size} scholarships`);

  // Merge existing enriched data
  for (const s of scholarships) {
    const existingEntry = existing.find((e) => e.id === s.id);
    if (existingEntry?.enriched) {
      s.enriched = existingEntry.enriched;
    }
  }

  // Step 4: Batch and enrich unenriched scholarships
  const unenriched = scholarships.filter((s) => s.enriched === null);
  console.log(`Remaining to enrich: ${unenriched.length}\n`);

  if (unenriched.length === 0) {
    console.log("All scholarships already enriched! Nothing to do.");
    // Still save in case parsing changed
    writeFileSync(OUTPUT_FILE, JSON.stringify(scholarships, null, 2));
    // Also save filter metadata
    saveFilterMetadata(rawData);
    return;
  }

  const batches = [];
  for (let i = 0; i < unenriched.length; i += BATCH_SIZE) {
    batches.push(unenriched.slice(i, i + BATCH_SIZE));
  }

  console.log(
    `Processing ${batches.length} batches of ${BATCH_SIZE}...\n`
  );

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchIds = batch.map((s) => s.id);
    console.log(
      `Batch ${i + 1}/${batches.length} (IDs: ${batchIds[0]}-${batchIds[batchIds.length - 1]})...`
    );

    const prompt = buildPrompt(batch);
    const response = callLLM(prompt);
    const enrichments = extractJsonFromResponse(response);

    if (enrichments && Array.isArray(enrichments)) {
      let matched = 0;
      for (const enrichment of enrichments) {
        const scholarship = scholarships.find((s) => s.id === enrichment.id);
        if (scholarship) {
          scholarship.enriched = {
            documents: enrichment.documents || [],
            whereToApply: enrichment.whereToApply || "Unknown",
            applyUrl: enrichment.applyUrl || null,
            eligibilitySummary: enrichment.eligibilitySummary || "",
            financialNeed: enrichment.financialNeed || false,
            yearRequirement: enrichment.yearRequirement || null,
          };
          matched++;
        }
      }
      console.log(`  -> Enriched ${matched}/${batch.length} scholarships`);
    } else {
      console.error(`  -> Failed to parse LLM response for batch ${i + 1}`);
      if (response) {
        console.error(
          `  -> Response preview: ${response.substring(0, 200)}...`
        );
      }
    }

    // Save progress after each batch
    writeFileSync(OUTPUT_FILE, JSON.stringify(scholarships, null, 2));
    console.log(`  -> Progress saved\n`);

    // Small delay between batches to be nice
    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Save filter metadata
  saveFilterMetadata(rawData);

  // Final summary
  const finalEnriched = scholarships.filter((s) => s.enriched !== null).length;
  console.log(`\n=== Done ===`);
  console.log(`Enriched: ${finalEnriched}/${scholarships.length}`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

function saveFilterMetadata(rawData) {
  const filtersData = rawData.filters?.[0]?.row || [];
  const metadata = {
    filters: filtersData.map((f) => ({
      label: f.label,
      type: f.type,
      values: f.values || [],
    })),
    total: rawData.display?.total || 0,
    lastUpdated: new Date().toISOString(),
  };
  writeFileSync(
    join(DATA_DIR, "metadata.json"),
    JSON.stringify(metadata, null, 2)
  );
  console.log("Filter metadata saved to data/metadata.json");
}

main().catch(console.error);
