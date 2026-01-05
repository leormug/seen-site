SECURITY_CHECK_BEFORE_PUBLIC.md

# 🔐 Security Check – Run Before Making Repo Public

Run these commands from the repo root.

## 1) Confirm repo
pwd
git remote -v

## 2) Confirm ignores
cat .gitignore

Must include:
.env
.env.*
*.pem
*.p8
AuthKey_*.p8
*.p12
*.cer
*.mobileprovision

## 3) Check tracked secrets
git ls-files | egrep -i "\.env|\.p8|\.pem|\.p12|secret|token|key"

## 4) Scan full history
git grep -nE "(OPENAI|STRIPE|POLAR|SUPABASE|AWS|AZURE|GOOGLE).{0,30}(:|=)\s*[^ \n]+" $(git rev-list --all)
git grep -nE "ghp_[A-Za-z0-9]{20,}|github_pat_|sk-[A-Za-z0-9]{20,}" $(git rev-list --all)
git grep -nE "BEGIN (RSA|EC|OPENSSH) PRIVATE KEY" $(git rev-list --all)

## If anything shows up
1. Revoke the key immediately
2. Remove from repo
3. Purge history if needed