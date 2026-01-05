import fs from 'fs';

interface Assistant {
    mpName: string;
    mpId: string;
    name: string;
    role: string;
    phone: string;
    email: string;
}

// Function to convert "LastName FirstName" to "FirstName LastName"
function reverseNameFormat(name: string): string {
    const parts = name.split(' ');
    if (parts.length < 2) return name;

    // Handle cases like "Čmilytė-Nielsen Viktorija" -> "Viktorija Čmilytė-Nielsen"
    const lastName = parts[0];
    const firstName = parts.slice(1).join(' ');
    return `${firstName} ${lastName}`;
}

// Load the scraped assistants data
const assistants: Assistant[] = JSON.parse(fs.readFileSync('assistants_2026.json', 'utf-8'));

// Group assistants by MP (converted to FirstName LastName format)
const assistantsByMP = new Map<string, Assistant[]>();

for (const assistant of assistants) {
    const convertedName = reverseNameFormat(assistant.mpName);
    if (!assistantsByMP.has(convertedName)) {
        assistantsByMP.set(convertedName, []);
    }
    assistantsByMP.get(convertedName)!.push(assistant);
}

// Generate SQL file using name matching (FirstName LastName format)
let sql = `-- MP Assistants Data Import (Generated from live site on 2026-01-05)
-- This script matches MP names to IDs and inserts their assistants
-- Names converted to "FirstName LastName" format to match database
-- Total MPs: ${assistantsByMP.size}
-- Total Assistants: ${assistants.length}

DO $$
BEGIN

`;

// Sort MPs alphabetically by converted name
const sortedMPs = Array.from(assistantsByMP.keys()).sort();

for (const mpName of sortedMPs) {
    const mpAssistants = assistantsByMP.get(mpName)!;

    sql += `-- ${mpName}\n`;

    for (const assistant of mpAssistants) {
        // Escape single quotes in SQL
        const escapedName = assistant.name.replace(/'/g, "''");
        const escapedRole = assistant.role.replace(/'/g, "''");
        const escapedPhone = assistant.phone.replace(/'/g, "''");
        const escapedEmail = assistant.email.replace(/'/g, "''");
        const escapedMPName = mpName.replace(/'/g, "''");

        sql += `INSERT INTO mp_assistants (mp_id, name, role, phone, email)\n`;
        sql += `SELECT id, '${escapedName}', '${escapedRole}', '${escapedPhone}', '${escapedEmail}' FROM mps WHERE name = '${escapedMPName}';\n`;
    }

    sql += `\n`;
}

sql += `END $$;\n`;

// Save the updated SQL file
fs.writeFileSync('mp_assistants_data_fixed.sql', sql, 'utf-8');

console.log('✅ Generated fixed SQL file: mp_assistants_data_fixed.sql');
console.log(`\nStats:`);
console.log(`  MPs: ${assistantsByMP.size}`);
console.log(`  Total Assistants: ${assistants.length}`);
console.log(`  Average per MP: ${(assistants.length / assistantsByMP.size).toFixed(2)}`);

// Show sample
console.log(`\n=== Sample (first 3 MPs) ===`);
let count = 0;
for (const [mpName, mpAssistants] of assistantsByMP) {
    if (count++ >= 3) break;
    console.log(`\n${mpName} (${mpAssistants.length} assistants):`);
    for (const a of mpAssistants.slice(0, 2)) {
        console.log(`  - ${a.name} (${a.role})`);
    }
}
