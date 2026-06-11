/**
 * stats/confiabilidad.js — Consistencia interna.
 *
 * Alfa de Cronbach: α = k/(k−1) · (1 − Σs²ᵢ / s²ₜ), con varianzas
 * muestrales (n−1). Entrada: matriz participantes × ítems.
 */

import { varianza, suma } from './descriptivos.js';

export function alfaCronbach(matriz) {
  const n = matriz.length;          // participantes
  const k = matriz[0].length;       // ítems
  const items = Array.from({ length: k }, (_, j) => matriz.map((f) => f[j]));
  const sumaItems = items.map(varianza);
  const totales = matriz.map((f) => suma(f));
  const varTotal = varianza(totales);
  const alfa = (k / (k - 1)) * (1 - suma(sumaItems) / varTotal);

  // Correlación ítem-total corregida (ítem vs. total sin el ítem)
  const itemTotal = items.map((col, j) => {
    const resto = matriz.map((f) => suma(f) - f[j]);
    return correlacion(col, resto);
  });

  return { alfa, k, n, itemTotal };
}

function correlacion(xs, ys) {
  const n = xs.length;
  const mx = suma(xs) / n, my = suma(ys) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  return sxy / Math.sqrt(sxx * syy);
}

/** Lectura convencional de α (con las reservas de uso conocidas). */
export function lecturaAlfa(alfa) {
  if (alfa >= 0.9) return 'excelente (revise posible redundancia de ítems si supera .95)';
  if (alfa >= 0.8) return 'buena';
  if (alfa >= 0.7) return 'aceptable';
  if (alfa >= 0.6) return 'cuestionable';
  return 'insuficiente para uso del puntaje total';
}
