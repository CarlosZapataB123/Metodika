/**
 * hipotesisEditor.js — Editor guiado del sistema de hipótesis.
 *
 * El tipo de hipótesis no se elige: lo deriva knowledge/hipotesis.js a
 * partir del diseño. El editor ofrece la plantilla, recibe la redacción
 * de Hi, pide la direccionalidad y genera la H₀ simétrica.
 */

import { el } from './dom.js';
import { state } from '../core/state.js';
import { tipoHipotesis } from '../knowledge/hipotesis.js';

export function renderEditorHipotesis(nodo, estado) {
  // Prerrequisito pedagógico: variables completas antes de redactar.
  if (nodo.prerrequisito && !nodo.prerrequisito(estado)) {
    return el(
      'p',
      { class: 'pendientes', role: 'status' },
      'Complete la operacionalización de variables: la hipótesis debe ' +
        'redactarse con los términos exactos de las variables ya definidas.'
    );
  }

  const tipo = tipoHipotesis(estado.decisiones);
  if (!tipo) return null;

  if (estado.hipotesis.guardada) return resumenGuardado(tipo, estado);

  return formulario(tipo, estado);
}

/* ---- Hipótesis guardada (editable) ----------------------------- */

function resumenGuardado(tipo, estado) {
  const h = estado.hipotesis;
  return el(
    'div',
    { class: 'hipotesis-resumen' },
    h.sinHipotesis
      ? el(
          'p',
          {},
          'Decisión registrada: el estudio no formulará hipótesis, lo cual ' +
            'es metodológicamente legítimo dado su alcance. Esta decisión ' +
            'quedará declarada en el capítulo de método.'
        )
      : el(
          'div',
          {},
          el('p', { class: 'hipotesis-linea' }, el('strong', {}, 'Hi: '), h.hi),
          el('p', { class: 'hipotesis-linea' }, tipo.h0(h.direccion)),
          el(
            'p',
            { class: 'hipotesis-meta' },
            `${tipo.nombre} · contraste ${h.direccion}`
          )
        ),
    el(
      'button',
      {
        class: 'boton-secundario',
        type: 'button',
        onClick: () => state.reabrirHipotesis(),
      },
      'Editar hipótesis'
    )
  );
}

/* ---- Formulario de redacción ------------------------------------ */

function formulario(tipo, estado) {
  const nombresVariables = estado.variables.map((v) => v.nombre).join(' · ');

  const areaHi = el('textarea', {
    class: 'campo__control',
    id: 'hi-texto',
    rows: 3,
    placeholder: tipo.plantilla,
  });
  if (estado.hipotesis.hi) areaHi.value = estado.hipotesis.hi;

  const selDireccion = el(
    'select',
    { class: 'campo__control', id: 'hi-direccion' },
    el('option', { value: 'bilateral' }, 'Bilateral (no direccional) — opción por defecto'),
    el('option', { value: 'unilateral' }, 'Unilateral (direccional) — requiere justificación previa')
  );
  selDireccion.value = estado.hipotesis.direccion || 'bilateral';

  const aviso = el('p', { class: 'error-validacion', role: 'alert', hidden: '' });

  return el(
    'div',
    { class: 'formulario' },
    el(
      'p',
      { class: 'hipotesis-tipo' },
      el('strong', {}, tipo.nombre + '. '),
      tipo.explicacion
    ),
    el(
      'p',
      { class: 'hipotesis-meta' },
      'Variables disponibles: ' + (nombresVariables || '—')
    ),
    el(
      'div',
      { class: 'campo' },
      el(
        'label',
        { class: 'campo__etiqueta', for: 'hi-texto' },
        'Hipótesis de investigación (Hi) — use la plantilla como guía'
      ),
      areaHi
    ),
    el(
      'div',
      { class: 'campo' },
      el(
        'label',
        { class: 'campo__etiqueta', for: 'hi-direccion' },
        'Direccionalidad del contraste'
      ),
      selDireccion
    ),
    aviso,
    el(
      'div',
      { class: 'formulario__acciones' },
      el(
        'button',
        {
          class: 'boton-primario',
          type: 'button',
          onClick: () => {
            const hi = areaHi.value.trim();
            if (!hi) {
              aviso.textContent =
                'Redacte la hipótesis como afirmación (no como pregunta ni objetivo).';
              aviso.hidden = false;
              return;
            }
            if (/^¿|determinar si|analizar si|conocer si/i.test(hi)) {
              aviso.textContent =
                'Eso parece una pregunta u objetivo. La hipótesis es una ' +
                'afirmación verificable: «Existe…», «Los participantes que… presentarán…».';
              aviso.hidden = false;
              return;
            }
            state.guardarHipotesis({
              hi,
              direccion: selDireccion.value,
              sinHipotesis: false,
            });
          },
        },
        'Guardar sistema de hipótesis'
      ),
      tipo.opcional &&
        el(
          'button',
          {
            class: 'boton-secundario',
            type: 'button',
            onClick: () =>
              state.guardarHipotesis({ hi: '', sinHipotesis: true }),
          },
          'Este estudio no formulará hipótesis'
        )
    )
  );
}
