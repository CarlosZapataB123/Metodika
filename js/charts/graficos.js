/**
 * charts/graficos.js — Fábrica de gráficos académicos.
 *
 * Envuelve Chart.js (cargado por CDN) con la identidad visual del
 * proyecto: tipografía IBM Plex, paleta sobria, tooltips discretos.
 * Si Chart.js no está disponible (sin conexión, CDN bloqueado), las
 * funciones devuelven null y la interfaz degrada a la salida textual.
 *
 * Decisión de diseño: el tipo de gráfico no lo elige el usuario; lo
 * determina el modo de análisis, porque el gráfico pertinente es una
 * decisión metodológica (boxplot para comparar distribuciones,
 * dispersión para inspeccionar linealidad, etc.).
 */

import { histograma, densidadNormal, media, de } from '../stats/descriptivos.js';
import { regresionLineal } from '../stats/pruebas.js';

export const disponible = () =>
  typeof window !== 'undefined' && typeof window.Chart !== 'undefined';

const PALETA = ['#1D4E6B', '#3E6B4F', '#8A5A00', '#8C2F39', '#4C5663', '#6B4E8A'];

/** Lee un token CSS en tiempo de creación (respeta el tema activo). */
const token = (nombre, respaldo) => {
  if (typeof document === 'undefined') return respaldo;
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  return v || respaldo;
};
const TINTA = () => token('--tinta', '#1C2430');
const FILETE = () => token('--filete', '#DCE0DE');
const SUAVE = () => token('--tinta-suave', '#4C5663');

function opcionesBase(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { font: { family: "'IBM Plex Sans', sans-serif", size: 12 }, color: TINTA(), boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: '#0D1117',
        titleFont: { family: "'IBM Plex Mono', monospace", size: 11 },
        bodyFont: { family: "'IBM Plex Mono', monospace", size: 11 },
        cornerRadius: 3,
        displayColors: false,
      },
      ...extra.plugins,
    },
    scales: extra.scales,
  };
}

const ejes = (xTitulo, yTitulo, extraX = {}, extraY = {}) => ({
  x: {
    title: { display: Boolean(xTitulo), text: xTitulo, color: TINTA(), font: { family: "'IBM Plex Sans', sans-serif", size: 12 } },
    ticks: { color: SUAVE(), font: { family: "'IBM Plex Sans', sans-serif", size: 11 } },
    grid: { color: FILETE() },
    ...extraX,
  },
  y: {
    title: { display: Boolean(yTitulo), text: yTitulo, color: TINTA(), font: { family: "'IBM Plex Sans', sans-serif", size: 12 } },
    ticks: { color: SUAVE(), font: { family: "'IBM Plex Sans', sans-serif", size: 11 } },
    grid: { color: FILETE() },
    ...extraY,
  },
});

/** Destruye instancias previas dentro de un contenedor (evita fugas). */
export function destruirGraficos(contenedor) {
  if (!disponible()) return;
  for (const canvas of contenedor.querySelectorAll('canvas')) {
    window.Chart.getChart(canvas)?.destroy();
  }
}

/* ---- Dispersión con recta de regresión --------------------------- */

export function dispersionConTendencia(canvas, xs, ys, nombreX = 'X', nombreY = 'Y') {
  if (!disponible()) return null;
  const { b0, b1 } = regresionLineal(xs, ys);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  return new window.Chart(canvas, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Observaciones',
          data: xs.map((x, i) => ({ x, y: ys[i] })),
          backgroundColor: 'rgba(29, 78, 107, 0.55)',
          pointRadius: 4,
        },
        {
          label: `ŷ = ${b0.toFixed(2)} + ${b1.toFixed(2)}·x`,
          type: 'line',
          data: [{ x: minX, y: b0 + b1 * minX }, { x: maxX, y: b0 + b1 * maxX }],
          borderColor: PALETA[3],
          borderWidth: 1.5,
          pointRadius: 0,
          borderDash: [6, 4],
        },
      ],
    },
    options: opcionesBase({ scales: ejes(nombreX, nombreY) }),
  });
}

/* ---- Boxplot por grupo (plugin @sgratzl) --------------------------- */

export function boxplotGrupos(canvas, grupos, nombres, nombreY = '') {
  if (!disponible() || !window.Chart.registry.controllers.get('boxplot')) return null;
  return new window.Chart(canvas, {
    type: 'boxplot',
    data: {
      labels: nombres,
      datasets: [{
        label: 'Distribución',
        data: grupos,
        backgroundColor: 'rgba(29, 78, 107, 0.15)',
        borderColor: PALETA[0],
        borderWidth: 1.5,
        outlierBackgroundColor: PALETA[3],
        itemRadius: 0,
      }],
    },
    options: opcionesBase({
      plugins: { legend: { display: false } },
      scales: ejes('', nombreY),
    }),
  });
}

/* ---- Histograma con curva normal superpuesta ------------------------ */

export function histogramaConNormal(canvas, datos, nombre = 'Variable') {
  if (!disponible()) return null;
  const h = histograma(datos);
  const m = media(datos), s = de(datos);
  const n = datos.length;
  const etiquetas = h.bins.map((b) => `${b.x0.toFixed(1)}–${b.x1.toFixed(1)}`);
  const curva = h.bins.map((b) =>
    n * h.ancho * densidadNormal((b.x0 + b.x1) / 2, m, s)
  );
  return new window.Chart(canvas, {
    data: {
      labels: etiquetas,
      datasets: [
        {
          type: 'bar',
          label: nombre,
          data: h.bins.map((b) => b.n),
          backgroundColor: 'rgba(29, 78, 107, 0.35)',
          borderColor: PALETA[0],
          borderWidth: 1,
          categoryPercentage: 1,
          barPercentage: 0.98,
        },
        {
          type: 'line',
          label: 'Normal teórica',
          data: curva,
          borderColor: PALETA[3],
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
        },
      ],
    },
    options: opcionesBase({ scales: ejes(nombre, 'Frecuencia') }),
  });
}

/* ---- Barras agrupadas (tabla de contingencia) ------------------------ */

export function barrasContingencia(canvas, tabla, filas, columnas) {
  if (!disponible()) return null;
  return new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels: filas,
      datasets: tabla[0].map((_, j) => ({
        label: columnas[j],
        data: tabla.map((fila) => fila[j]),
        backgroundColor: PALETA[j % PALETA.length] + 'B3',
        borderColor: PALETA[j % PALETA.length],
        borderWidth: 1,
      })),
    },
    options: opcionesBase({ scales: ejes('', 'Frecuencia observada') }),
  });
}

/* ---- Líneas de medias pre-post --------------------------------------- */

export function lineasPrePost(canvas, pre, post) {
  if (!disponible()) return null;
  return new window.Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Pre', 'Post'],
      datasets: [
        ...pre.map((v, i) => ({
          data: [v, post[i]],
          borderColor: 'rgba(76, 86, 99, 0.25)',
          borderWidth: 1,
          pointRadius: 2,
          pointBackgroundColor: 'rgba(76, 86, 99, 0.4)',
          label: '_caso',
        })),
        {
          label: 'Media',
          data: [media(pre), media(post)],
          borderColor: PALETA[0],
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: PALETA[0],
        },
      ],
    },
    options: opcionesBase({
      plugins: {
        legend: { labels: { filter: (item) => item.text !== '_caso' } },
      },
      scales: ejes('', ''),
    }),
  });
}
