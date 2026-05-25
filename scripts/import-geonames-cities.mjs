#!/usr/bin/env node
import fs from "node:fs";
import readline from "node:readline";
import { MongoClient } from "mongodb";

const filePath = process.argv[2];
const dbName = process.env.MONGODB_DB_NAME || "hm_visuals";
const collectionName = "testimonial_locations";

if (!filePath) {
  console.error("Usage: node scripts/import-geonames-cities.mjs ./cities1000.txt");
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI.");
  process.exit(1);
}

function normalizeLocationValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values.map(normalizeLocationValue).filter(Boolean))];
}

function parseLine(line) {
  const fields = line.split("\t");

  if (fields.length < 19) return null;

  const geonameId = fields[0];
  const name = fields[1];
  const asciiName = fields[2];
  const alternateNames = fields[3];
  const lat = Number(fields[4]);
  const lon = Number(fields[5]);
  const featureClass = fields[6];
  const countryCode = fields[8];
  const admin1Code = fields[10] || null;
  const population = Number(fields[14]) || 0;

  if (!geonameId || !name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (featureClass !== "P") return null;

  const aliases = alternateNames
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 24);

  const label = countryCode ? `${name}, ${countryCode}` : name;
  const searchNames = unique([name, asciiName, label, ...aliases]);

  return {
    geonameId,
    label,
    name,
    asciiName,
    countryCode,
    admin1Code,
    lat,
    lon,
    population,
    searchNames,
    updatedAt: new Date(),
  };
}

async function main() {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.createIndex({ geonameId: 1 }, { unique: true });
    await collection.createIndex({ searchNames: 1 });
    await collection.createIndex({ countryCode: 1, population: -1 });
    await collection.createIndex({ population: -1 });

    const stream = fs.createReadStream(filePath, { encoding: "utf8" });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let operations = [];
    let processed = 0;
    let skipped = 0;

    for await (const line of rl) {
      const doc = parseLine(line);

      if (!doc) {
        skipped += 1;
        continue;
      }

      operations.push({
        updateOne: {
          filter: { geonameId: doc.geonameId },
          update: {
            $set: doc,
            $setOnInsert: { createdAt: new Date() },
          },
          upsert: true,
        },
      });

      if (operations.length >= 1000) {
        await collection.bulkWrite(operations, { ordered: false });
        processed += operations.length;
        operations = [];
        process.stdout.write(`\rImported/updated ${processed.toLocaleString()} records...`);
      }
    }

    if (operations.length > 0) {
      await collection.bulkWrite(operations, { ordered: false });
      processed += operations.length;
    }

    console.log(
      `\nDone. Imported/updated: ${processed.toLocaleString()}. Skipped: ${skipped.toLocaleString()}.`
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});