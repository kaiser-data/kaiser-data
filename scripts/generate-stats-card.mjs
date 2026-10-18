#!/usr/bin/env node
// Generates a static GitHub stats card with a transparent grade, fully on GitHub Actions.
// Fetches public + private stats via the GitHub GraphQL API using a PAT and renders a
// neon-green SVG: grade medallion, four sub-scores, key figures and a 52-week heatmap.
//
// Env:
//   STATS_TOKEN  Personal Access Token with `repo` scope (reads private stats).
// Args:
//   --user <login> GitHub login to report on (default: GH_USER or kaiser-data)
//   --out <path>   Output SVG path (default: assets/stats-card.svg)
//   --json <path>  Also write the raw figures + calendar as JSON (for the portfolio page)
//
// No dependencies — uses Node 20+ global fetch.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const TOKEN = process.env.STATS_TOKEN;
// NB: do NOT read process.env.USERNAME — on macOS it is the OS login name.
const argOf = (flag, def) =>
  process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : def;
const USERNAME = argOf("--user", process.env.GH_USER || "kaiser-data");
const OUT = argOf("--out", "assets/stats-card.svg");
const JSON_OUT = argOf("--json", null);

if (!TOKEN) {
  console.error("Missing STATS_TOKEN env var.");
  process.exit(1);
}

const QUERY = `
query($login:String!, $mergedQuery:String!){
  user(login:$login){
    name login
    followers{totalCount}
    contributionsCollection{
      totalCommitContributions
      totalIssueContributions
      restrictedContributionsCount
      contributionCalendar{
        totalContributions
        weeks{contributionDays{date contributionCount}}
      }
    }
    mergedAllTime:pullRequests(states:MERGED){totalCount}
    repositoriesContributedTo(contributionTypes:[COMMIT,PULL_REQUEST,REPOSITORY,PULL_REQUEST_REVIEW]){totalCount}
    repositories(first:100,ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,orderBy:{field:STARGAZERS,direction:DESC}){
      totalCount
      nodes{stargazerCount}
    }
  }
  mergedPRs:search(query:$mergedQuery, type:ISSUE){issueCount}
}`;

// ---- Grade ----
// Not github-readme-stats' rank (hardcoded medians, commits capped at 2/12 weight).
// Four sub-scores of 25 points each, every one against a fixed, published target, so
// the grade is reproducible from the numbers on the card. Log scale for counts that
// grow multiplicatively (commits, PRs, stars), linear for active days.
const logScore = (x, target) => Math.min(1, Math.log1p(x) / Math.log1p(target));
const TARGETS = { contributions: 3000, activeDays: 250, mergedPRs: 100, contributedTo: 20, reach: 500 };
const BANDS = [[90, "S"], [80, "A+"], [70, "A"], [60, "B+"], [50, "B"], [0, "C"]];

function grade(m) {
  const parts = [
    { key: "Output", detail: `${fmtFull(m.contributions)} contributions`, s: logScore(m.contributions, TARGETS.contributions) },
    { key: "Consistency", detail: `${m.activeDays} active days`, s: Math.min(1, m.activeDays / TARGETS.activeDays) },
    {
      key: "Collaboration",
      detail: `${m.mergedPRs} merged PRs · ${m.contributedTo} repos`,
      s: (logScore(m.mergedPRs, TARGETS.mergedPRs) + logScore(m.contributedTo, TARGETS.contributedTo)) / 2,
    },
    { key: "Reach", detail: `${m.stars} stars · ${m.followers} followers`, s: logScore(m.stars + m.followers, TARGETS.reach) },
  ].map((p) => ({ ...p, pts: Math.floor(p.s * 25) })); // floor: full marks only at the target
  const total = parts.reduce((a, p) => a + p.pts, 0);
  const letter = BANDS.find(([min]) => total >= min)[1];
  return { parts, total, letter };
}

// ---- Calendar ----
function calendarStats(days) {
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.contributionCount ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  const best = days.reduce((a, d) => (d.contributionCount > a.contributionCount ? d : a), days[0]);
  return {
    activeDays: days.filter((d) => d.contributionCount > 0).length,
    longest,
    best,
    last30: days.slice(-30).reduce((a, d) => a + d.contributionCount, 0),
  };
}

