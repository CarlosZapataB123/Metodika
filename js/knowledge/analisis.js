/**
 * analisis.js — Recomendador de técnica de análisis estadístico.
 *
 * La función `recomendar(estado, nCondiciones)` cruza tres hechos ya
 * establecidos por el flujo —familia del diseño, nivel de medición de
 * las variables centrales y número de condiciones— y devuelve la prueba
 * principal, sus supuestos verificables, la alternativa robusta y el
 * tamaño del efecto pertinente, con la cadena de premisas visible.
 *
 * Fundamento: árboles de decisión clásicos de elección de prueba
 * (Siegel & Castellan, 1988; Field, 2018) y Cohen (1988) para efectos.
 */

const metrica = (v) => v.nivel === 'intervalo' || v.nivel === 'razon';

function variableCentral(estado, rol) {
  return estado.variables.find((v) => v.rol === rol) ?? null;
}

export const nodoAnalisis = {
  id: 'analisis',
  etapa: 'Análisis',
  tipo: 'recomendadorAnalisis',
  pregunta: 'Plan de análisis estadístico',
  contexto:
    'La prueba estadística no se elige por preferencia: queda determinada ' +
    'por el diseño, el nivel de medición de las variables y la estructura ' +
    'de la comparación. Aquí el sistema deriva la técnica pertinente, ' +
    'enumera los supuestos que deberá verificar y le permite ensayar el ' +
    'análisis con datos reales o piloto.',
  relevanteSi: (x) =>
    x.censoOMuestra !== undefined,
  respondido: (estado) => estado.analisis?.guardada === true,
  pedagogia: {
    queSignifica:
      'Un plan de análisis declara, antes de recolectar datos, qué prueba ' +
      'contrastará cada hipótesis, con qué supuestos, qué se hará si los ' +
      'supuestos fallan y qué tamaño del efecto se reportará. Es el ' +
      'antídoto contra el p-hacking: las decisiones analíticas se toman ' +
      'a ciegas de los resultados.',
    porQueImporta:
      'Cambiar de prueba después de ver los datos —probar t, luego ' +
      'Mann-Whitney, luego transformar— infla el error tipo I de manera ' +
      'invisible. El plan previo convierte cualquier desviación en una ' +
      'decisión documentada y justificable.',
    implicaciones: [
      'Verifique los supuestos sobre sus datos, no por costumbre: normalidad y homogeneidad son hipótesis empíricas.',
      'Reporte siempre el tamaño del efecto con su intervalo: el valor p depende del n; el efecto, no.',
      'Si los supuestos fallan, la alternativa robusta planificada se aplica sin culpa: para eso está en el plan.',
    ],
    erroresFrecuentes: [
      'Interpretar p < .05 como probabilidad de que la hipótesis sea cierta (es la probabilidad de los datos bajo H₀).',
      'Reportar "no hay diferencias" ante un p alto con potencia baja.',
      'Ejecutar múltiples pruebas sin corrección y narrar solo las significativas.',
    ],
    referencias:
      'Cohen (1994); Field (2018); Siegel & Castellan (1988); Tabachnick & Fidell (2019).',
  },
};

/**
 * Deriva la recomendación. `nCondiciones` (2 o 3) solo aplica a la
 * familia de comparación; en lo demás se ignora.
 */
export function recomendar(estado, nCondiciones = 2) {
  const x = estado.decisiones;
  const premisas = [];

  /* ---- Familia comparación (experimental / cuasi / pre) ---- */
  if (x.manipulacion === 'si') {
    const vd = variableCentral(estado, 'dependiente');
    const preExp = x.aleatorizacion === 'no' && x.grupoControl === 'no';
    premisas.push('El diseño manipula un tratamiento: el análisis compara condiciones.');

    if (preExp) {
      premisas.push('Un solo grupo con medición pre-post: comparación intra-sujetos.');
      if (vd && !metrica(vd)) {
        premisas.push(`La VD «${vd.nombre}» no es métrica: prueba de rangos.`);
        return rec('wilcoxon', premisas, vd);
      }
      premisas.push('VD métrica: contraste de medias relacionadas.');
      return rec('tPareada', premisas, vd);
    }

    if (vd && vd.nivel === 'nominal') {
      premisas.push(`La VD «${vd.nombre}» es nominal: se comparan proporciones.`);
      return rec('chi2', premisas, vd);
    }
    if (vd && vd.nivel === 'ordinal') {
      premisas.push(`La VD «${vd.nombre}» es ordinal: pruebas de rangos.`);
      return rec(nCondiciones >= 3 ? 'kruskal' : 'mannWhitney', premisas, vd);
    }
    premisas.push('VD métrica (intervalo/razón): contraste de medias.');
    if (nCondiciones >= 3) {
      premisas.push('Tres o más condiciones: ANOVA de un factor.');
      return rec('anova', premisas, vd);
    }
    premisas.push('Dos condiciones independientes: t de Student.');
    return rec('tIndependiente', premisas, vd);
  }

  /* ---- Familia asociación (correlacional / explicativo s/ manip.) ---- */
  if (x.alcance === 'correlacional' || (x.alcance === 'explicativo' && x.manipulacion === 'no')) {
    const [v1, v2] = estado.variables;
    premisas.push('Diseño no experimental de asociación: se cuantifica la relación entre variables.');
    if (v1 && v2) {
      if (v1.nivel === 'nominal' && v2.nivel === 'nominal') {
        premisas.push('Ambas variables nominales: asociación entre categorías.');
        return rec('chi2', premisas, null);
      }
      if (metrica(v1) && metrica(v2)) {
        premisas.push('Ambas variables métricas: correlación producto-momento.');
        return rec('pearson', premisas, null);
      }
      premisas.push('Al menos una variable ordinal (o métrica sin normalidad esperable): correlación de rangos.');
      return rec('spearman', premisas, null);
    }
    return rec('pearson', premisas, null);
  }

  /* ---- Descriptivo / exploratorio ---- */
  premisas.push('Alcance descriptivo o exploratorio: análisis univariado.');
  return rec('descriptivos', premisas, null);
}

