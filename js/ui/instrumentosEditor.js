/**
 * instrumentosEditor.js — Editor de instrumentos + calculadora de alfa.
 */

import { el } from './dom.js';
import { state } from '../core/state.js';
import { TIPOS_INSTRUMENTO, etiquetaTipoInstrumento } from '../knowledge/instrumentos.js';
import { alfaCronbach, lecturaAlfa } from '../stats/confiabilidad.js';
import { botonCargarCSV } from './csv.js';

export function renderEditorInstrumentos(nodo, estado) {
  const lista = estado.instrumentos.lista;

  return el(
    'div',
    {},
    lista.length > 0 && el('div', { class: 'fichas' }, lista.map(ficha)),
    formulario(estado),
    calculadoraAlfa(),
    lista.length > 0 &&
      !estado.instrumentos.guardada &&
      el(
        'button',
        {
          class: 'boton-primario',
          type: 'button',
          style: 'margin-top: 1rem',
          onClick: () => state.cerrarInstrumentos(),
        },
        'Confirmar instrumentos y continuar'
      )
  );
}

function ficha(ins) {
  return el(
    'article',
    { class: 'ficha' },
    el(
      'header',
      { class: 'ficha__cabecera' },
      el('strong', {}, ins.nombre),
      el('span', { class: 'ficha__meta' }, etiquetaTipoInstrumento(ins.tipo)),
      el(
        'button',
        {
          class: 'ficha__eliminar', type: 'button',
          'aria-label': `Eliminar instrumento ${ins.nombre}`,
          onClick: () => state.eliminarInstrumento(ins.id),
        },
        '×'
      )
    ),
    el('p', { class: 'ficha__def' }, el('em', {}, 'Mide: '), ins.variable),
    el('p', { class: 'ficha__def' }, el('em', {}, 'Evidencias de validez: '), ins.validez),
    ins.confiabilidad &&
      el('p', { class: 'ficha__def' }, el('em', {}, 'Confiabilidad: '), ins.confiabilidad)
  );
}

function formulario(estado) {
  const c = {};
  const campo = (id, etiqueta, control, ayuda) => {
    c[id] = control;
    return el(
      'div',
      { class: 'campo' },
      el('label', { class: 'campo__etiqueta', for: `ins-${id}` }, etiqueta),
      control,
      ayuda && el('p', { class: 'campo__ayuda' }, ayuda)
    );
  };

  const aviso = el('p', { class: 'error-validacion', role: 'alert', hidden: '' });

  return el(
    'div',
    { class: 'formulario' },
    el('h3', { class: 'formulario__titulo' }, 'Agregar instrumento'),
    campo('nombre', 'Nombre del instrumento',
      el('input', { class: 'campo__control', id: 'ins-nombre', type: 'text', placeholder: 'p. ej., Escala de Bienestar Psicológico de Ryff (versión 29 ítems)' })),
    el(
      'div',
      { class: 'formulario__fila' },
      campo('tipo', 'Tipo',
        el('select', { class: 'campo__control', id: 'ins-tipo' },
          TIPOS_INSTRUMENTO.map((t) => el('option', { value: t.id }, t.etiqueta)))),
      campo('variable', 'Variable que mide',
        el('select', { class: 'campo__control', id: 'ins-variable' },
          estado.variables.map((v) => el('option', { value: v.nombre }, v.nombre))))
    ),
    campo('validez', 'Evidencias de validez que citará',
      el('textarea', { class: 'campo__control', id: 'ins-validez', rows: 2, placeholder: 'p. ej., estructura factorial replicada en población española (Díaz et al., 2006); validez convergente con…' })),
    campo('confiabilidad', 'Confiabilidad reportada (antecedentes y propia)',
      el('input', { class: 'campo__control', id: 'ins-confiabilidad', type: 'text', placeholder: 'p. ej., α = .84 en validación original; se calculará α con datos propios' })),
    aviso,
    el(
      'button',
      {
        class: 'boton-primario', type: 'button',
        onClick: () => {
          const datos = {
            nombre: c.nombre.value.trim(),
            tipo: c.tipo.value,
            variable: c.variable.value,
            validez: c.validez.value.trim(),
            confiabilidad: c.confiabilidad.value.trim(),
          };
          if (!datos.nombre || !datos.validez) {
            aviso.textContent = 'Indique al menos el nombre del instrumento y las evidencias de validez que citará.';
            aviso.hidden = false;
            return;
          }
          state.agregarInstrumento(datos);
        },
      },
      'Agregar instrumento'
    )
  );
}

