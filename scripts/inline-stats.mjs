#!/usr/bin/env node
// Embeds docs/stats.json into docs/index.html so the page also works offline (file://).
// Idempotent: replaces whatever sits inside <script id="stats" type="application/json">.
import { readFileSync, writeFileSync } from "node:fs";

const page = "docs/index.html";
const data = JSON.stringify(JSON.parse(readFileSync("docs/stats.json", "utf8"))).replace(/</g, "\\u003c");
const html = readFileSync(page, "utf8");
const re = /(<script id="stats" type="application\/json">)[\s\S]*?(<\/script>)/;
if (!re.test(html)) throw new Error("stats script tag not found in " + page);
writeFileSync(page, html.replace(re, (_, a, b) => a + data + b));
console.log(`Inlined ${data.length} bytes into ${page}`);
