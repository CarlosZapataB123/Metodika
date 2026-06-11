/**
 * dom.js — Utilidades mínimas de creación de DOM.
 *
 * `el(tag, props, ...hijos)` crea elementos de forma declarativa usando
 * textContent (nunca innerHTML con datos), lo que elimina riesgos de
 * inyección y mantiene el renderizado legible.
 */

export function el(tag, props = {}, ...hijos) {
  const nodo = document.createElement(tag);

  for (const [clave, valor] of Object.entries(props)) {
    if (clave === 'class') nodo.className = valor;
    else if (clave === 'dataset') Object.assign(nodo.dataset, valor);
    else if (clave.startsWith('on') && typeof valor === 'function') {
      nodo.addEventListener(clave.slice(2).toLowerCase(), valor);
    } else if (valor !== undefined && valor !== null) {
      nodo.setAttribute(clave, valor);
    }
  }

  for (const hijo of hijos.flat()) {
    if (hijo === null || hijo === undefined || hijo === false) continue;
    nodo.append(hijo instanceof Node ? hijo : document.createTextNode(hijo));
  }

  return nodo;
}

/** Vacía un contenedor y monta nuevos hijos. */
export function montar(contenedor, ...hijos) {
  contenedor.replaceChildren(...hijos.flat().filter(Boolean));
}
