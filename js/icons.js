// Icon set — the board's icons, one module for every page.
export const I = {
 kids:'<circle cx="8" cy="5.6" r="2.3"/><path d="M4 20.5v-6a4 4 0 0 1 8 0v6"/><circle cx="17" cy="10.3" r="1.8"/><path d="M14 20.5V17a3 3 0 0 1 6 0v3.5"/>',
 ticket:'<path d="M4.5 5.5h15A1.5 1.5 0 0 1 21 7v3.25a1.75 1.75 0 0 0 0 3.5V17a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17v-3.25a1.75 1.75 0 0 0 0-3.5V7a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M9.5 8.5h.01M9.5 12h.01M9.5 15.5h.01"/>',
 bus:'<path d="M7.5 3.5h9A2.5 2.5 0 0 1 19 6v12H5V6a2.5 2.5 0 0 1 2.5-2.5z"/><path d="M5 11h14M8.5 14.5h.01M15.5 14.5h.01M7.5 18v2.5M16.5 18v2.5"/>',
 yoga:'<path d="M12 4.5c2.3 2.2 3.4 4.6 3.4 7.2S14.3 16.6 12 18c-2.3-1.4-3.4-3.7-3.4-6.3S9.7 6.7 12 4.5z"/><path d="M8.7 9.6C6.6 9 4.6 9.1 2.8 9.8c.1 4.5 3.6 8.2 9.2 8.2s9.1-3.7 9.2-8.2c-1.8-.7-3.8-.8-5.9-.2"/>',
 trek:'<path d="M3 19.5 9.5 8l4.2 7 2.6-3.6 4.7 8.1z"/><path d="M9.5 8V3.5l3.4 1.4-3.4 1.4"/>',
 dj:'<path d="M4.5 13.5V12a7.5 7.5 0 0 1 15 0v1.5"/><rect x="3.5" y="13.5" width="4.5" height="7" rx="1.5"/><rect x="16" y="13.5" width="4.5" height="7" rx="1.5"/>',
 bed:'<path d="M3 18V7M21 18v-5H3M6.5 13v-2.2a1.3 1.3 0 0 1 1.3-1.3h3a1.3 1.3 0 0 1 1.3 1.3V13M3 15.5h18"/>',
 beams:'<path d="M3 9l9-5 9 5M5 8v12M19 8v12M5 12h14M9 9.6V20M15 9.6V20M3 20h18"/>',
 door:'<rect x="6" y="3" width="12" height="18" rx="1"/><circle cx="14.6" cy="12.4" r=".9"/><path d="M3 21h18"/>',
 shower:'<path d="M5 21V6a3 3 0 0 1 6 0v1"/><path d="M8 9.5h6a3 3 0 0 0-6 0z"/><path d="M9 12.5l-.6 1.4M11 12.5v1.6M13 12.5l.6 1.4M10 16.5l-.4 1.2M12 16.5v1.4"/>',
 guests:'<circle cx="9" cy="8" r="3"/><path d="M3 19.5c.6-3.5 3-5.3 6-5.3s5.4 1.8 6 5.3"/><circle cx="17" cy="9" r="2.4"/><path d="M15.8 14.4c2.6-.2 4.6 1.3 5.2 4.5"/>',
 glass:'<path d="M7 3h10l-1.2 6.5a3.9 3.9 0 0 1-7.6 0zM12 13.5V20M8.5 21h7"/>',
 clock:'<circle cx="12" cy="12" r="8.6"/><path d="M12 7v5.3l3.4 2"/>',
 pin:'<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>',
 phone:'<path d="M5 4h3.5l1.6 4.2-2.1 1.4a11 11 0 0 0 6.4 6.4l1.4-2.1L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5C10.5 20 4 13.5 3.5 5.6A1.5 1.5 0 0 1 5 4z"/>',
 mail:'<rect x="3" y="5.5" width="18" height="13" rx="1"/><path d="m3.5 6.5 8.5 7 8.5-7"/>',
 col:'<path d="M4 21h16M5 18h14M6 18V8M10 18V8M14 18V8M18 18V8M3.5 8h17L12 3.2z"/>',
 meter:'<path d="M5 19v-3M10 19v-7M15 19v-10M20 19V5"/>',
 leaf:'<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7"/>',
 cutlery:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.5-3 4-3 7h3v11"/>',
 calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 night:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
};
export const ico = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;
export const paintIcons = (root = document) => root.querySelectorAll('svg[data-i]').forEach(s => { s.outerHTML = ico(s.dataset.i); });
