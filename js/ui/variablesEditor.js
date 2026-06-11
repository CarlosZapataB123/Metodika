/**
 * variablesEditor.js — Editor de variables y operacionalización.
 *
 * Renderiza la lista de variables ya definidas (fichas editables), el
 * formulario de alta y los requisitos pendientes según el diseño.
 * Toda regla metodológica proviene de knowledge/variables.js.
 */

import { el } from './dom.js';
import { state } from '../core/state.js';
import {
  ROLES,
  NIVELES,
  etiquetaRol,
  etiquetaNivel,
  requisitosVariables,
} from '../knowledge/variables.js';

export function renderEditorVariables(nodo, estado) {
  const { faltantes } = requisitosVariables(estado);

  return el(
    'div',
    {},
    estado.variables.length > 0 &&
      el('div', { class: 'fichas' }, estado.variables.map(fichaVariable)),
    formularioVariable(),
    faltantes.length > 0 &&
      el(
        'p',
        { class: 'pendientes', role: 'status' },
        'Para continuar, falta: ' + faltantes.join('; ') + '.'
      )
  );
}

/* ---- Ficha de variable definida ------------------------------- */

function fichaVariable(v) {
  return el(
    'article',
    { class: 'ficha' },
    el(
      'header',
      { class: 'ficha__cabecera' },
      el('strong', {}, v.nombre || 'Sin nombre'),
      el(
        'span',
        { class: 'ficha__meta' },
        `${etiquetaRol(v.rol)} · ${etiquetaNivel(v.nivel)}`
      ),
      el(
        'button',
        {
          class: 'ficha__eliminar',
          type: 'button',
          'aria-label': `Eliminar variable ${v.nombre}`,
          onClick: () => {
            if (confirm(`¿Eliminar la variable «${v.nombre}»?`)) {
              state.eliminarVariable(v.id);
            }
          },
        },
        '×'
      )
    ),
    el('p', { class: 'ficha__def' }, el('em', {}, 'Conceptual: '), v.defConceptual),
    el('p', { class: 'ficha__def' }, el('em', {}, 'Operacional: '), v.defOperacional),
    v.indicadores &&
      el('p', { class: 'ficha__def' }, el('em', {}, 'Indicadores: '), v.indicadores)
  );
}

/* ---- Formulario de alta ---------------------------------------- */

function formularioVariable() {
  const campos = {};

  const campo = (id, etiqueta, control) => {
    campos[id] = control;
    return el(
      'div',
      { class: 'campo' },
      el('label', { class: 'campo__etiqueta', for: `var-${id}` }, etiqueta),
      control
    );
  };

  const input = (id, placeholder) =>
    el('input', { class: 'campo__control', id: `var-${id}`, type: 'text', placeholder });

  const area = (id, placeholder) =>
    el('textarea', { class: 'campo__control', id: `var-${id}`, rows: 2, placeholder });

  const select = (id, opciones) =>
    el(
      'select',
      { class: 'campo__control', id: `var-${id}` },
      opciones.map((o) => el('option', { value: o.id }, o.etiqueta))
    );

  const aviso = el('p', { class: 'error-validacion', role: 'alert', hidden: '' });

  return el(
    'div',
    { class: 'formulario' },
    el('h3', { class: 'formulario__titulo' }, 'Agregar variable'),
    campo('nombre', 'Nombre de la variable', input('nombre', 'p. ej., Bienestar psicológico')),
    el(
      'div',
      { class: 'formulario__fila' },
      campo('rol', 'Rol en el diseño', select('rol', ROLES)),
      campo('nivel', 'Nivel de medición', select('nivel', NIVELES))
    ),
    campo(
      'defConceptual',
      'Definición conceptual (qué es, según la teoría)',
      area('defConceptual', 'Defina el constructo citando la fuente teórica…')
    ),
    campo(
      'defOperacional',
      'Definición operacional (cómo se medirá)',
      area('defOperacional', 'Instrumento, procedimiento de puntuación, rango…')
    ),
    campo(
      'indicadores',
      'Dimensiones e indicadores (opcional)',
      input('indicadores', 'p. ej., autoaceptación; relaciones positivas; propósito')
    ),
    aviso,
    el(
      'button',
      {
        class: 'boton-primario',
        type: 'button',
        onClick: () => {
          const datos = {
            nombre: campos.nombre.value.trim(),
            rol: campos.rol.value,
            nivel: campos.nivel.value,
            defConceptual: campos.defConceptual.value.trim(),
            defOperacional: campos.defOperacional.value.trim(),
            indicadores: campos.indicadores.value.trim(),
          };
          if (!datos.nombre || !datos.defConceptual || !datos.defOperacional) {
            aviso.textContent =
              'Complete nombre, definición conceptual y definición operacional. ' +
              'La operacionalización incompleta es el defecto más señalado por los jurados.';
            aviso.hidden = false;
            return;
          }
          state.agregarVariable(datos);
        },
      },
      'Agregar a la matriz'
    )
  );
}
