/**
 * blueprint.js — La Matriz Metodológica viva.
 *
 * Redacta en prosa académica la sección de método a medida que el
 * usuario decide. Fase 2: incorpora el sistema de hipótesis y la tabla
 * de operacionalización de variables.
 */

import { el, montar } from './dom.js';
import { engine } from '../core/engine.js';
import { state } from '../core/state.js';
import { nodos } from '../knowledge/index.js';
import { etiquetaRol, etiquetaNivel } from '../knowledge/variables.js';
import { tipoHipotesis } from '../knowledge/hipotesis.js';
import { etiquetaTipoInstrumento } from '../knowledge/instrumentos.js';
import { descargarMarkdown } from './exportacion.js';

export function renderBlueprint(contenedor, estado) {
  const secciones = redactarSecciones(estado);
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  montar(
    contenedor,
    el(
      'aside',
      { class: 'matriz', 'aria-label': 'Matriz metodológica del proyecto' },
      el(
        'div',
        { class: 'matriz__cabecera' },
        el('span', {}, 'MATRIZ METODOLÓGICA'),
        el('span', {}, fecha)
      ),
      el('h2', { class: 'matriz__titulo' }, 'Capítulo de método (borrador)'),
      secciones.length === 0
        ? el(
            'p',
            { class: 'matriz__vacia' },
            'Este panel redactará su sección de método a medida que tome ' +
              'decisiones. Comience respondiendo la primera pregunta del tutor.'
          )
        : secciones.map((s) =>
            el(
              'div',
              { class: 'matriz__seccion' },
              el('h3', { class: 'matriz__rotulo' }, s.rotulo),
              s.nodo ?? el('p', { class: 'matriz__texto' }, s.texto)
            )
          ),
      el(
        'div',
        { class: 'matriz__acciones' },
        el(
          'button',
          { class: 'boton-secundario', type: 'button', onClick: () => copiar(estado) },
          'Copiar texto'
        ),
        el(
          'button',
          { class: 'boton-secundario', type: 'button', onClick: () => descargarMarkdown(estado) },
          'Descargar .md'
        ),
        el(
          'button',
          { class: 'boton-secundario', type: 'button', onClick: () => window.print() },
          'Imprimir / PDF'
        ),
        el(
          'button',
          {
            class: 'boton-secundario',
            type: 'button',
            onClick: () => {
              if (confirm('¿Reiniciar el proyecto? Se perderán todas las decisiones.')) {
                state.reiniciar();
              }
            },
          },
          'Reiniciar proyecto'
        )
      )
    )
  );
}

/* ---- Redacción ----------------------------------------------------- */

const prosaAlcance = {
  exploratorio:
    'La presente investigación adopta un alcance exploratorio, por cuanto ' +
    'el fenómeno de interés ha sido escasamente documentado en el contexto ' +
    'de estudio; en consecuencia, su propósito es identificar variables ' +
    'relevantes y generar hipótesis para investigaciones posteriores.',
  descriptivo:
    'La presente investigación adopta un alcance descriptivo: su propósito ' +
    'es especificar las propiedades y características del fenómeno de ' +
    'estudio, midiendo las variables de interés y reportando su ' +
    'distribución en la población definida.',
  correlacional:
    'La presente investigación adopta un alcance correlacional: su ' +
    'propósito es determinar el grado de asociación entre las variables de ' +
    'estudio, sin manipulación alguna, anticipando la dirección de las ' +
    'relaciones en las hipótesis correspondientes.',
  explicativo:
    'La presente investigación adopta un alcance explicativo: su propósito ' +
    'es establecer relaciones de causa y efecto entre las variables de ' +
    'estudio, atendiendo a las condiciones de covariación, precedencia ' +
    'temporal y descarte de explicaciones alternativas.',
};

