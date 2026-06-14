/**
 * muestraCalculadora.js — Calculadora de tamaño de muestra.
 *
 * Sensible al diseño: en la familia experimental calcula por potencia
 * (d de Cohen); en estimación, por precisión (proporción o media, con
 * corrección por población finita). La salida se presenta como bloque
 * de consola (Plex Mono) seguido de interpretación académica.
 */

import { el } from './dom.js';
import { state } from '../core/state.js';
import { nProporcion, nMedia, nDosGrupos } from '../stats/muestra.js';

export function renderCalculadoraMuestra(nodo, estado) {
  const experimental = estado.decisiones.manipulacion === 'si';
  const m = estado.muestra;

  if (m.guardada) return resumen(m);

  return experimental ? formularioPotencia(m) : formularioPrecision(m, estado);
}

/* ---- Resultado guardado ----------------------------------------- */

function resumen(m) {
  return el(
    'div',
    { class: 'hipotesis-resumen' },
    el('pre', { class: 'consola' }, m.salida),
    el(
      'button',
      {
        class: 'boton-secundario',
        type: 'button',
        onClick: () => state.editarMuestra(),
      },
      'Recalcular'
    )
  );
}

/* ---- Utilidades de formulario ------------------------------------ */

function selectNum(id, opciones, defecto) {
  const s = el(
    'select',
    { class: 'campo__control', id },
    opciones.map(([v, t]) => el('option', { value: v }, t))
  );
  s.value = String(defecto);
  return s;
}

function campo(etiqueta, control, ayuda) {
  return el(
    'div',
    { class: 'campo' },
    el('label', { class: 'campo__etiqueta', for: control.id }, etiqueta),
    control,
    ayuda && el('p', { class: 'campo__ayuda' }, ayuda)
  );
}

const num = (v) => {
  const x = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(x) ? x : null;
};

/* ---- Modo precisión (estimación) ----------------------------------- */

