/**
 * charts/universoDatos.js — Matemática pura del Observatorio 3D.
 *
 * Todo lo computable sin navegador vive aquí (testeable con node):
 * sectores de la torta, normalización de escalas, preparación de datos
 * por tipo de gráfico y generadores de ejemplos. El módulo universo.js
 * (Three.js) solo dibuja lo que este módulo calcula.
 */

import { cuartiles, media } from '../stats/descriptivos.js';

/* ---- Torta: ángulos y proporciones ------------------------------ */

export function sectoresTorta(valores) {
  const total = valores.reduce((a, b) => a + b, 0);
  if (total <= 0) throw new Error('La torta requiere valores positivos.');
  let acumulado = 0;
  return valores.map((v) => {
    const proporcion = v / total;
    const inicio = acumulado * 2 * Math.PI;
    acumulado += proporcion;
    return { inicio, longitud: proporcion * 2 * Math.PI, proporcion };
  });
}

/* ---- Normalización de escalas ------------------------------------ */

/** Mapea xs linealmente al rango [a, b]; constante → punto medio. */
export function normalizar(xs, a, b) {
  const min = Math.min(...xs), max = Math.max(...xs);
  if (max === min) return xs.map(() => (a + b) / 2);
  return xs.map((x) => a + ((x - min) / (max - min)) * (b - a));
}

/* ---- Preparación por tipo de gráfico ------------------------------ */

/** Barras: matriz series × categorías con alturas normalizadas a [0.08, alto]. */
export function prepararBarras(series, alto = 3) {
  const valores = series.flatMap((s) => s.valores);
  if (valores.some((v) => v < 0)) throw new Error('Las columnas 3D requieren valores no negativos.');
  const max = Math.max(...valores);
  return series.map((s, i) => ({
    nombre: s.etiqueta ?? `Serie ${i + 1}`,
    alturas: s.valores.map((v) => Math.max(0.08, (v / max) * alto)),
    valores: s.valores,
  }));
}

/** Boxplot: estadísticos de caja por grupo + escala común a [0, alto]. */
export function prepararBoxplot(series, alto = 3.2) {
  const todos = series.flatMap((s) => s.valores);
  const min = Math.min(...todos), max = Math.max(...todos);
  const esc = (v) => (max === min ? alto / 2 : ((v - min) / (max - min)) * alto);
  return {
    min, max,
    grupos: series.map((s, i) => {
      const { q1, q2, q3 } = cuartiles(s.valores);
      const iqr = q3 - q1;
      const limInf = q1 - 1.5 * iqr, limSup = q3 + 1.5 * iqr;
      const dentro = s.valores.filter((v) => v >= limInf && v <= limSup);
      return {
        nombre: s.etiqueta ?? `Grupo ${i + 1}`,
        q1: esc(q1), q2: esc(q2), q3: esc(q3),
        bigoteInf: esc(Math.min(...dentro)),
        bigoteSup: esc(Math.max(...dentro)),
        atipicos: s.valores.filter((v) => v < limInf || v > limSup).map(esc),
        crudos: { q1, q2, q3 },
      };
    }),
  };
}

/** Dispersión 3D: tres series (X, Y, Z) → puntos normalizados a [−lado, lado]. */
export function prepararDispersion(series, lado = 1.7) {
  if (series.length < 3) throw new Error('La dispersión 3D requiere tres series: X, Y y Z.');
  const [x, y, z] = series;
  const n = Math.min(x.valores.length, y.valores.length, z.valores.length);
  if (n < 3) throw new Error('Se requieren al menos 3 puntos.');
  const nx = normalizar(x.valores.slice(0, n), -lado, lado);
  const ny = normalizar(y.valores.slice(0, n), 0, 2 * lado);
  const nz = normalizar(z.valores.slice(0, n), -lado, lado);
  return {
    puntos: nx.map((v, i) => [v, ny[i], nz[i]]),
    nombres: [x.etiqueta ?? 'X', y.etiqueta ?? 'Y', z.etiqueta ?? 'Z'],
  };
}

/** Senderos: cada serie es una trayectoria (x = tiempo, y = valor, z = serie). */
export function prepararSenderos(series, largo = 4, alto = 2.6, sep = 0.9) {
  const todos = series.flatMap((s) => s.valores);
  const min = Math.min(...todos), max = Math.max(...todos);
  const escY = (v) => (max === min ? alto / 2 : ((v - min) / (max - min)) * alto);
  const z0 = -((series.length - 1) * sep) / 2;
  return series.map((s, i) => ({
    nombre: s.etiqueta ?? `Trayectoria ${i + 1}`,
    puntos: s.valores.map((v, t) => [
      -largo / 2 + (s.valores.length === 1 ? largo / 2 : (t / (s.valores.length - 1)) * largo),
      escY(v),
      z0 + i * sep,
    ]),
    medias: media(s.valores),
  }));
}

/* ---- Ejemplos autogenerados por tipo -------------------------------- */

const azar = (min, max) => Math.round((min + Math.random() * (max - min)) * 10) / 10;
const serieNormal = (n, m, s) =>
  Array.from({ length: n }, () => Math.round((m + (Math.random() + Math.random() + Math.random() - 1.5) * s) * 10) / 10);

export const EJEMPLOS = {
  barras: () =>
    ['2023: ' + [azar(20, 45), azar(30, 60), azar(40, 70), azar(35, 65)].join(', '),
     '2024: ' + [azar(30, 55), azar(40, 70), azar(50, 80), azar(45, 75)].join(', '),
     '2025: ' + [azar(40, 65), azar(50, 80), azar(60, 90), azar(55, 85)].join(', ')].join('\n'),
  torta: () =>
    ['Muestreo probabilístico: ' + azar(35, 55),
     'Por conveniencia: ' + azar(20, 35),
     'Por cuotas: ' + azar(8, 18),
     'Bola de nieve: ' + azar(4, 10)].join('\n'),
  boxplot: () =>
    ['Control: ' + serieNormal(18, 50, 9).join(', '),
     'Intervención A: ' + serieNormal(18, 58, 8).join(', '),
     'Intervención B: ' + serieNormal(18, 64, 10).join(', ')].join('\n'),
  dispersion: () => {
    const n = 40;
    const x = serieNormal(n, 50, 12);
    const y = x.map((v) => Math.round((0.6 * v + 15 + (Math.random() - 0.5) * 14) * 10) / 10);
    const z = serieNormal(n, 30, 8);
    return `Burnout: ${x.join(', ')}\nBienestar: ${y.join(', ')}\nAntigüedad: ${z.join(', ')}`;
  },
  sendero: () =>
    ['Cohorte 2022: ' + [52, 55, 57, 61, 60, 64, 67].map((v) => v + azar(-2, 2)).join(', '),
     'Cohorte 2023: ' + [48, 50, 49, 53, 56, 58, 61].map((v) => v + azar(-2, 2)).join(', '),
     'Cohorte 2024: ' + [55, 54, 58, 57, 62, 65, 69].map((v) => v + azar(-2, 2)).join(', ')].join('\n'),
};
