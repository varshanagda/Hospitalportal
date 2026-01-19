#!/bin/bash

# Script to update git config with varshanagda username and gmail email

echo "Updating git configuration..."
echo "=============================="
echo ""

# Update git config for this repository
git config user.name "varshanagda"
git config user.email "nagdavarsha997@gmail.com"

echo "✅ Git config updated for this repository:"
echo "   Name: $(git config user.name)"
echo "   Email: $(git config user.email)"
echo ""

# Ask if user wants to set globally
read -p "Do you want to set this globally for all repositories? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git config --global user.name "varshanagda"
    git config --global user.email "nagdavarsha997@gmail.com"
    echo "✅ Git config updated globally"
    echo "   Global Name: $(git config --global user.name)"
    echo "   Global Email: $(git config --global user.email)"
fi

echo ""
echo "Done! Future commits will use:"
echo "   Author: varshanagda <nagdavarsha997@gmail.com>"
