import { engine } from '../js/core/engine.js';

const casos = [
  // [decisiones, veredicto esperado]
  [{ alcance: 'explicativo', manipulacion: 'si', aleatorizacion: 'si' }, 'experimentalPuro'],
  [{ alcance: 'explicativo', manipulacion: 'si', aleatorizacion: 'no', grupoControl: 'si' }, 'cuasiexperimental'],
  [{ alcance: 'explicativo', manipulacion: 'si', aleatorizacion: 'no', grupoControl: 'no' }, 'preexperimental'],
  [{ alcance: 'descriptivo', temporalidad: 'transversal' }, 'transversalDescriptivo'],
  [{ alcance: 'correlacional', temporalidad: 'transversal' }, 'transversalCorrelacional'],
  [{ alcance: 'explicativo', manipulacion: 'no', temporalidad: 'transversal' }, 'transversalCorrelacional'],
  [{ alcance: 'correlacional', temporalidad: 'longitudinal', tipoLongitudinal: 'panel' }, 'longitudinalVeredicto'],
  [{ alcance: 'exploratorio', temporalidad: 'transversal' }, 'exploratorioVeredicto'],
];

let fallos = 0;
for (const [d, esperado] of casos) {
  const activos = engine.veredictosActivos(d).map(v => v.id);
  const ok = activos.length === 1 && activos[0] === esperado;
  if (!ok) { fallos++; console.log('FALLO', JSON.stringify(d), '→', activos, 'esperado', esperado); }
  else console.log('OK  ', esperado);
}

// Progressive disclosure: con alcance explicativo, el frente debe ser 'manipulacion'
const vis = engine.nodosVisibles({ decisiones: { alcance: 'explicativo' } }).map(n => n.id);
console.log(vis.join(' → ') === 'alcance → manipulacion' ? 'OK   frente explicativo' : 'FALLO frente: ' + vis);

// Con alcance descriptivo, el frente debe saltar a 'temporalidad'
const vis2 = engine.nodosVisibles({ decisiones: { alcance: 'descriptivo' } }).map(n => n.id);
console.log(vis2.join(' → ') === 'alcance → temporalidad' ? 'OK   frente descriptivo' : 'FALLO frente: ' + vis2);

// Relevancia: cambiar de explicativo a descriptivo debe volver irrelevante 'manipulacion'
const ids = engine.idsRelevantes({ alcance: 'descriptivo', manipulacion: 'si' });
console.log(!ids.has('manipulacion') ? 'OK   poda en cascada' : 'FALLO poda');

process.exit(fallos ? 1 : 0);
