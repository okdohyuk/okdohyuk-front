import fs from 'fs';

const typesCsv = fs.readFileSync('scripts/types.csv', 'utf-8');
const efficacyCsv = fs.readFileSync('scripts/type_efficacy.csv', 'utf-8');

const typeNames = {};
typesCsv.trim().split('\n').slice(1).forEach(line=>{
  const [id, identifier] = line.split(',');
  const num = Number(id);
  if(num<=18) typeNames[num]=identifier;
});

const types = Object.values(typeNames);
const chart = {};
types.forEach(atk=>{ chart[atk] = {}; types.forEach(def=> chart[atk][def] = 1); });

efficacyCsv.trim().split('\n').slice(1).forEach(line=>{
  const [a,d,f] = line.split(',');
  if(!typeNames[a] || !typeNames[d]) return;
  chart[typeNames[a]][typeNames[d]] = Number(f)/100;
});

const content = `export const types = ${JSON.stringify(types)} as const;\nexport type Type = typeof types[number];\nexport const typeChart: Record<Type, Record<Type, number>> = ${JSON.stringify(chart, null, 2)};\n`;
fs.writeFileSync('src/libs/pokemon/typeChart.ts', content);
