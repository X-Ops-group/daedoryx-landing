import { DEFAULT_SCENARIO, calculateScenario, formatMoney, formatInteger } from './model.mjs';

const $ = (id) => document.getElementById(id);
const controls = ['volume', 'minutes', 'coverage', 'reduction', 'hourly', 'annualCost'];
const lenses = {
  CEO: {
    label: 'CEO / BUSINESS IMPACT',
    title: 'What if your teams could reclaim capacity?',
    body: 'Explore the annual value of time that could be redirected to higher-impact work — before validating adoption and benefits realization.',
    metric: (s) => formatMoney(s.capacityValue),
    caption: 'Illustrative capacity value, not revenue or cash savings',
    metricLabel: 'ANNUAL CAPACITY VALUE'
  },
  CFO: {
    label: 'CFO / CAPITAL EFFICIENCY',
    title: 'Build a financial hypothesis you can challenge.',
    body: 'Compare estimated capacity value against your assumed annual operating costs. This is conditional ROI if the full modeled value is captured.',
    metric: (s) => Math.round(s.modeledROI).toLocaleString('en-US') + '%',
    caption: 'Conditional model ROI; not verified financial performance',
    metricLabel: 'MODELLED ANNUAL ROI'
  },
  CIO: {
    label: 'CIO / OPERATING MODEL',
    title: 'See where enterprise work could change.',
    body: 'Model how much of total workload time might be released through scoped adoption while protecting control over enterprise systems.',
    metric: (s) => s.shareReleased.toFixed(1) + '%',
    caption: 'Share of baseline work time under assumptions',
    metricLabel: 'POTENTIAL TIME RELEASED'
  },
  CTO: {
    label: 'CTO / ENGINEERING CAPACITY',
    title: 'Transform throughput, not just tooling.',
    body: 'Evaluate time potentially returned to engineering or operations. It is available capacity, not a claim about shipped features or productivity gains.',
    metric: (s) => formatInteger(s.releasedAnnualHours) + 'h',
    caption: 'Annual capacity hours under assumptions',
    metricLabel: 'POTENTIAL TIME RELEASED'
  },
  CISO: {
    label: 'CISO / GOVERNANCE ARCHITECTURE',
    title: 'Put policy in the execution path.',
    body: 'Examine five proposed governance boundaries: identity, policy evaluation, approval, constrained execution, and evidence. This is a design model, not a security certification.',
    metric: () => '05',
    caption: 'Reference control stages, not audited product controls',
    metricLabel: 'GOVERNANCE DESIGN STAGES'
  }
};
const phases = [
  {crumb: 'INTELLIGENCE', title: 'Turn intent into structured work.', desc: 'A request becomes a scoped task with context, constraints, and a clear intended outcome.', input: 'Enterprise request', main: 'Intent + context'},
  {crumb: 'ORCHESTRATION', title: 'Coordinate specialized agents.', desc: 'Route a task through the right capabilities and orchestrate dependencies instead of multiplying isolated assistants.', input: 'Structured work', main: 'Agent orchestration'},
  {crumb: 'EXECUTION', title: 'Enforce the decision boundary.', desc: 'Policies, approvals, and tool permissions determine which actions are authorized before execution.', input: 'Proposed action', main: 'Policy + approval'},
  {crumb: 'EVIDENCE', title: 'See what happened, and why.', desc: 'Preserve traces and outcomes for review, operational oversight, and future improvement.', input: 'Execution event', main: 'Evidence + trace'}
];

