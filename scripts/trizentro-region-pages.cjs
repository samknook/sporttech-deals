'use strict';

const fs = require('node:fs');
const path = require('node:path');

const selections = [
  {
    slug: 'hardloopwedstrijden-noord-holland',
    title: 'Hardloopwedstrijden in Noord-Holland',
    intro: 'Vind wegwedstrijden, halve marathons en trails in Noord-Holland, van Egmond tot Volendam.',
    sport: 'Hardlopen',
  },
  {
    slug: 'graveltochten-noord-holland',
    title: 'Graveltochten in Noord-Holland',
    intro: 'Vind georganiseerde graveltochten in Noord-Holland. Bekijk per tocht de afstand en de informatie van de organisator.',
    sport: 'Fietsen',
    discipline: 'gravel',
  },
  {
    slug: 'triatlons-noord-holland',
    title: 'Triatlons in Noord-Holland',
    intro: 'Ontdek triatlons in Noord-Holland, van lokale wedstrijden tot IRONMAN 70.3 Westfriesland.',
    sport: 'Triatlon',
  },
];

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

function writeRegionPages({ root, events, filename, date }) {
  const now = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date());
  for (const selection of selections) {
    const matches = events.filter(event =>
      event.country === 'Nederland' &&
      ['Noord-Holland', 'Waterland & West-Friesland'].includes(event.region) &&
      event.sport === selection.sport &&
      (!selection.discipline || new RegExp(selection.discipline, 'i').test(event.discipline || event.name)) &&
      !/duatlon|duathlon|run[ -]bike[ -]run/i.test(event.name) &&
      (event.date ? event.date >= now : event.expectedMonth &&
        (event.expectedYear || 2027) + '-' + String(event.expectedMonth).padStart(2, '0') >= now.slice(0, 7))
    ).sort((left, right) => eventSortKey(left).localeCompare(eventSortKey(right)));
    const cards = matches.map(event => '<li><a href="../wedstrijden/' + escapeHtml(filename(event)) + '">' +
      escapeHtml(event.name) + '</a><span>' + escapeHtml([event.place, event.distance].filter(Boolean).join(' · ')) +
      '</span><small>' + escapeHtml(date(event)) +
      (event.date && event.dateEvidence !== 'official' ? ' · Controleer de datum bij de organisator' : '') +
      '</small></li>').join('\n');
    const canonical = 'https://trizentro.com/events/' + selection.slug + '/';
    const output = path.join(root, 'events', selection.slug);
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'index.html'), `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(selection.title)} | TriZentro</title><meta name="description" content="${escapeHtml(selection.intro)}">
<link rel="canonical" href="${canonical}"><link rel="stylesheet" href="../../raceatlas/region-events.css"></head>
<body><main class="region-content">
<a href="../" class="region-back">← Alle evenementen</a>
<h1>${escapeHtml(selection.title)}</h1><p>${escapeHtml(selection.intro)}</p>
${cards ? '<ul class="region-races">' + cards + '</ul>' : '<p>Er staan momenteel geen aankomende evenementen in deze selectie.</p>'}
<nav aria-label="Meer evenementen in Noord-Holland">${selections.filter(item => item !== selection).map(item =>
  '<a href="../' + item.slug + '/">' + escapeHtml(item.title) + '</a>').join(' ')}</nav>
<aside><a href="../../organisatoren/#aanmelden">Meld een evenement aan ↗</a></aside>
</main></body></html>`);
    console.log(selection.slug + ': ' + matches.length + ' upcoming events');
  }
}

function eventSortKey(event) {
  return event.date || (event.expectedYear || 2027) + '-' + String(event.expectedMonth).padStart(2, '0') + '-32';
}

module.exports = { selections, writeRegionPages };
