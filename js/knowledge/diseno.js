/**
 * diseno.js — Nodos de decisión de la etapa de diseño y veredictos.
 *
 * Fundamento: la taxonomía clásica de Campbell & Stanley (1966) y su
 * actualización en Shadish, Cook & Campbell (2002), articulada con la
 * presentación didáctica de Hernández-Sampieri (cap. 7).
 *
 * Lógica de derivación:
 *   manipulación + aleatorización            → experimental puro
 *   manipulación + grupos intactos + control → cuasiexperimental
 *   manipulación sin control ni azar         → preexperimental (alerta)
 *   sin manipulación + un solo momento       → no experimental transversal
 *   sin manipulación + varios momentos       → no experimental longitudinal
 */

const a = (d) => d.alcance; // abreviatura legible en predicados

export const nodosDiseno = [
  {
    id: 'manipulacion',
    etapa: 'Diseño',
    pregunta:
      '¿Manipulará deliberadamente la variable independiente?',
    contexto:
      'Manipular significa que usted —no la naturaleza ni la historia ' +
      'de los participantes— decide quién recibe qué condición ' +
      '(p. ej., aplicar un programa de intervención a un grupo y no a otro). ' +
      'Esta es la frontera entre la investigación experimental y la no experimental.',
    relevanteSi: (d) => a(d) === 'explicativo',
    opciones: [
      {
        id: 'si',
        titulo: 'Sí, habrá intervención o tratamiento',
        detalle:
          'Usted administrará al menos dos niveles de la variable ' +
          'independiente (p. ej., tratamiento vs. ausencia de tratamiento).',
        pedagogia: {
          queSignifica:
            'La manipulación activa convierte la variable independiente en ' +
            'una variable de tratamiento bajo control del investigador. ' +
            'Kerlinger la considera, junto con el control, la marca ' +
            'distintiva del experimento.',
          porQueImporta:
            'Solo la manipulación garantiza la precedencia temporal de la ' +
            'causa, una de las tres condiciones de la inferencia causal.',
          implicaciones: [
            'Deberá definir con precisión operacional cada nivel del tratamiento (fidelidad de la intervención).',
            'Aparecen obligaciones éticas: consentimiento informado, y en salud, posible aprobación de comité de ética.',
          ],
          erroresFrecuentes: [
            'Llamar "manipulación" a la simple medición de grupos preexistentes (hombres/mujeres, fumadores/no fumadores): eso es selección, no manipulación.',
          ],
          referencias:
            'Kerlinger & Lee (2002), cap. 19; Shadish, Cook & Campbell (2002), cap. 1.',
        },
      },
      {
        id: 'no',
        titulo: 'No, observaré las variables tal como ocurren',
        detalle:
          'Las variables ya tomaron o tomarán sus valores sin intervención ' +
          'suya (investigación no experimental u observacional).',
        pedagogia: {
          queSignifica:
            'En la investigación no experimental el investigador observa ' +
            'fenómenos en su ambiente natural para después analizarlos. ' +
            'No hay condiciones a las que se exponga a los participantes.',
          porQueImporta:
            'Renunciar a la manipulación implica que toda inferencia causal ' +
            'quedará condicionada: las explicaciones alternativas (terceras ' +
            'variables, causalidad inversa) no podrán descartarse por diseño, ' +
            'solo atenuarse por teoría y control estadístico.',
          implicaciones: [
            'Su diseño será correlacional-causal: legítimo, pero con conclusiones formuladas en lenguaje probabilístico y prudente.',
            'Considere medir y controlar covariables relevantes (ANCOVA, regresión múltiple).',
          ],
          erroresFrecuentes: [
            'Redactar conclusiones experimentales ("el programa causó…") desde datos observacionales.',
          ],
          referencias:
            'Hernández-Sampieri et al. (2014), cap. 7.',
        },
      },
    ],
    advertencias: {},
  },

  {
    id: 'aleatorizacion',
    etapa: 'Diseño',
    pregunta:
      '¿Podrá asignar a los participantes a los grupos de manera aleatoria?',
    contexto:
      'La asignación aleatoria (no confundir con muestreo aleatorio) ' +
      'distribuye por azar a los participantes entre condiciones, ' +
      'igualando los grupos en variables conocidas y desconocidas ' +
      'antes del tratamiento.',
    relevanteSi: (d) => d.manipulacion === 'si',
    opciones: [
      {
        id: 'si',
        titulo: 'Sí, asignación aleatoria a condiciones',
        detalle:
          'Cada participante tiene la misma probabilidad de quedar en ' +
          'cualquier grupo (sorteo, tabla de números aleatorios, software).',
        pedagogia: {
          queSignifica:
            'La aleatorización es el mecanismo más poderoso para lograr ' +
            'equivalencia inicial de los grupos. Convierte las diferencias ' +
            'preexistentes en error aleatorio cuantificable.',
          porQueImporta:
            'Es la principal defensa contra la amenaza de selección a la ' +
            'validez interna (Campbell & Stanley). Con ella, las diferencias ' +
            'post-tratamiento pueden atribuirse al tratamiento con un nivel ' +
            'de confianza conocido.',
          implicaciones: [
            'Su diseño califica como experimento puro (ensayo controlado aleatorizado en salud).',
            'Documente el procedimiento de aleatorización: será exigido en la sección de método.',
          ],
          erroresFrecuentes: [
            'Confundir asignación aleatoria con muestreo aleatorio: la primera protege la validez interna; el segundo, la externa.',
            'Asignar "alternadamente" (uno sí, uno no) y llamarlo aleatorio: eso es asignación sistemática.',
          ],
          referencias:
            'Campbell & Stanley (1966); Shadish, Cook & Campbell (2002), cap. 8.',
        },
      },
      {
        id: 'no',
        titulo: 'No, trabajaré con grupos ya formados',
        detalle:
          'Aulas, servicios clínicos, turnos laborales: grupos intactos ' +
          'que no puede desarmar para sortear.',
        pedagogia: {
          queSignifica:
            'Sin aleatorización, los grupos pueden diferir sistemáticamente ' +
            'antes del tratamiento. Su estudio será, en el mejor de los casos, ' +
            'cuasiexperimental.',
          porQueImporta:
            'La amenaza de selección pasa a ser su principal problema de ' +
            'validez interna. Deberá compensarla con pretest, grupos de ' +
            'comparación lo más equivalentes posible y control de covariables.',
          implicaciones: [
            'Incluya medición pretest para documentar la (no) equivalencia inicial.',
            'ANCOVA con el pretest como covariable es el análisis de referencia.',
          ],
          erroresFrecuentes: [
            'Omitir el pretest y asumir equivalencia inicial sin evidencia.',
          ],
          referencias:
            'Shadish, Cook & Campbell (2002), caps. 4–7.',
        },
      },
    ],
    advertencias: {},
  },

  {
    id: 'grupoControl',
    etapa: 'Diseño',
    pregunta: '¿Contará con un grupo de comparación o control?',
    contexto:
      'El grupo control —que no recibe el tratamiento o recibe el ' +
      'tratamiento habitual— es lo que permite saber qué habría ocurrido ' +
      'sin la intervención (el contrafáctico).',
    relevanteSi: (d) => d.manipulacion === 'si' && d.aleatorizacion === 'no',
    opciones: [
      {
        id: 'si',
        titulo: 'Sí, habrá grupo de comparación no equivalente',
        detalle:
          'Un grupo intacto similar que no recibe la intervención y se ' +
          'mide en los mismos momentos.',
        pedagogia: {
          queSignifica:
            'El diseño con grupo control no equivalente y pretest-postest ' +
            'es el cuasiexperimento más utilizado y mejor defendible.',
          porQueImporta:
            'El grupo de comparación permite descartar amenazas como ' +
            'historia y maduración, aunque no la selección.',
          implicaciones: [
            'Busque el grupo de comparación más parecido posible (mismo centro, mismo nivel).',
            'Reporte las diferencias pretest y ajústelas estadísticamente.',
          ],
          erroresFrecuentes: [
            'Elegir un grupo control por conveniencia extrema (otro turno, otra ciudad) y tratar las diferencias como ruido.',
          ],
          referencias: 'Shadish, Cook & Campbell (2002), cap. 5.',
        },
      },
      {
        id: 'no',
        titulo: 'No, solo el grupo intervenido',
        detalle: 'Un único grupo con medición antes y/o después.',
        pedagogia: {
          queSignifica:
            'Los diseños de un solo grupo (preexperimentales) carecen de ' +
            'contrafáctico: cualquier cambio observado admite múltiples ' +
            'explicaciones rivales.',
          porQueImporta:
            'Campbell y Stanley los describieron como diseños de valor ' +
            'científico muy limitado para inferencia causal. Pueden ser ' +
            'aceptables como estudio piloto o de factibilidad, no como ' +
            'evidencia de eficacia.',
          implicaciones: [
            'Reformule el objetivo en términos de factibilidad o cambio observado, no de efecto.',
            'Considere seriamente añadir un grupo de comparación o series temporales múltiples.',
          ],
          erroresFrecuentes: [
            'Presentar un pre-post de un solo grupo como prueba de que "el programa funcionó".',
          ],
          referencias: 'Campbell & Stanley (1966), diseños 1–3.',
        },
      },
    ],
    advertencias: {
      no:
        'Atención: con un solo grupo y sin aleatorización, las amenazas de ' +
        'historia, maduración, regresión a la media y testing quedan sin ' +
        'control. Trate los resultados como preliminares.',
    },
  },

  {
    id: 'temporalidad',
    etapa: 'Diseño',
    pregunta: '¿En cuántos momentos recolectará los datos?',
    contexto:
      'La dimensión temporal distingue los diseños no experimentales: ' +
      'una fotografía única (transversal) o una película en varios ' +
      'momentos (longitudinal).',
    relevanteSi: (d) =>
      ['descriptivo', 'correlacional', 'exploratorio'].includes(a(d)) ||
      (a(d) === 'explicativo' && d.manipulacion === 'no'),
    opciones: [
      {
        id: 'transversal',
        titulo: 'En un solo momento (transversal)',
        detalle:
          'Una única recolección: describir variables o analizar su ' +
          'relación en un punto del tiempo.',
        pedagogia: {
          queSignifica:
            'El diseño transversal recolecta datos en un momento único. ' +
            'Es el diseño de los estudios de prevalencia y de la mayoría ' +
            'de las encuestas.',
          porQueImporta:
            'Es eficiente y económico, pero no permite establecer ' +
            'precedencia temporal: si X y Y se miden a la vez, no puede ' +
            'saberse cuál antecede a cuál.',
          implicaciones: [
            'El cálculo del tamaño de muestra (nivel de confianza, margen de error) será central.',
            'Análisis típicos: descriptivos, chi-cuadrado, correlaciones, regresión.',
          ],
          erroresFrecuentes: [
            'Inferir trayectorias o cambios individuales desde datos de un solo corte.',
          ],
          referencias: 'Hernández-Sampieri et al. (2014), cap. 7.',
        },
      },
      {
        id: 'longitudinal',
        titulo: 'En varios momentos (longitudinal)',
        detalle:
          'Mediciones repetidas para analizar cambios, tendencias o ' +
          'trayectorias a través del tiempo.',
        pedagogia: {
          queSignifica:
            'El diseño longitudinal recolecta datos en dos o más puntos ' +
            'temporales, lo que permite estudiar el cambio y aproximarse ' +
            'a la precedencia temporal entre variables.',
          porQueImporta:
            'Gana capacidad inferencial sobre procesos, al costo de ' +
            'atrición (pérdida de participantes), mayor presupuesto y ' +
            'análisis estadísticos más exigentes (medidas repetidas, ' +
            'modelos mixtos).',
          implicaciones: [
            'Planifique estrategias de retención y registre la atrición: es la principal amenaza de estos diseños.',
            'Defina desde ya el número de olas y los intervalos entre mediciones, con justificación teórica.',
          ],
          erroresFrecuentes: [
            'Tratar la atrición como pérdida aleatoria sin analizarla (puede sesgar sistemáticamente los resultados).',
          ],
          referencias:
            'Hernández-Sampieri et al. (2014), cap. 7; Shadish, Cook & Campbell (2002), cap. 6.',
        },
      },
    ],
    advertencias: {},
  },

  {
    id: 'tipoLongitudinal',
    etapa: 'Diseño',
    pregunta: '¿A quiénes seguirá a través del tiempo?',
    contexto:
      'Los diseños longitudinales se distinguen por la unidad que se ' +
      'mantiene constante entre mediciones: la población, una cohorte ' +
      'o los mismos individuos.',
    relevanteSi: (d) => d.temporalidad === 'longitudinal',
    opciones: [
      {
        id: 'tendencia',
        titulo: 'La misma población, distintas muestras (tendencia)',
        detalle:
          'En cada ola se extrae una muestra nueva de la misma población ' +
          '(p. ej., encuestas anuales de clima laboral).',
        pedagogia: {
          queSignifica:
            'Los diseños de tendencia analizan cambios agregados de una ' +
            'población a lo largo del tiempo, con participantes distintos ' +
            'en cada medición.',
          porQueImporta:
            'Permite describir la evolución poblacional sin el problema de ' +
            'la atrición individual, pero no informa sobre cambios ' +
            'intraindividuales.',
          implicaciones: [
            'Cada muestra debe obtenerse con el mismo procedimiento para que las olas sean comparables.',
            'El análisis compara estadísticos agregados entre momentos.',
          ],
          erroresFrecuentes: [
            'Interpretar el cambio agregado como cambio individual (falacia ecológica temporal).',
          ],
          referencias: 'Hernández-Sampieri et al. (2014), cap. 7.',
        },
      },
      {
        id: 'cohorte',
        titulo: 'Una misma cohorte, distintas muestras (evolución de grupo)',
        detalle:
          'Se sigue a una subpoblación vinculada por un evento común ' +
          '(p. ej., la cohorte de ingreso 2024), muestreando en cada ola.',
        pedagogia: {
          queSignifica:
            'Los diseños de evolución de grupo (cohort designs) examinan ' +
            'cambios en subpoblaciones definidas por una característica ' +
            'compartida, típicamente la edad o un evento fundacional.',
          porQueImporta:
            'Permite separar parcialmente efectos de edad, periodo y ' +
            'cohorte, una distinción central en investigación del ' +
            'desarrollo y epidemiología.',
          implicaciones: [
            'Defina la cohorte con criterios de inclusión inequívocos.',
            'Considere el sesgo de supervivencia de la cohorte en olas tardías.',
          ],
          erroresFrecuentes: [
            'Confundir cohorte (grupo vinculado por un evento) con generación en sentido coloquial.',
          ],
          referencias: 'Hernández-Sampieri et al. (2014), cap. 7.',
        },
      },
      {
        id: 'panel',
        titulo: 'Los mismos participantes en todas las olas (panel)',
        detalle:
          'Cada individuo se mide repetidamente: permite estudiar ' +
          'trayectorias y cambio intraindividual.',
        pedagogia: {
          queSignifica:
            'El diseño de panel sigue exactamente a los mismos casos en ' +
            'todas las mediciones. Es el diseño longitudinal con mayor ' +
            'potencia inferencial sobre el cambio individual.',
          porQueImporta:
            'Habilita análisis de medidas repetidas, modelos de curvas de ' +
            'crecimiento y paneles cruzados; pero la atrición y los efectos ' +
            'de la medición repetida (testing) son sus amenazas centrales.',
          implicaciones: [
            'Requiere identificadores estables y estrategias activas de retención.',
            'Análisis de referencia: ANOVA de medidas repetidas o modelos lineales mixtos.',
          ],
          erroresFrecuentes: [
            'Excluir sin más a quienes abandonan (análisis solo de completadores) sin examinar el patrón de pérdida.',
          ],
          referencias:
            'Hernández-Sampieri et al. (2014), cap. 7; Tabachnick & Fidell (2019), cap. 8.',
        },
      },
    ],
    advertencias: {},
  },
];

