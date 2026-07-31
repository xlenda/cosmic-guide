const { SIGNS, compatPercent } = require('./lib/signs.js');
const v=[]; const byPair=[];
for(const a of SIGNS) for(const b of SIGNS){ const p=compatPercent(a.name,b.name); v.push(p); byPair.push([a.name,b.name,p]); }
const s=[...v].sort((x,y)=>x-y);
console.log('n',v.length,'min',s[0],'max',s[s.length-1],'media',(v.reduce((x,y)=>x+y,0)/v.length).toFixed(2));
console.log('abaixo50',v.filter(x=>x<50).length,'abaixo70',v.filter(x=>x<70).length);
console.log('valores distintos:',[...new Set(v)].sort((a,b)=>a-b).join(', '));
