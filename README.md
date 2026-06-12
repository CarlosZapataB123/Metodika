# Métodika

**Plataforma inteligente de diseño metodológico cuantitativo.**
Sistema experto educativo, estático y de código abierto, que guía a estudiantes
e investigadores en la construcción rigurosa de diseños metodológicos
cuantitativos — y enseña metodología mientras lo hace.

> Métodika no es una calculadora estadística. Es un tutor metodológico: cada
> decisión explica qué significa, por qué importa, qué implicaciones tiene,
> qué alternativas existen y qué errores frecuentes deben evitarse.

## Características (v1.1)

- **Flujo de decisión con revelación progresiva**: el tutor presenta solo la
  decisión pertinente según las respuestas previas (alcance → manipulación →
  aleatorización → grupo control → temporalidad).
- **Motor de derivación**: clasifica automáticamente el diseño resultante
  (experimental puro, cuasiexperimental, preexperimental, transversal
  descriptivo, transversal correlacional, longitudinal de tendencia / cohorte /
  panel) mostrando las **premisas trazables** del razonamiento.
- **Pedagogía estructurada**: cada opción incluye *qué significa*, *por qué
  importa*, *implicaciones*, *errores frecuentes* y *referencias* (Hernández-
  Sampieri; Creswell; Campbell & Stanley; Shadish, Cook & Campbell; Kerlinger;
  Cohen; Tabachnick & Fidell).
- **Matriz metodológica viva**: un panel tipografiado como página de tesis que
  redacta en prosa académica el borrador del capítulo de método a medida que
  el usuario decide. Copiable con un clic.
- **Advertencias metodológicas** contextuales (p. ej., ante diseños
  preexperimentales).
- **Operacionalización de variables**: editor con roles (independiente,
  dependiente, de asociación, atributiva, descriptiva) y niveles de medición
  (Stevens); la matriz exige definición conceptual y operacional, y el motor
  valida requisitos mínimos según el diseño (p. ej., VI + VD en experimentos,
  dos variables en correlacionales).
- **Sistema de hipótesis derivado**: el tipo de hipótesis (causal de
  diferencia de grupos, correlacional, correlacional-causal, descriptiva de
  valor) no se elige — se deriva del diseño. La plataforma ofrece plantilla,
  valida que Hi sea una afirmación, pide direccionalidad del contraste y
  genera la H₀ simétrica.
- **Validaciones de coherencia transversal**: advertencias dinámicas cuando
  variables y diseño entran en tensión (roles causales en estudios
  correlacionales, VI experimental con nivel de razón, VD nominal que obliga
  a comparar proporciones, etc.).
- **Población y muestreo**: editor de unidad de análisis, delimitación y
  criterios de inclusión/exclusión; ruta censo/muestra; árbol completo de
  técnicas probabilísticas (aleatorio simple, sistemático, estratificado,
  conglomerados) y no probabilísticas (conveniencia, propositivo, cuotas,
  bola de nieve), cada una con su pedagogía.
- **Calculadora de tamaño de muestra sensible al diseño**: por precisión
  (proporción o media, con corrección por población finita y ajuste por
  pérdida) en estudios de estimación; por **potencia estadística** (d de
  Cohen, α, 1−β) en diseños que comparan grupos. Salida tipo consola con
  interpretación académica y advertencias (p. ej., margen de error sin
  interpretación válida bajo muestreo no probabilístico).
- **Instrumentación**: declaración de instrumentos por variable (tipo,
  evidencias de validez, confiabilidad) con la pedagogía Messick/Standards;
  **calculadora de alfa de Cronbach** sobre datos propios, con correlación
  ítem-total corregida, detección de ítems débiles y la advertencia de que
  alfa no es validez ni unidimensionalidad.
- **Recomendador de análisis**: deriva la prueba estadística del cruce
  diseño × nivel de medición × número de condiciones (t de Student/Welch,
  t pareada, ANOVA + η², Mann-Whitney, Kruskal-Wallis, Wilcoxon,
  χ² + V de Cramér, Pearson, Spearman, descriptivos), con premisas
  trazables, supuestos y alternativa robusta planificada.
