/**
 * knowledge/index.js — Punto único de ensamblaje de la base de conocimiento.
 *
 * El orden del arreglo `nodos` define el orden pedagógico del flujo:
 * Alcance → Diseño → Variables → Hipótesis. Las fases futuras (muestreo,
 * instrumentos, análisis) se incorporan aquí sin tocar el motor.
 */

import { nodoAlcance } from './alcance.js';
import { nodosDiseno, veredictosDiseno } from './diseno.js';
import { nodoVariables, validacionesVariables } from './variables.js';
import { nodoHipotesis } from './hipotesis.js';
import {
  nodoPoblacion,
  nodoCensoOMuestra,
  nodoTipoMuestreo,
  nodoTecnicaProbabilistica,
  nodoTecnicaNoProbabilistica,
  nodoTamanoMuestra,
  validacionesMuestreo,
} from './muestreo.js';
import { nodoInstrumentos } from './instrumentos.js';
import { nodoAnalisis } from './analisis.js';

export const nodos = [
  nodoAlcance,
  ...nodosDiseno,
  nodoVariables,
  nodoHipotesis,
  nodoPoblacion,
  nodoCensoOMuestra,
  nodoTipoMuestreo,
  nodoTecnicaProbabilistica,
  nodoTecnicaNoProbabilistica,
  nodoTamanoMuestra,
  nodoInstrumentos,
  nodoAnalisis,
];

export const veredictos = [...veredictosDiseno];

/** Validaciones de coherencia transversal (estado → advertencias[]). */
export const validaciones = [...validacionesVariables, ...validacionesMuestreo];
