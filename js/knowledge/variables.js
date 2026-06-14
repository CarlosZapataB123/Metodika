/**
 * variables.js — Nodo editor de variables y operacionalización.
 *
 * Fundamento: Kerlinger & Lee (2002, caps. 2–3) sobre variables y
 * definiciones operacionales; Stevens (1946) sobre niveles de medición;
 * Hernández-Sampieri (cap. 10) sobre la matriz de operacionalización.
 *
 * El nivel de medición declarado aquí es la decisión con mayores
 * consecuencias aguas abajo: determina qué estadísticos serán legítimos
 * (Fase 4) y qué gráficos pertinentes (Fase 5).
 */

const d = (dec) => dec; // legibilidad en predicados

/** Catálogos compartidos por editor, matriz y validaciones. */
export const ROLES = [
  { id: 'independiente', etiqueta: 'Independiente (causa / tratamiento)' },
  { id: 'dependiente', etiqueta: 'Dependiente (efecto / resultado)' },
  { id: 'asociacion', etiqueta: 'De asociación (correlacional, sin rol causal)' },
  { id: 'atributiva', etiqueta: 'Atributiva / de control (covariable)' },
  { id: 'descriptiva', etiqueta: 'Descriptiva (solo caracterización)' },
];

export const NIVELES = [
  { id: 'nominal', etiqueta: 'Nominal (categorías sin orden)' },
  { id: 'ordinal', etiqueta: 'Ordinal (categorías con orden)' },
  { id: 'intervalo', etiqueta: 'De intervalo (distancias iguales, cero arbitrario)' },
  { id: 'razon', etiqueta: 'De razón (cero absoluto)' },
];

export const etiquetaRol = (id) => ROLES.find((r) => r.id === id)?.etiqueta ?? id;
export const etiquetaNivel = (id) => NIVELES.find((n) => n.id === id)?.etiqueta ?? id;

/** ¿Hay veredicto de diseño? (el editor de variables aparece después). */
function hayDiseno(decisiones) {
  const x = d(decisiones);
  return (
    (x.manipulacion === 'si' &&
      (x.aleatorizacion === 'si' ||
        (x.aleatorizacion === 'no' && x.grupoControl !== undefined))) ||
    (x.temporalidad === 'transversal') ||
    (x.temporalidad === 'longitudinal' && x.tipoLongitudinal !== undefined)
  );
}

const esExperimentalFamilia = (x) => x.manipulacion === 'si';

export const nodoVariables = {
  id: 'variables',
  etapa: 'Variables',
  tipo: 'editorVariables',
  pregunta: 'Defina y operacionalice sus variables',
  contexto:
    'Una variable es una propiedad que puede variar y cuya variación es ' +
    'susceptible de medirse u observarse. Operacionalizarla significa ' +
    'descender de la definición conceptual (qué es, según la teoría) a la ' +
    'definición operacional (cómo se medirá exactamente: instrumento, ' +
    'indicadores, procedimiento). Sin operacionalización no hay medición ' +
    'defendible.',
  relevanteSi: (decisiones) => hayDiseno(decisiones),
  respondido: (estado) => requisitosVariables(estado).completo,

  pedagogia: {
    queSignifica:
      'La matriz de operacionalización traduce cada constructo teórico en ' +
      'decisiones de medición verificables: variable → definición ' +
      'conceptual → definición operacional → dimensiones/indicadores → ' +
      'nivel de medición. Es el puente entre el marco teórico y el ' +
      'instrumento.',
    porQueImporta:
      'El nivel de medición (Stevens, 1946) determina qué operaciones ' +
      'matemáticas son legítimas y, por tanto, qué estadísticos podrá ' +
      'usar: con variables nominales, frecuencias y chi-cuadrado; con ' +
      'ordinales, medianas y pruebas no paramétricas; con intervalo o ' +
      'razón, medias, t de Student, ANOVA y correlación de Pearson ' +
      '(si se cumplen los demás supuestos).',
    implicaciones: [
      'En diseños experimentales, la variable independiente es categórica por construcción (los niveles del tratamiento).',
      'En estudios correlacionales puros, hablar de "independiente/dependiente" es teóricamente abusivo: prefiera "predictora/criterio" o "variables de asociación".',
      'Las escalas tipo Likert son ordinales ítem a ítem; la suma de múltiples ítems suele tratarse como de intervalo, decisión que debe declararse y justificarse.',
    ],
    erroresFrecuentes: [
      'Definiciones operacionales circulares ("la motivación se mide con el cuestionario de motivación") sin especificar indicadores ni puntuación.',
      'Declarar "de razón" variables psicológicas que carecen de cero absoluto.',
      'Omitir las covariables que el marco teórico señala como explicaciones rivales.',
    ],
    referencias:
      'Kerlinger & Lee (2002), caps. 2–3; Stevens (1946); Hernández-Sampieri et al. (2014), cap. 10.',
  },
};