let activeLens = 'CEO';
let currentLang = 'en';
const spanish = {
  'nav.platform': 'Plataforma', 'nav.impact': 'Impacto', 'nav.solutions': 'Soluciones',
  'nav.governance': 'Gobernanza', 'nav.deploy': 'Despliegue', 'nav.present': 'Presentar',
  'nav.demo': 'Solicitar demo ↗',
  'hero.eyebrow': 'INTELIGENCIA AGÉNTICA EMPRESARIAL',
  'hero.line1': 'Autónoma', 'hero.line2': 'por diseño.', 'hero.line3': 'Gobernada', 'hero.line4': 'por defecto.',
  'hero.desc': 'La capa operativa para la IA empresarial. Orquesta agentes, conecta el conocimiento de la organización e integra políticas en cada ejecución, en la nube o en infraestructura privada.',
  'hero.cta1': 'Explorar el impacto', 'hero.cta2': 'Modo presentación',
  'hero.note': 'Un plano de control, no otro chatbot.',
  'hero.illustration': 'Arquitectura conceptual · ilustración, no telemetría real',
  'hero.scroll': 'DESLIZA PARA EXPLORAR',
  'pill.1': 'Orquestar', 'pill.1d': 'Agentes especializados',
  'pill.2': 'Contextualizar', 'pill.2d': 'Conocimiento empresarial',
  'pill.3': 'Gobernar', 'pill.3d': 'Políticas y aprobaciones',
  'pill.4': 'Observar', 'pill.4d': 'Evidencia de ejecución',
  'platform.title': 'De una IA fragmentada a una <em>inteligencia coordinada.</em>',
  'platform.desc': 'No es otro asistente aislado. Es una arquitectura operativa para que los agentes interpreten, accedan al contexto, pidan autorización y ejecuten trabajo.',
  'impact.title': 'Construye el caso de negocio <em>en tiempo real.</em>',
  'impact.desc': 'Sustituye las promesas abstractas por hipótesis cuestionables. Modifica los supuestos operativos en directo y explora el potencial empresarial.',
  'impact.sim': 'ESCENARIO INTERACTIVO', 'impact.simnote': 'Supuestos ilustrativos; no son resultados de clientes',
  'impact.tune': 'Ajusta seis supuestos durante la presentación.',
  'solutions.title': 'Una arquitectura. <em>Muchas oportunidades.</em>',
  'solutions.desc': 'Conecta personas, agentes, herramientas y conocimiento organizativo para realizar tareas medibles dentro de límites comprensibles.',
  'gov.title': 'La autonomía exige <em>límites operativos.</em>',
  'gov.desc': 'La pregunta ya no es si la IA puede actuar. Es quién autoriza la acción, qué contexto puede utilizar y qué evidencia debe conservarse.',
  'deploy.title': 'Tu infraestructura. <em>Tu modelo operativo.</em>',
  'deploy.desc': 'Diseñada para los requisitos de tu organización. Explora posibles opciones de despliegue en nube, híbrido y privado.',
  'contact.title': 'El próximo sistema operativo no girará alrededor de aplicaciones. <em>Girará alrededor de la inteligencia.</em>',
  'contact.desc': 'Trae tu caso de uso. Analizaremos gobernanza, integración y los supuestos de negocio antes de prometer automatización.',
  'contact.deck': 'Abrir presentación ejecutiva'
};
const originalMarkup = new Map(Array.from(document.querySelectorAll('[data-t]')).map((el) => [el, el.innerHTML]));
const htmlKeys = new Set(['platform.title','impact.title','solutions.title','gov.title','deploy.title','contact.title']);

function setLanguage(lang) {
  currentLang = lang === 'es' ? 'es' : 'en';
  for (const [element, original] of originalMarkup) {
    const key = element.dataset.t;
    if (currentLang === 'en' || !(key in spanish)) element.innerHTML = original;
    else if (htmlKeys.has(key)) element.innerHTML = spanish[key];
    else element.textContent = spanish[key];
  }
  document.documentElement.lang = currentLang;
  $('lang-switch').textContent = currentLang === 'en' ? 'ES' : 'EN';
  $('lang-switch').setAttribute('aria-label',currentLang === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés');
  try { localStorage.setItem('daedoryx-language', currentLang); } catch {}
  updatePhase(Number(document.querySelector('.platform-step.active')?.dataset.step ?? 0));
  updateScenario();
}

function updatePhase(index) {
  const p = phases[index] ?? phases[0];
  const tr = [
    {crumb:'INTELIGENCIA',title:'Convertir la intención en trabajo estructurado.',desc:'Cada solicitud se convierte en una tarea con contexto, restricciones y un resultado definido.',input:'Solicitud empresarial',main:'Intención + contexto'},
    {crumb:'ORQUESTACIÓN',title:'Coordinar agentes especializados.',desc:'Enruta tareas a las capacidades adecuadas y gestiona dependencias entre agentes.',input:'Trabajo estructurado',main:'Orquestación'},
    {crumb:'EJECUCIÓN',title:'Aplicar los límites de autorización.',desc:'Políticas, aprobaciones y permisos determinan qué acciones pueden ejecutarse.',input:'Acción propuesta',main:'Política + aprobación'},
    {crumb:'EVIDENCIA',title:'Comprender qué ocurrió y por qué.',desc:'Conserva trazas y resultados para revisión y supervisión operativa.',input:'Evento de ejecución',main:'Evidencia + trazas'}
  ][index] ?? null;
  const item = currentLang === 'es' ? tr : p;
  $('console-crumb-current').textContent = item.crumb;
  $('console-title').textContent = item.title;
  $('console-description').textContent = item.desc;
  $('graph-input-label').textContent = item.input;
  $('graph-main-label').textContent = item.main;
  for (const b of document.querySelectorAll('.platform-step')) {
    const selected = Number(b.dataset.step) === index;
    b.classList.toggle('active',selected);
    b.setAttribute('aria-selected',String(selected));
    b.tabIndex = selected ? 0 : -1;
  }
}

function readScenario() {
  const raw = {};
  for (const name of controls) raw[name] = Number($(name)?.value ?? DEFAULT_SCENARIO[name]);
  return calculateScenario(raw);
}
function updateScenario() {
  const s = readScenario();
  for (const name of controls) {
    const input = $(name);
    const output = $(name + '-output');
    if (!input || !output) continue;
    const n = Number(input.value);
    output.textContent = name === 'volume' ? formatInteger(n) :
      name === 'minutes' ? n + ' min' :
      name === 'coverage' || name === 'reduction' ? n + '%' :
      name === 'hourly' ? '$' + formatInteger(n) : formatMoney(n);
    const min = Number(input.min), max = Number(input.max);
    const progress = (n - min) / (max - min) * 100;
    input.style.background = 'linear-gradient(90deg, #6ee5ee ' + progress + '%, #32465c ' + progress + '%)';
  }
  const lens = lenses[activeLens];
  $('lens-label').textContent = lens.label;
  $('lens-headline').textContent = lens.title;
  $('lens-body').textContent = lens.body;
  $('headline-metric-label').textContent = lens.metricLabel;
  $('headline-metric').textContent = lens.metric(s);
  $('headline-metric-caption').textContent = lens.caption;
  $('headline-metric').style.color = activeLens === 'CFO' && s.modeledROI < 0 ? '#ffb69e' : '';
  $('hours-freed').textContent = formatInteger(s.releasedAnnualHours);
  $('baseline-share').textContent = s.shareReleased.toFixed(1) + '%';
  $('net-value').textContent = formatMoney(s.modeledNetValue);
  $('net-value').style.color = s.modeledNetValue < 0 ? '#ffb69e' : '';
  $('baseline-hours').textContent = formatInteger(s.baselineMonthlyHours) + ' h';
  $('scenario-hours').textContent = formatInteger(s.scenarioMonthlyHours) + ' h';
  $('baseline-bar').style.width = '100%';
  $('scenario-bar').style.width = (100 - s.shareReleased) + '%';
  $('workload-caption').textContent = formatInteger(s.releasedMonthlyHours) + ' hours / month potentially released';
  const shareLink = $('send-to-deck');
  if (shareLink) shareLink.href = 'present.html?' + new URLSearchParams(s.assumptions).toString() + '#slide-4';
  for (const button of document.querySelectorAll('.exec-tab')) {
    const selected = button.dataset.lens === activeLens;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-selected',String(selected));
    button.tabIndex = selected ? 0 : -1;
  }
}

function tabKeyNavigation(event, selector, attribute) {
  const items = [...document.querySelectorAll(selector)];
  const current = items.indexOf(event.currentTarget);
  if (current < 0) return;
  let next;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % items.length;
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current + items.length - 1) % items.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = items.length - 1;
  else return;
  event.preventDefault();
  items[next].focus();
  items[next].click();
}

