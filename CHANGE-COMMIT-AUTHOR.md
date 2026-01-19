# How to Change Commit Author Name

## Method 1: Change Last Commit Only

```bash
cd /Users/varshanagda/ProjectAuth

# Change the author of the last commit
git commit --amend --author="varshanagda <varsha.nagda@novata.com>" --no-edit

# If already pushed, force push
git push --force-with-lease origin test-sonar-integration
```

## Method 2: Change Multiple Recent Commits

### Change last 5 commits:
```bash
git rebase -i HEAD~5 --exec 'git commit --amend --author="varshanagda <varsha.nagda@novata.com>" --no-edit'
```

### Change all commits in current branch:
```bash
git rebase -i --root --exec 'git commit --amend --author="varshanagda <varsha.nagda@novata.com>" --no-edit'
```

## Method 3: Change All Commits Using Filter-Branch (Advanced)

```bash
git filter-branch --env-filter '
OLD_EMAIL="varsha.nagda@novata.com"
CORRECT_NAME="varshanagda"
CORRECT_EMAIL="varsha.nagda@novata.com"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

## Method 4: Update Git Config for Future Commits

```bash
# For this repository only
git config user.name "varshanagda"
git config user.email "varsha.nagda@novata.com"

# OR for all repositories (global)
git config --global user.name "varshanagda"
git config --global user.email "varsha.nagda@novata.com"
```

## Quick Script to Change Last N Commits

Save this as a script and run it:

```bash
#!/bin/bash
# change-commits.sh

NEW_NAME="varshanagda"
NEW_EMAIL="varsha.nagda@novata.com"
NUM_COMMITS=${1:-5}  # Default to 5 commits

git rebase -i HEAD~$NUM_COMMITS --exec "git commit --amend --author='$NEW_NAME <$NEW_EMAIL>' --no-edit"
```

Usage: `bash change-commits.sh 10` (changes last 10 commits)

## Important Notes:

⚠️ **Force Push Warning**: If you've already pushed commits, you'll need to force push:
```bash
git push --force-with-lease origin test-sonar-integration
```

⚠️ **Team Collaboration**: If others have pulled your commits, coordinate before force pushing.

✅ **Safe Method**: Use `--force-with-lease` instead of `--force` - it's safer.
