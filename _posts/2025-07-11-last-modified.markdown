---
layout: post
title:  "[Github] Github 블로그 jekyll-last-modified-at 오류"
description: 
date:   2025-07-11 
categories: 프로그래밍 blog 

---

## 1. 문제 
- jekyll-last-modified-at를 제대로 설치했고, Actions을 통해 배포함 
- 로컬에서는 업데이트 일자가 마지막 수정 시간과 대응되지만, 깃헙에 올리면 모든 포스트의 업데이트 일자가 수정됨 
- 배포 시점에 모든 페이지가 동일한 last_modified_at으로 처리.

---
- fetch-depth: 0 으로 설정하는 방법이나 jekyll-last-modified-at 오류 문제는 아닌듯했음 
- 로컬에서는 다르게 보임
- sitemap.xml의 lastmod도 전부 동일하게 바뀜 

## 2. 해결 방법 
- 로컬에서 빌드하고 결과만 gh-pages 브랜치에 푸시

- 깃헙 세팅 Pages -> branch 로 바꿈 
- gh-pages 브랜치 비워놓기(최초 1회)

```bash
git checkout --orphan gh-pages
git rm -rf .
New-Item -Path .nojekyll -ItemType File
git add .nojekyll
git commit -m "init gh-pages"
git push origin gh-pages
git checkout main

```

- 루트 폴더에 `deploy.sh` 생성
```bash
#!/usr/bin/env bash

set -e

REPO="git@github.com:go00ood/go00ood.github.io.git" # 수정
BRANCH="gh-pages"
MSG="site updated: $(date '+%Y-%m-%d %H:%M:%S')"

JEKYLL_ENV=production bundle exec jekyll build

cd _site

git init
git remote add origin $REPO
git checkout -b $BRANCH

git add .
git commit -m "$MSG"
git push -f origin $BRANCH

cd ..
rm -rf _site/.git

echo "✅ 배포 완료: https://go00ood.github.io"

```

  - SSH 키 등록 필요함 

---
### 실질적으로 진행


- 로컬에서 `bundle exec jekyll build` 실행 
- Git Bash에서 실행
```
cd /c/programming/go00ood.github.io
./deploy.sh
```