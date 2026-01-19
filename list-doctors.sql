-- Query to list all doctors with their user information
SELECT 
    d.id as doctor_id,
    u.id as user_id,
    u.email,
    u.full_name,
    u.phone,
    d.specialization,
    d.qualification,
    d.experience_years,
    d.consultation_fee,
    d.is_approved,
    d.bio,
    d.created_at
FROM doctors d
JOIN users u ON d.user_id = u.id
ORDER BY d.created_at DESC;

-- Alternative: Simple query to see just doctor names and emails
-- SELECT 
--     u.full_name as doctor_name,
--     u.email,
--     d.specialization,
--     d.is_approved
-- FROM doctors d
-- JOIN users u ON d.user_id = u.id
-- ORDER BY u.full_name;