/* ---- Calculadora de alfa de Cronbach ---------------------------- */

function calculadoraAlfa() {
  const area = el('textarea', {
    class: 'campo__control', id: 'alfa-datos', rows: 5,
    placeholder: 'Una fila por participante, ítems separados por coma o espacio:\n4, 3, 4, 5\n2, 2, 3, 3\n5, 4, 4, 4\n…',
  });
  const salida = el('div', {});
  const aviso = el('p', { class: 'error-validacion', role: 'alert', hidden: '' });

  return el(
    'details',
    { class: 'pedagogia', style: 'margin-top: 1.5rem' },
    el('summary', { class: 'pedagogia__resumen' },
      'Calcular alfa de Cronbach con datos propios (piloto o estudio)'),
    el(
      'div',
      { class: 'formulario', style: 'margin-top: 0.75rem' },
      el(
        'div',
        { class: 'campo' },
        el('label', { class: 'campo__etiqueta', for: 'alfa-datos' },
          'Matriz de respuestas (participantes × ítems)'),
        area,
        el('div', { style: 'margin-top: 0.5rem' },
          botonCargarCSV(area, 'matriz', (msg) => { aviso.textContent = msg; aviso.hidden = false; }))
      ),
      aviso,
      el('button', { class: 'boton-primario', type: 'button', onClick: calcular }, 'Calcular alfa'),
      salida
    )
  );

  function calcular() {
    aviso.hidden = true;
    const filas = area.value.trim().split(/\n+/).map((linea) =>
      linea.split(/[,;\s]+/).filter(Boolean).map((v) => parseFloat(v.replace(',', '.')))
    ).filter((f) => f.length > 0);

    const k = filas[0]?.length ?? 0;
    if (filas.length < 3 || k < 2 || filas.some((f) => f.length !== k || f.some(Number.isNaN))) {
      aviso.textContent =
        'Revise la matriz: al menos 3 participantes, 2 ítems, todas las filas con el mismo número de valores numéricos y sin casillas vacías.';
      aviso.hidden = false;
      return;
    }

    const res = alfaCronbach(filas);
    const itemsDebiles = res.itemTotal
      .map((r, j) => ({ item: j + 1, r }))
      .filter((x) => x.r < 0.3);

    const lineas = [
      '── Consistencia interna · alfa de Cronbach ──',
      `participantes (n) = ${res.n}    ítems (k) = ${res.k}`,
      `alfa              = ${res.alfa.toFixed(3)}`,
      'r ítem-total corregida:',
      ...res.itemTotal.map((r, j) => `  ítem ${String(j + 1).padStart(2)}        = ${r.toFixed(3)}${r < 0.3 ? '  ◂ débil' : ''}`),
    ];

    let interpretacion =
      `El alfa de Cronbach obtenido (α = ${res.alfa.toFixed(2)}) indica una ` +
      `consistencia interna ${lecturaAlfa(res.alfa)} para las puntuaciones ` +
      `de esta muestra (n = ${res.n}, k = ${res.k} ítems). `;
    if (itemsDebiles.length > 0) {
      interpretacion +=
        `Los ítems ${itemsDebiles.map((x) => x.item).join(', ')} muestran ` +
        'correlación ítem-total corregida < .30: revise su redacción o su ' +
        'pertenencia teórica a la escala antes de decidir eliminarlos. ';
    }
    if (res.n < 30) {
      interpretacion +=
        'Con n < 30 la estimación de alfa es inestable: trátela como piloto.';
    }

    salida.replaceChildren(
      el('pre', { class: 'consola' }, lineas.join('\n')),
      el('p', { class: 'decision__contexto', style: 'margin-top: 1rem' }, interpretacion),
      el(
        'p',
        { class: 'advertencia', role: 'note' },
        el('strong', {}, 'Advertencia metodológica. '),
        'Alfa estima consistencia interna, no validez ni unidimensionalidad: ' +
          'un alfa alto puede coexistir con una escala multidimensional o con ' +
          'ítems redundantes. La estructura interna se examina con análisis factorial.'
      )
    );
  }
}
