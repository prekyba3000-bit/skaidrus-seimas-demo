import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  console.log('Connecting to database...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    console.log('Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Get all tables in the database
    const [tables] = await connection.query<any[]>(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()'
    );

    console.log(`Found ${tables.length} tables to drop`);

    // Drop each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME || table.table_name;
      console.log(`Dropping table: ${tableName}`);
      await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    }

    console.log('Re-enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✓ Database reset complete!');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

resetDatabase();
