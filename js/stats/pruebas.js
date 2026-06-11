/**
 * stats/pruebas.js — Pruebas de hipótesis con tamaños del efecto.
 *
 * Cada función devuelve el estadístico, los grados de libertad, el
 * valor p y el tamaño del efecto pertinente. Las aproximaciones
 * (Mann-Whitney, Kruskal-Wallis, Spearman) se señalan en el resultado.
 */

import {
  pBilateralT, pBilateralZ, pSuperiorF, pSuperiorChi2, tCdf,
} from './distribuciones.js';
import { media, varianza, de, suma, rangos } from './descriptivos.js';

/* ---- Comparación de dos grupos independientes -------------------- */

/** t de Student (varianzas iguales) y de Welch; d de Cohen (s combinada). */
export function tIndependiente(a, b) {
  const na = a.length, nb = b.length;
  const ma = media(a), mb = media(b);
  const va = varianza(a), vb = varianza(b);

  // Student
  const sp2 = ((na - 1) * va + (nb - 1) * vb) / (na + nb - 2);
  const tS = (ma - mb) / Math.sqrt(sp2 * (1 / na + 1 / nb));
  const glS = na + nb - 2;

  // Welch
  const se2 = va / na + vb / nb;
  const tW = (ma - mb) / Math.sqrt(se2);
  const glW = se2 ** 2 / ((va / na) ** 2 / (na - 1) + (vb / nb) ** 2 / (nb - 1));

  const d = (ma - mb) / Math.sqrt(sp2);

  return {
    mediaA: ma, mediaB: mb, deA: Math.sqrt(va), deB: Math.sqrt(vb), na, nb,
    student: { t: tS, gl: glS, p: pBilateralT(tS, glS) },
    welch: { t: tW, gl: glW, p: pBilateralT(tW, glW) },
    d,
  };
}

/** t para muestras relacionadas (pre-post); d_z = media(dif)/DE(dif). */
export function tPareada(pre, post) {
  const dif = post.map((y, i) => y - pre[i]);
  const n = dif.length;
  const md = media(dif), sd = de(dif);
  const t = md / (sd / Math.sqrt(n));
  return { n, mediaDif: md, deDif: sd, t, gl: n - 1, p: pBilateralT(t, n - 1), dz: md / sd };
}

/* ---- ANOVA de un factor ------------------------------------------- */

export function anovaUnFactor(grupos) {
  const k = grupos.length;
  const n = suma(grupos.map((g) => g.length));
  const gran = media(grupos.flat());
  const sce = suma(grupos.map((g) => g.length * (media(g) - gran) ** 2));
  const scd = suma(grupos.map((g) => {
    const mg = media(g);
    return suma(g.map((x) => (x - mg) ** 2));
  }));
  const gl1 = k - 1, gl2 = n - k;
  const F = (sce / gl1) / (scd / gl2);
  return { F, gl1, gl2, p: pSuperiorF(F, gl1, gl2), eta2: sce / (sce + scd), k, n };
}

/* ---- Chi-cuadrado de independencia --------------------------------- */

export function chiCuadrado(tabla) {
  const filas = tabla.length, cols = tabla[0].length;
  const totFila = tabla.map((f) => suma(f));
  const totCol = tabla[0].map((_, j) => suma(tabla.map((f) => f[j])));
  const N = suma(totFila);
  let x2 = 0, minEsperada = Infinity, bajas = 0;
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < cols; j++) {
      const e = (totFila[i] * totCol[j]) / N;
      minEsperada = Math.min(minEsperada, e);
      if (e < 5) bajas++;
      x2 += (tabla[i][j] - e) ** 2 / e;
    }
  }
  const gl = (filas - 1) * (cols - 1);
  const v = Math.sqrt(x2 / (N * Math.min(filas - 1, cols - 1)));
  return {
    x2, gl, p: pSuperiorChi2(x2, gl), v, N,
    minEsperada, celdasBajas: bajas, totalCeldas: filas * cols,
  };
}

/* ---- Correlaciones ---------------------------------------------------- */

