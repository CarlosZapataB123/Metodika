/**
 * stats/muestra.js — Cálculo de tamaño de muestra. Funciones puras.
 *
 * Fórmulas estándar (Cochran, 1977; Cohen, 1988):
 *  · Proporción:  n₀ = z²·p(1−p)/e²        + corrección finita
 *  · Media:       n₀ = z²·σ²/e²            + corrección finita
 *  · Dos grupos:  n/grupo = 2(z₁₋α/₂ + z₁₋β)²/d²   (aprox. normal)
 *
 * La corrección por población finita: n = n₀ / (1 + (n₀ − 1)/N).
 * Todos los resultados se redondean hacia arriba (ceil): un participante
 * fraccional no existe y redondear hacia abajo pierde precisión/potencia.
 */

/** Valores z para niveles de confianza usuales (bilateral). */
export const Z_CONFIANZA = { 90: 1.6449, 95: 1.96, 99: 2.5758 };

/** Valores z para potencia (unilateral sobre β). */
export const Z_POTENCIA = { 80: 0.8416, 90: 1.2816, 95: 1.6449 };

export function correccionFinita(n0, N) {
  return n0 / (1 + (n0 - 1) / N);
}

/** n para estimar una proporción con margen de error e (en proporción). */
export function nProporcion({ confianza, error, p = 0.5, N = null }) {
  const z = Z_CONFIANZA[confianza];
  const n0 = (z * z * p * (1 - p)) / (error * error);
  const n = N ? correccionFinita(n0, N) : n0;
  return { z, n0, n: Math.ceil(n), corregido: Boolean(N) };
}

/** n para estimar una media con margen de error e (unidades de la variable). */
export function nMedia({ confianza, error, sigma, N = null }) {
  const z = Z_CONFIANZA[confianza];
  const n0 = (z * sigma / error) ** 2;
  const n = N ? correccionFinita(n0, N) : n0;
  return { z, n0, n: Math.ceil(n), corregido: Boolean(N) };
}

/**
 * n por grupo para detectar un tamaño del efecto d (Cohen) comparando
 * dos medias independientes. Aproximación normal: subestima ligeramente
 * respecto de la distribución t exacta; verificar con G*Power.
 */
export function nDosGrupos({ confianza, potencia, d }) {
  const za = Z_CONFIANZA[confianza];
  const zb = Z_POTENCIA[potencia];
  const nGrupo = (2 * (za + zb) ** 2) / (d * d);
  return { za, zb, nGrupo: Math.ceil(nGrupo), nTotal: 2 * Math.ceil(nGrupo) };
}
