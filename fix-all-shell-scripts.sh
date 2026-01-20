#!/bin/bash

# Script to fix all shell script SonarQube issues
# This fixes: '[[' instead of '[' and stderr redirects

echo "🔧 Fixing all shell script SonarQube issues..."
echo ""

# Find all .sh files in the project root
for script in *.sh; do
    if [[ -f "$script" ]] && [[ "$script" != "fix-all-shell-scripts.sh" ]]; then
        echo "Processing: $script"
        
        # Create a backup
        cp "$script" "$script.bak"
        
        # Fix all conditional tests: [ to [[
        sed -i '' 's/if \[ /if [[ /g' "$script"
        sed -i '' 's/ \];/ ]];/g' "$script"
        sed -i '' 's/ \] ||/ ]] ||/g' "$script"
        sed -i '' 's/ \] &&/ ]] &&/g' "$script"
        sed -i '' 's/if \[\[ \!\([^]]*\)\]\]/if [[ !\1 ]]/g' "$script"
        
        # Fix stderr redirects for error messages
        sed -i '' 's/^\([[:space:]]*\)echo "\(✗\|⚠️\|❌\|Error:\)/\1echo "\2/g' "$script"
        sed -i '' '/echo ".*\(✗\|⚠️\|❌\|Error:\)/s/"$/" >\&2/' "$script"
        
        echo "  ✓ Fixed $script"
    fi
done

echo ""
echo "✅ All shell scripts fixed!"
echo "📝 Backups created with .bak extension"
