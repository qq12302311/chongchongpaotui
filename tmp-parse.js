const fs = require("fs");
const parser = require("@babel/parser");
const path = "pages/order/detail.vue";
const text = fs.readFileSync(path, "utf8");
const match = text.match(/<script>([\s\S]*?)<\/script>/);
if (!match) {
  console.log('no script block');
  process.exit(0);
}
try {
  parser.parse(match[1], { sourceType: 'module' });
  console.log('script ok');
} catch (err) {
  console.error('script error', err.message);
}
