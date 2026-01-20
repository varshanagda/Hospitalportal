#!/bin/bash

# Script to create test accounts for the Medical Appointment Booking System

API_URL="http://localhost:5001"

echo "Creating test accounts..."

# Create Admin Account
echo "Creating admin account..."
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin",
    "full_name": "Admin User",
    "phone": "1234567890"
  }'
echo -e "\n"

# Create Doctor Account
echo "Creating doctor account..."
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "password": "doctor123",
    "role": "doctor",
    "full_name": "Dr. John Smith",
    "phone": "1234567890"
  }'
echo -e "\n"

# Create Patient Account
echo "Creating patient account..."
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "patient123",
    "role": "user",
    "full_name": "Jane Doe",
    "phone": "0987654321"
  }'
echo -e "\n"

echo "Test accounts created!"
echo ""
echo "Login Credentials:"
echo "=================="
echo "Admin:  admin@test.com / admin123"
echo "Doctor: doctor@test.com / doctor123"
echo "Patient: patient@test.com / patient123"
