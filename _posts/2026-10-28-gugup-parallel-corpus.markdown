---
layout: post
title: "구급방언해·구급간이방언해 병렬 코퍼스 뷰어"
description: 구급방언해와 구급간이방언해의 유사 대목 및 언해 비교·검색
date: 2026-10-28
categories: 코퍼스 국어사
---

구급방언해와 구급간이방언해의 공통 한문을 기준으로 유사 대목을 모아 비교하는 뷰어입니다. 분절 길이가 다른 대목은 인접한 단위들을 연결했습니다. 자동으로 수집한 **대응 후보**이므로, 개별 대목의 대응 여부는 원문과 함께 확인해야 합니다.

<div id="gugup-corpus" data-xml-url="{{ '/assets/data/gugeupbang_parallel_corpus.xml' | relative_url }}">
<div class="gc-controls">
<input id="gc-search" type="search" aria-label="코퍼스 검색" placeholder="한문·언해·면·그룹 번호 검색..." />
<button id="gc-copy-all" type="button" disabled>검색 결과 전체 복사</button>
</div>
<p id="gc-status" role="status" aria-live="polite">자료를 불러오는 중입니다.</p>
<div id="gc-list"></div>
<div class="gc-pager"><button id="gc-prev" type="button" disabled>이전</button><span id="gc-page">0 / 0</span><button id="gc-next" type="button" disabled>다음</button></div>
<details id="gc-copy-fallback" hidden><summary>복사할 텍스트</summary><p>자동 복사가 지원되지 않습니다. 아래 텍스트를 선택하여 복사하세요.</p><textarea id="gc-copy-text" aria-label="복사할 텍스트" readonly></textarea></details>
<div id="gc-toast" role="status" hidden>복사되었습니다.</div>
</div>

