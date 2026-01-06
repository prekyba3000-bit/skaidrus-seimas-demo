import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import axios from "axios";
import { syncMps } from "../../scripts/sync-mps";
import { db } from "../../scripts/sync-mps"; // assuming db is exported for test purposes
import { mps } from "../../drizzle/schema";

// Mock environment variables for test DB (use a temporary Postgres container or pg-mem in real setup)
process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/testdb";

vi.mock("axios");

const mockApiResponse = `
<SeimoInformacija>
  <SeimoKadencija>
    <SeimoNarys @_asmens_id="123" @_vardas="Jonas" @_pavardė="Jonaitis" @_iškėlusi_partija="Partija A" frakcija="Frakcija X" apygarda="Apygarda 1" apygardos_nr="1" @_kadencijų_skaičius="2" />
  </SeimoKadencija>
</SeimoInformacija>
`;

describe("syncMps", () => {
  beforeAll(async () => {
    // Ensure test DB is clean – in a real CI you would spin up a temporary DB container.
    await db.delete(mps);
  });

  afterAll(async () => {
    await db.delete(mps);
    // Close DB connection if needed
    // await db.$close();
  });

  it("should fetch MPs, validate and upsert them", async () => {
    // @ts-ignore – mock axios.get to return our XML string
    (axios.get as any).mockResolvedValue({ data: mockApiResponse });

    await syncMps();

    const inserted = await db.select().from(mps).where(mps.seimasId.eq("123"));
    expect(inserted).toHaveLength(1);
    const mp = inserted[0];
    expect(mp.name).toBe("Jonas Jonaitis");
    expect(mp.party).toBe("Partija A");
    expect(mp.faction).toBe("Frakcija X");
    expect(mp.district).toBe("Apygarda 1");
  });
});
