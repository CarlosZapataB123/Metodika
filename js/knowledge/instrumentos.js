/**
 * instrumentos.js — Etapa de instrumentación.
 *
 * Fundamento: la concepción contemporánea de la validez como un juicio
 * unitario sobre las interpretaciones de las puntuaciones (Messick, 1989;
 * Standards AERA/APA/NCME, 2014), articulada con la presentación de
 * Hernández-Sampieri (cap. 9). Confiabilidad ≠ validez: un instrumento
 * puede medir consistentemente lo equivocado.
 */

export const TIPOS_INSTRUMENTO = [
  { id: 'estandarizado', etiqueta: 'Escala o test estandarizado (con antecedentes psicométricos)' },
  { id: 'adaptado', etiqueta: 'Instrumento adaptado o traducido para este estudio' },
  { id: 'adhoc', etiqueta: 'Cuestionario construido ad hoc' },
  { id: 'observacion', etiqueta: 'Registro observacional o lista de cotejo' },
  { id: 'secundarios', etiqueta: 'Datos secundarios o registros existentes' },
];

export const etiquetaTipoInstrumento = (id) =>
  TIPOS_INSTRUMENTO.find((t) => t.id === id)?.etiqueta ?? id;

function hayDiseno(x) {
  return (
    (x.manipulacion === 'si' &&
      (x.aleatorizacion === 'si' ||
        (x.aleatorizacion === 'no' && x.grupoControl !== undefined))) ||
    x.temporalidad === 'transversal' ||
    (x.temporalidad === 'longitudinal' && x.tipoLongitudinal !== undefined)
  );
}

export const nodoInstrumentos = {
  id: 'instrumentos',
  etapa: 'Instrumentos',
  tipo: 'editorInstrumentos',
  pregunta: 'Declare sus instrumentos y sus evidencias psicométricas',
  contexto:
    'Cada variable operacionalizada necesita un instrumento con dos ' +
    'credenciales distintas: evidencias de validez (¿las puntuaciones ' +
    'admiten la interpretación pretendida?) y de confiabilidad (¿la ' +
    'medición es consistente?). Si su instrumento es una escala de ' +
    'múltiples ítems, puede calcular aquí el alfa de Cronbach con sus ' +
    'datos piloto.',
  relevanteSi: hayDiseno,
  respondido: (estado) =>
    estado.instrumentos?.guardada === true && estado.instrumentos?.lista?.length > 0,
  pedagogia: {
    queSignifica:
      'La validez no es una propiedad del instrumento sino de las ' +
      'interpretaciones de sus puntuaciones para un uso concreto: por eso ' +
      'se reportan evidencias (de contenido, de estructura interna, de ' +
      'relación con otras variables), no un "certificado". La ' +
      'confiabilidad estima cuánta varianza de las puntuaciones es ' +
      'atribuible a diferencias verdaderas y no a error de medición; el ' +
      'alfa de Cronbach es su estimador de consistencia interna más usado.',
    porQueImporta:
      'La confiabilidad acota la validez (un instrumento inestable no ' +
      'puede medir válidamente nada) y atenúa las correlaciones ' +
      'observadas: con instrumentos poco confiables, los efectos reales ' +
      'se subestiman sistemáticamente.',
    implicaciones: [
      'Si usa un instrumento estandarizado, cite las evidencias de validación en población comparable a la suya; la validación no se hereda automáticamente entre contextos o idiomas.',
      'Si adapta o traduce, el protocolo mínimo es traducción inversa, jueceo de expertos y pilotaje.',
      'El alfa pertenece a las puntuaciones de SU muestra, no al instrumento: repórtelo siempre con sus propios datos.',
    ],
    erroresFrecuentes: [
      'Reportar el alfa de la publicación original como si fuera el del propio estudio.',
      'Tratar un alfa alto como prueba de validez o de unidimensionalidad: alfa supone la unidimensionalidad, no la demuestra.',
      'Inflar alfa agregando ítems redundantes (alfa crece mecánicamente con k).',
    ],
    referencias:
      'Messick (1989); AERA, APA & NCME (2014); Hernández-Sampieri et al. (2014), cap. 9; Cronbach (1951).',
  },
};
