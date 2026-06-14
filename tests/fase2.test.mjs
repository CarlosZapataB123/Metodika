import { engine } from '../js/core/engine.js';
import { requisitosVariables } from '../js/knowledge/variables.js';
import { tipoHipotesis } from '../js/knowledge/hipotesis.js';

const base = { variables: [], hipotesis: { hi: '', direccion: 'bilateral', sinHipotesis: false, guardada: false } };
let fallos = 0;
const ok = (cond, nombre) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + nombre); if (!cond) fallos++; };

// 1. Con diseño experimental completo y sin variables, el frente es 'variables'
const e1 = { ...base, decisiones: { alcance: 'explicativo', manipulacion: 'si', aleatorizacion: 'si' } };
let vis = engine.nodosVisibles(e1).map(n => n.id);
ok(vis.at(-1) === 'variables', 'frente avanza a variables tras veredicto experimental');

// 2. Requisitos: experimental exige VI y VD
let req = requisitosVariables(e1);
ok(!req.completo && req.faltantes.length === 2, 'experimental sin variables: faltan VI y VD');

// 3. Con VI y VD completas, el nodo variables queda respondido y aparece hipótesis
const vComp = (rol, nombre) => ({ id: 'x'+rol, nombre, rol, nivel: rol === 'independiente' ? 'nominal' : 'razon', defConceptual: 'def', defOperacional: 'op' });
const e2 = { ...e1, variables: [vComp('independiente','Programa'), vComp('dependiente','Bienestar')] };
ok(requisitosVariables(e2).completo, 'experimental con VI+VD completas');
vis = engine.nodosVisibles(e2).map(n => n.id);
ok(vis.at(-1) === 'hipotesis', 'frente avanza a hipótesis con variables completas');

// 4. Correlacional exige dos variables
const e3 = { ...base, decisiones: { alcance: 'correlacional', temporalidad: 'transversal' }, variables: [vComp('asociacion','A')] };
ok(!requisitosVariables(e3).completo, 'correlacional con una sola variable: incompleto');

// 5. Tipos de hipótesis derivados
ok(tipoHipotesis({ alcance: 'explicativo', manipulacion: 'si' })?.id === 'causal', 'tipo causal en experimental');
ok(tipoHipotesis({ alcance: 'correlacional' })?.id === 'correlacional', 'tipo correlacional');
ok(tipoHipotesis({ alcance: 'explicativo', manipulacion: 'no' })?.id === 'correlacionalCausal', 'tipo correlacional-causal');
ok(tipoHipotesis({ alcance: 'descriptivo' })?.opcional === true, 'descriptiva opcional');
ok(tipoHipotesis({ alcance: 'exploratorio' }) === null, 'exploratorio sin hipótesis');

// 6. Validaciones de coherencia
const e4 = { ...base, decisiones: { alcance: 'correlacional', temporalidad: 'transversal' },
  variables: [vComp('independiente','A'), vComp('dependiente','B')] };
let avisos = engine.validacionesActivas(e4);
ok(avisos.some(a => a.includes('correlacional sin manipulación')), 'aviso: roles causales en correlacional');

const e5 = { ...base, decisiones: { alcance: 'explicativo', manipulacion: 'si', aleatorizacion: 'si' },
  variables: [{ ...vComp('independiente','Dosis'), nivel: 'razon' }, vComp('dependiente','Y')] };
avisos = engine.validacionesActivas(e5);
ok(avisos.some(a => a.includes('niveles discretos')), 'aviso: VI experimental con nivel de razón');

// 7. Hipótesis guardada completa el nodo
const e6 = { ...e2, hipotesis: { hi: 'Existe…', direccion: 'bilateral', sinHipotesis: false, guardada: true } };
vis = engine.nodosVisibles(e6).map(n => n.id);
ok(engine.etapas(e6).find(x => x.etapa === 'Hipótesis')?.completa === true, 'etapa Hipótesis completa al guardar');

// 8. Regresión Fase 1: veredictos intactos
ok(engine.veredictosActivos({ alcance: 'explicativo', manipulacion: 'si', aleatorizacion: 'no', grupoControl: 'si' })[0]?.id === 'cuasiexperimental', 'regresión: veredicto cuasi intacto');

process.exit(fallos ? 1 : 0);
