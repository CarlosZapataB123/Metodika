/**
 * muestreo.js — Etapa de población y muestreo.
 *
 * Fundamento: Hernández-Sampieri (cap. 8) para la lógica
 * población→muestra→muestreo; Cochran (1977) para las fórmulas de
 * estimación; Cohen (1988) para la determinación por potencia.
 *
 * Regla rectora que esta etapa enseña: el procedimiento de selección
 * (muestreo) protege la validez EXTERNA; no debe confundirse con la
 * asignación aleatoria, que protege la validez INTERNA.
 */

function hayDiseno(x) {
  return (
    (x.manipulacion === 'si' &&
      (x.aleatorizacion === 'si' ||
        (x.aleatorizacion === 'no' && x.grupoControl !== undefined))) ||
    x.temporalidad === 'transversal' ||
    (x.temporalidad === 'longitudinal' && x.tipoLongitudinal !== undefined)
  );
}

/* ============================================================
   Nodo 1 — Población (editor)
   ============================================================ */

export const nodoPoblacion = {
  id: 'poblacion',
  etapa: 'Muestreo',
  tipo: 'editorPoblacion',
  pregunta: 'Delimite su unidad de análisis y su población',
  contexto:
    'La población (o universo) es el conjunto de todos los casos que ' +
    'concuerdan con una serie de especificaciones. Delimitarla mal es el ' +
    'origen de la mayoría de los problemas de generalización: una ' +
    'población vaga produce una muestra indefendible.',
  relevanteSi: hayDiseno,
  respondido: (estado) => estado.poblacion?.guardada === true,
  pedagogia: {
    queSignifica:
      'La unidad de análisis responde "¿quiénes o qué serán medidos?" ' +
      '(personas, díadas, organizaciones, registros clínicos). La ' +
      'población se delimita sobre esa unidad con criterios de contenido, ' +
      'lugar y tiempo. Los criterios de inclusión definen quién pertenece; ' +
      'los de exclusión retiran casos que, perteneciendo, comprometerían ' +
      'la medición o la seguridad.',
    porQueImporta:
      'Toda inferencia estadística generaliza exactamente a la población ' +
      'delimitada, ni más ni menos. Además, el tamaño N de la población ' +
      '(si es finito y conocido) modifica el cálculo del tamaño de muestra.',
    implicaciones: [
      'Los criterios de exclusión no son lo contrario de los de inclusión: se aplican sobre quienes ya cumplen la inclusión.',
      'En diseños longitudinales, delimite también la ventana temporal de elegibilidad.',
      'Si la unidad de análisis es grupal (aulas, servicios), el muestreo y el análisis deben respetar esa anidación.',
    ],
    erroresFrecuentes: [
      'Definir la población como "todas las personas que…" sin acotar lugar ni periodo.',
      'Redactar exclusiones redundantes ("se excluye a quienes no cumplan la inclusión").',
      'Generalizar a poblaciones más amplias que la delimitada ("los trabajadores en general").',
    ],
    referencias: 'Hernández-Sampieri et al. (2014), cap. 8.',
  },
};

/* ============================================================
   Nodo 2 — ¿Censo o muestra?
   ============================================================ */

export const nodoCensoOMuestra = {
  id: 'censoOMuestra',
  etapa: 'Muestreo',
  pregunta: '¿Estudiará la población completa o una muestra?',
  contexto:
    'Si la población es pequeña y accesible, medir a todos (censo) ' +
    'elimina el error muestral. Si no, necesitará una muestra y, con ' +
    'ella, un procedimiento de selección defendible.',
  relevanteSi: hayDiseno,
  opciones: [
    {
      id: 'censo',
      titulo: 'Población completa (censo)',
      detalle: 'Medirá a todos los casos que cumplen los criterios.',
      pedagogia: {
        queSignifica:
          'En un censo no hay inferencia de muestra a población: los ' +
          'estadísticos calculados SON los parámetros poblacionales.',
        porQueImporta:
          'Desaparece el error muestral, pero no los demás errores: ' +
          'no respuesta, cobertura incompleta y error de medición siguen ' +
          'presentes y deben reportarse.',
        implicaciones: [
          'No corresponde calcular tamaño de muestra ni margen de error.',
          'La inferencia estadística clásica pierde su justificación habitual; los valores p, si se reportan, requieren argumentación (p. ej., población como realización de un proceso).',
          'La tasa de respuesta se convierte en el indicador crítico de calidad.',
        ],
        erroresFrecuentes: [
          'Llamar "censo" a una muestra por conveniencia grande.',
          'Reportar intervalos de confianza de muestreo habiendo medido a toda la población, sin justificar el marco inferencial.',
        ],
        referencias: 'Hernández-Sampieri et al. (2014), cap. 8.',
      },
    },
    {
      id: 'muestra',
      titulo: 'Muestra',
      detalle: 'Seleccionará un subconjunto y generalizará (o no) según el muestreo.',
      pedagogia: {
        queSignifica:
          'La muestra es un subgrupo de la población del cual se ' +
          'recolectan los datos. Su valor depende de dos propiedades ' +
          'independientes: el tamaño (precisión/potencia) y el ' +
          'procedimiento de selección (representatividad).',
        porQueImporta:
          'Un n grande no repara un muestreo sesgado: mil voluntarios ' +
          'autoseleccionados no representan mejor que cien casos ' +
          'aleatorios. Tamaño y procedimiento se deciden por separado.',
        implicaciones: [
          'Deberá elegir entre muestreo probabilístico y no probabilístico.',
          'Deberá justificar el tamaño con un criterio explícito (precisión o potencia).',
        ],
        erroresFrecuentes: [
          'Justificar el n citando "la fórmula" sin declarar los parámetros elegidos (confianza, error, p o d esperado).',
        ],
        referencias: 'Hernández-Sampieri et al. (2014), cap. 8; Cochran (1977).',
      },
    },
  ],
  advertencias: {},
};