document.querySelectorAll('.platform-step').forEach((button) => {
  button.addEventListener('click', () => updatePhase(Number(button.dataset.step)));
  button.addEventListener('keydown', (event) => tabKeyNavigation(event,'.platform-step','step'));
});
document.querySelectorAll('.exec-tab').forEach((button) => {
  button.addEventListener('click', () => { activeLens = button.dataset.lens; updateScenario(); });
  button.addEventListener('keydown', (event) => tabKeyNavigation(event,'.exec-tab','lens'));
});
for (const name of controls) $(name)?.addEventListener('input',updateScenario);
$('reset-model')?.addEventListener('click',() => {
  for (const name of controls) $(name).value = DEFAULT_SCENARIO[name];
  updateScenario();
});
$('lang-switch')?.addEventListener('click',()=>setLanguage(currentLang === 'en' ? 'es' : 'en'));

const menu = $('mobile-nav');
const toggle = $('menu-toggle');
toggle?.addEventListener('click',()=> {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded',String(!isOpen));
  toggle.setAttribute('aria-label',isOpen ? 'Open navigation' : 'Close navigation');
  menu.hidden = isOpen;
});
menu?.querySelectorAll('a').forEach((a)=>a.addEventListener('click',()=> {
  menu.hidden=true; toggle.setAttribute('aria-expanded','false');
}));

$('year').textContent = String(new Date().getFullYear());
$('brief-form')?.addEventListener('submit', async (event)=>{
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const name = $('contact-name').value.trim();
  const company = $('contact-company').value.trim();
  const topic = $('contact-focus').value;
  const brief = 'DAEDORYX — Introductory enquiry\nName: ' + name + '\nOrganization: ' + company + '\nInterest: ' + topic + '\n\nPlease contact me to discuss DAEDORYX.';
  const status = $('form-status');
  status.className = 'form-status';
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(brief);
    status.textContent = 'Enquiry copied. Paste it into your preferred communication channel. No data was sent.';
    status.classList.add('success');
  } catch {
    const existing = $('brief-fallback');
    const area = existing || document.createElement('textarea');
    area.id = 'brief-fallback';
    area.setAttribute('aria-label','Copy your enquiry manually');
    area.value = brief;
    area.readOnly = true;
    area.style.minHeight = '120px';
    if (!existing) form.appendChild(area);
    area.focus(); area.select();
    status.textContent = 'Automatic copy unavailable. Select and copy the text below manually. Nothing was transmitted.';
    status.classList.add('error');
  }
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelector('.link-lines')?.pauseAnimations?.();
}
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('enhanced');
  const observer = new IntersectionObserver((entries)=>{
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  },{threshold:.08,rootMargin:'0px 0px 80px 0px'});
  document.querySelectorAll('.reveal').forEach((el)=>observer.observe(el));
}
let stored = 'en';
try { stored = localStorage.getItem('daedoryx-language') || 'en'; } catch {}
setLanguage(stored);
