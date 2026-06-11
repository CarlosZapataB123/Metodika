/**
 * stats/distribuciones.js — Funciones de distribución de probabilidad.
 *
 * Implementación propia (algoritmos clásicos de Numerical Recipes):
 * gamma incompleta regularizada (serie + fracción continua de Lentz) y
 * beta incompleta regularizada, de las que se derivan las CDF exactas
 * de la normal, t de Student, F y chi-cuadrado. Sin dependencias: cada
 * fórmula es auditable y citable con fines docentes.
 */

const EPS = 3e-12;
const FPMIN = 1e-300;

/** ln Γ(x) — aproximación de Lanczos. */
export function gammaln(x) {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

/** Gamma incompleta regularizada inferior P(a, x). */
export function gammp(a, x) {
  if (x < 0 || a <= 0) return NaN;
  if (x === 0) return 0;
  if (x < a + 1) {
    // Serie
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 0; n < 500; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * EPS) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
  }
  // Fracción continua (Lentz) para Q, luego P = 1 − Q
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return 1 - h * Math.exp(-x + a * Math.log(x) - gammaln(a));
}

/** Fracción continua para la beta incompleta. */
function betacf(a, b, x) {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 500; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Beta incompleta regularizada I_x(a, b). */
export function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/* ---- CDFs ----------------------------------------------------- */

/** Φ(x): CDF de la normal estándar. */
export function normalCdf(x) {
  const p = gammp(0.5, (x * x) / 2);
  return x >= 0 ? 0.5 * (1 + p) : 0.5 * (1 - p);
}

/** CDF de la t de Student con ν grados de libertad. */
export function tCdf(t, nu) {
  const p = 0.5 * betai(nu / 2, 0.5, nu / (nu + t * t));
  return t >= 0 ? 1 - p : p;
}

/** CDF de la F con (ν1, ν2) grados de libertad. */
export function fCdf(f, nu1, nu2) {
  if (f <= 0) return 0;
  return betai(nu1 / 2, nu2 / 2, (nu1 * f) / (nu1 * f + nu2));
}

/** CDF de chi-cuadrado con k grados de libertad. */
export function chi2Cdf(x, k) {
  return gammp(k / 2, x / 2);
}

/* ---- Valores p de uso frecuente -------------------------------- */

export const pBilateralT = (t, nu) => 2 * (1 - tCdf(Math.abs(t), nu));
export const pBilateralZ = (z) => 2 * (1 - normalCdf(Math.abs(z)));
export const pSuperiorF = (f, nu1, nu2) => 1 - fCdf(f, nu1, nu2);
export const pSuperiorChi2 = (x, k) => 1 - chi2Cdf(x, k);
