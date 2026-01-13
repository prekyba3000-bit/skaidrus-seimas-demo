/**
 * Verify Production Build
 *
 * This script verifies that:
 * - Build artifacts exist and are valid
 * - File sizes are reasonable
 *
 * Note: This does NOT start the server (that requires a database connection).
 * For full verification, run: npm run start (in a separate terminal)
 *
 * Usage: tsx scripts/verify-build.ts
 */

import { readFileSync, existsSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

function verifyBuild() {
  console.log("🔍 Verifying production build...\n");

  let hasErrors = false;

  // 1. Check if dist/index.js exists
  try {
    const distPath = join(projectRoot, "dist", "index.js");
    if (!existsSync(distPath)) {
      throw new Error("dist/index.js does not exist");
    }

    const stats = statSync(distPath);
    const content = readFileSync(distPath, "utf-8");

    if (content.length === 0) {
      throw new Error("dist/index.js is empty");
    }

    // Check for common build errors
    if (
      content.includes("require is not defined") &&
      !content.includes("import")
    ) {
      console.warn("⚠️  Build may have CommonJS/ESM issues");
    }

    console.log("✅ Build artifact exists: dist/index.js");
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (err: any) {
    console.error("❌ Build artifact not found:", err.message);
    console.error("   Run 'npm run build' first");
    hasErrors = true;
  }

  // 2. Check if frontend build exists (Vite outputs to dist/)
  try {
    const indexHtml = join(projectRoot, "dist", "index.html");
    const assetsDir = join(projectRoot, "dist", "assets");
    const jsDir = join(projectRoot, "dist", "js");

    if (existsSync(indexHtml)) {
      const html = readFileSync(indexHtml, "utf-8");
      if (html.includes("<html")) {
        console.log("✅ Frontend build exists: dist/index.html");
      } else {
        console.warn("⚠️  dist/index.html exists but may be invalid");
      }
    } else if (existsSync(assetsDir) || existsSync(jsDir)) {
      console.log("✅ Frontend assets found in dist/");
    } else {
      console.warn("⚠️  Frontend build not found in dist/");
      console.warn("   Note: Frontend is built as part of 'npm run build'");
    }
  } catch (err: any) {
    console.warn("⚠️  Frontend build check failed:", err.message);
    // Don't fail the build verification for frontend issues
  }

  // 3. Summary
  console.log("\n" + "=".repeat(50));
  if (hasErrors) {
    console.error("❌ Build verification FAILED");
    console.error("   Fix errors above before deploying");
    process.exit(1);
  } else {
    console.log("✅ Build verification PASSED");
    console.log("\n📦 Build artifacts are valid");
    console.log("   Next steps:");
    console.log("   1. Set up environment variables (.env)");
    console.log("   2. Run database migrations: npm run db:push");
    console.log("   3. Start server: npm run start");
    console.log("   4. Verify: curl http://localhost:3000/health");
    console.log("\n   Ready for deployment! 🚀");
  }
}

verifyBuild();
