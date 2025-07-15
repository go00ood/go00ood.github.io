#!/usr/bin/env bash

set -e

REPO="git@github.com:go00ood/go00ood.github.io.git"
BRANCH="gh-pages"
MSG="site updated: $(date '+%Y-%m-%d %H:%M:%S')"

JEKYLL_ENV=production bundle exec jekyll build

cd _site

# 🔽 기존 remote 제거 (중복 방지)
git init
git remote remove origin 2>/dev/null || true
git remote add origin $REPO
git checkout -b $BRANCH

git add .
git commit -m "$MSG"
git push -f origin $BRANCH

cd ..
rm -rf _site/.git

echo "✅ 배포 완료: https://go00ood.github.io"
