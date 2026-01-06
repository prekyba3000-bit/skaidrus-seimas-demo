import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function checkPhoto() {
  const mp = await db.query.mps.findFirst();
  console.log("MP:", mp?.name);
  console.log("Photo URL:", mp?.photoUrl);
  await client.end();
}

checkPhoto();
