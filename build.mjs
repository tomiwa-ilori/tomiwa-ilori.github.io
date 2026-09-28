// Builds the site into dist/. Run: npm run build
// Content lives in content/: site.json, projects/*.md, posts/*.md
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const C = (...p) => path.join(ROOT, 'content', ...p);
const OUT = path.join(ROOT, 'dist');
const site = JSON.parse(fs.readFileSync(C('site.json'), 'utf8'));

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    let v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    data[line.slice(0, i).trim()] = v === 'true' ? true : v === 'false' ? false : v;
  }
  return { data, body: m[2] };
}

function load(dir) {
  const full = C(dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith('.md')).map(f => {
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(full, f), 'utf8'));
    const slug = f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    return { ...data, slug, html: marked.parse(body) };
  });
}

const list = s => (s ? String(s).split(',').map(x => x.trim()).filter(Boolean) : []);
const fmtDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const words = html => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

const projects = load('projects').sort((a, b) => Number(a.order || 99) - Number(b.order || 99));
const posts = load('posts').filter(p => !p.draft).sort((a, b) => String(b.date).localeCompare(String(a.date)));

// ---------- hero chart: win probability vs bid ----------
function winChart() {
  const W = 440, H = 280, L = 48, R = 20, T = 20, B = 44;
  const pw = W - L - R, ph = H - T - B;
  const bmax = 0.07, target = 0.8;
  const p = b => 1 / (1 + Math.exp(-(b - 0.0265) / 0.0082));        // illustrative curve
  const x = b => L + (b / bmax) * pw, y = v => T + (1 - v) * ph;
  let bstar = 0; while (p(bstar) < target) bstar += 0.0001;          // lowest bid clearing target
  const pts = []; for (let b = 0; b <= bmax + 1e-9; b += bmax / 140) pts.push(`${x(b).toFixed(1)},${y(p(b)).toFixed(1)}`);
  const area = `M${x(0)},${y(0)} L${pts.join(' L')} L${x(bmax)},${y(0)} Z`;
  const yt = [0, 0.25, 0.5, 0.75, 1].map(v => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="tick" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v * 100}%</text>`).join('');
  const xt = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07].map(b => `<text class="tick" x="${x(b)}" y="${H - B + 18}" text-anchor="middle">${b === 0 ? '$0' : '$' + b.toFixed(2)}</text>`).join('');
  const bs = bstar.toFixed(3);
  return `<svg class="winchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Illustrative curve of win probability rising with bid. The lowest bid reaching an 80% chance of winning is about $${bs}.">
  ${yt}${xt}
  <path class="curve-area" d="${area}"/>
  <polyline class="curve" points="${pts.join(' ')}"/>
  <line class="target" x1="${L}" x2="${W - R}" y1="${y(target)}" y2="${y(target)}"/>
  <text class="target-label" x="${W - R}" y="${y(target) - 8}" text-anchor="end">target 80%</text>
  <line class="drop" x1="${x(bstar)}" x2="${x(bstar)}" y1="${y(target)}" y2="${y(0)}"/>
  <circle class="pick" cx="${x(bstar)}" cy="${y(target)}" r="5.5"/>
  <text class="pick-label" x="${x(bstar) + 10}" y="${y(target) + 22}">bid $${bs}</text>
  <text class="axis" x="${L + pw / 2}" y="${H - 6}" text-anchor="middle">bid</text>
  <text class="axis" x="14" y="${T + ph / 2}" text-anchor="middle" transform="rotate(-90 14 ${T + ph / 2})">P(win)</text>
</svg>`;
}

// ---------- layout ----------
function layout({ title, description, depth = 0, body, active = '', canonical = '' }) {
  const r = depth ? '../'.repeat(depth) : '';
  const nav = [
    ['Projects', `${r}index.html#projects`, 'projects'],
    ['Experience', `${r}index.html#experience`, 'experience'],
    ['Writing', `${r}blog/index.html`, 'blog'],
    ['Resume', `${r}resume.pdf`, 'resume'],
  ].map(([t, h, k]) => `<a href="${h}"${k === active ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.title}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || site.description)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description || site.description)}">
<meta property="og:type" content="website">
${canonical ? `<link rel="canonical" href="${site.url}/${canonical}">` : ''}
<link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${r}assets/style.css">
${posts.length ? `<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${r}blog/feed.xml">` : ''}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
  <div class="wrap head-inner">
    <a class="brand" href="${r}index.html"><span class="mark" aria-hidden="true">II</span>${esc(site.name)}</a>
    <nav aria-label="Main">${nav}</nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-foot">
  <div class="wrap foot-inner">
    <div>
      <p class="foot-name">${esc(site.name)}</p>
      <p class="muted">${esc(site.title)} · ${esc(site.location)}</p>
    </div>
    <ul class="foot-links">
      <li><span class="label">Email</span> <a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></li>
      <li><span class="label">LinkedIn</span> <a href="${esc(site.contact.linkedin)}">linkedin.com/in/israelilori</a></li>
      <li><span class="label">Medium</span> <a href="${esc(site.contact.medium)}">medium.com/@ogenepabo</a></li>
    </ul>
  </div>
</footer>
</body>
</html>
`;
}

const tags = arr => `<ul class="tags">${arr.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;

function projectRows(r) {
  return projects.map(p => `
    <li class="row">
      <a href="${r}projects/${p.slug}.html">
        <span class="row-meta">${esc(p.org)}<span class="dot">·</span>${esc(p.period)}</span>
        <span class="row-title">${esc(p.title)}</span>
        <span class="row-sum">${esc(p.summary)}</span>
        <span class="row-go" aria-hidden="true">Read case study →</span>
      </a>
    </li>`).join('');
}

function postRows(r, items) {
  return items.map(p => `
    <li class="post-row">
      <time datetime="${p.date}">${fmtDate(p.date)}</time>
      <a href="${r}blog/${p.slug}.html">${esc(p.title)}</a>
      <p>${esc(p.summary)}</p>
    </li>`).join('');
}

// ---------- pages ----------
function home() {
  const s = site;
  const body = `
<section class="hero wrap">
  <div class="hero-text">
    <p class="eyebrow">${esc(s.title)} · ${esc(s.location)}</p>
    <h1>${esc(s.name)}</h1>
    <p class="lede">${esc(s.intro)}</p>
    <div class="actions">
      <a class="btn" href="#projects">See my projects</a>
      <a class="btn ghost" href="resume.pdf">Download resume</a>
    </div>
  </div>
  <figure class="hero-fig">
    ${winChart()}
    <figcaption><strong>What I'm working on.</strong> Recommending the lowest bid that still reaches a target chance of winning an ad auction. Illustrative curve.</figcaption>
  </figure>
</section>

<section class="wrap figures" aria-label="Highlights">
  ${s.figures.map(f => `<div class="fig"><span class="fig-v">${esc(f.value)}</span><span class="fig-l">${esc(f.label)}</span></div>`).join('')}
</section>

<section class="wrap section about" id="about">
  <h2>About</h2>
  <div class="prose">${s.about.map(p => `<p>${esc(p)}</p>`).join('')}</div>
</section>

<section class="wrap section" id="projects">
  <h2>Projects</h2>
  <ul class="rows">${projectRows('')}</ul>
</section>

<section class="wrap section" id="experience">
  <h2>Experience</h2>
  <ol class="timeline">
    ${s.experience.map(e => `
    <li>
      <span class="when">${esc(e.start)} – ${esc(e.end)}</span>
      <div>
        <h3>${esc(e.role)} <span class="at">at</span> ${esc(e.org)}</h3>
        ${e.team ? `<p class="team">${esc(e.team)}</p>` : ''}
        <p>${esc(e.summary)}</p>
      </div>
    </li>`).join('')}
  </ol>
  <div class="two-col">
    <div>
      <h3 class="minor">Education</h3>
      <ul class="plain">${s.education.map(e => `<li><strong>${esc(e.name)}</strong>, ${esc(e.school)}${e.note ? ` <span class="muted">(${esc(e.note)})</span>` : ''}</li>`).join('')}</ul>
    </div>
    <div>
      <h3 class="minor">Certifications</h3>
      <ul class="plain">${s.certifications.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    </div>
  </div>
  <h3 class="minor">Tools I use</h3>
  <dl class="skills">${Object.entries(s.skills).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
</section>

<section class="wrap section" id="writing">
  <h2>Writing</h2>
  ${posts.length ? `<ul class="posts">${postRows('', posts.slice(0, 3))}</ul>` : ''}
  <p class="more"><a href="blog/index.html">All posts</a> <span class="dot">·</span> <a href="${esc(s.contact.medium)}">More on Medium</a></p>
</section>

<section class="wrap section contact" id="contact">
  <h2>Get in touch</h2>
  <p class="prose">I'm interested in data leadership roles where strategy and engineering meet. The quickest way to reach me is email.</p>
  <p class="email-line"><a href="mailto:${esc(s.contact.email)}">${esc(s.contact.email)}</a></p>
</section>`;
  return layout({ body, canonical: '' });
}

function projectPage(p, i) {
  const prev = projects[i - 1], next = projects[i + 1];
  const body = `
<article class="wrap article">
  <p class="crumb"><a href="../index.html#projects">Projects</a></p>
  <p class="eyebrow">${esc(p.org)} · ${esc(p.period)}</p>
  <h1>${esc(p.title)}</h1>
  <p class="lede">${esc(p.summary)}</p>
  <div class="meta-box">
    ${p.status ? `<p><span class="label">Status</span> ${esc(p.status)}</p>` : ''}
    <div><span class="label">Stack</span> ${tags(list(p.stack))}</div>
  </div>
  <div class="prose">${p.html}</div>
  <nav class="pager" aria-label="More projects">
    ${prev ? `<a href="${prev.slug}.html"><span class="label">Previous</span>${esc(prev.title)}</a>` : '<span></span>'}
    ${next ? `<a class="next" href="${next.slug}.html"><span class="label">Next</span>${esc(next.title)}</a>` : ''}
  </nav>
</article>`;
  return layout({ title: p.title, description: p.summary, depth: 1, body, active: 'projects', canonical: `projects/${p.slug}.html` });
}

function blogIndex() {
  const body = `
<section class="wrap article">
  <p class="eyebrow">Writing</p>
  <h1>Notes on data, ML and building things</h1>
  <p class="lede">What I learn from the systems I build: design decisions, mistakes, and what I'd do again.</p>
  ${posts.length ? `<ul class="posts">${postRows('../', posts)}</ul>` : '<p>No posts yet.</p>'}
  <p class="more">Older writing is on <a href="${esc(site.contact.medium)}">Medium</a>.</p>
</section>`;
  return layout({ title: 'Writing', description: 'Posts by Israel Ilori on data engineering, machine learning and AI systems.', depth: 1, body, active: 'blog', canonical: 'blog/' });
}

function postPage(p) {
  const mins = Math.max(1, Math.round(words(p.html) / 220));
  const body = `
<article class="wrap article">
  <p class="crumb"><a href="index.html">Writing</a></p>
  <p class="eyebrow"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${mins} min read</p>
  <h1>${esc(p.title)}</h1>
  <p class="lede">${esc(p.summary)}</p>
  ${list(p.tags).length ? tags(list(p.tags)) : ''}
  <div class="prose">${p.html}</div>
  <p class="more"><a href="index.html">← All posts</a></p>
</article>`;
  return layout({ title: p.title, description: p.summary, depth: 1, body, active: 'blog', canonical: `blog/${p.slug}.html` });
}

function feed() {
  const items = posts.map(p => `<item><title>${esc(p.title)}</title><link>${site.url}/blog/${p.slug}.html</link><guid>${site.url}/blog/${p.slug}.html</guid><pubDate>${new Date(p.date + 'T12:00:00Z').toUTCString()}</pubDate><description>${esc(p.summary)}</description></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)}</title><link>${site.url}</link><description>${esc(site.description)}</description>${items}</channel></rss>`;
}

// ---------- write ----------
fs.rmSync(OUT, { recursive: true, force: true });
const write = (rel, content) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };
write('index.html', home());
projects.forEach((p, i) => write(`projects/${p.slug}.html`, projectPage(p, i)));
write('blog/index.html', blogIndex());
posts.forEach(p => write(`blog/${p.slug}.html`, postPage(p)));
write('blog/feed.xml', feed());
write('404.html', layout({ title: 'Page not found', body: `<section class="wrap article"><h1>Page not found</h1><p class="lede">That page doesn't exist. <a href="/">Go to the home page</a>.</p></section>` }));
fs.cpSync(path.join(ROOT, 'static'), OUT, { recursive: true });
const urls = ['', 'blog/', ...projects.map(p => `projects/${p.slug}.html`), ...posts.map(p => `blog/${p.slug}.html`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${site.url}/${u}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${projects.length} projects and ${posts.length} posts into dist/`);
