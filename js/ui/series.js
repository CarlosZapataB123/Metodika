/**
 * series.js — Parser compartido de series en texto plano.
 * Formato: una serie por línea, «Etiqueta: v1, v2, v3…» (etiqueta opcional).
 */

export function parseSeries(texto, minSeries, minN) {
  const series = texto.trim().split(/\n+/).map((linea) => {
    const [etiqueta, resto] = linea.includes(':') ? linea.split(/:(.+)/) : [null, linea];
    const valores = (resto ?? linea).split(/[,;\s]+/).filter(Boolean)
      .map((v) => parseFloat(v.replace(',', '.')));
    if (valores.some(Number.isNaN)) throw new Error(`Hay valores no numéricos en la línea «${linea.slice(0, 40)}…».`);
    return { etiqueta: etiqueta?.trim() ?? null, valores };
  });
  if (series.length < minSeries) throw new Error(`Se requieren al menos ${minSeries} series (líneas) de datos.`);
  if (series.some((s) => s.valores.length < minN)) throw new Error(`Cada serie necesita al menos ${minN} valores.`);
  return series;
}