- **Laboratorio de datos**: el usuario pega datos en texto plano; el sistema
  verifica supuestos PRIMERO (normalidad K² de D'Agostino-Pearson,
  homogeneidad Brown-Forsythe), conmuta automáticamente a la alternativa
  planificada si fallan, y genera interpretación académica con tamaño del
  efecto — nunca solo el valor p.
- **Motor estadístico propio y auditado**: funciones gamma/beta incompletas
  → CDFs exactas de normal, t, F y χ², validadas contra cuantiles de
  referencia; sin dependencias externas.
- **Gráficos académicos integrados al análisis** (Chart.js 4 + plugin de
  boxplot, únicas dependencias externas, con degradación elegante a salida
  textual): el gráfico no se elige, lo determina el modo — boxplot por grupo
  en comparaciones, dispersión con recta de regresión en correlaciones
  (inspección visual de linealidad), trayectorias individuales + media en
  pre-post, barras agrupadas en contingencia, histograma con curva normal
  superpuesta en descriptivos.
- **Regresión lineal simple** en el motor (pendiente, intercepto, r², prueba
  t de la pendiente), reportada junto a Pearson y dibujada en la dispersión.
- **Carga de CSV sin dependencias**: parser propio (detecta coma o punto y
  coma; convención decimal europea) que vierte las columnas al formato del
  laboratorio y a la matriz del alfa de Cronbach.
- **Tema claro y oscuro**: alternador en la cabecera con persistencia;
  sin preferencia manual, sigue a `prefers-color-scheme` del sistema.
  Los gráficos leen los tokens del tema activo. Contraste AA en ambos modos.
- **Exportación**: el capítulo de método completo se copia al portapapeles,
  se descarga como **Markdown** (tabla de operacionalización incluida,
  salidas estadísticas como bloques de código — apto para Pandoc/Word) o
  se imprime a **PDF** con una hoja de impresión dedicada (solo el
  documento, siempre en claro).
- **Integración continua**: GitHub Actions ejecuta la suite completa
  (116 aserciones) en cada push y pull request.
- **Observatorio 3D** (columna independiente del flujo metodológico):
  gráficos "tipo universo" sobre Three.js — campo de estrellas, materiales
  emisivos, órbita por arrastre y zoom — con cinco tipos: columnas 3D
  (series × categorías), torta 3D explotada con relieve proporcional,
  boxplot 3D (Q1–Q3, mediana, bigotes de Tukey y atípicos luminosos),
  dispersión 3D (X·Y·Z) y senderos 3D para trayectorias longitudinales.
  Acepta datos pegados, CSV o **ejemplos autogenerados** por tipo. Carga
  perezosa del motor (si el CDN falla, el resto de la app no se afecta) e
  incluye la advertencia metodológica sobre la distorsión perceptual del
  3D: exploración y divulgación sí; informe de tesis, con los 2D del
  laboratorio.
- Persistencia local del proyecto (con degradación elegante sin
  `localStorage`), accesible por teclado, responsive, sin backend ni
  dependencias de pago.

## Arquitectura

```
index.html
css/
  tokens.css        # sistema de diseño (única fuente de verdad visual)
  base.css          # reset, tipografía, accesibilidad
  layout.css        # estructura de página
  components.css    # componentes
js/
  app.js            # punto de entrada (composición)
  core/
    state.js        # almacén observable + persistencia tolerante a fallos
    engine.js       # motor: relevancia, poda en cascada, veredictos
  stats/
    muestra.js        # tamaño de muestra (Cochran; Cohen)
    distribuciones.js # gamma/beta incompletas; CDFs normal, t, F, χ²
    descriptivos.js   # momentos, rangos, resúmenes
    pruebas.js        # t, ANOVA, χ², Pearson, Spearman, MW, KW, Wilcoxon
    supuestos.js      # K² de D'Agostino-Pearson; Brown-Forsythe
    confiabilidad.js  # alfa de Cronbach + ítem-total corregida
  charts/
    graficos.js       # fábrica de gráficos académicos sobre Chart.js
    universoDatos.js  # matemática pura del Observatorio (testeable)
    universo.js       # motor 3D: escena cósmica, órbita, constructores
  knowledge/
    index.js        # ensamblaje de la base de conocimiento
    alcance.js      # nodo de alcance (pedagogía completa)
    diseno.js       # nodos de diseño + veredictos derivados
    variables.js    # roles, niveles de medición, requisitos y validaciones
    hipotesis.js    # tipología derivada, plantillas y generación de H₀
    muestreo.js     # población, censo/muestra, técnicas y validaciones
    instrumentos.js # tipos, validez/confiabilidad (Messick; Standards)
    analisis.js     # recomendador de prueba con catálogo y premisas
  ui/
    dom.js          # creación declarativa de DOM (sin innerHTML)
    tutor.js        # renderizado del flujo del tutor
    blueprint.js    # matriz metodológica viva
docs/               # documentación del proyecto
```

