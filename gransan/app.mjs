import {searchLocales, validateContacts, mergeContacts} from './core.mjs';
const $ = id => document.getElementById(id);
const KEY = 'gransan-contactos-v1';
const SAVED_KEY = 'gransan-locales-guardados-v1';
const DEFAULT_SAVED = ['73f68c5f1a878e18', 'bc94ad89a5271252', 'ebf06954ba4230ad', 'e68fe153e256e873', '9e5021e008ada6f1', '1406918e96f0f888', 'da1f59a56fa28b11', '457666b4e5b0bafc'];
let savedIds = new Set(DEFAULT_SAVED);
let data, selected = null, floor = 1, zoom = 1, pending = null;
let contacts = {version: 1, contactos: []};
let userData = {};
let defaultContacts = {version: 1, contactos: []};
const displayName = row => userData[row.id]?.nombre || row.nombre || 'Nombre no registrado';
const contactFor = row => contacts.contactos.find(c => c.local_id === row.id) || defaultContacts.contactos.find(c => c.local_id === row.id) || userData[row.id];
function renderSummary() {
  if (!selected) return;
  const phones = contactFor(selected)?.telefonos || [];
  const numbers = phones.map(p => p.numero.replace(/^\+57(?=\d{10}$)/, '')).join(' / ');
  $('status').textContent = `Lc ${selected.numero} - ${displayName(selected)} piso ${selected.piso} cel ${numbers || 'pendiente'}`;
}
const text = (tag, value, className) => {const el = document.createElement(tag); el.textContent = value; if(className) el.className = className; return el;};