/**
 * Requisitos mínimos de variables según el diseño derivado.
 * Devuelve { completo, faltantes[] } para el motor y el editor.
 */
export function requisitosVariables(estado) {
  const x = estado.decisiones;
  const vars = estado.variables;
  const faltantes = [];

  if (esExperimentalFamilia(x)) {
    if (!vars.some((v) => v.rol === 'independiente'))
      faltantes.push('al menos una variable independiente (el tratamiento que manipulará)');
    if (!vars.some((v) => v.rol === 'dependiente'))
      faltantes.push('al menos una variable dependiente (el resultado que medirá)');
  } else if (x.alcance === 'correlacional' || (x.alcance === 'explicativo' && x.manipulacion === 'no')) {
    if (vars.length < 2)
      faltantes.push('al menos dos variables para analizar su asociación');
  } else {
    if (vars.length < 1)
      faltantes.push('al menos una variable de estudio');
  }

  const incompletas = vars.filter(
    (v) => !v.nombre?.trim() || !v.defConceptual?.trim() || !v.defOperacional?.trim()
  );
  if (incompletas.length > 0)
    faltantes.push('completar definición conceptual y operacional de todas las variables');

  return { completo: faltantes.length === 0, faltantes };
}

/**
 * Validaciones de coherencia transversal entre variables y diseño.
 * Cada función recibe el estado y devuelve un arreglo de advertencias.
 */
export const validacionesVariables = [
  (estado) => {
    const x = estado.decisiones;
    const avisos = [];
    if (!hayDiseno(x)) return avisos;

    const vi = estado.variables.filter((v) => v.rol === 'independiente');
    const vd = estado.variables.filter((v) => v.rol === 'dependiente');

    // Coherencia rol ↔ diseño
    if (!esExperimentalFamilia(x) && (vi.length > 0 || vd.length > 0) &&
        (x.alcance === 'correlacional')) {
      avisos.push(
        'Declaró variables como independiente/dependiente en un diseño ' +
        'correlacional sin manipulación. La nomenclatura causal sugiere ' +
        'una inferencia que el diseño no puede sostener; considere los ' +
        'roles "de asociación" o la pareja predictora/criterio.'
      );
    }

    // VI experimental con nivel no categórico
    if (esExperimentalFamilia(x)) {
      for (const v of vi) {
        if (v.nivel === 'intervalo' || v.nivel === 'razon') {
          avisos.push(
            `La variable independiente «${v.nombre}» se declaró con nivel ` +
            'de intervalo/razón. En un experimento, la VI manipulada se ' +
            'expresa en niveles discretos del tratamiento (p. ej., ' +
            'intervención vs. control): regístrela como nominal u ordinal.'
          );
        }
      }
      for (const v of vd) {
        if (v.nivel === 'nominal') {
          avisos.push(
            `La variable dependiente «${v.nombre}» es nominal: las ` +
            'comparaciones entre grupos se harán sobre proporciones ' +
            '(chi-cuadrado), no sobre medias (t/ANOVA). Téngalo presente ' +
            'al planear el tamaño de muestra y el análisis.'
          );
        }
      }
    }

    // Correlacional con ambas variables nominales
    if (x.alcance === 'correlacional' && estado.variables.length >= 2 &&
        estado.variables.every((v) => v.nivel === 'nominal')) {
      avisos.push(
        'Todas sus variables son nominales: la "correlación" pertinente ' +
        'será una medida de asociación para categorías (chi-cuadrado con ' +
        'V de Cramér), no r de Pearson ni rho de Spearman.'
      );
    }

    return avisos;
  },
];
