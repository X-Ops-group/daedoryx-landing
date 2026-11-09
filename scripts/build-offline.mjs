import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const outDir = path.resolve('offline');
fs.mkdirSync(outDir, {recursive:true});
const read = (file) => fs.readFileSync(file,'utf8');
const write = (file,body) => fs.writeFileSync(path.join(outDir,file),body,'utf8');
const branding = ['favicon.svg','social-card.svg'];
const baseCSS = read('styles.css').replace(/@import\s+url\([^)]*\);?/g,'');
const model = read('model.mjs').replace(/^export\s+/gm,'');
const moduleImports = /^import\s+\{[^\n]+\}\s+from\s+['"]\.\/model\.mjs['"];?\s*$/m;

function buildStandalone(page, moduleFile, extraCSS, outputName) {
  let html = read(page);
  let app = read(moduleFile).replace(moduleImports,'');
  if (app === read(moduleFile)) throw new Error('Module import was not removed for '+moduleFile);
  app = app.replaceAll("'present.html?'", "'daedoryx-presentation-offline.html?'");
  const hasSecurity = page === 'index.html';
  const security = hasSecurity ? read('security.mjs') : '';
  const code = model + '\n' + app + '\n' + security;
  new vm.Script(code,{filename:outputName});
  const originalScript = '<script type="module" src="' + moduleFile + '"></script>';
  if (!html.includes(originalScript)) throw new Error('Missing application script in '+page);
  html = html.replace(originalScript,'');
  if (hasSecurity) {
    const securityScript = '<script type="module" src="security.mjs"></script>';
    if (!html.includes(securityScript)) throw new Error('Missing security explorer script');
    html = html.replace(securityScript,'');
  }
  html = html.replace(/<link rel="stylesheet" href="styles\.css"\s*\/>/g,'');
  html = html.replace(/<link rel="stylesheet" href="presentation\.css"\s*\/>/g,'');
  html = html.replaceAll('href="present.html','href="daedoryx-presentation-offline.html');
  html = html.replaceAll('href="index.html','href="daedoryx-landing-offline.html');
  html = html.replaceAll('href="privacy.html','href="privacy-offline.html');
  html = html.replace('</head>','<style>\n' + baseCSS + '\n' + extraCSS + '\n</style>\n</head>');
  html = html.replace('</body>',() => '<script>\n' + code + '\n</script>\n</body>');
  const scriptStart = html.indexOf('<script>') + '<script>'.length;
  const scriptEnd = html.indexOf('</script>', scriptStart);
  if (scriptStart < '<script>'.length || scriptEnd < 0) throw new Error('No embedded script in '+outputName);
  new vm.Script(html.slice(scriptStart,scriptEnd),{filename:outputName+' inline'});
  write(outputName,html);
  if (!html.includes('<script>') || html.includes('src="'+moduleFile+'"')) throw new Error('Standalone bundle failed for '+outputName);
  return html.length;
}

const landingSize = buildStandalone('index.html','app.mjs','','daedoryx-landing-offline.html');
const deckSize = buildStandalone('present.html','present.mjs',read('presentation.css'),'daedoryx-presentation-offline.html');
let privacy = read('privacy.html');
privacy = privacy.replace(/<link rel="stylesheet" href="styles\.css"\s*\/>/,'');
privacy = privacy.replaceAll('href="index.html','href="daedoryx-landing-offline.html');
privacy = privacy.replace('</head>','<style>\n' + baseCSS + '\n</style></head>');
write('privacy-offline.html',privacy);
for (const asset of branding) fs.copyFileSync(asset,path.join(outDir,asset));
write('README-OFFLINE.txt',[
  'DAEDORYX — Offline Event Package',
  '',
  '1. Unzip the archive, keeping all the files together.',
  '2. Open daedoryx-landing-offline.html in Chrome, Edge, Safari or Firefox.',
  '3. Open daedoryx-presentation-offline.html for the 10-slide event deck.',
  '4. The landing can transfer a customized executive scenario to the deck.',
  '5. Use arrow keys, F for fullscreen, P for print/save as PDF.',
  '6. No live backend, metrics service, account system or lead delivery exists.',
  '7. The numeric results are illustrative calculations, not customer outcomes.',
  '8. All fonts fall back to system fonts offline. No HTTP server is required.',
  ''
].join('\n'));
console.log('Generated offline landing ('+landingSize+' chars) and event deck ('+deckSize+' chars).');
