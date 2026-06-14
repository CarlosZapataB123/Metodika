/**
 * hipotesis.js — Nodo editor del sistema de hipótesis.
 *
 * Fundamento: Kerlinger & Lee (2002, cap. 2): una hipótesis es un
 * enunciado conjetural de la relación entre dos o más variables;
 * Hernández-Sampieri (cap. 6) para la tipología (descriptivas de valor,
 * correlacionales, de diferencia de grupos, causales) y el papel de la
 * hipótesis nula.
 *
 * El tipo de hipótesis NO lo elige el usuario: se deriva del alcance y
 * del diseño ya construidos. La plataforma redacta la H0 simétrica.
 */

import { requisitosVariables } from './variables.js';

function hayVariablesCompletas(estado) {
  return requisitosVariables(estado).completo;
}

/** Clasifica el tipo de hipótesis pertinente según las decisiones. */
export function tipoHipotesis(decisiones) {
  const x = decisiones;
  if (x.alcance === 'exploratorio') return null;

  if (x.manipulacion === 'si') {
    return {
      id: 'causal',
      nombre: 'Hipótesis causal de diferencia de grupos',
      explicacion:
        'Su diseño manipula un tratamiento y compara grupos: la hipótesis ' +
        'afirma que la intervención produce un cambio en la variable ' +
        'dependiente. Debe nombrar la dirección esperada del efecto.',
      plantilla:
        'Los participantes que reciben [tratamiento] presentarán ' +
        '[mayor/menor] [variable dependiente] que quienes no lo reciben.',
      h0: (dir) =>
        'H₀: No existen diferencias en la variable dependiente entre los ' +
        'grupos comparados' +
        (dir === 'unilateral'
          ? ' (o la diferencia es contraria a la dirección hipotetizada).'
          : '.'),
    };
  }

  if (x.alcance === 'correlacional' ||
      (x.alcance === 'explicativo' && x.manipulacion === 'no')) {
    const causal = x.alcance === 'explicativo';
    return {
      id: causal ? 'correlacionalCausal' : 'correlacional',
      nombre: causal
        ? 'Hipótesis correlacional-causal'
        : 'Hipótesis correlacional',
      explicacion: causal
        ? 'Su pregunta es causal pero el diseño es observacional: la ' +
          'hipótesis se formula como asociación, y la dirección causal se ' +
          'sostiene por teoría. Redáctela con honestidad epistemológica.'
        : 'La hipótesis anticipa la existencia, dirección (positiva o ' +
          'negativa) y, deseablemente, la magnitud esperada de la ' +
          'asociación entre las variables.',
      plantilla:
        'Existe una relación [positiva/negativa] entre [variable A] y ' +
        '[variable B] en [población].',
      h0: () =>
        'H₀: No existe asociación entre las variables de estudio en la ' +
        'población (ρ = 0).',
    };
  }

  if (x.alcance === 'descriptivo') {
    return {
      id: 'descriptiva',
      nombre: 'Hipótesis descriptiva de valor pronosticado (opcional)',
      explicacion:
        'En estudios descriptivos la hipótesis solo procede cuando se ' +
        'pronostica un hecho o una cifra (p. ej., "la prevalencia superará ' +
        'el 30%"). Si su estudio solo caracteriza, es legítimo no formular ' +
        'hipótesis: decláralo explícitamente en el método.',
      plantilla:
        'La [variable] en [población] alcanzará un valor de [cifra o rango pronosticado].',
      h0: () =>
        'H₀: El parámetro poblacional no difiere del valor pronosticado.',
      opcional: true,
    };
  }

  return null;
}

export const nodoHipotesis = {
  id: 'hipotesis',
  etapa: 'Hipótesis',
  tipo: 'editorHipotesis',
  pregunta: 'Formule su sistema de hipótesis',
  contexto:
    'Una hipótesis es una explicación tentativa, formulada como ' +
    'proposición, de la relación entre dos o más variables. No se redacta ' +
    'en el vacío: su tipo lo dicta el diseño que usted ya construyó, y sus ' +
    'términos deben ser exactamente las variables que ya operacionalizó.',
  relevanteSi: (decisiones) =>
    decisiones.alcance !== undefined &&
    decisiones.alcance !== 'exploratorio' &&
    tipoHipotesis(decisiones) !== null,
  // Solo aparece cuando las variables están completas (orden pedagógico)
  // y se considera respondido cuando la hipótesis fue guardada.
  respondido: (estado) => estado.hipotesis?.guardada === true,

  pedagogia: {
    queSignifica:
      'El sistema de hipótesis articula la hipótesis de investigación ' +
      '(Hi), que afirma la relación esperada, y la hipótesis nula (H₀), ' +
      'que la niega y es la que el contraste estadístico somete a prueba. ' +
      'La evidencia nunca "prueba" Hi: solo permite rechazar o no ' +
      'rechazar H₀ con una probabilidad de error conocida (α).',
    porQueImporta:
      'La direccionalidad de la hipótesis decide el contraste: una ' +
      'hipótesis direccional (unilateral) concentra α en una cola y gana ' +
      'potencia, pero debe justificarse con evidencia previa; una ' +
      'bilateral es más conservadora y es la opción por defecto en ' +
      'ausencia de antecedentes sólidos.',
    implicaciones: [
      'Cada término de la hipótesis debe corresponder a una variable operacionalizada; si menciona un constructo no definido, vuelva a la etapa de variables.',
      'La hipótesis fija el parámetro de interés (diferencia de medias, proporción, coeficiente de correlación) que guiará el cálculo del tamaño de muestra.',
      'Decidir la direccionalidad después de ver los datos invalida el control del error tipo I.',
    ],
    erroresFrecuentes: [
      'Redactar hipótesis en forma de pregunta o de objetivo ("determinar si…"): la hipótesis es una afirmación.',
      'Formular hipótesis no falsables o con términos valorativos ("mejorará notablemente").',
      'Confundir "no rechazar H₀" con "demostrar que no hay efecto": la ausencia de evidencia no es evidencia de ausencia.',
    ],
    referencias:
      'Kerlinger & Lee (2002), cap. 2; Hernández-Sampieri et al. (2014), cap. 6; Cohen (1994), "The earth is round (p < .05)".',
  },

  /** El editor exige variables completas antes de habilitar la redacción. */
  prerrequisito: hayVariablesCompletas,
};
