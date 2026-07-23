---
layout: post
title: "내훈·어제내훈·번역소학·소학언해 병렬 코퍼스 뷰어"
description: 내훈, 어제내훈, 번역소학, 소학언해의 대역 코퍼스 조회 및 검색
date: 2026-07-23
categories: 코퍼스 국어사

---

<!-- 검색 및 조작 바 -->
<div class="search-wrapper">
  <input type="text" id="corpus-search-input" placeholder="한자 키, 원문 또는 언해 구절 검색..." />
  <button class="copy-all-btn" onclick="copyAllFormatted()">전체 검색 결과 복사</button>
</div>

<!-- 코퍼스 리스트 출력 영역 -->
<div id="corpus-list"></div>

<!-- 복사 토스트 알림 -->
<div id="toast" class="toast">클립보드에 복사되었습니다!</div>

<style>
/* 입력창 및 검색바 스타일 */
.search-wrapper {
  display: flex;
  gap: 10px;
  max-width: 800px;
  margin-bottom: 20px;
}

#corpus-search-input {
  flex: 1;
  min-height: 2.8em;
  padding: 10px 14px;
  font-size: 1rem;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  box-sizing: border-box;
  font-family: inherit;
  background-color: var(--card-bg, #fff);
  color: var(--text-color, #111);
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

#corpus-search-input:focus {
  outline: none;
  border-color: var(--accent-color, #5a8dee);
  box-shadow: 0 0 0 2px rgba(90, 141, 238, 0.2);
}

.copy-all-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.copy-all-btn:hover {
  background-color: #2196f3;
}

/* 그룹 카드 스타일 */
.group-card {
  max-width: 800px;
  background-color: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: background-color 0.3s, border-color 0.3s;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--accent-color, #5a8dee);
  padding-bottom: 10px;
  margin-bottom: 14px;
}

.key-hanja {
  font-size: 1.15rem;
  font-weight: bold;
  color: var(--text-color, #111);
  letter-spacing: 0.5px;
}

.group-copy-btn {
  background-color: var(--accent-color, #5a8dee);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.group-copy-btn:hover {
  opacity: 0.85;
}

/* 개별 문헌 스타일 */
.doc-item {
  margin-bottom: 10px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.02);
  border-left: 4px solid #cbd5e1;
  border-radius: 0 6px 6px 0;
}

.doc-item.has-data {
  border-left-color: var(--accent-color, #5a8dee);
}

.doc-name {
  font-weight: 700;
  color: var(--text-color, #333);
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.doc-content {
  font-size: 1rem;
  line-height: 1.6;
}

.meta {
  font-size: 0.82rem;
  color: var(--text-muted, #888);
  margin-left: 6px;
}

.chi-text {
  color: #555;
}

.kor-text {
  color: var(--text-color, #111);
  font-weight: 500;
}

/* 토스트 메세지 */
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: var(--tooltip-bg, #333);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: none;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}

/* ✅ 다크모드 대응 */
[data-theme="dark"] .group-card {
  background-color: #1b1b1b;
  border-color: #333;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}

[data-theme="dark"] .doc-item {
  background: rgba(255, 255, 255, 0.04);
}

[data-theme="dark"] .chi-text {
  color: #aaa;
}

[data-theme="dark"] .kor-text {
  color: #eee;
}

[data-theme="dark"] .doc-name {
  color: #ddd;
}
</style>

<script>
let globalCorpusData = [];

(async function () {
  try {
    const res = await fetch('/assets/data/parallel_corpus.xml');
    const xmlString = await res.text();
    parseAndRenderXML(xmlString);
  } catch (err) {
    console.error('Failed to load XML corpus:', err);
  }
})();

function parseAndRenderXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const groups = xmlDoc.querySelectorAll("align_group");

  globalCorpusData = [];

  groups.forEach((group, index) => {
    const keyHanja = group.querySelector("key_hanja") ? group.querySelector("key_hanja").textContent : "";
    const docs = {};

    group.querySelectorAll("document").forEach(doc => {
      const name = doc.getAttribute("name");
      const isNotFound = doc.getAttribute("status") === "not_found";

      if (isNotFound) {
        docs[name] = null;
      } else {
        const mainChi = doc.querySelector("sent[type='main'][lang='chi']");
        const mainKor = doc.querySelector("sent[type='main'][lang='kor']");

        docs[name] = {
          chi: mainChi ? mainChi.textContent : "",
          kor: mainKor ? mainKor.textContent : "",
          vol: mainChi ? (mainChi.getAttribute("vol") || "") : "",
          page: mainChi ? (mainChi.getAttribute("page") || "") : ""
        };
      }
    });

    globalCorpusData.push({
      id: index + 1,
      keyHanja: keyHanja,
      docs: docs
    });
  });

  renderCorpus(globalCorpusData);
}

function renderCorpus(dataList) {
  const listDiv = document.getElementById('corpus-list');
  listDiv.innerHTML = "";

  if (dataList.length === 0) {
    listDiv.innerHTML = "<div style='padding: 20px; color: var(--text-muted, #888);'>검색 결과가 없습니다.</div>";
    return;
  }

  dataList.forEach(group => {
    const card = document.createElement('div');
    card.className = 'group-card';

    let docHtml = "";
    const docOrder = ["내훈", "어제내훈", "번역소학", "소학언해"];

    docOrder.forEach(docName => {
      const item = group.docs[docName];
      if (item) {
        const volInfo = item.vol ? `권${item.vol}: ` : "";
        docHtml += `
          <div class="doc-item has-data">
            <div class="doc-name">${docName}</div>
            <div class="doc-content">
              <span class="kor-text">${item.kor}</span>
              <span class="chi-text">(${item.chi})</span>
              <span class="meta">&lt;${docName} ${volInfo}${item.page}&gt;</span>
            </div>
          </div>
        `;
      } else {
        docHtml += `
          <div class="doc-item">
            <div class="doc-name">${docName}</div>
            <div class="doc-content" style="color: var(--text-muted, #888); font-size: 0.9rem;">[해당 구절 없음]</div>
          </div>
        `;
      }
    });

    card.innerHTML = `
      <div class="group-header">
        <span class="key-hanja">그룹 #${group.id} : ${group.keyHanja}</span>
        <button class="group-copy-btn" onclick="copySingleGroup(${group.id})">복사</button>
      </div>
      ${docHtml}
    `;

    listDiv.appendChild(card);
  });
}

function formatGroupText(group) {
  const docOrder = ["내훈", "어제내훈", "번역소학", "소학언해"];
  let lines = [];

  docOrder.forEach(docName => {
    const item = group.docs[docName];
    if (item && (item.kor || item.chi)) {
      const volText = item.vol ? ` 권${item.vol}:` : "";
      lines.push(`${docName}: ${item.kor}(${item.chi})<${docName}${volText} ${item.page}>`);
    } else {
      lines.push(`${docName}: `);
    }
  });

  return lines.join("\n\n");
}

function copySingleGroup(groupId) {
  const group = globalCorpusData.find(g => g.id === groupId);
  if (group) {
    const textToCopy = formatGroupText(group);
    copyToClipboard(textToCopy);
  }
}

function copyAllFormatted() {
  const textToCopy = globalCorpusData.map(group => formatGroupText(group)).join("\n\n----------------------------------------\n\n");
  copyToClipboard(textToCopy);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast();
  });
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 1800);
}

document.getElementById('corpus-search-input').addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  if (!query) {
    renderCorpus(globalCorpusData);
    return;
  }

  const filtered = globalCorpusData.filter(group => {
    if (group.keyHanja.includes(query)) return true;
    return Object.values(group.docs).some(doc => {
      if (!doc) return false;
      return doc.chi.includes(query) || doc.kor.includes(query);
    });
  });

  renderCorpus(filtered);
});
</script>
