/**
 * tutor.js — Renderizado del flujo conversacional del tutor metodológico.
 *
 * Despacha cada nodo a un renderizador según su tipo (registro de
 * renderizadores: sin if/else por nodo). Muestra además las validaciones
 * de coherencia transversal y los veredictos derivados por el motor.
 */

import { el, montar } from './dom.js';
import { engine } from '../core/engine.js';
import { state } from '../core/state.js';
import { renderEditorVariables } from './variablesEditor.js';
import { renderEditorHipotesis } from './hipotesisEditor.js';
import { renderEditorPoblacion } from './poblacionEditor.js';
import { renderCalculadoraMuestra } from './muestraCalculadora.js';
import { renderEditorInstrumentos } from './instrumentosEditor.js';
import { renderRecomendadorAnalisis } from './analisisRecomendador.js';

export function renderTutor(contenedor, estado) {
  const visibles = engine.nodosVisibles(estado);
  const veredictos = engine.veredictosActivos(estado.decisiones);
  const avisos = engine.validacionesActivas(estado);

  montar(
    contenedor,
    renderEspina(estado),
    visibles.map((nodo) => renderNodo(nodo, estado)),
    avisos.map((texto) =>
      el(
        'p',
        { class: 'advertencia', role: 'note' },
        el('strong', {}, 'Coherencia metodológica. '),
        texto
      )
    ),
    veredictos.map(renderVeredicto)
  );
}

/* ---- Registro de renderizadores por tipo de nodo -------------- */

const renderizadores = {
  seleccion: renderCuerpoSeleccion,
  editorVariables: renderEditorVariables,
  editorHipotesis: renderEditorHipotesis,
  editorPoblacion: renderEditorPoblacion,
  calculadoraMuestra: renderCalculadoraMuestra,
  editorInstrumentos: renderEditorInstrumentos,
  recomendadorAnalisis: renderRecomendadorAnalisis,
};

function renderNodo(nodo, estado) {
  const cuerpo = renderizadores[nodo.tipo ?? 'seleccion'];

  return el(
    'section',
    { class: 'decision', 'aria-labelledby': `q-${nodo.id}` },
    el('p', { class: 'decision__etiqueta' }, nodo.etapa),
    el('h2', { class: 'decision__pregunta', id: `q-${nodo.id}` }, nodo.pregunta),
    el('p', { class: 'decision__contexto' }, nodo.contexto),
    cuerpo(nodo, estado),
    nodo.pedagogia && renderPedagogia(nodo.pedagogia, 'Comprender esta etapa')
  );
}

/* ---- Nodo de selección ------------------------------------------ */

function renderCuerpoSeleccion(nodo, estado) {
  const elegida = estado.decisiones[nodo.id];
  const opcionElegida = nodo.opciones.find((o) => o.id === elegida);

  return el(
    'div',
    {},
    el(
      'div',
      { class: 'opciones', role: 'group', 'aria-labelledby': `q-${nodo.id}` },
      nodo.opciones.map((opcion) =>
        el(
          'button',
          {
            class: 'opcion',
            type: 'button',
            'aria-pressed': String(opcion.id === elegida),
            onClick: () => {
              state.decidir(nodo.id, opcion.id);
              engine.podarDecisionesHuerfanas();
            },
          },
          el('span', { class: 'opcion__titulo' }, opcion.titulo),
          el('span', { class: 'opcion__detalle' }, opcion.detalle)
        )
      )
    ),
    opcionElegida &&
      opcionElegida.pedagogia &&
      renderPedagogia(
        opcionElegida.pedagogia,
        `Comprender esta decisión: ${opcionElegida.titulo.toLowerCase()}`
      ),
    opcionElegida &&
      nodo.advertencias?.[elegida] &&
      el(
        'p',
        { class: 'advertencia', role: 'note' },
        el('strong', {}, 'Advertencia metodológica. '),
        nodo.advertencias[elegida]
      )
  );
}

/* ---- Bloque pedagógico -------------------------------------------- */

function renderPedagogia(p, titulo) {
  return el(
    'details',
    { class: 'pedagogia' },
    el('summary', { class: 'pedagogia__resumen' }, titulo),
    el(
      'div',
      { class: 'pedagogia__cuerpo' },
      el('h4', {}, 'Qué significa'),
      el('p', {}, p.queSignifica),
      el('h4', {}, 'Por qué importa'),
      el('p', {}, p.porQueImporta),
      el('h4', {}, 'Implicaciones'),
      el('ul', {}, p.implicaciones.map((i) => el('li', {}, i))),
      el('h4', {}, 'Errores frecuentes'),
      el('ul', {}, p.erroresFrecuentes.map((e) => el('li', {}, e))),
      el('p', { class: 'referencias' }, p.referencias)
    )
  );
}

/* ---- Espina y veredicto -------------------------------------------- */

function renderEspina(estado) {
  const etapas = engine.etapas(estado);
  const futuras = [];

  return el(
    'ol',
    { class: 'espina', 'aria-label': 'Progreso del diseño metodológico' },
    etapas.map(({ etapa, completa, activa }) =>
      el(
        'li',
        {
          class: [
            'espina__etapa',
            activa && 'espina__etapa--activa',
            completa && 'espina__etapa--completa',
          ]
            .filter(Boolean)
            .join(' '),
        },
        etapa
      )
    ),
    futuras.map((nombre) => el('li', { class: 'espina__etapa' }, nombre))
  );
}

function renderVeredicto(v) {
  return el(
    'section',
    { class: 'veredicto', 'aria-label': `Diseño derivado: ${v.nombre}` },
    el('p', { class: 'veredicto__etiqueta' }, 'DISEÑO DERIVADO DE SUS DECISIONES'),
    el('h2', { class: 'veredicto__nombre' }, v.nombre),
    el(
      'div',
      { class: 'veredicto__razonamiento' },
      v.premisas.map((premisa, i) =>
        el('span', { class: 'premisa' }, `P${i + 1} · ${premisa}`)
      ),
      el('p', { style: 'margin-top: 1rem' }, v.interpretacion),
      el(
        'p',
        { class: 'advertencia', role: 'note' },
        el('strong', {}, 'Advertencia metodológica. '),
        v.advertencia
      ),
      el('p', { class: 'referencias' }, v.referencias)
    )
  );
}
