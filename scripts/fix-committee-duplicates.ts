import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);

async function addCommitteeConstraint() {
  try {
    console.log("Adding unique constraint to committees.name...");

    // First, delete duplicate committees keeping only the first occurrence
    await client`
      DELETE FROM committee_members 
      WHERE committee_id IN (
        SELECT id FROM committees 
        WHERE id NOT IN (
          SELECT MIN(id) FROM committees GROUP BY name
        )
      );
    `;

    await client`
      DELETE FROM committees 
      WHERE id NOT IN (
        SELECT MIN(id) FROM committees GROUP BY name
      );
    `;

    console.log("  - Removed duplicate committees");

    // Add unique constraint
    await client`
      ALTER TABLE committees
      ADD CONSTRAINT committees_name_unique UNIQUE (name);
    `;

    console.log("✅ Constraint added successfully!");

    // Show current state
    const committees = await client`
      SELECT COUNT(*) as count FROM committees;
    `;
    const members = await client`
      SELECT COUNT(*) as count FROM committee_members;
    `;

    console.log(`\nCurrent state:`);
    console.log(`  - Committees: ${committees[0].count}`);
    console.log(`  - Committee members: ${members[0].count}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

addCommitteeConstraint();