export function pearson(xs, ys) {
  const n = xs.length;
  const mx = media(xs), my = media(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  const r = sxy / Math.sqrt(sxx * syy);
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  return { r, n, t, gl: n - 2, p: pBilateralT(t, n - 2), r2: r * r };
}

/** Spearman: Pearson sobre rangos; p por aproximación t. */
export function spearman(xs, ys) {
  const res = pearson(rangos(xs), rangos(ys));
  return { rho: res.r, n: res.n, t: res.t, gl: res.gl, p: res.p, aproximacion: 't' };
}

/* ---- No paramétricas --------------------------------------------------- */

/** Mann-Whitney U con corrección por empates y continuidad. */
export function mannWhitney(a, b) {
  const na = a.length, nb = b.length, n = na + nb;
  const todos = [...a, ...b];
  const r = rangos(todos);
  const Ra = suma(r.slice(0, na));
  const U1 = Ra - (na * (na + 1)) / 2;
  const U = Math.min(U1, na * nb - U1);
  const mu = (na * nb) / 2;
  // Corrección por empates en la varianza
  const conteos = {};
  for (const v of todos) conteos[v] = (conteos[v] ?? 0) + 1;
  const T = suma(Object.values(conteos).map((t) => t ** 3 - t));
  const sigma = Math.sqrt(((na * nb) / 12) * (n + 1 - T / (n * (n - 1))));
  const z = (Math.abs(U - mu) - 0.5) / sigma; // continuidad
  const p = pBilateralZ(z);
  const rbc = 1 - (2 * U) / (na * nb); // correlación rango-biserial
  return { U, z, p, na, nb, rbc, aproximacion: 'normal' };
}

/** Kruskal-Wallis H con corrección por empates; p por chi-cuadrado. */
export function kruskalWallis(grupos) {
  const todos = grupos.flat();
  const n = todos.length;
  const r = rangos(todos);
  let H = 0, offset = 0;
  for (const g of grupos) {
    const Rg = suma(r.slice(offset, offset + g.length));
    H += (Rg * Rg) / g.length;
    offset += g.length;
  }
  H = (12 / (n * (n + 1))) * H - 3 * (n + 1);
  const conteos = {};
  for (const v of todos) conteos[v] = (conteos[v] ?? 0) + 1;
  const T = suma(Object.values(conteos).map((t) => t ** 3 - t));
  H /= 1 - T / (n ** 3 - n);
  const gl = grupos.length - 1;
  return { H, gl, p: pSuperiorChi2(H, gl), n, aproximacion: 'chi2' };
}

/** Wilcoxon de rangos con signo (pre-post); aproximación normal. */
export function wilcoxonSignos(pre, post) {
  const dif = post.map((y, i) => y - pre[i]).filter((d) => d !== 0);
  const n = dif.length;
  const r = rangos(dif.map(Math.abs));
  let Wpos = 0;
  for (let i = 0; i < n; i++) if (dif[i] > 0) Wpos += r[i];
  const mu = (n * (n + 1)) / 4;
  const sigma = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
  const z = (Math.abs(Wpos - mu) - 0.5) / sigma;
  return { W: Wpos, n, z, p: pBilateralZ(z), aproximacion: 'normal' };
}

/* ---- Regresión lineal simple ------------------------------------------- */

/** y = b0 + b1·x por mínimos cuadrados; r² y prueba t de la pendiente. */
export function regresionLineal(xs, ys) {
  const n = xs.length;
  const mx = media(xs), my = media(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  const b1 = sxy / sxx;
  const b0 = my - b1 * mx;
  const sce = syy - b1 * sxy;           // suma de cuadrados del error
  const r2 = 1 - sce / syy;
  const se = Math.sqrt(sce / (n - 2) / sxx);
  const t = b1 / se;
  return { b0, b1, r2, t, gl: n - 2, p: pBilateralT(t, n - 2) };
}

/* ---- Magnitud del efecto (umbrales de Cohen, 1988) --------------------- */

export function magnitud(tipo, valor) {
  const v = Math.abs(valor);
  const escalas = {
    d:    [[0.2, 'trivial'], [0.5, 'pequeño'], [0.8, 'mediano'], [Infinity, 'grande']],
    r:    [[0.1, 'trivial'], [0.3, 'pequeño'], [0.5, 'mediano'], [Infinity, 'grande']],
    eta2: [[0.01, 'trivial'], [0.06, 'pequeño'], [0.14, 'mediano'], [Infinity, 'grande']],
    v:    [[0.1, 'trivial'], [0.3, 'pequeño'], [0.5, 'mediano'], [Infinity, 'grande']],
  };
  for (const [umbral, etiqueta] of escalas[tipo]) if (v < umbral) return etiqueta;
  return 'grande';
}
