/**
 * stats/supuestos.js — Verificación de supuestos.
 *
 * Normalidad: prueba ómnibus K² de D'Agostino-Pearson (D'Agostino,
 * Belanger & D'Agostino, 1990), que combina las transformaciones z de
 * asimetría y curtosis. Requiere n ≥ 8 (idealmente n ≥ 20).
 *
 * Homogeneidad de varianzas: prueba de Levene en la variante de
 * Brown-Forsythe (desviaciones respecto de la MEDIANA), más robusta
 * ante no normalidad que la variante original sobre medias.
 */

import { pSuperiorChi2, pSuperiorF } from './distribuciones.js';
import { momentos, mediana, media, suma } from './descriptivos.js';

/** Transformación z de la asimetría (D'Agostino, 1970). */
function zAsimetria(g1, n) {
  const Y = g1 * Math.sqrt(((n + 1) * (n + 3)) / (6 * (n - 2)));
  const b2 = (3 * (n * n + 27 * n - 70) * (n + 1) * (n + 3)) /
             ((n - 2) * (n + 5) * (n + 7) * (n + 9));
  const W2 = -1 + Math.sqrt(2 * (b2 - 1));
  const delta = 1 / Math.sqrt(Math.log(Math.sqrt(W2)));
  const alpha = Math.sqrt(2 / (W2 - 1));
  const ya = Y / alpha;
  return delta * Math.log(ya + Math.sqrt(ya * ya + 1));
}

/** Transformación z de la curtosis (Anscombe & Glynn, 1983). */
function zCurtosis(b2, n) {
  const E = (3 * (n - 1)) / (n + 1);
  const V = (24 * n * (n - 2) * (n - 3)) / ((n + 1) ** 2 * (n + 3) * (n + 5));
  const x = (b2 - E) / Math.sqrt(V);
  const sb = ((6 * (n * n - 5 * n + 2)) / ((n + 7) * (n + 9))) *
             Math.sqrt((6 * (n + 3) * (n + 5)) / (n * (n - 2) * (n - 3)));
  const A = 6 + (8 / sb) * (2 / sb + Math.sqrt(1 + 4 / (sb * sb)));
  const t1 = 1 - 2 / (9 * A);
  const t2 = Math.cbrt((1 - 2 / A) / (1 + x * Math.sqrt(2 / (A - 4))));
  return (t1 - t2) / Math.sqrt(2 / (9 * A));
}

/** Prueba ómnibus de normalidad K². Devuelve null si n < 8. */
export function dagostinoK2(xs) {
  const n = xs.length;
  if (n < 8) return null;
  const { m2, m3, m4 } = momentos(xs);
  const g1 = m3 / m2 ** 1.5;
  const b2 = m4 / (m2 * m2);
  const z1 = zAsimetria(g1, n);
  const z2 = zCurtosis(b2, n);
  const k2 = z1 * z1 + z2 * z2;
  return { k2, p: pSuperiorChi2(k2, 2), z1, z2, n };
}

/** Brown-Forsythe: ANOVA sobre |x − mediana de su grupo|. */
export function brownForsythe(grupos) {
  const z = grupos.map((g) => {
    const md = mediana(g);
    return g.map((x) => Math.abs(x - md));
  });
  const k = z.length;
  const n = suma(z.map((g) => g.length));
  const total = z.flat();
  const gran = media(total);
  const sce = suma(z.map((g) => g.length * (media(g) - gran) ** 2));
  const scd = suma(z.map((g) => {
    const mg = media(g);
    return suma(g.map((x) => (x - mg) ** 2));
  }));
  const F = (sce / (k - 1)) / (scd / (n - k));
  return { F, gl1: k - 1, gl2: n - k, p: pSuperiorF(F, k - 1, n - k) };
}