const yearAgo = () => new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
const fmt = (n) =>
  n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n);
const fmtFull = (n) => n.toLocaleString("en-US");
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = (iso) => `${+iso.slice(8, 10)} ${MONTHS[+iso.slice(5, 7) - 1]}`;

async function main() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "kaiser-data-stats-card",
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: USERNAME, mergedQuery: `author:${USERNAME} is:pr is:merged merged:>=${yearAgo()}` },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  const u = json.data.user;

  const cc = u.contributionsCollection;
  const weeks = cc.contributionCalendar.weeks;
  const days = weeks.flatMap((w) => w.contributionDays);
  const cal = calendarStats(days);
  const m = {
    // Public commits only. Private work arrives as restrictedContributionsCount,
    // which GitHub does not split by type, so it is shown separately, never added.
    commits: cc.totalCommitContributions,
    privateContribs: cc.restrictedContributionsCount,
    contributions: cc.contributionCalendar.totalContributions,
    issues: cc.totalIssueContributions,
    mergedPRs: json.data.mergedPRs.issueCount,
    mergedAllTime: u.mergedAllTime.totalCount,
    contributedTo: u.repositoriesContributedTo.totalCount,
    followers: u.followers.totalCount,
    repos: u.repositories.totalCount,
    stars: u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0),
    ...cal,
  };
  const g = grade(m);

  const svg = renderCard({
    name: u.name || USERNAME,
    updated: days[days.length - 1].date,
    g,
    m,
    weeks,
    figures: [
      { icon: "commit", label: "Public commits", value: fmtFull(m.commits) },
      { icon: "lock", label: "Private contribs", value: fmtFull(m.privateContribs) },
      { icon: "pr", label: "Merged PRs", value: fmt(m.mergedPRs) },
      { icon: "flame", label: "Longest streak", value: `${m.longest} d` },
      { icon: "star", label: "Stars", value: fmt(m.stars) },
      { icon: "people", label: "Followers", value: fmt(m.followers) },
    ],
  });

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, svg);
  if (JSON_OUT) {
    const { best, ...rest } = m;
    writeFileSync(
      JSON_OUT,
      JSON.stringify({ name: u.name || USERNAME, updated: days[days.length - 1].date, metrics: { ...rest, best }, targets: TARGETS, grade: g, days }, null, 1),
    );
  }
  console.log(
    `Wrote ${OUT}  grade=${g.letter} (${g.total}/100) ` +
      g.parts.map((p) => `${p.key}=${p.pts}`).join(" ") +
      `  contributions=${m.contributions} private=${m.privateContribs} commits=${m.commits} active=${m.activeDays} streak=${m.longest} prs=${m.mergedPRs} stars=${m.stars} followers=${m.followers}`,
  );
}

// ---- SVG rendering ----
const ICONS = {
  star: '<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>',
  commit: '<path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>',
  pr: '<path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/>',
  flame: '<path d="M9.533.753V.752c.217 2.385 1.463 3.626 2.653 4.81C13.37 6.74 14.498 7.863 14.498 10c0 3.5-3 6-6.5 6S1.5 13.512 1.5 10c0-1.298.536-2.56 1.425-3.286.376-.308.862 0 1.035.454C4.46 8.487 5.581 8.419 6 8c.282-.282.341-.811-.003-1.5C4.34 3.187 7.035.75 8.5.25c.517-.177 1 .206 1.033.503Z"/>',
  pulse: '<path d="M6 2c.306 0 .582.187.696.471L10 10.731l1.304-3.26A.751.751 0 0 1 12 7h3.25a.75.75 0 0 1 0 1.5h-2.742l-1.812 4.528a.751.751 0 0 1-1.392 0L6 4.77 4.696 8.03A.75.75 0 0 1 4 8.5H.75a.75.75 0 0 1 0-1.5h2.742l1.812-4.529A.751.751 0 0 1 6 2Z"/>',
  lock: '<path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 1 0-5 0v2Z"/>',
  people: '<path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Z"/>',
};