/* ============================================================
   Nodo 3 — Tipo de muestreo
   ============================================================ */

export const nodoTipoMuestreo = {
  id: 'tipoMuestreo',
  etapa: 'Muestreo',
  pregunta: '¿El muestreo será probabilístico o no probabilístico?',
  contexto:
    'En el muestreo probabilístico todos los elementos tienen una ' +
    'probabilidad conocida y distinta de cero de ser elegidos; requiere ' +
    'un marco muestral (listado de la población). En el no probabilístico, ' +
    'la selección obedece a criterios del investigador o a la ' +
    'accesibilidad de los casos.',
  relevanteSi: (x) => hayDiseno(x) && x.censoOMuestra === 'muestra',
  opciones: [
    {
      id: 'probabilistico',
      titulo: 'Probabilístico',
      detalle: 'Selección aleatoria desde un marco muestral; permite estimar el error.',
      pedagogia: {
        queSignifica:
          'La aleatoriedad de la selección hace que el error muestral sea ' +
          'cuantificable: los intervalos de confianza y los márgenes de ' +
          'error tienen aquí su fundamento.',
        porQueImporta:
          'Es la única vía formal hacia la generalización estadística. ' +
          'Su costo: necesita un marco muestral completo y actualizado, ' +
          'que en muchas poblaciones simplemente no existe.',
        implicaciones: [
          'Documente el marco muestral y su cobertura (¿a quién deja fuera?).',
          'La no respuesta erosiona la aleatoriedad: planifique reemplazos y reporte tasas.',
        ],
        erroresFrecuentes: [
          'Declarar "aleatorio simple" sin marco muestral real (si no hay listado, no hubo sorteo posible).',
        ],
        referencias: 'Cochran (1977); Hernández-Sampieri et al. (2014), cap. 8.',
      },
    },
    {
      id: 'noProbabilistico',
      titulo: 'No probabilístico',
      detalle: 'Selección dirigida por criterios o accesibilidad; sin error muestral estimable.',
      pedagogia: {
        queSignifica:
          'La muestra se elige por conveniencia, propósito, cuotas o ' +
          'cadenas de referidos. La probabilidad de selección de cada ' +
          'caso es desconocida.',
        porQueImporta:
          'Es legítimo y a menudo inevitable (poblaciones ocultas, ' +
          'pilotos, experimentos con voluntarios). Lo ilegítimo es ' +
          'pretender después generalización estadística: el "margen de ' +
          'error" no tiene interpretación válida en estas muestras.',
        implicaciones: [
          'Las conclusiones se restringen a la muestra estudiada o se generalizan analíticamente (por teoría), no estadísticamente.',
          'En experimentos, lo crucial sigue siendo la asignación aleatoria a grupos, no la selección de la muestra.',
        ],
        erroresFrecuentes: [
          'Calcular margen de error o "representatividad" sobre una muestra por conveniencia.',
          'Ocultar el carácter no probabilístico llamándolo "aleatorio" porque "cualquiera podía responder la encuesta".',
        ],
        referencias: 'Hernández-Sampieri et al. (2014), cap. 8.',
      },
    },
  ],
  advertencias: {},
};

/* ============================================================
   Nodos 4a/4b — Técnica de muestreo
   ============================================================ */

const tecnica = (id, titulo, detalle, ped) => ({
  id, titulo, detalle,
  pedagogia: { ...ped, referencias: ped.referencias ?? 'Cochran (1977); Hernández-Sampieri et al. (2014), cap. 8.' },
});