function redactarSecciones(estado) {
  const { decisiones } = estado;
  const secciones = [];

  if (decisiones.alcance) {
    secciones.push({
      rotulo: 'Alcance de la investigación',
      texto: prosaAlcance[decisiones.alcance],
    });
  }

  const veredicto = engine.veredictosActivos(decisiones)[0];
  if (veredicto) {
    secciones.push({
      rotulo: 'Diseño metodológico',
      texto:
        `El estudio se enmarca en un ${veredicto.nombre.toLowerCase()}. ` +
        veredicto.interpretacion.split('. ').slice(0, 2).join('. ') + '.',
    });
  } else {
    const parciales = nodos
      .filter((n) => (n.tipo ?? 'seleccion') === 'seleccion')
      .filter((n) => n.etapa === 'Diseño' && decisiones[n.id])
      .map((n) => n.opciones.find((o) => o.id === decisiones[n.id])?.titulo.toLowerCase())
      .filter(Boolean);
    if (parciales.length > 0) {
      secciones.push({
        rotulo: 'Diseño metodológico (en construcción)',
        texto:
          'Decisiones registradas hasta ahora: ' + parciales.join('; ') +
          '. Complete las preguntas del tutor para derivar la clasificación del diseño.',
      });
    }
  }

  if (estado.variables.length > 0) {
    secciones.push({
      rotulo: 'Operacionalización de variables',
      nodo: tablaVariables(estado.variables),
    });
  }

  if (estado.poblacion.guardada) {
    const p = estado.poblacion;
    const d = estado.decisiones;
    const tecnica = nodos
      .filter((n) => ['tecnicaProb', 'tecnicaNoProb'].includes(n.id) && d[n.id])
      .map((n) => n.opciones.find((o) => o.id === d[n.id])?.titulo.toLowerCase())[0];
    let texto =
      `La unidad de análisis serán ${p.unidad}. La población se delimita como ` +
      `${p.descripcion}. Se incluirán los casos que cumplan: ${p.inclusion}.` +
      (p.exclusion ? ` Se excluirán: ${p.exclusion}.` : '');
    if (d.censoOMuestra === 'censo') {
      texto += ' Se estudiará la población completa (censo), por lo que no procede el cálculo de error muestral; la tasa de respuesta se reportará como indicador de calidad.';
    } else if (d.tipoMuestreo) {
      texto +=
        ` Se empleará un muestreo ${d.tipoMuestreo === 'probabilistico' ? 'probabilístico' : 'no probabilístico'}` +
        (tecnica ? `, mediante la técnica de tipo ${tecnica}` : '') + '.';
    }
    secciones.push({ rotulo: 'Población y muestreo', texto });
  }

  if (estado.muestra.guardada) {
    const m = estado.muestra;
    secciones.push({
      rotulo: 'Tamaño de la muestra',
      texto: m.interpretacion ?? '',
    });
  }

  if (estado.instrumentos.guardada && estado.instrumentos.lista.length > 0) {
    const frases = estado.instrumentos.lista.map(
      (i) =>
        `${i.variable} se medirá con ${i.nombre} (${etiquetaTipoInstrumento(i.tipo).toLowerCase()}); ` +
        `se citarán como evidencias de validez: ${i.validez}` +
        (i.confiabilidad ? `; confiabilidad: ${i.confiabilidad}` : '')
    );
    secciones.push({
      rotulo: 'Instrumentos',
      texto: frases.join('. ') + '.',
    });
  }

  if (estado.analisis.guardada) {
    secciones.push({
      rotulo: 'Plan de análisis estadístico',
      texto: estado.analisis.interpretacion ?? '',
    });
  }

  const h = estado.hipotesis;
  if (h.guardada) {
    const tipo = tipoHipotesis(decisiones);
    secciones.push({
      rotulo: 'Sistema de hipótesis',
      texto: h.sinHipotesis
        ? 'Dado el alcance del estudio, no se formulan hipótesis; el ' +
          'análisis será de carácter descriptivo, con estimación de ' +
          'parámetros e intervalos de confianza.'
        : `Hi: ${h.hi} ${tipo ? tipo.h0(h.direccion) : ''} ` +
          `El contraste se planteará de forma ${h.direccion}.`,
    });
  }

  return secciones;
}

function tablaVariables(variables) {
  return el(
    'table',
    { class: 'matriz__tabla' },
    el(
      'thead',
      {},
      el(
        'tr',
        {},
        ['Variable', 'Rol', 'Nivel', 'Definición operacional'].map((t) =>
          el('th', { scope: 'col' }, t)
        )
      )
    ),
    el(
      'tbody',
      {},
      variables.map((v) =>
        el(
          'tr',
          {},
          el('td', {}, v.nombre),
          el('td', {}, etiquetaRol(v.rol).split(' (')[0]),
          el('td', {}, etiquetaNivel(v.nivel).split(' (')[0]),
          el('td', {}, v.defOperacional)
        )
      )
    )
  );
}

/* ---- Exportación al portapapeles ------------------------------------ */

function copiar(estado) {
  const secciones = redactarSecciones(estado);
  const partes = secciones.map((s) => {
    if (s.texto) return `${s.rotulo.toUpperCase()}\n${s.texto}`;
    // Tabla de variables en texto plano
    const filas = estado.variables.map(
      (v) =>
        `- ${v.nombre} | ${etiquetaRol(v.rol)} | ${etiquetaNivel(v.nivel)}\n` +
        `  Conceptual: ${v.defConceptual}\n  Operacional: ${v.defOperacional}` +
        (v.indicadores ? `\n  Indicadores: ${v.indicadores}` : '')
    );
    return `${s.rotulo.toUpperCase()}\n${filas.join('\n')}`;
  });
  navigator.clipboard?.writeText(partes.join('\n\n')).catch(() => {});
}
