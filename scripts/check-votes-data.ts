import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);

async function checkVotesData() {
  try {
    // Check session votes
    const [sessionVotesCount] = await client`
      SELECT COUNT(*) as count FROM session_votes;
    `;
    console.log(`Total session votes: ${sessionVotesCount.count}`);

    // Check session MP votes
    const [sessionMpVotesCount] = await client`
      SELECT COUNT(*) as count FROM session_mp_votes;
    `;
    console.log(`Total session MP votes: ${sessionMpVotesCount.count}`);

    // Sample some session MP votes to see the data structure
    const sampleVotes = await client`
      SELECT * FROM session_mp_votes LIMIT 5;
    `;
    console.log("\nSample session MP votes:");
    console.log(sampleVotes);

    // Check for null mp_id
    const [nullMpIdCount] = await client`
      SELECT COUNT(*) as count FROM session_mp_votes WHERE mp_id IS NULL;
    `;
    console.log(`\nSession MP votes with null mp_id: ${nullMpIdCount.count}`);

    // Check MPs with votes
    const mpsWithVotes = await client`
      SELECT m.name, m.seimas_id, COUNT(smv.id) as vote_count
      FROM mps m
      LEFT JOIN session_mp_votes smv ON m.id = smv.mp_id
      GROUP BY m.id, m.name, m.seimas_id
      HAVING COUNT(smv.id) > 0
      ORDER BY vote_count DESC
      LIMIT 10;
    `;
    console.log("\nTop 10 MPs by vote count:");
    console.log(mpsWithVotes);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

checkVotesData();
