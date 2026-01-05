import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { mps, mpAssistants } from "./drizzle/schema";
import { sql } from "drizzle-orm";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function importAssistants() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Use a more robust connection configuration
  const client = postgres(connectionString, {
    connect_timeout: 30,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
  const db = drizzle(client);

  console.log("Reading scraped assistants data...");
  interface AssistantSourceData {
    mpName: string;
    name: string;
    role: string;
    phone: string;
    email: string;
  }

  const assistantsData = JSON.parse(
    fs.readFileSync("assistants_2026.json", "utf8")
  ) as AssistantSourceData[];

  console.log(
    `Found ${assistantsData.length} assistants. Fetching MP mapping...`
  );

  // Pre-fetch all MPs to avoid repeated queries over the tunnel
  const allMps = await db.select().from(mps);
  
  // Create a helper to normalize names for matching
  const normalizeName = (name: string) => {
    return name.toLowerCase()
      .replace(/\s+/g, ' ')
      .split(' ')
      .sort()
      .join(' ')
      .trim();
  };

  const mpMap = new Map<string, number>();
  allMps.forEach(m => {
    mpMap.set(normalizeName(m.name), m.id);
  });

  console.log(`Mapped ${mpMap.size} MPs. Starting batch import...`);

  const batchSize = 20;
  let count = 0;

  for (let i = 0; i < assistantsData.length; i += batchSize) {
    const batch = assistantsData.slice(i, i + batchSize);
    const valuesToInsert = batch
      .map((a: AssistantSourceData) => {
        const normalizedInputName = normalizeName(a.mpName);
        const mpId = mpMap.get(normalizedInputName);
        if (!mpId) {
          console.warn(`MP not found for assistant ${a.name}: ${a.mpName} (normalized: ${normalizedInputName})`);
          return null;
        }
        return {
          mpId,
          name: a.name,
          role: a.role,
          phone: a.phone,
          email: a.email,
        };
      })
      .filter((v): v is { mpId: number; name: string; role: string; phone: string; email: string; } => v !== null);

    if (valuesToInsert.length > 0) {
      try {
        await db.insert(mpAssistants).values(valuesToInsert);
        count += valuesToInsert.length;
        console.log(
          `Imported batch ${Math.floor(i / batchSize) + 1} (${count}/${assistantsData.length})`
        );
      } catch (error) {
        console.error(`Error importing batch starting at ${i}:`, error);
        // Try individual inserts for this batch if batch fails
        for (const val of valuesToInsert) {
          try {
            await db.insert(mpAssistants).values(val);
            count++;
          } catch (innerError) {
            console.error(
              `Failed individual insert for ${val.name}:`,
              innerError
            );
          }
        }
      }
    }
  }

  console.log(`✓ Assistants import completed. Imported ${count} assistants.`);
  await client.end();
  process.exit(0);
}

importAssistants().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