function showFloor(number) {
  floor = number;
  const info = data.pisos.find(p => p.piso === number);
  $('map').src = `datos/${info.archivo}`;
  $('map').alt = `Plano del piso ${number}`;
  $('map').width = info.ancho;
  $('map').height = info.alto;
  $('coverage').hidden = number !== 3;
  document.querySelectorAll('[data-floor]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.floor) === floor)));
  renderMapLocals();
  renderMarker();
}
function renderMapLocals() {
  $('map-locals').replaceChildren(...data.locales.filter(r => r.piso === floor).map(r => {
    const button = text('button', '', 'map-local');
    button.type = 'button';
    button.style.left = `${r.x_normalizado * 100}%`;
    button.style.top = `${r.y_normalizado * 100}%`;
    button.dataset.localId = r.id;
    button.setAttribute('aria-label', `Local ${r.numero} · ${displayName(r)} · Piso ${r.piso}`);
    button.title = `Local ${r.numero} · ${displayName(r)}`;
    button.setAttribute('aria-pressed', String(selected?.id === r.id));
    button.onclick = () => {
      selected = r; $('results').hidden = true;
      renderMarker(); renderDetail(); renderSummary(); revealMap();
      $('map-locals').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.localId === r.id)));
    };
    return button;
  }));
}
function renderSaved() {
  const rows = data.locales.filter(r => savedIds.has(r.id));
  $('saved-count').textContent = `(${rows.length})`;
  $('saved-list').replaceChildren(...rows.map(r => {
    const item = text('div', '', 'saved-item');
    const locate = text('button', '', 'saved-locate'); locate.type = 'button';
    locate.append(text('strong', displayName(r)), text('small', `Local ${r.numero} · Piso ${r.piso}`));
    locate.onclick = () => { $('results').hidden = true; selectLocal(r); };
    const remove = text('button', 'Quitar'); remove.type = 'button';
    remove.setAttribute('aria-label', `Quitar ${displayName(r)}, local ${r.numero}, de guardados`);
    remove.onclick = () => toggleSaved(r);
    item.append(locate, remove); return item;
  }));
  if (!rows.length) $('saved-list').append(text('p', 'Busca o toca un local y pulsa Guardar local.'));
}
function toggleSaved(row) {
  const next = new Set(savedIds);
  if (next.has(row.id)) next.delete(row.id); else next.add(row.id);
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...next])); savedIds = next;
    $('saved-status').textContent = ''; renderSaved(); renderDetail();
  } catch { $('saved-status').textContent = 'El navegador no permitió guardar la lista.'; }
}
function renderMarker() {
  const visible = selected?.piso === floor;
  $('marker').hidden = !visible;
  if (!visible) return;
  $('marker').style.left = `${selected.x_normalizado * 100}%`;
  $('marker').style.top = `${selected.y_normalizado * 100}%`;
  $('marker-label').textContent = `Aquí ${selected.numero} ${displayName(selected)}`;
}
function center() {
  if (!selected || selected.piso !== floor) return;
  requestAnimationFrame(() => {
    $('viewport').scrollTo({left: selected.x_normalizado * $('canvas').clientWidth - $('viewport').clientWidth / 2,
      top: selected.y_normalizado * $('canvas').clientHeight - $('viewport').clientHeight / 2, behavior:'instant'});
  });
}
function setZoom(value) {
  zoom = Math.min(5, Math.max(1, value));
  $('canvas').style.width = `${zoom * 100}%`;
  if (selected?.piso === floor) center();
}
function setupMapGestures() {
  const viewport = $('viewport');
  let pinch = null;
  const geometry = touches => {
    const [a, b] = touches;
    const rect = viewport.getBoundingClientRect();
    return {distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
      x: (a.clientX + b.clientX) / 2 - rect.left - viewport.clientLeft,
      y: (a.clientY + b.clientY) / 2 - rect.top - viewport.clientTop};
  };
  viewport.addEventListener('touchstart', event => {
    if (event.touches.length !== 2) {pinch = null; return;}
    event.preventDefault();
    const g = geometry(event.touches);
    pinch = {distance: Math.max(1, g.distance), zoom,
      x: (viewport.scrollLeft + g.x) / zoom,
      y: (viewport.scrollTop + g.y) / zoom};
  }, {passive: false});
  viewport.addEventListener('touchmove', event => {
    if (!pinch || event.touches.length !== 2) return;
    event.preventDefault();
    const g = geometry(event.touches);
    zoom = Math.min(5, Math.max(1, pinch.zoom * g.distance / pinch.distance));
    $('canvas').style.width = `${zoom * 100}%`;
    viewport.scrollLeft = pinch.x * zoom - g.x;
    viewport.scrollTop = pinch.y * zoom - g.y;
  }, {passive: false});
  const end = () => {pinch = null;};
  viewport.addEventListener('touchend', end);
  viewport.addEventListener('touchcancel', end);
}
function renderDetail() {
  $('detail').hidden = !selected;
  if (!selected) return;
  const r = selected;
  const heading = text('div', '', 'detail-heading');
  heading.append(text('h2', displayName(r)), text('span', `Local ${r.numero} · Piso ${r.piso}`));
  $('detail').replaceChildren(heading);
  if (r.ubicacion_verificada === false) $('detail').append(text('p', 'Ubicación aproximada: número pendiente de verificar en el plano.', 'notice'));
  const extra = text('details', '', 'detail-extra');
  extra.append(text('summary', 'Más información'), text('p', r.categoria || 'Categoría no registrada'));
  const save = text('button', savedIds.has(r.id) ? 'Quitar de guardados' : 'Guardar local');
  save.type = 'button'; save.id = 'save-local'; save.setAttribute('aria-pressed', String(savedIds.has(r.id)));
  save.onclick = () => toggleSaved(r); $('detail').append(save);
  if(r.etiqueta !== r.numero) $('detail').append(text('p', `Mapa: ${r.etiqueta} · Ficha: ${r.numero}. Confirma en sitio.`, 'notice'));
  const contact = contactFor(r);
  if (!contact) $('detail').append(text('p', 'Teléfono pendiente: puedes agregarlo desde tu catálogo.'));
  else {
    for (const phone of contact.telefonos) {
      const call = text('a', `Llamar ${phone.numero}`, 'phone-link'); call.href = `tel:${phone.numero}`; $('detail').append(call);
      if (phone.whatsapp) {const wa = text('a', 'WhatsApp ↗', 'phone-link'); wa.href = `https://wa.me/${phone.numero.slice(1)}`; wa.target = '_blank'; wa.rel = 'noopener'; $('detail').append(wa);}
    }
    extra.append(text('p', `Fuente: ${contact.fuente}`));
  }
  $('detail').append(extra);
  if (r.piso !== floor) {
    const button = text('button', `Volver al local en piso ${r.piso}`);
    button.onclick = () => {showFloor(r.piso); center(); renderDetail();}; $('detail').append(button);
  }
}
function selectLocal(row) {
  selected = row; showFloor(row.piso); setZoom(Math.max(zoom, 2.5)); renderDetail();
  renderSummary(); revealMap();
}
function revealMap() {
  requestAnimationFrame(() => document.querySelector('.map-card').scrollIntoView({block:'start', behavior:'instant'}));
}
function search() {
  const query = $('query').value.trim();
  if (!query) { $('status').textContent = 'Escribe un número de local o una tienda.'; return; }
  const matches = searchLocales(data.locales.map(r => ({...r, nombre: displayName(r)})), query);
  const ids = new Set(matches.map(r => r.id));
  const results = data.locales.filter(r => ids.has(r.id));
  selected = null; renderMarker(); renderDetail();
  $('results').replaceChildren(); $('results').hidden = results.length <= 1;
  if (!results.length) { $('status').textContent = 'No hay un punto registrado para esa búsqueda. Revisa el número o consulta el plano; el piso 3 tiene cobertura parcial.'; return; }
  if (results.length === 1) {selectLocal(results[0]); return;}
  $('status').textContent = `${results.length} coincidencias. Elige el local correcto${results.length > 60 ? ' o escribe más para reducir la lista (se muestran 60)' : ''}.`;
  for (const r of results.slice(0, 60)) {
    const b = text('button', '', 'result'); b.type = 'button';
    b.append(text('strong', `${r.numero} · ${displayName(r)}`), text('small', `Piso ${r.piso} · ${r.categoria || 'Sin categoría'} · punto ${r.id.slice(0, 6)}`));
    if (r.numero !== r.etiqueta) b.append(text('small', `Etiqueta visible: ${r.etiqueta}`));
    b.onclick = () => selectLocal(r); $('results').append(b);
  }
}
function updateContacts() {$('contact-count').textContent = `${defaultContacts.contactos.length} incluidos · ${contacts.contactos.length} locales importados`; renderDetail(); renderSummary();}
function downloadJSON(name, object) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(object, null, 2)], {type: 'application/json'}));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function offlineSetup() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    $('offline-status').textContent = 'Prueba por Wi-Fi: mantén el computador encendido. Para instalar y usar sin conexión, abre la app por HTTPS.'; return;
  }
  try {
    await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
    $('offline-status').textContent = 'Planos guardados. Lista para abrir sin conexión en este navegador.';
  } catch { $('offline-status').textContent = 'No se pudo preparar el modo sin conexión. Recarga cuando tengas conexión.'; }
}
async function init() {
  try {
    const response = await fetch('./datos/locales.json');
    if (!response.ok) throw new Error('No se pudo cargar el catálogo.');
    data = await response.json();
    const userResponse = await fetch('./datos_usuario.json');
    if (!userResponse.ok) throw new Error('No se pudieron cargar los datos actualizados de locales.');
    userData = await userResponse.json();
    const contactsResponse = await fetch('./contactos.json');
    if (!contactsResponse.ok) throw new Error('No se pudieron cargar los contactos incluidos.');
    defaultContacts = validateContacts(await contactsResponse.json(), data.locales);
    if (!data.locales?.length || data.pisos?.length !== 3) throw new Error('Catálogo incompleto.');
    try {const saved = localStorage.getItem(KEY); if (saved) contacts = validateContacts(JSON.parse(saved), data.locales);}
    catch { $('import-status').textContent = 'No se pudieron recuperar los contactos guardados. Importa tu copia; puede haber cambiado el catálogo.'; }
    try {
      const stored = localStorage.getItem(SAVED_KEY);
      if (stored !== null) {
        const ids = JSON.parse(stored);
        if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) throw new Error('Lista inválida');
        savedIds = new Set(ids.filter(id => data.locales.some(r => r.id === id)));
      }
    } catch { $('saved-status').textContent = 'No se pudo recuperar tu lista; se muestran los locales iniciales.'; }
    renderSaved();
    showFloor(1); updateContacts();
    setupMapGestures();
    $('query').disabled = false; $('search-button').disabled = false;
    $('status').textContent = `${data.locales.length} puntos disponibles en tres pisos.`;
    $('search-form').onsubmit = event => {event.preventDefault(); search();};
    document.querySelectorAll('[data-floor]').forEach(b => b.onclick = () => {showFloor(Number(b.dataset.floor)); setZoom(1); $('viewport').scrollTo(0,0); renderDetail();});
    $('zoom-in').onclick = () => setZoom(zoom + .5);
    $('zoom-out').onclick = () => setZoom(zoom - .5);
    $('fit').onclick = () => {setZoom(1); if(selected?.piso !== floor) $('viewport').scrollTo(0,0);};
    $('map').onload = center;
    $('map').onerror = () => {$('status').textContent = 'No se pudo cargar el plano. Revisa la conexión y recarga.';};
    $('contact-file').onchange = async event => {
      pending = null; $('import-preview').hidden = true;
      const file = event.target.files[0]; if(!file) return;
      try {
        if (file.size > 2 * 1024 * 1024) throw new Error('El JSON supera 2 MB. Divide el catálogo en lotes.');
        pending = validateContacts(JSON.parse((await file.text()).replace(/^\uFEFF/, '')), data.locales);
        if (!pending.contactos.length) throw new Error('El archivo no contiene contactos vinculados.');
        const replaced = pending.contactos.filter(c => contacts.contactos.some(x => x.local_id === c.local_id)).length;
        $('import-summary').textContent = `${pending.contactos.length} locales listos para guardar (${replaced} reemplazarán sus teléfonos anteriores). Revisa los datos contra tu catálogo.`;
        $('import-list').replaceChildren(...pending.contactos.map(c => text('li', `Piso ${c.piso} · ${c.numero} · ${c.nombre || 'Sin nombre'}: ${c.telefonos.map(p => p.numero).join(', ')} — ${c.fuente}`)));
        $('import-preview').hidden = false; $('import-status').textContent = '';
      } catch (error) {pending = null; $('import-status').textContent = error.message;}
      event.target.value = '';
    };
    $('confirm-import').onclick = () => {
      if (!pending) return;
      try {
        const merged = mergeContacts(contacts, pending); localStorage.setItem(KEY, JSON.stringify(merged)); contacts = merged;
        pending = null; $('import-preview').hidden = true; $('import-status').textContent = 'Contactos guardados en este navegador. Exporta una copia para conservarlos.'; updateContacts();
      } catch { $('import-status').textContent = 'El navegador no permitió guardar. Habilita almacenamiento o usa otro navegador; no se cambió la lista.'; }
    };
    $('cancel-import').onclick = () => {pending = null; $('import-preview').hidden = true;};
    $('export-contacts').onclick = () => downloadJSON('contactos.json', mergeContacts(defaultContacts, contacts));
    $('clear-contacts').onclick = () => {
      if (!confirm('¿Borrar los teléfonos guardados en este navegador? Exporta una copia antes si la necesitas.')) return;
      try {localStorage.removeItem(KEY); contacts = {version:1, contactos:[]}; updateContacts(); $('import-status').textContent = 'Teléfonos borrados.';}
      catch {$('import-status').textContent = 'No se pudo borrar el almacenamiento.';}
    };
    offlineSetup();
  } catch(error) {$('status').textContent = `${error.message} Inicia la app con iniciar_app.py; no abras el HTML con doble clic.`; $('offline-status').textContent = 'App sin cargar.';}
}
let installPrompt;
window.addEventListener('beforeinstallprompt', event => {event.preventDefault(); installPrompt = event; $('install').hidden = false;});
$('install').onclick = async () => {if (installPrompt) {await installPrompt.prompt(); installPrompt = null; $('install').hidden = true;}};
init();
