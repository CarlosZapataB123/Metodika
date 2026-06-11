import { engine } from '../js/core/engine.js';
import { recomendar } from '../js/knowledge/analisis.js';

let fallos = 0;
const ok = (c, n) => { console.log((c ? 'OK   ' : 'FALLO') + ' ' + n); if (!c) fallos++; };

const v = (rol, nivel, nombre='V') => ({ id: nombre+rol, nombre, rol, nivel, defConceptual:'c', defOperacional:'o' });
const lleno = {
  hipotesis: { hi:'H', direccion:'bilateral', sinHipotesis:false, guardada:true },
  poblacion: { unidad:'u', descripcion:'d', inclusion:'i', exclusion:'', guardada:true },
  muestra: { guardada:true },
  instrumentos: { lista:[{id:'i1', nombre:'Escala X', tipo:'estandarizado', variable:'V', validez:'v', confiabilidad:''}], guardada:true },
  analisis: { guardada:false },
};

/* --- Recomendador: 8 rutas --- */
const expPuro = { decisiones:{ alcance:'explicativo', manipulacion:'si', aleatorizacion:'si' } };
ok(recomendar({ ...expPuro, variables:[v('independiente','nominal'), v('dependiente','razon')] }, 2).id === 'tIndependiente', 'experimental + VD métrica + 2 cond → t independiente');
ok(recomendar({ ...expPuro, variables:[v('independiente','nominal'), v('dependiente','razon')] }, 3).id === 'anova', '3+ condiciones → ANOVA');
ok(recomendar({ ...expPuro, variables:[v('independiente','nominal'), v('dependiente','ordinal')] }, 2).id === 'mannWhitney', 'VD ordinal + 2 cond → Mann-Whitney');
ok(recomendar({ ...expPuro, variables:[v('independiente','nominal'), v('dependiente','ordinal')] }, 3).id === 'kruskal', 'VD ordinal + 3 cond → Kruskal-Wallis');
ok(recomendar({ ...expPuro, variables:[v('independiente','nominal'), v('dependiente','nominal')] }, 2).id === 'chi2', 'VD nominal → chi-cuadrado');

const preExp = { decisiones:{ alcance:'explicativo', manipulacion:'si', aleatorizacion:'no', grupoControl:'no' } };
ok(recomendar({ ...preExp, variables:[v('independiente','nominal'), v('dependiente','razon')] }).id === 'tPareada', 'preexperimental + VD métrica → t pareada');
ok(recomendar({ ...preExp, variables:[v('independiente','nominal'), v('dependiente','ordinal')] }).id === 'wilcoxon', 'preexperimental + VD ordinal → Wilcoxon');

const corr = { decisiones:{ alcance:'correlacional', temporalidad:'transversal' } };
ok(recomendar({ ...corr, variables:[v('asociacion','razon','A'), v('asociacion','intervalo','B')] }).id === 'pearson', 'correlacional métrico → Pearson');
ok(recomendar({ ...corr, variables:[v('asociacion','ordinal','A'), v('asociacion','razon','B')] }).id === 'spearman', 'con ordinal → Spearman');
ok(recomendar({ ...corr, variables:[v('asociacion','nominal','A'), v('asociacion','nominal','B')] }).id === 'chi2', 'ambas nominales → chi-cuadrado');
ok(recomendar({ decisiones:{ alcance:'descriptivo', temporalidad:'transversal' }, variables:[v('descriptiva','razon')] }).id === 'descriptivos', 'descriptivo → univariado');

/* --- Flujo: instrumentos y análisis aparecen en orden --- */
const e1 = { ...lleno,
  decisiones: { alcance:'correlacional', temporalidad:'transversal', censoOMuestra:'muestra', tipoMuestreo:'probabilistico', tecnicaProb:'aleatorioSimple' },
  variables: [v('asociacion','razon','A'), v('asociacion','razon','B')],
  instrumentos: { lista: [], guardada: false },
};
let vis = engine.nodosVisibles(e1).map(n => n.id);
ok(vis.at(-1) === 'instrumentos', 'frente avanza a instrumentos');

const e2 = { ...e1, instrumentos: lleno.instrumentos };
vis = engine.nodosVisibles(e2).map(n => n.id);
ok(vis.at(-1) === 'analisis', 'frente avanza a análisis');

const e3 = { ...e2, analisis: { guardada: true, salida:'', interpretacion:'' } };
const etapas = engine.etapas(e3);
ok(etapas.every(x => x.completa), 'todas las etapas completas: flujo de extremo a extremo');

/* --- Censo también habilita análisis --- */
const e4 = { ...lleno,
  decisiones: { alcance:'descriptivo', temporalidad:'transversal', censoOMuestra:'censo' },
  variables: [v('descriptiva','razon')],
};
ok(engine.idsRelevantes(e4.decisiones).has('analisis'), 'censo habilita la etapa de análisis');

/* --- Regresión --- */
ok(engine.veredictosActivos({ alcance:'explicativo', manipulacion:'si', aleatorizacion:'si' })[0]?.id === 'experimentalPuro', 'regresión: veredictos intactos');

process.exit(fallos ? 1 : 0);
