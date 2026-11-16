// W2 セレナ E1（告白後の対立・障害の皆無）の着手前計測
const fs = require("fs");
const vm = require("vm");
const src = fs.readFileSync("data.js", "utf8");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src + "\nthis.__GAMES = GAMES;", ctx);
const serena = ctx.__GAMES.find((g) => g.id === "serena");
const nodes = serena.scenes;
console.log("serena nodes:", nodes.length);
const words = ["不安", "怖い", "対立", "反対", "つわり", "体調", "迷い", "ためらい", "悩み", "葛藤", "すれ違い", "喧嘩", "言い合い", "誤解", "勘違い", "違っていた", "がっかり", "陰性"];
for (const w of words) {
  const hits = nodes.filter((n) => (n.text || "").includes(w)).map((n) => n.id);
  console.log(w, hits.length, hits.join(","));
}
for (const id of ["e62", "e63", "e64", "e104", "e79", "e80"]) {
  const n = nodes.find((x) => x.id === id);
  console.log("---", id, "---");
  console.log(n ? n.text : "NOT FOUND");
}
