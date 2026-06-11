/**
 * poblacionEditor.js — Editor de unidad de análisis, población y criterios.
 */

import { el } from './dom.js';
import { state } from '../core/state.js';

export function renderEditorPoblacion(nodo, estado) {
  const p = estado.poblacion;
  if (p.guardada) return resumen(p);
  return formulario(p);
}

function resumen(p) {
  const linea = (rotulo, valor) =>
    valor &&
    el('p', { class: 'ficha__def' }, el('em', {}, rotulo + ': '), valor);

  return el(
    'div',
    { class: 'hipotesis-resumen' },
    linea('Unidad de análisis', p.unidad),
    linea('Población', p.descripcion),
    linea('Criterios de inclusión', p.inclusion),
    linea('Criterios de exclusión', p.exclusion),
    el(
      'button',
      {
        class: 'boton-secundario',
        type: 'button',
        onClick: () => state.editarPoblacion(),
      },
      'Editar población'
    )
  );
}

function formulario(p) {
  const campos = {};

  const campo = (id, etiqueta, control, ayuda) => {
    campos[id] = control;
    if (p[id]) control.value = p[id];
    return el(
      'div',
      { class: 'campo' },
      el('label', { class: 'campo__etiqueta', for: `pob-${id}` }, etiqueta),
      control,
      ayuda && el('p', { class: 'campo__ayuda' }, ayuda)
    );
  };

  const input = (id, placeholder) =>
    el('input', { class: 'campo__control', id: `pob-${id}`, type: 'text', placeholder });
  const area = (id, placeholder) =>
    el('textarea', { class: 'campo__control', id: `pob-${id}`, rows: 2, placeholder });

  const aviso = el('p', { class: 'error-validacion', role: 'alert', hidden: '' });

  return el(
    'div',
    { class: 'formulario' },
    campo('unidad', 'Unidad de análisis',
      input('unidad', 'p. ej., profesionales de enfermería en ejercicio'),
      '¿Quiénes o qué serán medidos?'),
    campo('descripcion', 'Delimitación de la población (contenido, lugar, tiempo)',
      area('descripcion', 'p. ej., profesionales de enfermería de hospitales públicos de Navarra durante 2026')),
    campo('inclusion', 'Criterios de inclusión',
      area('inclusion', 'p. ej., contrato vigente; antigüedad ≥ 6 meses; consentimiento informado')),
    campo('exclusion', 'Criterios de exclusión',
      area('exclusion', 'p. ej., licencia prolongada durante la recolección; participación en el piloto')),
    aviso,
    el(
      'button',
      {
        class: 'boton-primario',
        type: 'button',
        onClick: () => {
          const datos = {
            unidad: campos.unidad.value.trim(),
            descripcion: campos.descripcion.value.trim(),
            inclusion: campos.inclusion.value.trim(),
            exclusion: campos.exclusion.value.trim(),
          };
          if (!datos.unidad || !datos.descripcion || !datos.inclusion) {
            aviso.textContent =
              'Defina al menos la unidad de análisis, la delimitación ' +
              '(contenido, lugar y tiempo) y los criterios de inclusión.';
            aviso.hidden = false;
            return;
          }
          state.guardarPoblacion(datos);
        },
      },
      'Guardar población'
    )
  );
}
