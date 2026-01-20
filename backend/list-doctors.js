// Script to list all doctors from the database
// Set environment variables for localhost connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.DB_NAME = process.env.DB_NAME || 'authdb';
process.env.DB_PORT = process.env.DB_PORT || '5433'; // Use 5433 for localhost (Docker mapped port)

const pool = require('./src/db');

// Use top-level await instead of async function (ES2022)
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
    console.log('\n❌ No doctors found in the database.\n');
  } else {
    console.log('\n=== All Doctors in Database ===\n');
    result.rows.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.doctor_name || 'N/A'}`);
      console.log(`   📧 Email: ${doctor.email}`);
      console.log(`   🏥 Specialization: ${doctor.specialization || 'N/A'}`);
      console.log(`   ✅ Approved: ${doctor.is_approved ? 'Yes' : 'No'}`);
      console.log(`   📞 Phone: ${doctor.phone || 'N/A'}`);
      if (doctor.qualification) console.log(`   🎓 Qualification: ${doctor.qualification}`);
      if (doctor.experience_years) console.log(`   💼 Experience: ${doctor.experience_years} years`);
      if (doctor.consultation_fee) console.log(`   💰 Fee: $${doctor.consultation_fee}`);
      console.log(`   🆔 Doctor ID: ${doctor.doctor_id} | User ID: ${doctor.user_id}`);
      console.log(`   📅 Created: ${new Date(doctor.created_at).toLocaleString()}`);
      console.log('');
    });

    console.log(`\n📊 Total: ${result.rows.length} doctor(s)\n`);
  }
} catch (error) {
  console.error('❌ Error listing doctors:', error.message);
  console.error(error.stack);
} finally {
  await pool.end();
  process.exit(0);
}
