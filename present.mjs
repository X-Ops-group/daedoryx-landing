import { DEFAULT_SCENARIO, calculateScenario, formatMoney, formatInteger, sanitizeScenario } from './model.mjs';

const $ = (id) => document.getElementById(id);
const slides = [...document.querySelectorAll('.slide')];
const names = ['INTRODUCTION','THE PROBLEM','THE SYSTEM','EXECUTIVE MODEL','BOARDROOM PERSPECTIVES','GOVERNANCE','DEPLOYMENT','LET\'S TALK'];
let active = 0;
const inputs = ['volume','reduction','coverage'];
let baseAssumptions = {...DEFAULT_SCENARIO};

function drawModel() {
  const s = calculateScenario({
    ...baseAssumptions,
    volume: Number($('deck-volume').value),
    reduction: Number($('deck-reduction').value),
    coverage: Number($('deck-coverage').value)
  });
  $('deck-volume-out').textContent = formatInteger(s.assumptions.volume);
  $('deck-reduction-out').textContent = s.assumptions.reduction + '%';
  $('deck-coverage-out').textContent = s.assumptions.coverage + '%';
  $('deck-capacity-value').textContent = formatMoney(s.capacityValue);
  $('deck-control-note').textContent = 'Other assumptions: ' + s.assumptions.minutes + ' min/item, $' + s.assumptions.hourly + '/hour, ' + formatMoney(s.assumptions.annualCost) + ' yearly operating cost. Model only.';
  $('deck-hours').textContent = formatInteger(s.releasedAnnualHours) + ' h';
  $('deck-roi').textContent = Math.round(s.modeledROI) + '%';
  $('deck-roi').style.color = s.modeledROI < 0 ? '#ffb69e' : '';
  $('deck-baseline').textContent = formatInteger(s.baselineMonthlyHours) + ' h';
  $('deck-after').textContent = formatInteger(s.scenarioMonthlyHours) + ' h';
  $('deck-after-bar').style.width = (100 - s.shareReleased) + '%';
  $('persona-ceo').textContent = formatMoney(s.capacityValue);
  $('persona-cfo').textContent = Math.round(s.modeledROI) + '%';
  $('persona-cfo').style.color = s.modeledROI < 0 ? '#ffb69e' : '';
  $('persona-cio').textContent = s.shareReleased.toFixed(1) + '%';
  $('persona-cto').textContent = formatInteger(s.releasedAnnualHours) + ' h';
  for (const name of inputs) {
    const item = $('deck-' + name);
    const position = (Number(item.value) - Number(item.min)) / (Number(item.max) - Number(item.min)) * 100;
    item.style.background = 'linear-gradient(90deg, #6ee5ee ' + position + '%, #32465c ' + position + '%)';
  }
}

function showSlide(n, updateUrl = true) {
  active = Math.max(0,Math.min(slides.length - 1,n));
  slides.forEach((slide,i) => {
    const visible = i === active;
    slide.classList.toggle('active',visible);
    slide.setAttribute('aria-hidden',String(!visible));
    slide.inert = !visible;
    if (visible) slide.scrollTop = 0;
  });
  $('slide-name').textContent = names[active] ?? '';
  $('deck-counter').textContent = String(active + 1).padStart(2,'0') + ' / ' + String(slides.length).padStart(2,'0');
  $('slide-progress-fill').style.width = (active + 1) / slides.length * 100 + '%';
  $('deck-prev').disabled = active === 0;
  $('deck-next').disabled = active === slides.length - 1;
  if (updateUrl) history.replaceState(null,'','#slide-' + (active + 1));
}
function slideFromHash() {
  const found = /^#slide-(\d+)$/.exec(location.hash);
  return found ? Number(found[1]) - 1 : 0;
}

$('deck-prev').addEventListener('click',()=>showSlide(active - 1));
$('deck-next').addEventListener('click',()=>showSlide(active + 1));
$('deck-reset').addEventListener('click',()=>{
  baseAssumptions = {...DEFAULT_SCENARIO};
  for (const name of inputs) $('deck-' + name).value = DEFAULT_SCENARIO[name];
  drawModel();
});
for (const name of inputs) $('deck-' + name).addEventListener('input',drawModel);
$('deck-print').addEventListener('click',()=>window.print());
$('deck-fullscreen').addEventListener('click',async ()=>{
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
  } catch { $('deck-fullscreen').textContent = 'FULLSCREEN UNAVAILABLE'; }
});
document.addEventListener('fullscreenchange',()=>{
  $('deck-fullscreen').textContent = document.fullscreenElement ? 'EXIT FULLSCREEN ⛶' : 'FULLSCREEN ⛶';
});
document.addEventListener('keydown',(event)=>{
  const tag = event.target?.tagName?.toLowerCase();
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || (event.code === 'Space' && tag !== 'button' && tag !== 'a')) {
    event.preventDefault();showSlide(active + 1);
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();showSlide(active - 1);
  } else if (event.key === 'Home') {
    event.preventDefault();showSlide(0);
  } else if (event.key === 'End') {
    event.preventDefault();showSlide(slides.length - 1);
  } else if (event.key.toLowerCase() === 'f' && tag !== 'button' && tag !== 'a') {
    event.preventDefault();$('deck-fullscreen').click();
  } else if (event.key.toLowerCase() === 'p' && tag !== 'button' && tag !== 'a') {
    event.preventDefault();window.print();
  }
});
window.addEventListener('hashchange',()=>showSlide(slideFromHash(),false));
const params = new URLSearchParams(location.search);
const seeded = sanitizeScenario(Object.fromEntries(Object.keys(DEFAULT_SCENARIO).map((key) => [key, params.get(key) ?? DEFAULT_SCENARIO[key]])));
baseAssumptions = {...seeded};
for (const name of inputs) $('deck-' + name).value = seeded[name];
drawModel();
showSlide(slideFromHash(),false);
