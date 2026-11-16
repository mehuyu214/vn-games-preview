const fs = require('fs');
const src = fs.readFileSync('data.js', 'utf-8');
for (const s of ['c259', 'c260', 'c261', 'c262', 'boxguess', '20箱くらいかな', '30箱は超えそう', '正解は40箱よ']) {
  let n = 0, i = -1;
  while ((i = src.indexOf(s, i + 1)) !== -1) n++;
  console.log(s, n);
}
