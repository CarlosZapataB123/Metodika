/**
 * ui/observatorio.js — Panel del Observatorio 3D.
 *
 * Columna independiente: no lee ni escribe el estado del proyecto.
 * Carga Three.js (y el motor universo.js) de forma perezosa en el
 * primer uso; si el CDN no está disponible, informa y el resto de la
 * aplicación continúa intacta.
 */

import { el } from './dom.js';
import { parseSeries } from './series.js';
import { botonCargarCSV } from './csv.js';
import { EJEMPLOS } from '../charts/universoDatos.js';

const TIPOS = [
  { id: 'barras', etiqueta: 'Columnas 3D (series × categorías)', modoCSV: 'gruposContinua', minSeries: 1, minN: 1,
    nota: 'Cada línea es una serie; cada valor, una categoría. Útil para comparar magnitudes a través de grupos y momentos.' },
  { id: 'torta', etiqueta: 'Torta 3D explotada', modoCSV: 'gruposContinua', minSeries: 2, minN: 1,
    nota: 'Una línea por sector: «Etiqueta: valor». El relieve es proporcional a la participación.' },
  { id: 'boxplot', etiqueta: 'Boxplot 3D por grupo', modoCSV: 'gruposContinua', minSeries: 1, minN: 5,
    nota: 'Caja Q1–Q3, mediana luminosa, bigotes de Tukey y atípicos como esferas carmín. Cuartiles tipo 7 (como R).' },
  { id: 'dispersion', etiqueta: 'Dispersión 3D (X · Y · Z)', modoCSV: 'gruposContinua', minSeries: 3, minN: 3,
    nota: 'Tres líneas: X, Y y Z. Arrastre para orbitar la nube y detectar estructura que el plano oculta.' },
  { id: 'sendero', etiqueta: 'Senderos 3D (trayectorias)', modoCSV: 'gruposContinua', minSeries: 1, minN: 2,
    nota: 'Cada línea es una trayectoria en el tiempo (olas de un diseño longitudinal): x = tiempo, y = valor, z = serie.' },
];

export function iniciarObservatorio(contenedor) {
  let motor = null;       // instancia de crearObservatorio (perezosa)
  let tipoActual = TIPOS[0];

  const selTipo = el(
    'select',
    { class: 'campo__control', id: 'obs-tipo' },
    TIPOS.map((t) => el('option', { value: t.id }, t.etiqueta))
  );

  const nota = el('p', { class: 'campo__ayuda' }, tipoActual.nota);
  const area = el('textarea', {
    class: 'campo__control', id: 'obs-datos', rows: 5,
    placeholder: 'Pegue sus datos («Etiqueta: v1, v2…», una serie por línea),\ncargue un CSV o pida un ejemplo.',
  });
  const aviso = el('p', { class: 'error-validacion', role: 'alert', hidden: '' });
  const lienzo = el('div', { class: 'observatorio__lienzo' });
  const vacio = el(
    'p',
    { class: 'observatorio__vacio' },
    'El cosmos espera sus datos. Genere un ejemplo o pegue los suyos.'
  );
  lienzo.append(vacio);

  selTipo.addEventListener('change', () => {
    tipoActual = TIPOS.find((t) => t.id === selTipo.value);
    nota.textContent = tipoActual.nota;
  });

  const generar = async () => {
    aviso.hidden = true;
    try {
      const series = parseSeries(area.value, tipoActual.minSeries, tipoActual.minN);
      if (tipoActual.id === 'torta' && series.some((s) => s.valores.length !== 1)) {
        throw new Error('La torta requiere exactamente un valor por línea («Etiqueta: valor»).');
      }
      if (!motor) {
        vacio.textContent = 'Encendiendo el observatorio…';
        const { crearObservatorio } = await import('../charts/universo.js');
        vacio.remove();
        motor = crearObservatorio(lienzo);
      }
      motor.pintar(tipoActual.id, series);
    } catch (e) {
      aviso.textContent = e?.message?.includes('Failed to fetch') || e?.message?.includes('import')
        ? 'No fue posible cargar el motor 3D (CDN de Three.js no disponible). El resto de Métodika funciona con normalidad.'
        : e.message;
      aviso.hidden = false;
    }
  };

  const ejemplo = () => {
    area.value = EJEMPLOS[tipoActual.id]();
    generar();
  };

  contenedor.append(
    el(
      'aside',
      { class: 'observatorio', 'aria-label': 'Observatorio de gráficos 3D' },
      el(
        'div',
        { class: 'observatorio__cabecera' },
        el('span', {}, 'OBSERVATORIO 3D'),
        el('span', {}, 'independiente del proyecto')
      ),
      el('h2', { class: 'observatorio__titulo' }, 'Gráficos tipo universo'),
      el(
        'p',
        { class: 'observatorio__intro' },
        'Explore sus datos en tres dimensiones: arrastre para orbitar, ' +
          'use la rueda para acercarse. Espacio de exploración y divulgación, ' +
          'separado del flujo metodológico.'
      ),
      el('div', { class: 'campo' },
        el('label', { class: 'campo__etiqueta', for: 'obs-tipo' }, 'Tipo de gráfico'),
        selTipo, nota),
      el('div', { class: 'campo' },
        el('label', { class: 'campo__etiqueta', for: 'obs-datos' }, 'Datos'),
        area,
        el('div', { style: 'margin-top: 0.5rem' },
          botonCargarCSV(area, 'gruposContinua', (m) => { aviso.textContent = m; aviso.hidden = false; }))),
      aviso,
      el(
        'div',
        { class: 'formulario__acciones' },
        el('button', { class: 'boton-primario', type: 'button', onClick: generar }, 'Generar universo'),
        el('button', { class: 'boton-secundario', type: 'button', onClick: ejemplo }, 'Ejemplo')
      ),
      lienzo,
      el(
        'p',
        { class: 'advertencia', role: 'note', style: 'margin-top: 1rem' },
        el('strong', {}, 'Advertencia metodológica. '),
        'La perspectiva 3D distorsiona la comparación visual de magnitudes ' +
          '(la torta 3D es el caso clásico): estos gráficos sirven para ' +
          'explorar y divulgar. Para el informe o la tesis, use los gráficos ' +
          '2D del laboratorio de análisis.'
      )
    )
  );
}
