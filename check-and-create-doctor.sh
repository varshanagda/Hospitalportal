#!/bin/bash

# Script to check if doctors exist and create a test doctor if needed
API_URL="http://localhost:5001"

echo "Checking for existing doctors..."
echo "================================"
echo ""

# First, let's try to create a test doctor account
echo "Creating test doctor account..."
echo ""

response=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "password": "doctor123",
    "role": "doctor",
    "full_name": "Dr. John Smith",
    "phone": "1234567890"
  }')

echo "Response: $response"
echo ""

# Now list doctors again
echo "Listing all doctors..."
echo "======================"
cd backend
node list-doctors.js
