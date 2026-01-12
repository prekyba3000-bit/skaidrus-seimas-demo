import { sql } from "drizzle-orm";
import { getDb } from "../server/services/database";

/**
 * Manual migration script to create the activities table
 * Run with: pnpm exec tsx scripts/migrate-activities.ts
 */

async function migrateActivities() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("🔧 Creating activities table...");

  try {
    // Create activities table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activities (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        type varchar(50) NOT NULL,
        mp_id integer NOT NULL,
        bill_id integer,
        session_vote_id integer,
        metadata json NOT NULL,
        is_highlighted boolean DEFAULT false,
        is_new boolean DEFAULT true,
        category varchar(100) NOT NULL,
        created_at timestamp DEFAULT now()
      );
    `);

    console.log("✅ Activities table created");

    // Add foreign key constraints
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'activities_mp_id_mps_id_fk'
        ) THEN
          ALTER TABLE activities ADD CONSTRAINT activities_mp_id_mps_id_fk 
            FOREIGN KEY (mp_id) REFERENCES mps(id);
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'activities_bill_id_bills_id_fk'
        ) THEN
          ALTER TABLE activities ADD CONSTRAINT activities_bill_id_bills_id_fk 
            FOREIGN KEY (bill_id) REFERENCES bills(id);
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'activities_session_vote_id_session_votes_id_fk'
        ) THEN
          ALTER TABLE activities ADD CONSTRAINT activities_session_vote_id_session_votes_id_fk 
            FOREIGN KEY (session_vote_id) REFERENCES session_votes(id);
        END IF;
      END $$;
    `);

    console.log("✅ Foreign key constraints added");
    console.log("🎉 Migration complete!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateActivities();
