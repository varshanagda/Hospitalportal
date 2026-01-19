// Node.js script to list all doctors from the database
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'authdb',
  port: Number(process.env.DB_PORT) || 5433, // Note: 5433 for localhost, 5432 for docker internal
});

async function listDoctors() {
  try {
    const query = `
      SELECT 
          d.id as doctor_id,
          u.id as user_id,
          u.email,
          u.full_name as doctor_name,
          u.phone,
          d.specialization,
          d.qualification,
          d.experience_years,
          d.consultation_fee,
          d.is_approved,
          d.created_at
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC;
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      console.log('No doctors found in the database.');
      return;
    }

    console.log('\n=== All Doctors ===\n');
    result.rows.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.doctor_name || 'N/A'}`);
      console.log(`   Email: ${doctor.email}`);
      console.log(`   Specialization: ${doctor.specialization || 'N/A'}`);
      console.log(`   Approved: ${doctor.is_approved ? 'Yes' : 'No'}`);
      console.log(`   Phone: ${doctor.phone || 'N/A'}`);
      console.log(`   Doctor ID: ${doctor.doctor_id}`);
      console.log(`   User ID: ${doctor.user_id}`);
      console.log('');
    });

    console.log(`Total: ${result.rows.length} doctor(s)\n`);

  } catch (error) {
    console.error('Error listing doctors:', error.message);
  } finally {
    await pool.end();
  }
}

listDoctors();
