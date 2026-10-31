// Voorbeeld: toont wat je deze week gepland hebt en hoe je challenges ervoor staan.
// Gebruik: MYLEARNQ_COOKIE="..." node examples/week-overzicht.js

import { MyLearnQ } from "../src/index.js";

const lq = new MyLearnQ({ cookie: process.env.MYLEARNQ_COOKIE });

const me = await lq.me();
const [{ checkIns }, { active }] = await Promise.all([lq.checkIns(), lq.challenges()]);

const monday = new Date();
monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
const from = monday.toISOString().slice(0, 10);

console.log(`Hoi ${me.name.split(",").at(-1).trim()}!\n`);
console.log("Deze week:");
for (const c of checkIns.filter(c => c.date >= from).reverse()) {
  const minutes = c.items.reduce((sum, i) => sum + (i.estimatedDuration || 0), 0);
  console.log(`  ${c.date}  ${c.items.length} blok(ken), ${minutes} minuten gepland`);
}

console.log("\nActieve challenges:");
for (const c of active) {
  console.log(`  ${c.title}: ${c.phase.label} (${Math.round(c.phase.progress)}%)`);
}