**Principio rector:** la lógica metodológica es *contenido declarativo*
(`/js/knowledge`), no código de interfaz. Agregar un diseño nuevo o una etapa
nueva significa agregar datos, no reescribir el motor. Cada nodo declara su
predicado `relevanteSi(decisiones)` y cada veredicto su regla
`cuando(decisiones)`; el motor (`engine.js`) es genérico y de ~80 líneas.

## Ejecución local

No requiere instalación. Por ser módulos ES, sirva los archivos con cualquier
servidor estático:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Publicación en GitHub Pages

1. Cree un repositorio y suba todo el contenido a la rama `main`.
2. En **Settings → Pages**, seleccione *Deploy from a branch*, rama `main`,
   carpeta `/ (root)`.
3. La aplicación quedará en `https://<usuario>.github.io/<repositorio>/`.

No hay paso de compilación: lo que está en el repositorio es lo que se sirve.

## Hoja de ruta

| Fase | Contenido |
|------|-----------|
| ~~2~~ | ~~Hipótesis, variables y operacionalización~~ ✔ completada |
| ~~3~~ | ~~Población, muestreo y calculadoras~~ ✔ completada |
| ~~4~~ | ~~Motor estadístico, supuestos, efecto, alfa~~ ✔ completada |
| ~~5~~ | ~~Gráficos interactivos y carga CSV~~ ✔ completada |
| ~~6~~ | ~~Exportación, tema, CI~~ ✔ completada — **v1.0** |

## Dependencias

Tres, todas MIT y por CDN, con degradación elegante si no cargan:
**Chart.js 4.4**, **@sgratzl/chartjs-chart-boxplot 4.4** y **Three.js 0.160**
(esta última con carga perezosa: solo se descarga al usar el Observatorio). Todo lo demás
—motor metodológico, estadística (incluidas las CDF de normal, t, F y χ²),
CSV, exportación— es código propio sin dependencias.

## Hoja de ruta v2

1. Regresión múltiple con diagnósticos (multicolinealidad, residuos) y ANCOVA.
2. ANOVA de medidas repetidas y modelos para diseños longitudinales.
3. Post hoc (Tukey HSD) y corrección de comparaciones múltiples en el laboratorio.
4. Prueba exacta de Fisher y residuos ajustados por celda en χ².
5. Diagrama de flujo del diseño (SVG) exportable para el capítulo de método.
6. Modo docente: rúbricas de evaluación del diseño construido y casos guiados.
7. Internacionalización (catálogo de textos separado) y PWA para uso sin conexión.
8. Importación/exportación del proyecto completo como JSON para compartir con el director.

## Referencias conceptuales

Hernández-Sampieri, R., Fernández, C. y Baptista, P. (2014). *Metodología de la
investigación* (6.ª ed.). · Creswell, J. W. y Creswell, J. D. (2018).
*Research Design* (5.ª ed.). · Campbell, D. T. y Stanley, J. C. (1966).
*Experimental and Quasi-Experimental Designs for Research*. · Shadish, W. R.,
Cook, T. D. y Campbell, D. T. (2002). *Experimental and Quasi-Experimental
Designs for Generalized Causal Inference*. · Kerlinger, F. N. y Lee, H. B.
(2002). *Investigación del comportamiento* (4.ª ed.). · Cohen, J. (1988).
*Statistical Power Analysis for the Behavioral Sciences* (2.ª ed.). ·
Tabachnick, B. G. y Fidell, L. S. (2019). *Using Multivariate Statistics*
(7.ª ed.).

## Licencia

Código bajo licencia **MIT**. Los contenidos pedagógicos en español pueden
reutilizarse bajo **CC BY-SA 4.0** citando el proyecto.

---

*Métodika es una herramienta educativa de apoyo. No sustituye la asesoría de
un director o comité de investigación.*
