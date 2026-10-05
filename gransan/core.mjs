export const normalize = value => String(value ?? '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function searchLocales(rows, query) {
  const q = normalize(query);
  if (!q) return [];
  const exact = rows.filter(r => [r.numero, r.etiqueta].some(n => normalize(n) === q));
  if (exact.length) return exact;
  return rows.filter(r => [r.numero, r.etiqueta, r.nombre].some(n => normalize(n).includes(q)));
}

// Importar por ID evita adjudicar el teléfono a otra tienda con el mismo número.
export function validateContacts(input, rows) {
  if (!input || input.version !== 1 || !Array.isArray(input.contactos)) throw new Error('Se requiere version: 1 y una lista contactos. Usa el prompt entregado.');
  const byId = new Map(rows.map(r => [r.id, r]));
  const ids = new Set();
  const contacts = input.contactos.map((c, index) => {
    const row = byId.get(c?.local_id);
    const fail = message => { throw new Error(`Contacto ${index + 1}: ${message}`); };
    if (!row) fail('local_id desconocido. No se importó ningún contacto.');
    if (ids.has(c.local_id)) fail('ID repetido; agrupa sus teléfonos en un solo registro.');
    ids.add(c.local_id);
    if (c.piso !== row.piso || c.numero !== row.numero) fail('piso o numero no coincide con el catálogo.');
    if (typeof c.nombre !== 'string' || normalize(c.nombre) !== normalize(row.nombre)) fail('nombre no coincide con el catálogo.');
    if (!Array.isArray(c.telefonos) || !c.telefonos.length) fail('faltan telefonos.');
    const phones = c.telefonos.map(p => {
      if (typeof p?.numero !== 'string' || !/^\+[1-9]\d{7,14}$/.test(p.numero)) fail('teléfono inválido: usa formato internacional, por ejemplo +57 y el número completo.');
      if (typeof p.whatsapp !== 'boolean') fail('whatsapp debe ser true o false.');
      return {numero: p.numero, whatsapp: p.whatsapp};
    });
    if (typeof c.fuente !== 'string' || !c.fuente.trim()) fail('falta la página o foto de origen.');
    if (c.redes !== undefined && (!Array.isArray(c.redes) || c.redes.some(value => typeof value !== 'string' || !value.trim()))) fail('redes debe contener usuarios o enlaces de texto.');
    return {local_id: c.local_id, piso: c.piso, numero: c.numero, nombre: c.nombre,
      telefonos: phones.filter((p, i, a) => a.findIndex(x => x.numero === p.numero && x.whatsapp === p.whatsapp) === i),
      ...(c.redes ? {redes: [...new Set(c.redes.map(value => value.trim()))]} : {}),
      fuente: c.fuente.trim()};
  });
  return {version: 1, contactos: contacts};
}

export function mergeContacts(previous, incoming) {
  const map = new Map(previous.contactos.map(c => [c.local_id, c]));
  for (const c of incoming.contactos) map.set(c.local_id, c);
  return {version: 1, contactos: [...map.values()]};
}
