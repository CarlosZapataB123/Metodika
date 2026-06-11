/**
 * exportacion.js — Exportación del capítulo de método.
 *
 * Genera un documento Markdown completo (apto para Word vía Pandoc,
 * Obsidian, GitHub o entrega directa) con todas las secciones de la
 * matriz, la tabla de operacionalización y las salidas estadísticas
 * como bloques de código. La impresión a PDF usa la hoja @media print
 * del propio navegador (sin dependencias).
 */

import { engine } from '../core/engine.js';
import { etiquetaRol, etiquetaNivel } from '../knowledge/variables.js';
import { tipoHipotesis } from '../knowledge/hipotesis.js';
import { etiquetaTipoInstrumento } from '../knowledge/instrumentos.js';

const prosaAlcance = {
  exploratorio:
    'La presente investigación adopta un alcance exploratorio, por cuanto el fenómeno de interés ha sido escasamente documentado en el contexto de estudio; en consecuencia, su propósito es identificar variables relevantes y generar hipótesis para investigaciones posteriores.',
  descriptivo:
    'La presente investigación adopta un alcance descriptivo: su propósito es especificar las propiedades y características del fenómeno de estudio, midiendo las variables de interés y reportando su distribución en la población definida.',
  correlacional:
    'La presente investigación adopta un alcance correlacional: su propósito es determinar el grado de asociación entre las variables de estudio, sin manipulación alguna, anticipando la dirección de las relaciones en las hipótesis correspondientes.',
  explicativo:
    'La presente investigación adopta un alcance explicativo: su propósito es establecer relaciones de causa y efecto entre las variables de estudio, atendiendo a las condiciones de covariación, precedencia temporal y descarte de explicaciones alternativas.',
};

/** Documento Markdown completo a partir del estado. */
export function matrizComoMarkdown(estado) {
  const d = estado.decisiones;
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const partes = [
    '# Capítulo de método (borrador)',
    `*Generado con Métodika · ${fecha}*`,
  ];

  if (d.alcance) {
    partes.push('## Alcance de la investigación', prosaAlcance[d.alcance]);
  }

  const veredicto = engine.veredictosActivos(d)[0];
  if (veredicto) {
    partes.push(
      '## Diseño metodológico',
      `El estudio se enmarca en un ${veredicto.nombre.toLowerCase()}.`,
      veredicto.interpretacion,
      `> **Advertencia metodológica.** ${veredicto.advertencia}`,
      `*Referencias: ${veredicto.referencias}*`
    );
  }

  if (estado.variables.length > 0) {
    const filas = estado.variables.map((v) =>
      `| ${v.nombre} | ${etiquetaRol(v.rol).split(' (')[0]} | ${etiquetaNivel(v.nivel).split(' (')[0]} | ${v.defConceptual} | ${v.defOperacional}${v.indicadores ? ` (Indicadores: ${v.indicadores})` : ''} |`
    );
    partes.push(
      '## Operacionalización de variables',
      '| Variable | Rol | Nivel | Definición conceptual | Definición operacional |',
      '|---|---|---|---|---|',
      ...filas
    );
  }

  const h = estado.hipotesis;
  if (h?.guardada) {
    const tipo = tipoHipotesis(d);
    partes.push(
      '## Sistema de hipótesis',
      h.sinHipotesis
        ? 'Dado el alcance del estudio, no se formulan hipótesis; el análisis será de carácter descriptivo, con estimación de parámetros e intervalos de confianza.'
        : `**Hi:** ${h.hi}\n\n**${tipo ? tipo.h0(h.direccion) : ''}**\n\nEl contraste se planteará de forma ${h.direccion}.`
    );
  }

  if (estado.poblacion?.guardada) {
    const p = estado.poblacion;
    let texto =
      `La unidad de análisis serán ${p.unidad}. La población se delimita como ${p.descripcion}. ` +
      `Se incluirán los casos que cumplan: ${p.inclusion}.` +
      (p.exclusion ? ` Se excluirán: ${p.exclusion}.` : '');
    if (d.censoOMuestra === 'censo') {
      texto += ' Se estudiará la población completa (censo).';
    } else if (d.tipoMuestreo) {
      texto += ` Se empleará un muestreo ${d.tipoMuestreo === 'probabilistico' ? 'probabilístico' : 'no probabilístico'}.`;
    }
    partes.push('## Población y muestreo', texto);
  }

  if (estado.muestra?.guardada) {
    partes.push(
      '## Tamaño de la muestra',
      estado.muestra.interpretacion ?? '',
      '```', estado.muestra.salida ?? '', '```'
    );
  }

  if (estado.instrumentos?.guardada && estado.instrumentos.lista.length > 0) {
    const frases = estado.instrumentos.lista.map(
      (i) =>
        `- **${i.variable}** se medirá con *${i.nombre}* (${etiquetaTipoInstrumento(i.tipo).toLowerCase()}). ` +
        `Evidencias de validez: ${i.validez}.` +
        (i.confiabilidad ? ` Confiabilidad: ${i.confiabilidad}.` : '')
    );
    partes.push('## Instrumentos', ...frases);
  }

  if (estado.analisis?.guardada) {
    partes.push(
      '## Plan de análisis estadístico',
      estado.analisis.interpretacion ?? '',
      '```', estado.analisis.salida ?? '', '```'
    );
  }

  partes.push(
    '---',
    '*Documento de trabajo generado con Métodika. No sustituye la asesoría de un director o comité de investigación.*'
  );

  return partes.filter(Boolean).join('\n\n');
}

/** Descarga el Markdown como archivo. */
export function descargarMarkdown(estado) {
  const md = matrizComoMarkdown(estado);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'metodo-metodika.md';
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
