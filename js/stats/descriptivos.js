/**
 * stats/descriptivos.js — Estadísticos descriptivos. Funciones puras.
 * Varianza y DE muestrales (denominador n−1) salvo indicación.
 */

export const suma = (xs) => xs.reduce((a, b) => a + b, 0);
export const media = (xs) => suma(xs) / xs.length;

export function varianza(xs) {
  const m = media(xs);
  return suma(xs.map((x) => (x - m) ** 2)) / (xs.length - 1);
}

export const de = (xs) => Math.sqrt(varianza(xs));

export function mediana(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const k = s.length;
  return k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2;
}

/** Momentos centrales muestrales (denominador n). */
export function momentos(xs) {
  const n = xs.length;
  const m = media(xs);
  let m2 = 0, m3 = 0, m4 = 0;
  for (const x of xs) {
    const d = x - m;
    m2 += d * d; m3 += d ** 3; m4 += d ** 4;
  }
  return { n, media: m, m2: m2 / n, m3: m3 / n, m4: m4 / n };
}

/** Asimetría g1 y curtosis b2 (= m4/m2², la normal vale 3). */
export function forma(xs) {
  const { m2, m3, m4 } = momentos(xs);
  return { g1: m3 / m2 ** 1.5, b2: m4 / (m2 * m2) };
}

/** Rangos promedio (para Spearman, Mann-Whitney, Kruskal-Wallis). */
export function rangos(xs) {
  const idx = xs.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const r = new Array(xs.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const promedio = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = promedio;
    i = j + 1;
  }
  return r;
}

export function resumen(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return {
    n: xs.length,
    media: media(xs),
    de: de(xs),
    min: s[0],
    max: s[s.length - 1],
    mediana: mediana(xs),
  };
}

/** Histograma: intervalos por regla de Sturges (o k dado). */
export function histograma(xs, k = null) {
  const n = xs.length;
  const min = Math.min(...xs), max = Math.max(...xs);
  const bins = k ?? Math.max(4, Math.ceil(1 + Math.log2(n)));
  const ancho = (max - min) / bins || 1;
  const conteos = Array.from({ length: bins }, (_, i) => ({
    x0: min + i * ancho, x1: min + (i + 1) * ancho, n: 0,
  }));
  for (const x of xs) {
    const i = Math.min(bins - 1, Math.floor((x - min) / ancho));
    conteos[i].n++;
  }
  return { bins: conteos, ancho, min, max };
}

/** Densidad normal con media m y DE s (para superponer al histograma). */
export const densidadNormal = (x, m, s) =>
  Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));

/** Cuartiles por interpolación lineal (tipo 7, como R por defecto). */
export function cuartiles(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const q = (p) => {
    const h = (s.length - 1) * p;
    const lo = Math.floor(h);
    return s[lo] + (h - lo) * (s[Math.min(lo + 1, s.length - 1)] - s[lo]);
  };
  return { q1: q(0.25), q2: q(0.5), q3: q(0.75) };
}