function formularioPrecision(m, estado) {
  const selObjetivo = selectNum('calc-objetivo', [
    ['proporcion', 'Estimar una proporción (prevalencia, porcentaje)'],
    ['media', 'Estimar una media (promedio de una variable continua)'],
  ], 'proporcion');
  selObjetivo.value = m.objetivo ?? 'proporcion';

  const selConf = selectNum('calc-conf', [[90, '90%'], [95, '95% (convención)'], [99, '99%']], 95);
  const inpError = el('input', { class: 'campo__control', id: 'calc-error', type: 'text', value: m.error ?? '5' });
  const inpP = el('input', { class: 'campo__control', id: 'calc-p', type: 'text', value: m.p ?? '50' });
  const inpSigma = el('input', { class: 'campo__control', id: 'calc-sigma', type: 'text', placeholder: 'DE esperada (de estudios previos o piloto)' });
  const inpN = el('input', { class: 'campo__control', id: 'calc-N', type: 'text', placeholder: 'Déjelo vacío si la población es muy grande o desconocida' });
  const inpPerdida = el('input', { class: 'campo__control', id: 'calc-perdida', type: 'text', value: m.perdida ?? '10' });

  const filaP = campo('Proporción esperada p (%)', inpP,
    'Use 50% como postura conservadora (varianza máxima) si no hay antecedentes; decláralo.');
  const filaSigma = campo('Desviación estándar esperada (σ)', inpSigma,
    'En unidades de la variable. Tómela de la literatura o de un piloto.');

  const sincronizar = () => {
    const esP = selObjetivo.value === 'proporcion';
    filaP.hidden = !esP;
    filaSigma.hidden = esP;
  };
  selObjetivo.addEventListener('change', sincronizar);

  const salida = el('div', {});
  const aviso = el('p', { class: 'error-validacion', role: 'alert', hidden: '' });

  const raiz = el(
    'div',
    { class: 'formulario' },
    campo('Objetivo de estimación', selObjetivo),
    el(
      'div',
      { class: 'formulario__fila' },
      campo('Nivel de confianza (1−α)', selConf),
      campo(selObjetivo.value === 'proporcion' ? 'Margen de error (± puntos %)' : 'Margen de error (unidades)', inpError)
    ),
    filaP,
    filaSigma,
    el(
      'div',
      { class: 'formulario__fila' },
      campo('Tamaño de la población N (opcional)', inpN),
      campo('Pérdida esperada (%)', inpPerdida, 'No respuesta o atrición prevista; infla el n final.')
    ),
    aviso,
    el('button', { class: 'boton-primario', type: 'button', onClick: calcular }, 'Calcular'),
    salida
  );
  sincronizar();
  return raiz;

  function calcular() {
    aviso.hidden = true;
    const confianza = parseInt(selConf.value, 10);
    const N = inpN.value.trim() ? num(inpN.value) : null;
    const perdida = (num(inpPerdida.value) ?? 0) / 100;
    const esP = selObjetivo.value === 'proporcion';

    let res, lineas, interpretacion;

    if (esP) {
      const error = (num(inpError.value) ?? 0) / 100;
      const p = (num(inpP.value) ?? 0) / 100;
      if (!(error > 0 && error < 0.5) || !(p > 0 && p < 1)) {
        aviso.textContent = 'Revise el margen de error (0–50 puntos) y la proporción esperada (0–100%).';
        aviso.hidden = false; return;
      }
      res = nProporcion({ confianza, error, p, N });
      lineas = [
        '── Tamaño de muestra · estimación de proporción ──',
        `z(${confianza}%)            = ${res.z.toFixed(4)}`,
        `p esperada        = ${(p * 100).toFixed(0)}%   e = ±${(error * 100).toFixed(1)} pts`,
        `n₀ (infinita)     = ${res.n0.toFixed(2)}`,
        N ? `N poblacional     = ${N}` : null,
        N ? `n corregido       = ${res.n}` : `n requerido       = ${res.n}`,
      ];
      interpretacion =
        `Con ${res.n} casos válidos, una proporción muestral estimará el ` +
        `parámetro poblacional con un margen de ±${(error * 100).toFixed(1)} ` +
        `puntos porcentuales al ${confianza}% de confianza` +
        (N ? ', aplicada la corrección por población finita' : '') + '. ';
    } else {
      const error = num(inpError.value);
      const sigma = num(inpSigma.value);
      if (!(error > 0) || !(sigma > 0)) {
        aviso.textContent = 'Indique margen de error y desviación estándar esperada (positivos, en unidades de la variable).';
        aviso.hidden = false; return;
      }
      res = nMedia({ confianza, error, sigma, N });
      lineas = [
        '── Tamaño de muestra · estimación de media ──',
        `z(${confianza}%)            = ${res.z.toFixed(4)}`,
        `σ esperada        = ${sigma}   e = ±${error}`,
        `n₀ (infinita)     = ${res.n0.toFixed(2)}`,
        N ? `N poblacional     = ${N}` : null,
        N ? `n corregido       = ${res.n}` : `n requerido       = ${res.n}`,
      ];
      interpretacion =
        `Con ${res.n} casos válidos, la media muestral estimará la media ` +
        `poblacional con un margen de ±${error} unidades al ${confianza}% ` +
        `de confianza, asumiendo σ ≈ ${sigma}. `;
    }

    const nAjustado = perdida > 0 && perdida < 1 ? Math.ceil(res.n / (1 - perdida)) : res.n;
    if (nAjustado !== res.n) {
      lineas.push(`pérdida prevista  = ${(perdida * 100).toFixed(0)}%`);
      lineas.push(`n a reclutar      = ${nAjustado}`);
      interpretacion +=
        `Previendo una pérdida del ${(perdida * 100).toFixed(0)}%, deberá ` +
        `reclutar ${nAjustado} participantes para conservar ${res.n} casos válidos. `;
    }

    const noProb = state.get().decisiones.tipoMuestreo === 'noProbabilistico';
    const advertencia = noProb
      ? 'Su muestreo es no probabilístico: este margen de error NO tiene ' +
        'interpretación inferencial válida. El cálculo sirve únicamente como ' +
        'referencia de magnitud; decláralo así en el método.'
      : 'Recuerde que el margen de error supone selección aleatoria efectiva ' +
        'y respuesta completa: la no respuesta diferencial lo invalida.';

    mostrarResultado(salida, lineas.filter(Boolean), interpretacion, advertencia, {
      modo: 'precision', objetivo: selObjetivo.value, confianza, n: res.n, nAjustado,
    });
  }
}

/* ---- Modo potencia (experimental) ------------------------------------ */