export const nodoTecnicaProbabilistica = {
  id: 'tecnicaProb',
  etapa: 'Muestreo',
  pregunta: '¿Qué técnica probabilística empleará?',
  contexto:
    'La técnica depende del marco muestral disponible y de la estructura ' +
    'de la población (homogénea, estratificada o agrupada en conglomerados).',
  relevanteSi: (x) => x.tipoMuestreo === 'probabilistico',
  opciones: [
    tecnica('aleatorioSimple', 'Aleatorio simple',
      'Sorteo directo sobre el listado completo de la población.',
      {
        queSignifica: 'Cada elemento y cada combinación posible de elementos tiene la misma probabilidad de selección.',
        porQueImporta: 'Es el patrón de referencia: las fórmulas clásicas de tamaño de muestra y error lo presuponen.',
        implicaciones: ['Requiere marco muestral completo y numerado.', 'Use un generador verificable (R: sample(); no "al azar manual").'],
        erroresFrecuentes: ['Sortear sobre un listado incompleto y tratarlo como si cubriera toda la población.'],
      }),
    tecnica('sistematico', 'Sistemático',
      'Selección cada k elementos desde un arranque aleatorio (k = N/n).',
      {
        queSignifica: 'Operativamente más simple que el aleatorio simple; equivalente si el listado no tiene periodicidad.',
        porQueImporta: 'Si el orden del listado tiene un ciclo que coincide con k, la muestra queda sesgada.',
        implicaciones: ['Verifique que el listado no esté ordenado por una variable relacionada con el estudio.'],
        erroresFrecuentes: ['Arrancar siempre en el primer elemento en lugar de un arranque aleatorio.'],
      }),
    tecnica('estratificado', 'Estratificado',
      'La población se divide en estratos homogéneos y se sortea dentro de cada uno.',
      {
        queSignifica: 'Garantiza representación de subgrupos relevantes (sexo, nivel, sede) y gana precisión si los estratos son internamente homogéneos.',
        porQueImporta: 'Es la técnica indicada cuando se planean comparaciones entre subgrupos o cuando alguno es minoritario.',
        implicaciones: ['Decida afijación proporcional (refleja pesos poblacionales) o uniforme (iguala subgrupos para comparar).', 'Con afijación no proporcional, pondere en el análisis.'],
        erroresFrecuentes: ['Estratificar por variables irrelevantes para el fenómeno: complica sin ganar precisión.'],
      }),
    tecnica('conglomerados', 'Por conglomerados (racimos)',
      'Se sortean grupos naturales completos (escuelas, servicios, barrios).',
      {
        queSignifica: 'La unidad de muestreo es el grupo, no el individuo. Útil cuando no existe listado de individuos pero sí de grupos.',
        porQueImporta: 'Los individuos de un mismo conglomerado se parecen entre sí (correlación intraclase), lo que reduce la información efectiva: el n debe inflarse por el efecto de diseño.',
        implicaciones: ['Estime el efecto de diseño (DEFF) o use n mayores que los de las fórmulas simples.', 'El análisis debería reconocer la anidación (modelos multinivel).'],
        erroresFrecuentes: ['Analizar datos de conglomerados como si fueran observaciones independientes: infla el error tipo I.'],
      }),
  ],
  advertencias: {},
};

export const nodoTecnicaNoProbabilistica = {
  id: 'tecnicaNoProb',
  etapa: 'Muestreo',
  pregunta: '¿Qué técnica no probabilística empleará?',
  contexto:
    'Sin probabilidades de selección conocidas, la defensa de la muestra ' +
    'es argumentativa: por qué estos casos informan bien la pregunta.',
  relevanteSi: (x) => x.tipoMuestreo === 'noProbabilistico',
  opciones: [
    tecnica('conveniencia', 'Por conveniencia',
      'Casos disponibles y accesibles para el investigador.',
      {
        queSignifica: 'La accesibilidad decide la composición de la muestra.',
        porQueImporta: 'Es la técnica más usada y la más frágil: la autoselección y el contexto de captación moldean los resultados.',
        implicaciones: ['Describa exhaustivamente la muestra obtenida: es lo único a lo que sus conclusiones aplican con certeza.'],
        erroresFrecuentes: ['Generalizar a la población; ocultar el canal de reclutamiento.'],
      }),
    tecnica('propositivo', 'Intencional o propositivo',
      'Casos elegidos deliberadamente por poseer características de interés.',
      {
        queSignifica: 'El investigador selecciona casos típicos, extremos o expertos según el propósito del estudio.',
        porQueImporta: 'La justificación teórica de los criterios de selección es la columna vertebral de su defensa metodológica.',
        implicaciones: ['Explicite los criterios de selección y su anclaje en el marco teórico.'],
        erroresFrecuentes: ['Confundir intencional con "los que pude conseguir" (eso es conveniencia).'],
      }),
    tecnica('cuotas', 'Por cuotas',
      'Se fijan proporciones de subgrupos y se llenan sin sorteo.',
      {
        queSignifica: 'Imita la estructura del estratificado pero sin aleatoriedad dentro de cada cuota.',
        porQueImporta: 'Asegura diversidad composicional, no representatividad: dentro de cada cuota persiste la autoselección.',
        implicaciones: ['Defina las cuotas con datos poblacionales oficiales y repórtelas.'],
        erroresFrecuentes: ['Presentar el cumplimiento de cuotas como evidencia de representatividad estadística.'],
      }),
    tecnica('bolaNieve', 'Bola de nieve (en cadena)',
      'Los participantes refieren a otros participantes.',
      {
        queSignifica: 'Indicada para poblaciones ocultas o de difícil acceso (sin marco muestral posible).',
        porQueImporta: 'La muestra hereda la estructura de la red social de los primeros casos (semillas).',
        implicaciones: ['Use varias semillas independientes y reporte la longitud de las cadenas.'],
        erroresFrecuentes: ['Partir de una sola semilla: toda la muestra proviene de un mismo círculo.'],
      }),
  ],
  advertencias: {},
};

