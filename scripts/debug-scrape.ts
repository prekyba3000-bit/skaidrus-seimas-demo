import axios from "axios";
import { writeFileSync } from "fs";

async function main() {
  const url = "https://e-seimas.lrs.lt/portal/legalAct/lt/TAP/";
  try {
    const res = await axios.get(url);
    console.log("Fetched HTML length:", res.data.length);
    writeFileSync("debug.html", res.data);
    console.log("Saved to debug.html");
  } catch (err) {
    console.error("Error fetching:", err);
  }
}

main().catch(console.error);
