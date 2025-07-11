(async function annotateHanjaAndGugyeol() {
  const res = await fetch('/assets/hanja_reading.json');
  const hanjaMap = await res.json();

  function annotate(node) {
    if (node.nodeType === 3) {
      const originalText = node.nodeValue;
      let text = originalText;

      // 1. 한자 병기
      text = text.replace(/([\u4E00-\u9FFF]+)/g, hanjas => {
        const reading = [...hanjas].map(ch => hanjaMap[ch] || '').join('');
        return reading ? `${hanjas}<small class="hanja">(${reading})</small>` : hanjas;
      });

      // 2. 
        text = text.replace(/([\uF600-\uF8FF])/g, (match, ch, offset, fullText) => {
        const prevChar = fullText[offset - 1];
        const nextChar = fullText[offset + 1];

        // 앞이나 뒤가 구결자라면 병기하지 않음 (둘 다 해당 구결자 무시)
        if (/[\uF600-\uF8FF]/.test(prevChar) || /[\uF600-\uF8FF]/.test(nextChar)) {
            return ch;
        }

        const reading = hanjaMap[ch];
        return reading ? `${ch}<small class="gugyeol">[${reading}]</small>` : ch;
        });

      // ★ DOM 반영은 마지막에 한 번만!
      if (text !== originalText) {
        const span = document.createElement('span');
        span.innerHTML = text;
        node.replaceWith(span);
      }
    } else if (node.nodeType === 1 && node.childNodes) {
      [...node.childNodes].forEach(annotate);
    }
  }

  annotate(document.body);
})();
