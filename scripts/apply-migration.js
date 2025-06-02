import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyMigration() {
  try {
    // Check if connection string exists
    if (!process.env.NEON_DB_CONNECTION_STRING) {
      throw new Error('NEON_DB_CONNECTION_STRING is not defined in environment variables');
    }

    console.log('🔗 Connecting to database...');
    const sql = neon(process.env.NEON_DB_CONNECTION_STRING);

    // Read the migration file
    const migrationPath = join(__dirname, '..', 'lib', 'db', 'migrations', '0000_silky_logan.sql');
    console.log('📄 Reading migration file:', migrationPath);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split by statement breakpoints and filter out empty statements
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await sql(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        throw error;
      }
    }

    console.log('🎉 Migration applied successfully!');
    console.log('📋 Created tables:');
    console.log('  - users (authentication)');
    console.log('  - plans (activity plans)');
    console.log('  - activities (plan activities)');
    console.log('  - plan_status_history (audit trail)');
    console.log('🔧 Created enums:');
    console.log('  - facility_type');
    console.log('  - plan_status');
    console.log('  - program');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration(); 