<style>
#gugup-corpus{--gc-border:var(--border-color,#d8dfdd);--gc-bg:var(--card-bg,#fff);--gc-text:var(--text-color,#222);--gc-muted:var(--text-muted,#666);--gc-accent:var(--accent-color,#397d70);color:var(--gc-text);margin:24px 0}
#gugup-corpus *{box-sizing:border-box}
#gugup-corpus .gc-controls{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
#gugup-corpus input{flex:1;min-width:180px;padding:12px;font:inherit;background:var(--gc-bg);color:var(--gc-text);border:1px solid var(--gc-border);border-radius:7px}
#gugup-corpus button{font:inherit;cursor:pointer;border:1px solid var(--gc-border);border-radius:6px;padding:8px 12px;background:var(--gc-bg);color:var(--gc-text)}
#gugup-corpus #gc-copy-all{background:var(--gc-accent);color:white}
#gugup-corpus button:disabled{opacity:.45;cursor:default}
#gugup-corpus button:focus-visible,#gugup-corpus input:focus-visible{outline:2px solid var(--gc-accent);outline-offset:2px}
#gugup-corpus .gc-card{padding:20px;border:1px solid var(--gc-border);border-radius:10px;background:var(--gc-bg);margin:20px 0}
#gugup-corpus .gc-head{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:2px solid var(--gc-accent);padding-bottom:12px}
#gugup-corpus .gc-head h3{font-size:1.05rem;margin:0}
#gugup-corpus .gc-key{font-size:.92rem;overflow-wrap:anywhere;line-height:1.7;color:var(--gc-muted)}
#gugup-corpus .gc-doc{padding:12px 14px;margin-top:14px;border-left:3px solid var(--gc-accent);background:rgba(127,127,127,.045)}
#gugup-corpus h4{font-size:1rem;margin:0 0 10px;color:var(--gc-text)}
#gugup-corpus .gc-label{font-size:.8rem;color:var(--gc-muted);margin-top:12px}
#gugup-corpus .gc-text{font-family:inherit;font-size:1rem;line-height:1.95;white-space:pre-wrap;overflow-wrap:anywhere;margin:4px 0 12px}
#gugup-corpus .gc-chi{color:var(--gc-muted)}
#gugup-corpus .gc-meta{font-size:.8rem;color:var(--gc-muted)}
#gugup-corpus .gc-pager{display:flex;justify-content:center;gap:16px;align-items:center;margin:24px 0}
#gugup-corpus #gc-status{font-size:.9rem;color:var(--gc-muted)}
#gugup-corpus #gc-copy-text{width:100%;height:260px;background:var(--gc-bg);color:var(--gc-text);font:inherit}
#gugup-corpus #gc-toast{position:fixed;bottom:24px;right:24px;background:#253c36;color:white;padding:12px 20px;border-radius:8px;z-index:1000}
#gugup-corpus [hidden]{display:none!important}
[data-theme="dark"] #gugup-corpus{--gc-bg:#202421;--gc-border:#465149;--gc-text:#eee;--gc-muted:#b6c2ba}
@media(max-width:600px){#gugup-corpus .gc-card{padding:12px}#gugup-corpus .gc-doc{padding:10px}#gugup-corpus #gc-copy-all{width:100%}}
</style>

<script>
(function(){
'use strict';
const root=document.getElementById('gugup-corpus');
if(!root)return;
const $=id=>root.querySelector('#'+id);
const children=(node,tag)=>Array.from(node?node.children:[]).filter(n=>n.localName===tag);
const child=(node,tag)=>children(node,tag)[0];
const text=node=>node?node.textContent:'';
const normal=s=>s.normalize('NFC').toLowerCase();
const order=['구급방언해','구급간이방언해'];
let all=[],filtered=[],page=0,timer;const size=20;
function make(tag,value,cls){const n=document.createElement(tag);if(value!==undefined)n.textContent=value;if(cls)n.className=cls;return n}
function location(s){return [['vol','권'],['page','면'],['n','번호']].filter(([key])=>s.getAttribute(key)).map(([key,label])=>label+' '+s.getAttribute(key)).join(' · ')}
function parse(source){const doc=new DOMParser().parseFromString(source,'application/xml');if(doc.querySelector('parsererror'))throw Error('XML 구문이 올바르지 않습니다.');if(doc.documentElement.localName!=='parallel_corpus')throw Error('parallel_corpus 형식의 XML이 아닙니다.');return children(doc.documentElement,'align_group').map((group,index)=>{const docs=children(group,'document').map(d=>({name:d.getAttribute('name')||'',missing:d.getAttribute('status')==='not_found',sents:children(d,'sent').map(s=>({lang:s.getAttribute('lang'),type:s.getAttribute('type')||'main',value:text(s),where:location(s)}))}));const id=group.getAttribute('id')||String(index+1),key=text(child(group,'key_hanja'));return {id,key,docs,search:normal([id,key,...docs.flatMap(d=>[d.name,...d.sents.map(s=>s.value+' '+s.where)])].join(' '))}})}
function render(){const list=$('gc-list');list.replaceChildren();for(const group of filtered.slice(page*size,(page+1)*size)){const card=make('section',undefined,'gc-card'),head=make('div',undefined,'gc-head'),button=make('button','이 그룹 복사');button.type='button';button.addEventListener('click',()=>copy(format(group)));head.append(make('h3',group.id),button);card.append(head);const details=make('details');details.append(make('summary','기준 한문 보기'),make('p',group.key,'gc-key'));card.append(details);for(const name of order){const d=group.docs.find(d=>d.name===name),panel=make('div',undefined,'gc-doc');panel.append(make('h4',name));if(!d||d.missing){panel.append(make('p','해당 구절 없음'));}else{const sorted=[...d.sents.filter(s=>s.lang==='kor'),...d.sents.filter(s=>s.lang!=='kor')];for(const s of sorted){const label=s.lang==='chi'?'한문':s.type==='main'?'언해':'언해 · '+s.type;panel.append(make('div',label,'gc-label'),make('p',s.value,'gc-text'+(s.lang==='chi'?' gc-chi':'')),make('p','〈'+name+' '+s.where+'〉','gc-meta'));}}card.append(panel)}list.append(card)}const pages=Math.ceil(filtered.length/size);$('gc-status').textContent='전체 '+all.length+'개 중 '+filtered.length+'개 · 페이지당 '+size+'개';if(!filtered.length)list.append(make('p','검색 결과가 없습니다.'));$('gc-page').textContent=pages?(page+1)+' / '+pages:'0 / 0';$('gc-prev').disabled=page===0;$('gc-next').disabled=page+1>=pages;$('gc-copy-all').disabled=!filtered.length}
function search(){const q=normal($('gc-search').value.trim());filtered=all.filter(g=>!q||g.search.includes(q));page=0;render()}
function format(g){return [g.id,...order.map(name=>{const d=g.docs.find(d=>d.name===name);if(!d||d.missing)return name+': 해당 구절 없음';return name+':\n'+d.sents.map(s=>(s.lang==='chi'?'한문':s.type==='main'?'언해':'언해·'+s.type)+': '+s.value+' 〈'+name+' '+s.where+'〉').join('\n')})].join('\n\n')}
async function copy(value){try{await navigator.clipboard.writeText(value);$('gc-toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('gc-toast').hidden=true,1800)}catch(e){$('gc-copy-fallback').hidden=false;$('gc-copy-fallback').open=true;$('gc-copy-text').value=value;$('gc-copy-text').focus();$('gc-copy-text').select()}}
$('gc-search').addEventListener('input',search);
$('gc-copy-all').addEventListener('click',()=>copy(filtered.map(format).join('\n\n----------------------------------------\n\n')));
$('gc-prev').addEventListener('click',()=>{if(page>0){page--;render()}});
$('gc-next').addEventListener('click',()=>{if((page+1)*size<filtered.length){page++;render()}});
(async()=>{try{const response=await fetch(root.dataset.xmlUrl);if(!response.ok)throw Error('XML을 불러오지 못했습니다 (HTTP '+response.status+').');all=parse(await response.text());search()}catch(error){$('gc-status').textContent=error.message+' assets/data/gugup_parallel_corpus.xml 경로를 확인하세요.';}})();
})();
</script>
