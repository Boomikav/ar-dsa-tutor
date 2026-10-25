import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const forbidden = [
  'localhost',
  '127.0.0.1',
  'AIzaSy',
  'Pending Physical Test',
  'Viewport Only',
  'Device Frame',
  'PHASE 1',
  'Mobile AR Architecture',
  'Core Phase 2 Module'
];

function scan(dir) {
  const files = fs.readdirSync(dir);
  let issues = 0;
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      issues += scan(full);
    } else if (f.endsWith('.js') || f.endsWith('.html') || f.endsWith('.css')) {
      const content = fs.readFileSync(full, 'utf8');
      for (const term of forbidden) {
        if (content.includes(term)) {
          console.error(`FORBIDDEN TERM "${term}" found in ${full}`);
          issues++;
        }
      }
    }
  }
  return issues;
}

const totalIssues = scan(distDir);
console.log(`Scan finished. Total forbidden term occurrences: ${totalIssues}`);
process.exit(totalIssues > 0 ? 1 : 0);
