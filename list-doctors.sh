#!/bin/bash

# Script to list all doctors from the database
# Database connection details
DB_HOST="localhost"
DB_PORT="5433"
DB_NAME="authdb"
DB_USER="postgres"
DB_PASSWORD="postgres"

echo "Listing all doctors..."
echo "======================"
echo ""

# Run the query using psql
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
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
"

echo ""
echo "Done!"
