/**
 * alcance.js — Nodo de decisión: alcance de la investigación.
 *
 * Fundamento conceptual: Hernández-Sampieri, Fernández y Baptista
 * (Metodología de la investigación, 6.ª ed., cap. 5) y Creswell
 * (Research Design, cap. 1). El alcance no es una "categoría burocrática":
 * determina la estrategia de diseño, el tipo de hipótesis admisible y
 * la familia de análisis estadísticos pertinentes.
 */

export const nodoAlcance = {
  id: 'alcance',
  etapa: 'Alcance',
  pregunta: '¿Qué pretende lograr su pregunta de investigación?',
  contexto:
    'Antes de elegir un diseño, defina con honestidad qué tipo de ' +
    'conocimiento busca producir. El alcance condiciona todo lo demás: ' +
    'las hipótesis que puede formular, el diseño que necesita y la ' +
    'estadística que será legítima aplicar.',
  relevanteSi: () => true,

  opciones: [
    {
      id: 'exploratorio',
      titulo: 'Explorar',
      detalle:
        'Examinar un problema poco estudiado, sobre el cual existen dudas ' +
        'o no se ha abordado antes en este contexto.',
      pedagogia: {
        queSignifica:
          'Un estudio exploratorio se realiza cuando la revisión de la ' +
          'literatura revela que solo hay guías no investigadas, ideas ' +
          'vagamente relacionadas o que el tema se ha estudiado en otros ' +
          'contextos no transferibles. Su producto típico no es la prueba ' +
          'de hipótesis, sino la identificación de conceptos, variables ' +
          'promisorias y prioridades para investigaciones posteriores.',
        porQueImporta:
          'Declarar un alcance exploratorio lo exime de formular hipótesis ' +
          'estadísticas, pero también limita la fuerza de sus conclusiones: ' +
          'los hallazgos serán tentativos y servirán como insumo, no como ' +
          'evidencia confirmatoria.',
        implicaciones: [
          'No es obligatorio formular hipótesis (Hernández-Sampieri).',
          'El muestreo puede ser no probabilístico sin comprometer el objetivo.',
          'El análisis suele limitarse a estadística descriptiva.',
          'Frecuentemente antecede o se combina con enfoques cualitativos.',
        ],
        erroresFrecuentes: [
          'Llamar "exploratorio" a un estudio descriptivo o correlacional para evitar el rigor de la formulación de hipótesis.',
          'Pretender conclusiones causales o generalizaciones poblacionales desde un diseño exploratorio.',
        ],
        referencias:
          'Hernández-Sampieri et al. (2014), cap. 5; Creswell & Creswell (2018), cap. 1.',
      },
    },
    {
      id: 'descriptivo',
      titulo: 'Describir',
      detalle:
        'Especificar propiedades, características y perfiles de personas, ' +
        'grupos o fenómenos: medir y reportar cómo es y cómo se manifiesta algo.',
      pedagogia: {
        queSignifica:
          'El estudio descriptivo mide conceptos o recolecta información ' +
          'sobre cada variable de interés de manera independiente o ' +
          'conjunta, pero sin pretender indicar cómo se relacionan entre ' +
          'sí. Responde preguntas del tipo "¿cuánto?", "¿con qué ' +
          'frecuencia?", "¿con qué características?".',
        porQueImporta:
          'Es la base de la epidemiología descriptiva, los diagnósticos ' +
          'institucionales y los estudios de prevalencia. Exige precisión ' +
          'en la definición operacional y, si busca generalizar, un ' +
          'muestreo probabilístico cuidadoso.',
        implicaciones: [
          'Solo se formulan hipótesis cuando se pronostica un hecho o cifra (hipótesis descriptivas de valor).',
          'El análisis pertinente es univariado: frecuencias, proporciones, medidas de tendencia central y dispersión, intervalos de confianza.',
          'La calidad del estudio depende críticamente de la representatividad de la muestra y de la validez de los instrumentos.',
        ],
        erroresFrecuentes: [
          'Deslizar lenguaje relacional o causal ("influye", "afecta", "determina") en objetivos descriptivos.',
          'Calcular correlaciones o comparaciones de grupos sin haberlas previsto en el diseño.',
        ],
        referencias:
          'Hernández-Sampieri et al. (2014), cap. 5; Kerlinger & Lee (2002), cap. 1.',
      },
    },
    {
      id: 'correlacional',
      titulo: 'Relacionar',
      detalle:
        'Conocer el grado de asociación entre dos o más variables en un ' +
        'contexto particular, sin manipularlas.',
      pedagogia: {
        queSignifica:
          'El estudio correlacional cuantifica relaciones: mide cada ' +
          'variable presuntamente vinculada y después analiza la fuerza y ' +
          'dirección de su asociación. Tiene, parcialmente, valor ' +
          'explicativo y permite cierto grado de predicción.',
        porQueImporta:
          'Es el alcance más frecuente en ciencias sociales y de la salud ' +
          'cuando la manipulación experimental es imposible o no ética. ' +
          'Su límite epistemológico es célebre: correlación no implica ' +
          'causalidad. El riesgo de correlaciones espurias (terceras ' +
          'variables) debe gestionarse teóricamente y, cuando sea posible, ' +
          'estadísticamente (control de covariables).',
        implicaciones: [
          'Exige hipótesis correlacionales que anticipen dirección y, deseablemente, magnitud de la asociación.',
          'Análisis pertinentes: r de Pearson, rho de Spearman, regresión lineal simple y múltiple, según nivel de medición y supuestos.',
          'La interpretación debe reportar tamaño del efecto (no solo significación) siguiendo a Cohen (1988).',
        ],
        erroresFrecuentes: [
          'Concluir causalidad a partir de coeficientes de correlación.',
          'Ignorar la posibilidad de relaciones no lineales al usar exclusivamente r de Pearson.',
          'Interpretar p < .05 como evidencia de una relación "fuerte": significación y magnitud son cosas distintas.',
        ],
        referencias:
          'Hernández-Sampieri et al. (2014), cap. 5; Cohen (1988); Tabachnick & Fidell (2019), cap. 3.',
      },
    },
    {
      id: 'explicativo',
      titulo: 'Explicar',
      detalle:
        'Establecer relaciones de causa y efecto: por qué ocurre un ' +
        'fenómeno y en qué condiciones se manifiesta.',
      pedagogia: {
        queSignifica:
          'El estudio explicativo va más allá de la descripción y la ' +
          'asociación: pretende identificar causas. Para sostener una ' +
          'inferencia causal se requieren, al menos, tres condiciones ' +
          '(Shadish, Cook & Campbell, 2002): covariación entre causa y ' +
          'efecto, precedencia temporal de la causa, y descarte de ' +
          'explicaciones alternativas plausibles.',
        porQueImporta:
          'La tercera condición —descartar explicaciones rivales— es la ' +
          'más exigente y es la razón de ser del diseño experimental. ' +
          'Si su pregunta es causal pero no puede manipular la variable ' +
          'independiente, deberá asumir explícitamente las limitaciones ' +
          'de un diseño correlacional-causal o cuasiexperimental.',
        implicaciones: [
          'Exige hipótesis causales (bivariadas o multivariadas) con dirección explícita.',
          'El diseño ideal es el experimento aleatorizado; en su defecto, cuasiexperimentos con estrategias de control.',
          'Los análisis típicos comparan grupos o modelan efectos: pruebas t, ANOVA, ANCOVA, regresión.',
        ],
        erroresFrecuentes: [
          'Formular objetivos causales ("determinar el efecto de…") con diseños incapaces de sostener esa inferencia.',
          'Confundir control estadístico con control experimental: ajustar covariables no equivale a aleatorizar.',
        ],
        referencias:
          'Shadish, Cook & Campbell (2002), cap. 1; Hernández-Sampieri et al. (2014), cap. 5.',
      },
    },
  ],

  /** Advertencias condicionales mostradas al elegir una opción. */
  advertencias: {
    exploratorio:
      'Los estudios exploratorios rara vez justifican inferencia ' +
      'estadística confirmatoria. Esta plataforma le acompañará, pero ' +
      'considere si su pregunta no es, en realidad, descriptiva: es el ' +
      'autodiagnóstico errado más frecuente en proyectos de grado.',
  },
};
