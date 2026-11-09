import fs from 'node:fs';
import path from 'node:path';

const pages = ['index.html','present.html','privacy.html'];
const errors = [];
for (const name of pages) {
  if (!fs.existsSync(name)) { errors.push('Missing '+name); continue; }
  const content = fs.readFileSync(name,'utf8');
  const ids = [...content.matchAll(/\bid=["']([^"']+)["']/g)].map((match)=>match[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) errors.push(name+': duplicate id '+id);
    seen.add(id);
  }
  const refs = [...content.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map((match)=>match[1]);
  for (const ref of refs) {
    if (ref.startsWith('#')) {
      const target = ref.slice(1);
      if (target && !seen.has(target)) errors.push(name+': missing anchor '+ref);
      continue;
    }
    if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
    const localPath = ref.split(/[?#]/)[0];
    if (!localPath) continue;
    const file = path.resolve(path.dirname(name),decodeURI(localPath));
    if (!fs.existsSync(file)) errors.push(name+': missing local asset '+ref);
  }
  if (!/<meta\s+name=["']description["']/.test(content)) errors.push(name+': missing description');
  if (!/<html\s+lang=/.test(content)) errors.push(name+': missing document language');
}
const model = fs.readFileSync('model.mjs','utf8');
if (!model.includes('capacityValue') || !model.includes('modeledNetValue')) errors.push('Scenario model incomplete');
if (errors.length) {
  console.error('Website validation failed:\n'+errors.map(x=>' - '+x).join('\n'));
  process.exitCode=1;
} else console.log('Validated local links, anchors, IDs, metadata, and scenario model.');