/* ============================================================
   Veredictos — conclusiones que el motor deriva lógicamente.
   Cada veredicto incluye el razonamiento (premisas trazables),
   una interpretación académica y advertencias.
   ============================================================ */

export const veredictosDiseno = [
  {
    id: 'experimentalPuro',
    cuando: (d) => d.manipulacion === 'si' && d.aleatorizacion === 'si',
    nombre: 'Diseño experimental puro',
    premisas: [
      'Alcance explicativo: la pregunta es causal.',
      'Manipulación deliberada de la variable independiente.',
      'Asignación aleatoria de participantes a condiciones.',
    ],
    interpretacion:
      'Su estudio reúne los tres requisitos del experimento verdadero: ' +
      'manipulación, aleatorización y, por construcción, grupos de ' +
      'comparación. Es el diseño con mayor validez interna disponible: ' +
      'las diferencias post-tratamiento podrán atribuirse a la ' +
      'intervención con explicaciones rivales razonablemente descartadas. ' +
      'El precio habitual es la validez externa: las condiciones de ' +
      'control pueden alejar el estudio de los contextos naturales. ' +
      'En las siguientes etapas deberá definir el número de grupos y ' +
      'mediciones (solo postest o pretest-postest), el tamaño de muestra ' +
      'por potencia estadística (no por margen de error) y las pruebas ' +
      'de comparación pertinentes (t de Student, ANOVA) con sus supuestos.',
    advertencia:
      'La aleatorización iguala grupos en expectativa, no con certeza: ' +
      'con muestras pequeñas pueden persistir desequilibrios. Reporte ' +
      'siempre las características basales por grupo.',
    referencias:
      'Campbell & Stanley (1966); Shadish, Cook & Campbell (2002), cap. 8.',
  },
  {
    id: 'cuasiexperimental',
    cuando: (d) =>
      d.manipulacion === 'si' &&
      d.aleatorizacion === 'no' &&
      d.grupoControl === 'si',
    nombre: 'Diseño cuasiexperimental con grupo control no equivalente',
    premisas: [
      'Alcance explicativo: la pregunta es causal.',
      'Manipulación deliberada de la variable independiente.',
      'Grupos intactos, sin asignación aleatoria.',
      'Existe grupo de comparación.',
    ],
    interpretacion:
      'Su estudio es un cuasiexperimento: manipula el tratamiento pero ' +
      'trabaja con grupos formados antes del estudio. La inferencia ' +
      'causal es posible pero condicionada: la amenaza de selección ' +
      '(diferencias preexistentes entre grupos) es su adversario ' +
      'principal. La estrategia defendible combina pretest en ambos ' +
      'grupos, documentación de equivalencia inicial y ajuste de ' +
      'covariables (ANCOVA). Redacte las conclusiones reconociendo ' +
      'explícitamente las amenazas no controladas.',
    advertencia:
      'No presente el ajuste estadístico como sustituto de la ' +
      'aleatorización: el ANCOVA solo controla las covariables medidas; ' +
      'las no medidas permanecen como explicaciones rivales.',
    referencias: 'Shadish, Cook & Campbell (2002), caps. 4–7.',
  },
  {
    id: 'preexperimental',
    cuando: (d) =>
      d.manipulacion === 'si' &&
      d.aleatorizacion === 'no' &&
      d.grupoControl === 'no',
    nombre: 'Diseño preexperimental (un solo grupo)',
    premisas: [
      'Manipulación de la variable independiente.',
      'Sin asignación aleatoria.',
      'Sin grupo de comparación.',
    ],
    interpretacion:
      'Su estudio corresponde a los diseños preexperimentales (pre-post ' +
      'de un solo grupo, o solo postest). Carecen de contrafáctico: no ' +
      'hay forma de saber qué habría ocurrido sin la intervención. ' +
      'Campbell y Stanley los consideraron inadecuados para inferencia ' +
      'causal; su lugar legítimo es el estudio piloto, la prueba de ' +
      'factibilidad o la generación de hipótesis. Si este es su proyecto ' +
      'de tesis, reformule el objetivo (de "evaluar el efecto" a ' +
      '"explorar el cambio observado y la factibilidad") o fortalezca el ' +
      'diseño añadiendo un grupo de comparación.',
    advertencia:
      'Historia, maduración, regresión a la media y efecto de la ' +
      'medición quedan completamente sin control. Esta es la advertencia ' +
      'más importante que esta plataforma puede darle en este punto.',
    referencias: 'Campbell & Stanley (1966), diseños 1–3.',
  },
  {
    id: 'transversalDescriptivo',
    cuando: (d) => d.alcance === 'descriptivo' && d.temporalidad === 'transversal',
    nombre: 'Diseño no experimental, transversal, descriptivo',
    premisas: [
      'Alcance descriptivo.',
      'Sin manipulación de variables.',
      'Recolección en un momento único.',
    ],
    interpretacion:
      'Su estudio describirá la distribución de las variables en una ' +
      'población en un punto del tiempo: el formato clásico del estudio ' +
      'de prevalencia o la encuesta diagnóstica. La calidad del estudio ' +
      'dependerá de tres pilares: definición operacional precisa de las ' +
      'variables, instrumentos con evidencia de validez y confiabilidad, ' +
      'y una muestra cuyo tamaño y procedimiento de selección permitan ' +
      'la generalización pretendida. El análisis pertinente es ' +
      'univariado: frecuencias, proporciones con intervalos de confianza, ' +
      'medias y medidas de dispersión.',
    advertencia:
      'Si durante el análisis surge la tentación de cruzar variables y ' +
      'reportar asociaciones, recuerde que no fueron previstas en el ' +
      'diseño: repórtelas, si acaso, como análisis exploratorios.',
    referencias: 'Hernández-Sampieri et al. (2014), caps. 5 y 7.',
  },
  {
    id: 'transversalCorrelacional',
    cuando: (d) =>
      d.temporalidad === 'transversal' &&
      (d.alcance === 'correlacional' ||
        (d.alcance === 'explicativo' && d.manipulacion === 'no')),
    nombre: 'Diseño no experimental, transversal, correlacional' ,
    premisas: [
      'Pregunta de asociación (o causal sin posibilidad de manipulación).',
      'Sin manipulación de variables.',
      'Recolección en un momento único.',
    ],
    interpretacion:
      'Su estudio medirá dos o más variables en un mismo momento y ' +
      'analizará su asociación. Si su intención de fondo es causal ' +
      '(correlacional-causal), sea explícito: la simultaneidad de la ' +
      'medición impide establecer precedencia temporal, de modo que la ' +
      'dirección causal deberá sostenerse por teoría, no por datos. ' +
      'Los análisis de referencia son la correlación de Pearson (con ' +
      'supuestos de linealidad y normalidad bivariada), Spearman como ' +
      'alternativa robusta, y la regresión múltiple cuando se controlen ' +
      'covariables. Reporte siempre tamaños del efecto e intervalos de ' +
      'confianza, no solo valores p.',
    advertencia:
      'La tercera variable es su amenaza estructural: identifique en el ' +
      'marco teórico las covariables plausibles y mídalas, o reconozca ' +
      'la limitación.',
    referencias:
      'Hernández-Sampieri et al. (2014), cap. 7; Cohen (1988); Tabachnick & Fidell (2019).',
  },
  {
    id: 'longitudinalVeredicto',
    cuando: (d) => d.temporalidad === 'longitudinal' && Boolean(d.tipoLongitudinal),
    nombre: 'Diseño no experimental, longitudinal',
    premisas: [
      'Sin manipulación de variables.',
      'Mediciones en dos o más momentos.',
    ],
    interpretacion:
      'Su estudio seguirá la evolución de las variables a través del ' +
      'tiempo. Con ello gana lo que el corte transversal no puede dar: ' +
      'evidencia de cambio y aproximación a la precedencia temporal. ' +
      'A cambio asume tres costos: atrición de participantes, mayor ' +
      'exigencia logística y análisis estadísticos de medidas repetidas ' +
      '(ANOVA intra-sujetos o modelos mixtos) cuyos supuestos —como la ' +
      'esfericidad— deberá verificar. La justificación del número de ' +
      'olas y de los intervalos entre mediciones debe ser teórica: ' +
      '¿en cuánto tiempo es razonable esperar que el fenómeno cambie?',
    advertencia:
      'Analice la atrición, no la oculte: compare a quienes permanecen ' +
      'con quienes abandonan en las variables basales.',
    referencias:
      'Hernández-Sampieri et al. (2014), cap. 7; Shadish, Cook & Campbell (2002), cap. 6.',
  },
  {
    id: 'exploratorioVeredicto',
    cuando: (d) => d.alcance === 'exploratorio' && Boolean(d.temporalidad),
    nombre: 'Estudio exploratorio (no experimental)',
    premisas: ['Alcance exploratorio declarado.', 'Sin manipulación de variables.'],
    interpretacion:
      'Su estudio examinará un fenómeno poco documentado para identificar ' +
      'variables, generar hipótesis y preparar investigación posterior. ' +
      'Las exigencias de representatividad muestral y de inferencia ' +
      'estadística se relajan, pero la transparencia aumenta: reporte ' +
      'con detalle cómo seleccionó casos e instrumentos, porque su ' +
      'producto principal será metodológico (qué conviene estudiar y cómo).',
    advertencia:
      'Resista la tentación de reportar valores p como si confirmaran ' +
      'hipótesis: en un estudio exploratorio toda inferencia es tentativa.',
    referencias: 'Hernández-Sampieri et al. (2014), cap. 5.',
  },
];