/* ============================================================
   Nodo 5 — Tamaño de muestra (calculadora)
   ============================================================ */

export const nodoTamanoMuestra = {
  id: 'tamanoMuestra',
  etapa: 'Muestreo',
  tipo: 'calculadoraMuestra',
  pregunta: 'Determine el tamaño de su muestra',
  contexto:
    'El tamaño de muestra no se hereda de otras tesis ni se decide por ' +
    'costumbre: se calcula desde un criterio explícito. En estudios de ' +
    'estimación, el criterio es la precisión deseada (confianza y margen ' +
    'de error). En estudios que comparan grupos, el criterio es la ' +
    'potencia para detectar un efecto de la magnitud esperada.',
  relevanteSi: (x) => hayDiseno(x) && x.censoOMuestra === 'muestra',
  respondido: (estado) => estado.muestra?.guardada === true,
  pedagogia: {
    queSignifica:
      'Confianza (1−α) es la probabilidad de que el procedimiento capture ' +
      'el parámetro; margen de error es la holgura admitida alrededor de ' +
      'la estimación; potencia (1−β) es la probabilidad de detectar un ' +
      'efecto que realmente existe; d de Cohen expresa esa magnitud en ' +
      'desviaciones estándar (0.2 pequeño, 0.5 mediano, 0.8 grande).',
    porQueImporta:
      'Una muestra insuficiente condena el estudio antes de empezar: con ' +
      'potencia baja, un resultado "no significativo" es ininterpretable. ' +
      'Una muestra excesiva desperdicia recursos y vuelve significativas ' +
      'diferencias triviales.',
    implicaciones: [
      'En muestreos no probabilísticos el "margen de error" no tiene interpretación inferencial: el cálculo sirve solo como referencia de magnitud.',
      'Prevea la no respuesta y la atrición: infle el n calculado por la tasa esperada de pérdida (n ajustado = n / (1 − tasa)).',
      'El cálculo por potencia aquí usa aproximación normal; verifique con G*Power para el informe final.',
    ],
    erroresFrecuentes: [
      'Usar p = 0.5 "porque así da más" sin saber que es la varianza máxima: es correcto como postura conservadora, pero debe declararse.',
      'Calcular n para estimación cuando el objetivo es comparar grupos (criterios distintos, fórmulas distintas).',
      'Reportar el n final sin el desglose de los parámetros usados.',
    ],
    referencias: 'Cochran (1977); Cohen (1988), caps. 1–2.',
  },
};

/* ============================================================
   Validaciones transversales de la etapa
   ============================================================ */

export const validacionesMuestreo = [
  (estado) => {
    const x = estado.decisiones;
    const avisos = [];

    if (x.alcance === 'descriptivo' && x.tipoMuestreo === 'noProbabilistico') {
      avisos.push(
        'Eligió un alcance descriptivo —cuyo valor depende de la ' +
        'generalización— con muestreo no probabilístico. Es admisible, ' +
        'pero las prevalencias y promedios que reporte describirán a su ' +
        'muestra, no a la población: declárelo como limitación central.'
      );
    }

    if (x.manipulacion === 'si' && x.tipoMuestreo === 'probabilistico') {
      avisos.push(
        'Nota docente: en su experimento, el muestreo probabilístico ' +
        'fortalece la validez externa (a quién generalizan los resultados), ' +
        'pero la validez interna depende de la asignación aleatoria a ' +
        'grupos, que es un procedimiento distinto y posterior a la selección.'
      );
    }

    return avisos;
  },
];
