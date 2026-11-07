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
  const touchLayout = window.matchMedia('(hover: none) and (pointer: coarse)');
  let touchInput = false;
  let index = new Map();
  let active = null;
  let pinned = false;
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
      if (pinned) active.setAttribute('aria-expanded', 'false');
    }
    active = null;
    pinned = false;
  }

  function scheduleClose() {
    if (pinned) return;
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

  function glosses(entries) {
    return entries ? [...new Set(entries.map(entry => entry.pron))] : ['이 자료에 등록되지 않은 한자입니다.'];
  }

  function showTooltip(element, character, entries, interactive = false) {
    closeTooltip();
    active = element;
    pinned = interactive;
    active.classList.add('active');
    tooltip.setAttribute('role', interactive ? 'group' : 'tooltip');
    if (interactive) {
      active.setAttribute('aria-controls', 'tooltip');
      active.setAttribute('aria-expanded', 'true');
      tooltip.setAttribute('aria-label', `${character} 풀이`);
    } else {
      active.setAttribute('aria-describedby', 'tooltip');
      tooltip.removeAttribute('aria-label');
    }
    tooltip.replaceChildren();
    const heading = document.createElement('div');
    heading.className = 'character';
    heading.textContent = character;
    tooltip.append(heading);
    for (const pron of glosses(entries)) {
      const row = document.createElement('div');
      row.className = 'pron';
      row.textContent = pron;
      tooltip.append(row);
    }
    const foot = document.createElement(interactive ? 'a' : 'div');
    foot.className = 'tip-footer';
    foot.textContent = entries ? '클릭하여 자세히 보기 ↗' : '클릭하여 글자 검색 ↗';
    if (interactive) {
      foot.href = element.href;
      foot.target = element.target;
      foot.rel = element.rel;
    }
    tooltip.append(foot);
    tooltip.hidden = false;
    positionTooltip();
    if (interactive) foot.focus({preventScroll: true});
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
      const description = entries ? glosses(entries).join(', ') : '자료에 없는 한자';
      const action = touchLayout.matches ? '풀이 열기' : '네이버 한자사전 새 탭에서 열기';
      element.setAttribute('aria-label', `${character}, ${description}, ${action}`);
      element.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') showTooltip(element, character, entries);
      });
      element.addEventListener('pointerleave', scheduleClose);
      element.addEventListener('focus', () => {
        if (!pinned && !touchInput && !touchLayout.matches) showTooltip(element, character, entries);
      });
      element.addEventListener('blur', () => { if (!pinned) closeTooltip(); });
      element.addEventListener('click', event => {
        const fromTouch = event.pointerType === 'touch' || (!event.pointerType && event.detail > 0 && touchInput);
        if (!fromTouch && !touchLayout.matches) return;
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (pinned && active === element) {
          closeTooltip();
          return;
        }
        showTooltip(element, element.textContent, entries, true);
      });
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
  root.addEventListener('pointerdown', event => { touchInput = event.pointerType === 'touch'; });
  document.addEventListener('keydown', event => {
    touchInput = false;
    if (event.key === 'Escape') {
      if (pinned && tooltip.contains(document.activeElement)) active.focus({preventScroll: true});
      closeTooltip();
    }
  });
  document.addEventListener('pointerdown', event => {
    const anchor = pinned ? active : reading;
    if (!tooltip.contains(event.target) && !anchor.contains(event.target)) closeTooltip();
  });
  window.addEventListener('resize', positionTooltip);
  window.addEventListener('scroll', event => {
    if (!pinned || event.target !== tooltip) closeTooltip();
  }, true);
  source.value = '';
  try { acceptDictionary(window.HANJA_DATA, 'naver-ext.json'); }
  catch { status.textContent = '기본 사전 자료를 읽지 못했습니다. data.js 파일이 있는지 확인해 주세요.'; render(); }
})();