function formularioPotencia(m) {
  const selConf = selectNum('pot-conf', [[95, 'α = .05 (convención)'], [99, 'α = .01']], 95);
  const selPot = selectNum('pot-pow', [[80, '80% (convención)'], [90, '90%'], [95, '95%']], 80);
  const selD = selectNum('pot-d', [
    ['0.2', 'd = 0.2 — efecto pequeño'],
    ['0.5', 'd = 0.5 — efecto mediano'],
    ['0.8', 'd = 0.8 — efecto grande'],
    ['otro', 'Otro valor (de la literatura)'],
  ], '0.5');
  const inpD = el('input', { class: 'campo__control', id: 'pot-d-otro', type: 'text', placeholder: 'd esperado, p. ej. 0.35', hidden: '' });
  selD.addEventListener('change', () => { inpD.hidden = selD.value !== 'otro'; });
  const inpPerdida = el('input', { class: 'campo__control', id: 'pot-perdida', type: 'text', value: '10' });

  const salida = el('div', {});
  const aviso = el('p', { class: 'error-validacion', role: 'alert', hidden: '' });

  return el(
    'div',
    { class: 'formulario' },
    el(
      'p',
      { class: 'hipotesis-tipo' },
      el('strong', {}, 'Cálculo por potencia estadística. '),
      'Su diseño compara grupos: el n no se decide por margen de error, ' +
      'sino por la capacidad de detectar el efecto que espera encontrar. ' +
      'Tome el d esperado de la literatura de su área; en su ausencia, ' +
      'd = 0.5 es una apuesta mediana razonable que debe justificar.'
    ),
    el(
      'div',
      { class: 'formulario__fila' },
      campo('Nivel de significación', selConf),
      campo('Potencia deseada (1−β)', selPot)
    ),
    campo('Tamaño del efecto esperado (d de Cohen)', selD),
    campo('Valor de d', inpD),
    campo('Pérdida esperada (%)', inpPerdida, 'Atrición prevista entre asignación y postest.'),
    aviso,
    el('button', { class: 'boton-primario', type: 'button', onClick: calcular }, 'Calcular'),
    salida
  );

  function calcular() {
    aviso.hidden = true;
    const d = selD.value === 'otro' ? num(inpD.value) : num(selD.value);
    if (!(d > 0 && d < 3)) {
      aviso.textContent = 'Indique un d de Cohen plausible (habitualmente entre 0.1 y 1.5).';
      aviso.hidden = false; return;
    }
    const confianza = parseInt(selConf.value, 10);
    const potencia = parseInt(selPot.value, 10);
    const perdida = (num(inpPerdida.value) ?? 0) / 100;

    const res = nDosGrupos({ confianza, potencia, d });
    const nAjustadoGrupo = perdida > 0 && perdida < 1 ? Math.ceil(res.nGrupo / (1 - perdida)) : res.nGrupo;

    const lineas = [
      '── Tamaño de muestra · comparación de dos grupos ──',
      `α (bilateral)     = ${confianza === 95 ? '.05' : '.01'}   z = ${res.za.toFixed(4)}`,
      `potencia (1−β)    = ${potencia}%      z = ${res.zb.toFixed(4)}`,
      `d esperado        = ${d}`,
      `n por grupo       = ${res.nGrupo}`,
      `n total           = ${res.nTotal}`,
      perdida > 0 ? `pérdida prevista  = ${(perdida * 100).toFixed(0)}%` : null,
      perdida > 0 ? `reclutar/grupo    = ${nAjustadoGrupo}` : null,
    ].filter(Boolean);

    const interpretacion =
      `Con ${res.nGrupo} participantes por grupo (${res.nTotal} en total), ` +
      `su estudio tendrá un ${potencia}% de probabilidad de detectar un ` +
      `efecto de magnitud d = ${d}, si existe, con α = ${confianza === 95 ? '.05' : '.01'} ` +
      `bilateral. Si el efecto real fuera menor que ${d}, la potencia caerá ` +
      `por debajo de lo planificado: por eso la elección de d debe ` +
      `fundamentarse en antecedentes, no en optimismo.`;

    const advertencia =
      'Cálculo por aproximación normal: subestima ligeramente el n exacto ' +
      'basado en la distribución t. Verifique con G*Power antes del informe ' +
      'final y reporte ambos parámetros (α, 1−β) y la fuente del d esperado.';

    mostrarResultado(salida, lineas, interpretacion, advertencia, {
      modo: 'potencia', confianza, potencia, d, nGrupo: res.nGrupo, nTotal: res.nTotal,
    });
  }
}

/* ---- Salida común ------------------------------------------------- */

function mostrarResultado(contenedor, lineas, interpretacion, advertencia, datos) {
  const texto = lineas.join('\n');
  contenedor.replaceChildren(
    el('pre', { class: 'consola' }, texto),
    el('p', { class: 'decision__contexto', style: 'margin-top: 1rem' }, interpretacion),
    el(
      'p',
      { class: 'advertencia', role: 'note' },
      el('strong', {}, 'Advertencia metodológica. '),
      advertencia
    ),
    el(
      'button',
      {
        class: 'boton-primario',
        type: 'button',
        onClick: () => state.guardarMuestra({ ...datos, salida: texto, interpretacion }),
      },
      'Guardar en la matriz'
    )
  );
}
