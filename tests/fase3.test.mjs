import { engine } from '../js/core/engine.js';
import { nProporcion, nMedia, nDosGrupos, correccionFinita } from '../js/stats/muestra.js';

let fallos = 0;
const ok = (c, n) => { console.log((c ? 'OK   ' : 'FALLO') + ' ' + n); if (!c) fallos++; };

/* --- Fórmulas contra valores de referencia (Cochran; tablas clásicas) --- */
ok(nProporcion({ confianza: 95, error: 0.05, p: 0.5 }).n === 385, 'proporción: 95%, e=5%, p=.5 → 385');
ok(nProporcion({ confianza: 95, error: 0.05, p: 0.5, N: 1000 }).n === 278, 'proporción con N=1000 → 278');
ok(nProporcion({ confianza: 99, error: 0.03, p: 0.5 }).n === 1843, "proporción: 99%, e=3% → 1843 (z exacto)");
ok(nMedia({ confianza: 95, error: 3, sigma: 15 }).n === 97, 'media: σ=15, e=3, 95% → 97');
const dg = nDosGrupos({ confianza: 95, potencia: 80, d: 0.5 });
ok(dg.nGrupo === 63 && dg.nTotal === 126, 'dos grupos: d=.5, 80% → 63/grupo (aprox normal)');
ok(nDosGrupos({ confianza: 95, potencia: 90, d: 0.8 }).nGrupo === 33, 'dos grupos: d=.8, 90% → 33/grupo');
ok(Math.abs(correccionFinita(385, 100000) - 383.5) < 1, 'corrección finita ≈ neutra con N grande');

/* --- Flujo: relevancia y poda --- */
const base = {
  variables: [
    { id:'a', nombre:'X', rol:'asociacion', nivel:'razon', defConceptual:'c', defOperacional:'o' },
    { id:'b', nombre:'Y', rol:'asociacion', nivel:'razon', defConceptual:'c', defOperacional:'o' },
  ],
  hipotesis: { hi: 'Existe relación', direccion: 'bilateral', sinHipotesis: false, guardada: true },
  poblacion: { unidad:'u', descripcion:'d', inclusion:'i', exclusion:'', guardada: true },
  muestra: { guardada: false },
};

// Tras hipótesis y población, con 'muestra' elegida, frente = tipoMuestreo
const e1 = { ...base, decisiones: { alcance:'correlacional', temporalidad:'transversal', censoOMuestra:'muestra' } };
let vis = engine.nodosVisibles(e1).map(n => n.id);
ok(vis.at(-1) === 'tipoMuestreo', 'frente avanza a tipoMuestreo');

// Probabilístico → tecnicaProb visible; noProb no
const e2 = { ...e1, decisiones: { ...e1.decisiones, tipoMuestreo:'probabilistico' } };
vis = engine.nodosVisibles(e2).map(n => n.id);
ok(vis.includes('tecnicaProb') && !vis.includes('tecnicaNoProb'), 'técnica probabilística visible');

// Con técnica elegida, frente = tamanoMuestra
const e3 = { ...e2, decisiones: { ...e2.decisiones, tecnicaProb:'estratificado' } };
vis = engine.nodosVisibles(e3).map(n => n.id);
ok(vis.at(-1) === 'tamanoMuestra', 'frente avanza a la calculadora');

// Censo: muestreo y calculadora irrelevantes
const e4 = { ...base, decisiones: { alcance:'descriptivo', temporalidad:'transversal', censoOMuestra:'censo' } };
const ids = engine.idsRelevantes(e4.decisiones);
ok(!ids.has('tipoMuestreo') && !ids.has('tamanoMuestra'), 'censo corta muestreo y calculadora');

// Poda: cambiar a noProbabilistico invalida tecnicaProb
const idsCambio = engine.idsRelevantes({ ...e3.decisiones, tipoMuestreo:'noProbabilistico' });
ok(!idsCambio.has('tecnicaProb') && idsCambio.has('tecnicaNoProb'), 'poda al cambiar tipo de muestreo');

// Validación: descriptivo + noProbabilistico → aviso
const e5 = { ...base, decisiones: { alcance:'descriptivo', temporalidad:'transversal', censoOMuestra:'muestra', tipoMuestreo:'noProbabilistico' } };
ok(engine.validacionesActivas(e5).some(a => a.includes('limitación')), 'aviso: descriptivo con muestreo no probabilístico');

// Etapa Muestreo completa con muestra guardada
const e6 = { ...e3, muestra: { guardada: true } };
ok(engine.etapas(e6).find(x => x.etapa === 'Muestreo')?.completa === true, 'etapa Muestreo completa');

// Regresión fases 1-2
ok(engine.veredictosActivos({ alcance:'explicativo', manipulacion:'si', aleatorizacion:'si' })[0]?.id === 'experimentalPuro', 'regresión: veredicto experimental intacto');

process.exit(fallos ? 1 : 0);
