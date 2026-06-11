/**
 * app.js — Punto de entrada de la aplicación.
 *
 * Composición mínima: conecta el estado con los dos renderizadores
 * (tutor y matriz). Toda la inteligencia vive en /core y /knowledge.
 */

import { state } from './core/state.js';
import { renderTutor } from './ui/tutor.js';
import { renderBlueprint } from './ui/blueprint.js';
import { iniciarTema } from './ui/tema.js';

const contenedorTutor = document.getElementById('tutor');
const contenedorMatriz = document.getElementById('matriz');

function render(estado) {
  renderTutor(contenedorTutor, estado);
  renderBlueprint(contenedorMatriz, estado);
}

state.suscribir(render);
render(state.get());

iniciarTema(document.getElementById('boton-tema'));
