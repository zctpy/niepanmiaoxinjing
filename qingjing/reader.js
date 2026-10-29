'use strict';
(() => {
const $ = id => document.getElementById(id);
const episodes = window.EPISODES;
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('main').focus();$('main').scrollIntoView()});
const key = 'qingjing-comic-v1';
let current = 1, zoom = 1, toastTimer;
const storage = { get(k){try{return localStorage.getItem(k)}catch{return null}}, set(k,v){try{localStorage.setItem(k,v)}catch{}} };
let last = Number(storage.get(key));
if (!Number.isInteger(last) || last < 1 || last > episodes.length) last = 1;
if (last > 1) { $('resumeButton').hidden = false; $('resumeButton').textContent = `继续阅读 · 第${String(last).padStart(2,'0')}集`; }
function announce(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,2500)}
function openToc(){ $('tocDialog').showModal(); const link=$('tocList').querySelector('[aria-current="page"]'); if(link)link.scrollIntoView({block:'center'}); }
function navigate(n){if(n<1||n>episodes.length)return;const hash=`#episode-${n}`;if(location.hash===hash)route();else location.hash=hash;}
function route(){
const match=location.hash.match(/^#episode-(\d+)$/);
if(!match){$('reader').hidden=true;$('home').hidden=false;document.title='一念之间 · 清静经｜十八集双语漫画电子书';if(location.hash==='#chapters')setTimeout(()=>$('chapters').scrollIntoView(),0);else window.scrollTo(0,0);return;}
const n=Number(match[1]);
if(n<1||n>episodes.length){location.hash='#home';return;}
current=n;last=n;storage.set(key,String(n));const e=episodes[n-1];
$('home').hidden=true;$('reader').hidden=false;
$('episodeNumber').textContent=`EPISODE ${String(n).padStart(2,'0')} / 18${n===18?' · FINALE':''}`;
$('episodeTitle').textContent=e.title;$('episodeEnglish').textContent=e.en;
$('pageCounter').textContent=`第 ${n} / 18 集`;$('verseText').textContent=e.verse;
$('pageRange').value=n;$('rangeOutput').textContent=`${n} / 18`;
$('prevButton').disabled=n===1;$('nextButton').disabled=n===18;
$('finish').hidden=n!==18;$('imageStatus').hidden=false;$('imageError').hidden=true;
const img=$('comicPage');img.hidden=false;img.alt=`第${n}集《${e.title}》：中英双语四格漫画，含本集经文`;img.width=e.width;img.height=e.height;
img.onload=()=>{$('imageStatus').hidden=true;$('imageError').hidden=true};
img.onerror=()=>{$('imageStatus').hidden=true;img.hidden=true;$('imageError').hidden=false};
img.src=e.image;if(img.complete&&img.naturalWidth)$('imageStatus').hidden=true;
$('downloadLink').href=e.image;$('downloadLink').download=`一念之间-清静经-第${String(n).padStart(2,'0')}集.webp`;
for(const a of $('tocList').querySelectorAll('a')){if(a.hash===location.hash)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
$('resumeButton').hidden=false;$('resumeButton').textContent=`继续阅读 · 第${String(n).padStart(2,'0')}集`;
document.title=`第${n}集 ${e.title}｜一念之间 · 清静经`;
window.scrollTo(0,0);$('episodeTitle').focus({preventScroll:true});
const next=episodes[n];if(next){const pre=new Image();pre.src=next.image;}
}
for(const e of episodes){
const a=document.createElement('a');a.className='chapter-card';a.href=`#episode-${e.number}`;
const img=document.createElement('img');img.src=e.thumb;img.width=66;img.height=99;img.loading='lazy';img.alt='';
const text=document.createElement('div');const label=document.createElement('small');label.textContent=`${String(e.number).padStart(2,'0')} / ${e.number===18?'FINALE':'EPISODE'}`;
const h=document.createElement('h3');h.textContent=e.title;const p=document.createElement('p');p.lang='en';p.textContent=e.en;text.append(label,h,p);a.append(img,text);$('chapterGrid').append(a);
const link=document.createElement('a');link.className='toc-link';link.href=a.href;const number=document.createElement('span');number.className='num';number.textContent=String(e.number).padStart(2,'0');const d=document.createElement('div');const strong=document.createElement('strong');strong.textContent=e.title;const en=document.createElement('small');en.lang='en';en.textContent=e.en;d.append(strong,en);link.append(number,d);link.addEventListener('click',()=>{$('tocDialog').close();if(location.hash===link.hash)route()});$('tocList').append(link);
}
$('startButton').onclick=()=>navigate(1);$('resumeButton').onclick=()=>navigate(last);
$('prevButton').onclick=()=>navigate(current-1);$('nextButton').onclick=()=>navigate(current+1);
$('backCover').onclick=()=>location.hash='#home';$('tocButton').onclick=openToc;$('readerToc').onclick=openToc;$('closeToc').onclick=()=>$('tocDialog').close();
$('pageRange').addEventListener('input',e=>$('rangeOutput').textContent=`${e.target.value} / 18`);$('pageRange').addEventListener('change',e=>navigate(Number(e.target.value)));
$('retryButton').onclick=()=>{const img=$('comicPage');img.hidden=false;$('imageError').hidden=true;$('imageStatus').hidden=false;img.src=episodes[current-1].image+'?retry='+Date.now()};
function setTheme(dark){document.body.classList.toggle('dark',dark);$('themeButton').setAttribute('aria-pressed',String(dark));$('themeButton').textContent=dark?'日读':'夜读';$('themeButton').setAttribute('aria-label',dark?'切换浅色阅读':'切换深色阅读');document.querySelector('meta[name="theme-color"]').content=dark?'#171f1d':'#f7f3eb';storage.set('qingjing-theme',dark?'dark':'light')}
setTheme(storage.get('qingjing-theme')==='dark');$('themeButton').onclick=()=>setTheme(!document.body.classList.contains('dark'));
function sizeZoom(){const width=$('zoomScroller').clientWidth;$('zoomImage').style.width=Math.round(Math.min(width,1100)*zoom)+'px';$('zoomValue').textContent=Math.round(zoom*100)+'%';$('zoomIn').disabled=zoom>=3;$('zoomOut').disabled=zoom<=1;}
$('zoomButton').onclick=()=>{const e=episodes[current-1];$('zoomImage').src=e.image;$('zoomImage').alt=`放大阅读：第${current}集 ${e.title}`;zoom=1;$('zoomDialog').showModal();sizeZoom();$('zoomScroller').scrollTo(0,0)};
$('zoomIn').onclick=()=>{zoom=Math.min(3,zoom+.5);sizeZoom()};$('zoomOut').onclick=()=>{zoom=Math.max(1,zoom-.5);sizeZoom()};$('closeZoom').onclick=()=>$('zoomDialog').close();window.addEventListener('resize',()=>{if($('zoomDialog').open)sizeZoom()});
$('shareButton').onclick=async()=>{try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(location.href);announce('本集链接已复制')}else announce('可复制地址栏中的本集链接')}catch{announce('可复制地址栏中的本集链接')}};
for(const id of ['tocDialog','zoomDialog'])$(id).addEventListener('click',e=>{if(e.target!==$(id))return;const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close()});
window.addEventListener('keydown',e=>{if($('reader').hidden||$('tocDialog').open||$('zoomDialog').open||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)||e.ctrlKey||e.altKey||e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();navigate(current+1)}else if(e.key==='ArrowLeft'){e.preventDefault();navigate(current-1)}});
window.addEventListener('hashchange',route);route();
})();
