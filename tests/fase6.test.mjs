import { matrizComoMarkdown } from '../js/ui/exportacion.js';

let fallos = 0;
const ok = (c, n) => { console.log((c ? 'OK   ' : 'FALLO') + ' ' + n); if (!c) fallos++; };

const v = (rol, nivel, nombre) => ({ id: nombre, nombre, rol, nivel, defConceptual: 'def conceptual', defOperacional: 'def operacional', indicadores: '' });

const estado = {
  decisiones: {
    alcance: 'explicativo', manipulacion: 'si', aleatorizacion: 'si',
    censoOMuestra: 'muestra', tipoMuestreo: 'probabilistico', tecnicaProb: 'aleatorioSimple',
  },
  variables: [v('independiente', 'nominal', 'Programa'), v('dependiente', 'razon', 'Bienestar')],
  hipotesis: { hi: 'Los participantes que reciben el programa presentarán mayor bienestar.', direccion: 'bilateral', sinHipotesis: false, guardada: true },
  poblacion: { unidad: 'profesionales de enfermería', descripcion: 'hospitales públicos de Navarra, 2026', inclusion: 'contrato vigente', exclusion: 'licencia prolongada', guardada: true },
  muestra: { guardada: true, salida: 'n por grupo = 63', interpretacion: 'Con 63 participantes por grupo…' },
  instrumentos: { lista: [{ id: 'i1', nombre: 'Escala de Ryff', tipo: 'estandarizado', variable: 'Bienestar', validez: 'estructura factorial replicada', confiabilidad: 'α = .84' }], guardada: true },
  analisis: { guardada: true, salida: 't de Student t(124)=2.31', interpretacion: 'La comparación de medias resultó significativa…' },
};

const md = matrizComoMarkdown(estado);

ok(md.startsWith('# Capítulo de método'), 'el documento abre con el título');
ok(md.includes('## Alcance de la investigación') && md.includes('alcance explicativo'), 'sección de alcance presente');
ok(md.includes('diseño experimental puro'), 'el veredicto del motor se exporta');
ok(md.includes('| Programa |') && md.includes('| Bienestar |'), 'tabla de operacionalización en Markdown');
ok(md.includes('**Hi:**') && md.includes('H₀'), 'sistema de hipótesis con H0 generada');
ok(md.includes('profesionales de enfermería') && md.includes('muestreo probabilístico'), 'población y muestreo');
ok(md.includes('n por grupo = 63') && md.includes('```'), 'salida de muestra como bloque de código');
ok(md.includes('Escala de Ryff') && md.includes('α = .84'), 'instrumentos exportados');
ok(md.includes('t de Student t(124)=2.31'), 'plan de análisis exportado');
ok(md.includes('No sustituye la asesoría'), 'descargo de responsabilidad presente');

/* Estado vacío: no debe romper */
const vacio = matrizComoMarkdown({ decisiones: {}, variables: [], hipotesis: {}, poblacion: {}, muestra: {}, instrumentos: { lista: [] }, analisis: {} });
ok(vacio.includes('# Capítulo de método'), 'estado vacío exporta sin errores');

process.exit(fallos ? 1 : 0);
