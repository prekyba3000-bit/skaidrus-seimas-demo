import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);

async function checkConstraint() {
  try {
    // Check if unique constraint exists
    const constraints = await client`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'mp_stats'
      AND constraint_type = 'UNIQUE';
    `;

    console.log("Constraints on mp_stats table:");
    console.log(constraints);

    // If constraint doesn't exist, add it
    if (
      constraints.length === 0 ||
      !constraints.find(c => c.constraint_name === "mp_stats_mp_id_unique")
    ) {
      console.log("\nAdding unique constraint on mp_id...");
      await client`
        ALTER TABLE mp_stats
        ADD CONSTRAINT mp_stats_mp_id_unique UNIQUE (mp_id);
      `;
      console.log("✅ Constraint added successfully!");
    } else {
      console.log("\n✅ Unique constraint already exists!");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

checkConstraint();
