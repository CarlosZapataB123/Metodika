/**
 * engine.js — Motor metodológico.
 *
 * Agnóstico al contenido: recorre la base de conocimiento y, para el
 * estado actual, determina (1) qué nodos son relevantes y cuál es el
 * "frente" de la conversación, (2) qué decisiones quedaron huérfanas
 * tras un cambio, (3) qué veredictos se derivan y (4) qué validaciones
 * de coherencia transversal están activas.
 *
 * Contratos de un nodo:
 *   relevanteSi(decisiones)       → boolean   (visibilidad)
 *   respondido?(estado)           → boolean   (completitud; por defecto,
 *                                              existe decisiones[id])
 *   tipo: 'seleccion' (defecto) | 'editorVariables' | 'editorHipotesis'
 */

import { nodos, veredictos, validaciones } from '../knowledge/index.js';
import { state } from './state.js';

function estaRespondido(nodo, estado) {
  if (typeof nodo.respondido === 'function') return nodo.respondido(estado);
  return estado.decisiones[nodo.id] !== undefined;
}

export const engine = {
  /**
   * Nodos visibles en orden: los relevantes ya respondidos más el
   * primer relevante sin responder (el frente).
   */
  nodosVisibles(estado) {
    const visibles = [];
    for (const nodo of nodos) {
      if (!nodo.relevanteSi(estado.decisiones)) continue;
      visibles.push(nodo);
      if (!estaRespondido(nodo, estado)) break;
    }
    return visibles;
  },

  idsRelevantes(decisiones) {
    return new Set(
      nodos.filter((n) => n.relevanteSi(decisiones)).map((n) => n.id)
    );
  },

  /** Poda en cascada hasta punto fijo tras un cambio aguas arriba. */
  podarDecisionesHuerfanas() {
    let previo;
    do {
      const decisiones = state.get().decisiones;
      previo = Object.keys(decisiones).length;
      state.podar(this.idsRelevantes(decisiones));
    } while (Object.keys(state.get().decisiones).length !== previo);
  },

  veredictosActivos(decisiones) {
    return veredictos.filter((v) => v.cuando(decisiones));
  },

  /** Validaciones de coherencia transversal (advertencias activas). */
  validacionesActivas(estado) {
    return validaciones.flatMap((v) => v(estado)).filter(Boolean);
  },

  /** Progreso por etapa: pendiente | activa | completa. */
  etapas(estado) {
    const { decisiones } = estado;
    const orden = [...new Set(nodos.map((n) => n.etapa))];
    const visibles = this.nodosVisibles(estado);
    const frente = visibles.find((n) => !estaRespondido(n, estado));
    return orden.map((etapa) => {
      const propios = nodos.filter(
        (n) => n.etapa === etapa && n.relevanteSi(decisiones)
      );
      const completa =
        propios.length > 0 && propios.every((n) => estaRespondido(n, estado));
      const activa = frente ? frente.etapa === etapa : false;
      return { etapa, completa, activa };
    });
  },
};
