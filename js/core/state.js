/**
 * state.js — Gestor de estado de la aplicación.
 *
 * Un único almacén observable (patrón pub/sub) con todas las decisiones
 * metodológicas, las variables operacionalizadas y el sistema de
 * hipótesis. La interfaz muta el estado; los suscriptores se re-renderizan.
 *
 * Persistencia: localStorage con degradación a memoria. Los proyectos
 * guardados con versiones anteriores migran mediante `migrar()`.
 */

const CLAVE = 'metodika.v1.proyecto';

const almacen = (() => {
  let memoria = null;
  return {
    leer() {
      try { return JSON.parse(localStorage.getItem(CLAVE)) ?? memoria; }
      catch { return memoria; }
    },
    guardar(datos) {
      memoria = datos;
      try { localStorage.setItem(CLAVE, JSON.stringify(datos)); }
      catch { /* sin persistencia: solo memoria */ }
    },
    limpiar() {
      memoria = null;
      try { localStorage.removeItem(CLAVE); } catch { /* noop */ }
    },
  };
})();

function estadoInicial() {
  return {
    decisiones: {},          // { idNodo: idOpcion }
    variables: [],           // [{ id, nombre, rol, nivel, defConceptual, defOperacional, indicadores }]
    hipotesis: { hi: '', direccion: 'bilateral', sinHipotesis: false, guardada: false },
    poblacion: { unidad: '', descripcion: '', inclusion: '', exclusion: '', guardada: false },
    muestra: { guardada: false },
    instrumentos: { lista: [], guardada: false },
    analisis: { guardada: false },
    creado: new Date().toISOString(),
  };
}

/** Migra proyectos de versiones previas al esquema actual. */
function migrar(guardado) {
  if (!guardado) return estadoInicial();
  const base = estadoInicial();
  return {
    ...base,
    ...guardado,
    variables: Array.isArray(guardado.variables) ? guardado.variables : [],
    hipotesis: { ...base.hipotesis, ...(guardado.hipotesis ?? {}) },
    poblacion: { ...base.poblacion, ...(guardado.poblacion ?? {}) },
    muestra: { ...base.muestra, ...(guardado.muestra ?? {}) },
    instrumentos: { ...base.instrumentos, ...(guardado.instrumentos ?? {}) },
    analisis: { ...base.analisis, ...(guardado.analisis ?? {}) },
  };
}

let estado = migrar(almacen.leer());
const suscriptores = new Set();

let secuencia = 0;
const nuevoId = () => `v${Date.now().toString(36)}${(secuencia++).toString(36)}`;

export const state = {
  get() { return structuredClone(estado); },

  decision(idNodo) { return estado.decisiones[idNodo]; },

  decidir(idNodo, idOpcion) {
    estado.decisiones[idNodo] = idOpcion;
    persistirYNotificar();
  },

  /** Elimina decisiones cuyos nodos dejaron de ser relevantes. */
  podar(idsNodosValidos) {
    let cambio = false;
    for (const id of Object.keys(estado.decisiones)) {
      if (!idsNodosValidos.has(id)) {
        delete estado.decisiones[id];
        cambio = true;
      }
    }
    if (cambio) persistirYNotificar();
  },

  /* ---- Variables ------------------------------------------- */

  agregarVariable(datos) {
    estado.variables.push({ id: nuevoId(), ...datos });
    persistirYNotificar();
  },

  actualizarVariable(id, datos) {
    const v = estado.variables.find((x) => x.id === id);
    if (v) { Object.assign(v, datos); persistirYNotificar(); }
  },

  eliminarVariable(id) {
    estado.variables = estado.variables.filter((x) => x.id !== id);
    persistirYNotificar();
  },

  /* ---- Hipótesis -------------------------------------------- */

  guardarHipotesis(datos) {
    estado.hipotesis = { ...estado.hipotesis, ...datos, guardada: true };
    persistirYNotificar();
  },

  reabrirHipotesis() {
    estado.hipotesis.guardada = false;
    persistirYNotificar();
  },

  /* ---- Población y muestra ----------------------------------- */

  guardarPoblacion(datos) {
    estado.poblacion = { ...estado.poblacion, ...datos, guardada: true };
    persistirYNotificar();
  },

  editarPoblacion() {
    estado.poblacion.guardada = false;
    persistirYNotificar();
  },

  guardarMuestra(datos) {
    estado.muestra = { ...datos, guardada: true };
    persistirYNotificar();
  },

  editarMuestra() {
    estado.muestra.guardada = false;
    persistirYNotificar();
  },

  /* ---- Instrumentos y análisis -------------------------------- */

  agregarInstrumento(datos) {
    estado.instrumentos.lista.push({ id: nuevoId(), ...datos });
    estado.instrumentos.guardada = false;
    persistirYNotificar();
  },

  eliminarInstrumento(id) {
    estado.instrumentos.lista = estado.instrumentos.lista.filter((x) => x.id !== id);
    persistirYNotificar();
  },

  cerrarInstrumentos() {
    estado.instrumentos.guardada = true;
    persistirYNotificar();
  },

  guardarAnalisis(datos) {
    estado.analisis = { ...datos, guardada: true };
    persistirYNotificar();
  },

  editarAnalisis() {
    estado.analisis.guardada = false;
    persistirYNotificar();
  },

  reiniciar() {
    estado = estadoInicial();
    almacen.limpiar();
    notificar();
  },

  suscribir(fn) {
    suscriptores.add(fn);
    return () => suscriptores.delete(fn);
  },
};

function persistirYNotificar() {
  almacen.guardar(estado);
  notificar();
}

function notificar() {
  const copia = state.get();
  for (const fn of suscriptores) fn(copia);
}
