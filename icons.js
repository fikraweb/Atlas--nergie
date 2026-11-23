const paths = {
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3"/><circle cx="12" cy="12" r="7"/>',
  door: '<path d="M3 21h18M5 21V4h14v17M8 21V7h8v14m-3-7h1"/>',
  water: '<path d="M2 17c2-2 3-2 5 0s3 2 5 0 3-2 5 0 3 2 5 0M2 21c2-2 3-2 5 0s3 2 5 0 3-2 5 0 3 2 5 0M7 14V5a2 2 0 0 1 4 0m5 9V5a2 2 0 0 1 4 0M7 8h9m-9 4h9"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  diagonal: '<path d="M6 18 18 6M8 6h10v10"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  shield: '<path d="M12 22s7-3 7-9V5l-7-3-7 3v8c0 6 7 9 7 9Z"/><path d="m9 12 2 2 4-4"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  users: '<circle cx="9" cy="7" r="3"/><path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M17 4a3 3 0 0 1 0 6m4 11v-2a5 5 0 0 0-3-5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  camera: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  home: '<path d="m2 11 10-9 10 9M5 9v12h14V9m-9 12v-6h4v6"/>',
  controls: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  whatsapp: '<path d="M20.6 3.5A11 11 0 0 0 3.3 16.6L2 22l5.6-1.3A11 11 0 0 0 20.6 3.5Z"/><path d="M8.2 7.2c-.8.2-1.4.9-1.4 1.9 0 2.8 4.1 6.7 7.2 7.2 1.3.2 2.3-.5 2.5-1.5.1-.4-2.2-1.7-2.5-1.5l-1.1 1a9 9 0 0 1-3.7-3.5l.8-1c.2-.3-1.1-2.7-1.8-2.6Z" fill="currentColor" stroke="none"/>',
};

export function icon(name) {
  return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + paths[name] + '</svg>';
}
