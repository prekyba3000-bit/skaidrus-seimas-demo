import { getDb } from "../server/services/database";
import * as schema from "../drizzle/schema";

/**
 * Seed script to generate mock activity feed data
 * Run with: pnpm exec tsx scripts/seed-activities.ts
 */

const activityTypes = ["vote", "comment", "document", "session", "achievement"];
const categories = {
  vote: "legislation",
  comment: "discussion",
  document: "documents",
  session: "sessions",
  achievement: "achievements",
};

// Sample metadata for each activity type
const voteMetadata = [
  {
    billTitle: "Dėl Lietuvos Respublikos aplinkos apsaugos įstatymo pakeitimo",
    voteChoice: "for",
  },
  {
    billTitle: "Dėl mokesčių reformos",
    voteChoice: "against",
  },
  {
    billTitle: "Dėl švietimo sistemos tobulinimo",
    voteChoice: "abstain",
  },
  {
    billTitle: "Dėl sveikatos apsaugos finansavimo",
    voteChoice: "for",
  },
];

const commentMetadata = [
  {
    billTitle: "Dėl mokesčių reformos",
    commentPreview: "Pritariu šiam įstatymui, tačiau siūlau...",
    commentFull:
      "Pritariu šiam įstatymui, tačiau siūlau papildyti 15 straipsnį nuostata dėl smulkaus verslo lengvatų.",
    commentLength: 120,
  },
  {
    billTitle: "Dėl aplinkos apsaugos",
    commentPreview: "Būtina didinti atsakomybę už...",
    commentFull:
      "Būtina didinti atsakomybę už taršos mažinimo įsipareigojimų nevykdymą. Siūlau griežtesnes sankcijas.",
    commentLength: 98,
  },
];

const documentMetadata = [
  {
    documentTitle: "Komiteto ataskaita Nr. KA-234",
    documentType: "report",
    fileSize: "2.4 MB",
  },
  {
    documentTitle: "Ekspertų nuomonė dėl klimato kaitos",
    documentType: "expert_opinion",
    fileSize: "1.8 MB",
  },
];

const sessionMetadata = [
  {
    sessionTitle: "Seimo posėdis Nr. 145",
    participationType: "attended",
    duration: 180,
  },
  {
    sessionTitle: "Seimo posėdis Nr. 146",
    participationType: "spoke",
    duration: 240,
  },
];

const achievementMetadata = [
  {
    title: "100 Balsavimų",
    description: "Dalyvavo 100 balsavimų per mėnesį",
    rarity: "rare",
  },
  {
    title: "Aktyvus diskutuotojas",
    description: "Pateikė 50 komentarų šį mėnesį",
    rarity: "common",
  },
  {
    title: "Įstatymų kūrėjas",
    description: "Inicijavo 10 įstatymų projektų",
    rarity: "epic",
  },
];

async function seedActivities() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🌱 Starting activity seed...");

  // Get all MPs to assign activities to them
  const mps = await db.select().from(schema.mps).limit(30);

  if (mps.length === 0) {
    console.error("❌ No MPs found in database. Please seed MPs first.");
    process.exit(1);
  }

  const bills = await db.select().from(schema.bills).limit(10);

  let seedCount = 0;
  const activitiesToCreate = [];

  // Generate 50 varied activities
  for (let i = 0; i < 50; i++) {
    const type = activityTypes[i % activityTypes.length];
    const mp = mps[i % mps.length];
    const bill = bills.length > 0 ? bills[i % bills.length] : null;

    let metadata;
    let billId = null;

    switch (type) {
      case "vote":
        metadata = voteMetadata[i % voteMetadata.length];
        billId = bill?.id || null;
        break;
      case "comment":
        metadata = commentMetadata[i % commentMetadata.length];
        billId = bill?.id || null;
        break;
      case "document":
        metadata = documentMetadata[i % documentMetadata.length];
        break;
      case "session":
        metadata = sessionMetadata[i % sessionMetadata.length];
        break;
      case "achievement":
        metadata = achievementMetadata[i % achievementMetadata.length];
        break;
    }

    activitiesToCreate.push({
      type,
      mpId: mp.id,
      billId,
      sessionVoteId: null,
      metadata,
      isHighlighted: i % 10 === 0, // Every 10th activity is highlighted
      isNew: i < 10, // First 10 are marked as new
      category: categories[type as keyof typeof categories],
      createdAt: new Date(Date.now() - i * 1000 * 60 * 30), // Space them out by 30 minutes
    });
  }

  // Batch insert all activities
  for (const activity of activitiesToCreate) {
    await db.insert(schema.activities).values(activity);
    seedCount++;
  }

  console.log(`✅ Seeded ${seedCount} activity events`);
  console.log(`📊 Breakdown:`);
  console.log(
    `   - Vote: ${activitiesToCreate.filter(a => a.type === "vote").length}`
  );
  console.log(
    `   - Comment: ${activitiesToCreate.filter(a => a.type === "comment").length}`
  );
  console.log(
    `   - Document: ${activitiesToCreate.filter(a => a.type === "document").length}`
  );
  console.log(
    `   - Session: ${activitiesToCreate.filter(a => a.type === "session").length}`
  );
  console.log(
    `   - Achievement: ${activitiesToCreate.filter(a => a.type === "achievement").length}`
  );

  process.exit(0);
}

seedActivities().catch(error => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
