import { access, readFile } from "fs/promises";
import path, { resolve } from "path";
import { fileURLToPath } from "url";

/**
 * Verifies that security.txt exists and contains required fields.
 * Checks RFC 9116 essentials: Contact, Encryption.
 */
async function verifySecurityTxt() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const filePath = resolve(
    __dirname,
    "..",
    "client",
    "public",
    ".well-known",
    "security.txt"
  );

  try {
    await access(filePath);
  } catch {
    console.error("❌ security.txt not found at", filePath);
    process.exit(1);
  }

  const content = await readFile(filePath, "utf-8");
  const hasContact = new RegExp("^Contact:\\s*", "mi").test(content);
  const hasEncryption = new RegExp("^Encryption:\\s*", "mi").test(content);

  if (!hasContact || !hasEncryption) {
    console.error(
      "❌ security.txt missing required fields:",
      !hasContact ? "Contact" : "",
      !hasEncryption ? "Encryption" : ""
    );
    process.exit(1);
  }

  console.log(
    "✅ security.txt is present and includes Contact and Encryption fields."
  );
}

verifySecurityTxt().catch(err => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