function renderCard({ name, updated, g, m, weeks, figures }) {
  const W = 860, H = 392, ACCENT = "#00ff88", TEXT = "#c9d1d9", MUTED = "#8b949e", BG = "#0d1117", EMPTY = "#161b22";

  // Grade medallion: here the ring IS a percentage — the score out of 100.
  const r = 58, cx = 112, cy = 150, circ = 2 * Math.PI * r;
  const ringOffset = circ * (1 - g.total / 100);

  // Sub-score bars
  const bx = 232, bw = 300, by0 = 106, bStep = 42;
  const bars = g.parts
    .map((p, i) => {
      const y = by0 + i * bStep, d = (0.35 + i * 0.12).toFixed(2);
      return `
    <g transform="translate(${bx}, ${y})">
      <text x="0" y="0" class="lbl">${esc(p.key)}</text>
      <text x="${bw - 46}" y="0" class="sub" text-anchor="end">${esc(p.detail)}</text>
      <text x="${bw}" y="0" class="pts">${p.pts}<tspan class="ptsMax">/25</tspan></text>
      <rect x="0" y="9" width="${bw}" height="7" rx="3.5" fill="${EMPTY}"/>
      <rect class="bar" style="animation-delay:${d}s" x="0" y="9" width="${(bw * p.s).toFixed(1)}" height="7" rx="3.5" fill="${ACCENT}"/>
    </g>`;
    })
    .join("");

  // Key figures, 2 columns x 3 rows
  const fx = 580, fy0 = 100, colW = 140, rowH = 52;
  const figs = figures
    .map((f, i) => {
      const x = fx + (i % 2) * colW, y = fy0 + Math.floor(i / 2) * rowH, d = (0.5 + i * 0.08).toFixed(2);
      return `
    <g transform="translate(${x}, ${y})" class="fig" style="animation-delay:${d}s">
      <svg x="0" y="-13" width="14" height="14" viewBox="0 0 16 16" fill="${ACCENT}" fill-opacity="0.85">${ICONS[f.icon]}</svg>
      <text x="20" y="-2" class="figLbl">${esc(f.label)}</text>
      <text x="0" y="24" class="figVal">${esc(f.value)}</text>
    </g>`;
    })
    .join("");

  // 52-week heatmap strip
  const cell = 9, gap = 2, hx = 28, hy = 296;
  const max = Math.max(1, ...weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)));
  // sqrt scale so one 70-commit day doesn't flatten every other day to level 1
  const level = (c) => (c === 0 ? 0 : Math.max(1, Math.ceil(Math.sqrt(c / max) * 4)));
  const OPAC = [0, 0.25, 0.5, 0.75, 1];
  const heat = weeks
    .map((w, wi) =>
      w.contributionDays
        .map((d) => {
          const l = level(d.contributionCount);
          const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
          const fill = l ? `fill="${ACCENT}" fill-opacity="${OPAC[l]}"` : `fill="${EMPTY}"`;
          return `<rect x="${hx + wi * (cell + gap)}" y="${hy + dow * (cell + gap)}" width="${cell}" height="${cell}" rx="2" ${fill}/>`;
        })
        .join(""),
    )
    .join("");
  const heatW = weeks.length * (cell + gap) - gap;
  const legendX = hx + heatW + 24;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)} GitHub stats — grade ${esc(g.letter)}, ${g.total} of 100; ${fmtFull(m.contributions)} contributions, ${m.activeDays} active days in the last 12 months">
  <style>
    text { font-family: 'Segoe UI', Ubuntu, system-ui, sans-serif; }
    .title { font: 700 20px 'Segoe UI', system-ui, sans-serif; fill: ${ACCENT}; }
    .meta { font-size: 12px; fill: ${MUTED}; text-anchor: end; }
    .sect { font-size: 11px; font-weight: 700; fill: ${MUTED}; letter-spacing: 1.2px; }
    .lbl { font-size: 14px; font-weight: 600; fill: ${TEXT}; }
    .pts { font-size: 14px; font-weight: 700; fill: ${ACCENT}; text-anchor: end; }
    .ptsMax { font-weight: 400; fill: ${MUTED}; font-size: 12px; }
    .sub { font-size: 12px; fill: ${MUTED}; }
    .figLbl { font-size: 12px; fill: ${MUTED}; }
    .figVal { font: 800 22px 'Segoe UI', system-ui, sans-serif; fill: ${TEXT}; }
    .grade { font: 800 44px 'Segoe UI', system-ui, sans-serif; fill: ${ACCENT}; text-anchor: middle; }
    .score { font-size: 13px; font-weight: 700; fill: ${TEXT}; text-anchor: middle; }
    .gradeSub { font-size: 11px; fill: ${MUTED}; text-anchor: middle; }
    .legend { font-size: 12px; fill: ${MUTED}; }
    .legendVal { font-size: 13px; font-weight: 700; fill: ${TEXT}; }
    .ring { stroke-dasharray: ${circ.toFixed(1)}; stroke-dashoffset: ${ringOffset.toFixed(1)}; animation: draw 1.4s ease-out backwards 0.3s; }
    .bar { transform-box: fill-box; transform-origin: left; animation: grow 0.9s ease-out backwards; }
    .fig { animation: fadein 0.6s ease backwards; }
    .heat { animation: fadein 1s ease backwards 0.8s; }
    @keyframes draw { from { stroke-dashoffset: ${circ.toFixed(1)}; } }
    @keyframes grow { from { transform: scaleX(0); } }
    @keyframes fadein { from { opacity: 0; } }
  </style>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="${BG}" stroke="${ACCENT}" stroke-opacity="0.35"/>
  <rect x="1" y="1" width="${W - 2}" height="4" rx="2" fill="${ACCENT}" fill-opacity="0.9"/>

  <text x="28" y="44" class="title">${esc(name)} · GitHub</text>
  <text x="${W - 28}" y="44" class="meta">last 12 months · public + private · updated ${esc(updated)}</text>
  <line x1="28" y1="58" x2="${W - 28}" y2="58" stroke="${ACCENT}" stroke-opacity="0.15"/>

  <text x="${cx}" y="80" class="sect" text-anchor="middle">GRADE</text>
  <g transform="translate(${cx}, ${cy})">
    <circle r="${r}" fill="none" stroke="${ACCENT}" stroke-opacity="0.12" stroke-width="8"/>
    <circle class="ring" r="${r}" fill="none" stroke="${ACCENT}" stroke-width="8" stroke-linecap="round" transform="rotate(-90)"/>
    <text y="10" class="grade">${esc(g.letter)}</text>
    <text y="30" class="score">${g.total} / 100</text>
  </g>
  <text x="${cx}" y="${cy + r + 22}" class="gradeSub">4 × 25 pts vs fixed targets</text>

  <text x="${bx}" y="80" class="sect">BREAKDOWN</text>
  ${bars}

  <text x="${fx}" y="80" class="sect">KEY FIGURES</text>
  ${figs}

  <line x1="28" y1="262" x2="${W - 28}" y2="262" stroke="${ACCENT}" stroke-opacity="0.1"/>
  <text x="${hx}" y="284" class="sect">LAST 52 WEEKS</text>
  <g class="heat">${heat}</g>
  <text x="${legendX}" y="306" class="legend">${fmtFull(m.contributions)} contributions</text>
  <text x="${legendX}" y="328" class="legend">best day <tspan class="legendVal">${m.best.contributionCount}</tspan> · ${esc(shortDate(m.best.date))}</text>
  <text x="${legendX}" y="350" class="legend">stars, followers: current totals</text>
  <g transform="translate(${legendX}, 364)">
    <text x="0" y="9" class="legend">less</text>
    ${OPAC.map((o, i) => `<rect x="${32 + i * 13}" y="0" width="${cell}" height="${cell}" rx="2" ${i ? `fill="${ACCENT}" fill-opacity="${o}"` : `fill="${EMPTY}"`}/>`).join("")}
    <text x="${32 + 5 * 13 + 4}" y="9" class="legend">more</text>
  </g>
</svg>`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
