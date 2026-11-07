'use strict';

(() => {
  const root = document.getElementById('hanja-reader');
  if (!root) return;
  const get = id => root.querySelector('#' + id);
  const sample = 'ᄒᆞᆫ 잔 수울 먹져(喫一盞酒) [번역노걸대상:64b]';
  const source = get('source');
  const reading = get('reading');
  const tooltip = get('tooltip');
  const status = get('status');
  let index = new Map();
  let active = null;
  let hideTimer;
  const han = /\p{Script=Han}/u;
  const variation = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/u;

  function buildIndex(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('JSON 형식 오류');
    const next = new Map();
    for (const group of Object.values(data)) {
      if (!Array.isArray(group)) throw new Error('음별 목록 형식 오류');
      for (const entry of group) {
        if (!entry || typeof entry.entryName !== 'string' || typeof entry.pron !== 'string' || !/^[a-f0-9]{32}$/i.test(entry.entryId) || entry.dictType !== 'ccko') {
          throw new Error('한자 항목 형식 오류');
        }
        const entries = next.get(entry.entryName) || [];
        if (!entries.some(e => e.entryId === entry.entryId && e.pron === entry.pron)) entries.push(entry);
        next.set(entry.entryName, entries);
      }
    }
    if (!next.size) throw new Error('빈 사전');
    return next;
  }

  function dictionaryURL(entry) {
    return 'https://hanja.dict.naver.com/#/entry/ccko/' + encodeURIComponent(entry.entryId);
  }

  function closeTooltip() {
    clearTimeout(hideTimer);
    tooltip.hidden = true;
    if (active) {
      active.classList.remove('active');
      active.removeAttribute('aria-describedby');
    }
    active = null;
  }

  function scheduleClose() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(closeTooltip, 140);
  }

  function positionTooltip() {
    if (!active || tooltip.hidden) return;
    const box = active.getBoundingClientRect();
    const tip = tooltip.getBoundingClientRect();
    const left = Math.max(12, Math.min(box.left + box.width / 2 - tip.width / 2, innerWidth - tip.width - 12));
    const above = box.top - tip.height - 10;
    const top = above >= 12 ? above : Math.max(12, Math.min(box.bottom + 10, innerHeight - tip.height - 12));
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function showTooltip(element, character, entries) {
    closeTooltip();
    active = element;
    active.classList.add('active');
    active.setAttribute('aria-describedby', 'tooltip');
    tooltip.replaceChildren();
    const heading = document.createElement('div');
    heading.className = 'character';
    heading.textContent = character;
    tooltip.append(heading);
    const prons = entries ? [...new Set(entries.map(e => e.pron))] : ['이 자료에 등록되지 않은 한자입니다.'];
    for (const pron of prons) {
      const row = document.createElement('div');
      row.className = 'pron';
      row.textContent = pron;
      tooltip.append(row);
    }
    const foot = document.createElement('div');
    foot.className = 'tip-footer';
    foot.textContent = entries ? '클릭하여 자세히 보기 ↗' : '클릭하여 글자 검색 ↗';
    tooltip.append(foot);
    tooltip.hidden = false;
    positionTooltip();
  }

  function render() {
    closeTooltip();
    const fragment = document.createDocumentFragment();
    let plain = '';
    let previous = null;
    let total = 0;
    let found = 0;
    const flush = () => { if (plain) fragment.append(document.createTextNode(plain)); plain = ''; };
    for (const character of source.value) {
      // Keep ideographic variation selectors attached to their original Han character.
      if (variation.test(character) && previous) { previous.append(document.createTextNode(character)); continue; }
      const entries = index.get(character);
      if (!entries && !han.test(character)) { plain += character; previous = null; continue; }
      flush();
      total++;
      if (entries) found++;
      const element = document.createElement('a');
      element.textContent = character;
      element.className = entries ? 'hr-hanja' : 'hr-hanja unknown';
      element.href = entries
        ? dictionaryURL(entries[0])
        : 'https://hanja.dict.naver.com/#/search?query=' + encodeURIComponent(character);
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
      if (entries) {
        element.setAttribute('aria-label', character + ', ' + [...new Set(entries.map(e => e.pron))].join(', ') + ', 네이버 한자사전 새 탭에서 열기');
      } else {
        element.setAttribute('aria-label', character + ', 자료에 없는 한자, 네이버 한자사전 검색 새 탭에서 열기');
      }
      element.addEventListener('pointerenter', () => showTooltip(element, character, entries));
      element.addEventListener('pointerleave', scheduleClose);
      element.addEventListener('focus', () => showTooltip(element, character, entries));
      element.addEventListener('blur', closeTooltip);
      // A long touch reveals the gloss; a normal tap follows the dictionary link.
      let touchTimer;
      let longTouch = false;
      element.addEventListener('pointerdown', event => {
        longTouch = false;
        if (event.pointerType !== 'touch') return;
        touchTimer = setTimeout(() => { longTouch = true; showTooltip(element, character, entries); }, 450);
      });
      for (const eventName of ['pointerup', 'pointercancel', 'pointermove']) element.addEventListener(eventName, () => clearTimeout(touchTimer));
      element.addEventListener('contextmenu', event => { if (longTouch) event.preventDefault(); });
      element.addEventListener('click', event => { if (longTouch) { event.preventDefault(); longTouch = false; } });
      fragment.append(element);
      previous = element;
    }
    flush();
    reading.replaceChildren(fragment);
    reading.hidden = !source.value;
    get('empty').hidden = !!source.value;
    get('count').textContent = total ? `한자 ${total}자 · 풀이 ${found}자` : '';
  }

  function acceptDictionary(data, name) {
    index = buildIndex(data);
    status.textContent = `${name} · ${index.size.toLocaleString('ko-KR')}자 준비됨`;
    render();
  }

  source.addEventListener('input', render);
  get('example').addEventListener('click', () => { source.value = sample; render(); });
  get('clear').addEventListener('click', () => { source.value = ''; render(); source.focus(); });
  tooltip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  tooltip.addEventListener('pointerleave', scheduleClose);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeTooltip(); });
  document.addEventListener('pointerdown', event => { if (!tooltip.contains(event.target) && !reading.contains(event.target)) closeTooltip(); });
  window.addEventListener('resize', positionTooltip);
  window.addEventListener('scroll', closeTooltip, true);
  source.value = '';
  try { acceptDictionary(window.HANJA_DATA, 'naver-ext.json'); }
  catch { status.textContent = '기본 사전 자료를 읽지 못했습니다. data.js 파일이 있는지 확인해 주세요.'; render(); }
})();
