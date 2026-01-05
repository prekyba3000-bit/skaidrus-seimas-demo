import fs from 'fs';

// Load the scraped data
const assistants2026 = JSON.parse(fs.readFileSync('assistants_2026.json', 'utf-8'));

// Extract assistant names from SQL file
const sqlContent = fs.readFileSync('mp_assistants_data.sql', 'utf-8');
const sqlAssistantNames = new Set<string>();

// Parse the SQL file to extract assistant names
// Format: SELECT id, 'Name', 'Role', 'Phone', 'Email' FROM mps WHERE name = 'MP Name';
const selectMatches = sqlContent.matchAll(/SELECT id, '([^']+)', '([^']+)', '([^']+)', '([^']+)'/g);
for (const match of selectMatches) {
    const name = match[1]; // First captured group is the assistant name
    sqlAssistantNames.add(name);
}

console.log(`=== Comparison Report ===\n`);
console.log(`Assistants in SQL file: ${sqlAssistantNames.size}`);
console.log(`Assistants from live site (2026): ${assistants2026.length}`);
console.log(`Difference: ${assistants2026.length - sqlAssistantNames.size}`);

// Find missing assistants (in 2026 but not in SQL)
const missingAssistants = assistants2026.filter((a: any) => !sqlAssistantNames.has(a.name));

console.log(`\n=== Missing Assistants (${missingAssistants.length}) ===`);

// Group by MP
const missingByMP = new Map<string, any[]>();
for (const assistant of missingAssistants) {
    if (!missingByMP.has(assistant.mpName)) {
        missingByMP.set(assistant.mpName, []);
    }
    missingByMP.get(assistant.mpName)!.push(assistant);
}

console.log(`\nMPs with missing assistants: ${missingByMP.size}`);

// Save detailed report
const report = {
    summary: {
        sqlTotal: sqlAssistantNames.size,
        liveTotal: assistants2026.length,
        missing: missingAssistants.length,
        mpsWithMissingData: missingByMP.size,
    },
    missingAssistants: Array.from(missingByMP.entries()).map(([mp, assistants]) => ({
        mp,
        count: assistants.length,
        assistants,
    })),
};

fs.writeFileSync('assistants_comparison_report.json', JSON.stringify(report, null, 2));
console.log('\nDetailed report saved to: assistants_comparison_report.json');

// Display some examples
console.log(`\n=== Sample Missing Assistants ===`);
for (const [mp, assistants] of Array.from(missingByMP.entries()).slice(0, 10)) {
    console.log(`\n${mp} (${assistants.length} missing):`);
    for (const a of assistants) {
        console.log(`  - ${a.name} (${a.role})`);
    }
}
