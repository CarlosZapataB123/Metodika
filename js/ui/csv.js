/**
 * ui/csv.js — Carga de archivos CSV sin dependencias.
 *
 * Parser deliberadamente simple: detecta el delimitador (coma o punto y
 * coma) y, con punto y coma, interpreta la coma como separador decimal
 * (convención europea). No soporta campos entrecomillados con
 * delimitadores internos; para datos numéricos de laboratorio es
 * suficiente y la limitación se documenta.
 *
 * En lugar de un flujo paralelo, el CSV se VIERTE al formato textual del
 * laboratorio (una serie por línea, «Etiqueta: v1, v2…»), de modo que la
 * validación y el análisis reutilizan exactamente la misma ruta.
 */

import { el } from './dom.js';

export function parseCSV(texto) {
  const lineas = texto.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lineas.length < 2) throw new Error('El CSV necesita una fila de encabezados y al menos una de datos.');

  const delim = lineas[0].includes(';') ? ';' : ',';
  const celdas = (l) => l.split(delim).map((c) => c.trim());

  const encabezados = celdas(lineas[0]);
  const columnas = encabezados.map(() => []);

  for (const linea of lineas.slice(1)) {
    const fila = celdas(linea);
    fila.forEach((valor, j) => {
      if (j >= columnas.length || valor === '') return;
      const num = parseFloat(delim === ';' ? valor.replace(',', '.') : valor);
      if (!Number.isNaN(num)) columnas[j].push(num);
    });
  }

  const conDatos = encabezados
    .map((nombre, j) => ({ nombre, valores: columnas[j] }))
    .filter((c) => c.valores.length > 0);

  if (conDatos.length === 0) throw new Error('No se encontraron columnas numéricas en el CSV.');
  return conDatos;
}

/** Convierte columnas al formato del laboratorio según el modo. */
export function columnasATexto(columnas, modo) {
  if (modo === 'prePost') {
    if (columnas.length < 2) throw new Error('Se requieren dos columnas (pre y post).');
    return `Pre: ${columnas[0].valores.join(', ')}\nPost: ${columnas[1].valores.join(', ')}`;
  }
  if (modo === 'correlacion') {
    if (columnas.length < 2) throw new Error('Se requieren dos columnas (X e Y).');
    return columnas.slice(0, 2).map((c) => `${c.nombre}: ${c.valores.join(', ')}`).join('\n');
  }
  if (modo === 'tablaContingencia') {
    // Cada fila del CSV (sin encabezado) es una fila de la tabla
    const filas = columnas[0].valores.map((_, i) =>
      columnas.map((c) => c.valores[i]).filter((v) => v !== undefined).join(', ')
    );
    return filas.join('\n');
  }
  if (modo === 'matriz') {
    // Para alfa de Cronbach: participantes × ítems
    const filas = columnas[0].valores.map((_, i) =>
      columnas.map((c) => c.valores[i]).filter((v) => v !== undefined).join(', ')
    );
    return filas.join('\n');
  }
  // gruposContinua / descriptivos: una serie por columna
  return columnas.map((c) => `${c.nombre}: ${c.valores.join(', ')}`).join('\n');
}

/** Botón discreto «Cargar CSV» que rellena un textarea destino. */
export function botonCargarCSV(area, modo, alError) {
  const input = el('input', {
    type: 'file',
    accept: '.csv,text/csv,text/plain',
    class: 'sr-only',
    id: `csv-${modo}-${Math.random().toString(36).slice(2, 7)}`,
  });

  input.addEventListener('change', () => {
    const archivo = input.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      try {
        area.value = columnasATexto(parseCSV(String(lector.result)), modo);
        area.dispatchEvent(new Event('input'));
      } catch (e) {
        alError?.(e.message);
      }
    };
    lector.onerror = () => alError?.('No fue posible leer el archivo.');
    lector.readAsText(archivo);
  });

  const etiqueta = el(
    'label',
    { class: 'boton-secundario boton-archivo', for: input.id },
    'Cargar CSV…'
  );
  return el('span', {}, input, etiqueta);
}