/* ---- Catálogo de técnicas -------------------------------------- */

function rec(id, premisas, vd) {
  return { ...CATALOGO[id], id, premisas, vd };
}

export const CATALOGO = {
  tIndependiente: {
    nombre: 'Prueba t de Student para muestras independientes',
    supuestos: [
      'Independencia de las observaciones (garantizada por el diseño).',
      'Normalidad de la VD en cada grupo (se verifica con K² de D\u2019Agostino; con n ≥ 30 por grupo el TCL la atenúa).',
      'Homogeneidad de varianzas (Brown-Forsythe); si falla, se reporta la corrección de Welch.',
    ],
    alternativa: 'U de Mann-Whitney (si la normalidad falla con n pequeño) o t de Welch (si solo falla la homogeneidad).',
    efecto: { tipo: 'd', nombre: 'd de Cohen' },
    laboratorio: 'gruposContinua',
  },
  anova: {
    nombre: 'ANOVA de un factor',
    supuestos: [
      'Independencia de las observaciones.',
      'Normalidad de la VD en cada grupo.',
      'Homogeneidad de varianzas entre los k grupos (Brown-Forsythe).',
    ],
    alternativa: 'Kruskal-Wallis. Si el ANOVA resulta significativo, las comparaciones por pares requieren post hoc (Tukey HSD) — no múltiples t sin corrección.',
    efecto: { tipo: 'eta2', nombre: 'eta cuadrado (η²)' },
    laboratorio: 'gruposContinua',
  },
  tPareada: {
    nombre: 'Prueba t para muestras relacionadas (pre-post)',
    supuestos: ['Normalidad de las DIFERENCIAS (no de cada medición por separado).'],
    alternativa: 'Wilcoxon de rangos con signo.',
    efecto: { tipo: 'd', nombre: 'd_z (sobre las diferencias)' },
    laboratorio: 'prePost',
  },
  wilcoxon: {
    nombre: 'Prueba de Wilcoxon de rangos con signo',
    supuestos: ['Simetría aproximada de la distribución de las diferencias.', 'Pares relacionados.'],
    alternativa: 'Prueba de los signos (más robusta, menos potente).',
    efecto: { tipo: 'r', nombre: 'r = z/√n' },
    laboratorio: 'prePost',
  },
  mannWhitney: {
    nombre: 'Prueba U de Mann-Whitney',
    supuestos: ['Independencia de las observaciones.', 'Para interpretarla como comparación de medianas, formas distribucionales similares entre grupos.'],
    alternativa: 'Prueba de la mediana (menos potente).',
    efecto: { tipo: 'r', nombre: 'correlación rango-biserial' },
    laboratorio: 'gruposContinua',
  },
  kruskal: {
    nombre: 'Prueba de Kruskal-Wallis',
    supuestos: ['Independencia de las observaciones.', 'Formas distribucionales similares para leerla como comparación de medianas.'],
    alternativa: 'Comparaciones por pares con Mann-Whitney corrigiendo α (Bonferroni) si H resulta significativa.',
    efecto: { tipo: 'eta2', nombre: 'η²_H = (H − k + 1)/(n − k)' },
    laboratorio: 'gruposContinua',
  },
  chi2: {
    nombre: 'Chi-cuadrado de independencia',
    supuestos: [
      'Observaciones independientes (cada caso aporta a una sola celda).',
      'Frecuencias esperadas ≥ 5 en al menos el 80% de las celdas y ninguna < 1; si falla en tablas 2×2, prueba exacta de Fisher.',
    ],
    alternativa: 'Prueba exacta de Fisher (tablas 2×2 con esperadas bajas).',
    efecto: { tipo: 'v', nombre: 'V de Cramér' },
    laboratorio: 'tablaContingencia',
  },
  pearson: {
    nombre: 'Correlación r de Pearson',
    supuestos: [
      'Relación lineal (inspeccione el diagrama de dispersión).',
      'Normalidad bivariada (aproximada por la normalidad de cada variable).',
      'Ausencia de valores atípicos influyentes.',
    ],
    alternativa: 'rho de Spearman (monotonicidad sin linealidad, ordinales o atípicos).',
    efecto: { tipo: 'r', nombre: 'el propio r (y r² como varianza compartida)' },
    laboratorio: 'correlacion',
  },
  spearman: {
    nombre: 'Correlación rho de Spearman',
    supuestos: ['Relación monótona.', 'Pares de observaciones independientes.'],
    alternativa: 'tau de Kendall (muestras pequeñas con muchos empates).',
    efecto: { tipo: 'r', nombre: 'el propio rho' },
    laboratorio: 'correlacion',
  },
  descriptivos: {
    nombre: 'Análisis descriptivo univariado',
    supuestos: ['Nivel de medición correcto para cada estadístico: media y DE solo con variables métricas; mediana y rango con ordinales; frecuencias y proporciones con nominales.'],
    alternativa: 'Intervalos de confianza para medias y proporciones como inferencia mínima.',
    efecto: null,
    laboratorio: 'descriptivos',
  },
};
