/**
 * Minimal fake-data seeder: 3 mock bills for quick tests/CI.
 * No API calls, works offline.
 *
 * For real Lithuanian Parliament data (MPs, bills from LRS API):
 *   pnpm run seed:real
 * Or sync incrementally: pnpm run sync:mps && pnpm run sync:bills && pnpm run sync:votes && pnpm run sync:committees
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import {
  bills,
  billSummaries,
  billSponsors,
  votes,
  quizAnswers,
  quizQuestions,
  activities,
  userActivityReads,
  watchlist,
} from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
  console.log("🌱 Seeding database (fake data)...");

  try {
    // Clear tables that reference bills first (FK order), then bills
    console.log("Clearing existing bills and dependent data...");
    await db.delete(userActivityReads);
    await db.delete(activities);
    await db.delete(quizAnswers);
    await db.delete(quizQuestions);
    await db.delete(votes);
    await db.delete(billSponsors);
    await db.delete(billSummaries);
    await db.delete(watchlist);
    await db.delete(bills);

    // Insert 3 static mock bills with different titles (so we can test search)
    const mockBills = [
      {
        seimasId: "TEST-001",
        title: "Dėl pridėtinės vertės mokesčio įstatymo pakeitimo",
        status: "Pateiktas",
        category: "Ekonomika",
        submittedAt: new Date(),
      },
      {
        seimasId: "TEST-002",
        title: "Dėl atsinaujinančių išteklių energetikos",
        status: "Priimtas",
        category: "Aplinka",
        submittedAt: new Date(),
      },
      {
        seimasId: "TEST-003",
        title: "Dėl vietos savivaldos įstatymo",
        status: "Registruotas",
        category: "Teisė",
        submittedAt: new Date(),
      },
    ];

    await db.insert(bills).values(mockBills);

    console.log("✅ Database seeded with 3 fake bills!");
    console.log(
      "   - TEST-001: Dėl pridėtinės vertės mokesčio įstatymo pakeitimo"
    );
    console.log("   - TEST-002: Dėl atsinaujinančių išteklių energetikos");
    console.log("   - TEST-003: Dėl vietos savivaldos įstatymo");
    console.log("");
    console.log("   For real data: pnpm run seed:real");
  } catch (e) {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  }

  process.exit(0);
}

main();
