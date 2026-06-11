/**
 * analisisRecomendador.js — Plan de análisis + laboratorio de datos.
 *
 * Muestra la técnica derivada por knowledge/analisis.js con sus premisas,
 * supuestos y alternativa; permite ensayar el análisis con datos pegados.
 * Flujo del laboratorio: verificar supuestos PRIMERO, luego ejecutar la
 * prueba pertinente (o su alternativa) y generar interpretación con
 * tamaño del efecto.
 */

import { el } from './dom.js';
import { state } from '../core/state.js';
import { recomendar } from '../knowledge/analisis.js';
import {
  tIndependiente, tPareada, anovaUnFactor, chiCuadrado,
  pearson, spearman, mannWhitney, kruskalWallis, wilcoxonSignos, magnitud,
} from '../stats/pruebas.js';
import { dagostinoK2, brownForsythe } from '../stats/supuestos.js';
import { resumen } from '../stats/descriptivos.js';
import { regresionLineal } from '../stats/pruebas.js';
import {
  disponible, destruirGraficos, dispersionConTendencia, boxplotGrupos,
  histogramaConNormal, barrasContingencia, lineasPrePost,
} from '../charts/graficos.js';
import { botonCargarCSV } from './csv.js';

export function renderRecomendadorAnalisis(nodo, estado) {
  const m = estado.analisis;
  if (m.guardada) {
    return el(
      'div',
      { class: 'hipotesis-resumen' },
      el('pre', { class: 'consola' }, m.salida),
      el('p', { class: 'decision__contexto', style: 'margin-top: 1rem' }, m.interpretacion),
      el('button', {
        class: 'boton-secundario', type: 'button',
        onClick: () => state.editarAnalisis(),
      }, 'Reabrir plan de análisis')
    );
  }

  const esComparacion = estado.decisiones.manipulacion === 'si' &&
    !(estado.decisiones.aleatorizacion === 'no' && estado.decisiones.grupoControl === 'no');

  const selCondiciones = el(
    'select',
    { class: 'campo__control', id: 'an-condiciones' },
    el('option', { value: '2' }, 'Dos condiciones (tratamiento vs. control)'),
    el('option', { value: '3' }, 'Tres o más condiciones')
  );

  const zona = el('div', {});
  const pintar = () => {
    const rec = recomendar(estado, parseInt(selCondiciones.value, 10));
    zona.replaceChildren(tarjetaRecomendacion(rec), laboratorio(rec, estado));
  };
  selCondiciones.addEventListener('change', pintar);

  const raiz = el(
    'div',
    {},
    esComparacion &&
      el('div', { class: 'campo' },
        el('label', { class: 'campo__etiqueta', for: 'an-condiciones' },
          '¿Cuántas condiciones comparará su diseño?'),
        selCondiciones),
    zona
  );
  pintar();
  return raiz;
}

/* ---- Tarjeta de recomendación ------------------------------------ */

function tarjetaRecomendacion(rec) {
  return el(
    'section',
    { class: 'veredicto', style: 'margin-top: 1rem' },
    el('p', { class: 'veredicto__etiqueta' }, 'TÉCNICA DERIVADA DE SU DISEÑO'),
    el('h3', { class: 'veredicto__nombre', style: 'font-size: 1.375rem' }, rec.nombre),
    el(
      'div',
      { class: 'veredicto__razonamiento' },
      rec.premisas.map((p, i) => el('span', { class: 'premisa' }, `P${i + 1} · ${p}`)),
      el('h4', { style: 'margin-top: 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em' }, 'Supuestos que deberá verificar'),
      el('ul', { style: 'font-size: 0.875rem; padding-left: 1.2em' },
        rec.supuestos.map((s) => el('li', {}, s))),
      el('p', { style: 'font-size: 0.875rem' },
        el('strong', {}, 'Alternativa planificada: '), rec.alternativa),
      rec.efecto &&
        el('p', { style: 'font-size: 0.875rem' },
          el('strong', {}, 'Tamaño del efecto a reportar: '), rec.efecto.nombre)
    )
  );
}

/* ---- Laboratorio --------------------------------------------------- */

const INSTRUCCIONES = {
  gruposContinua: 'Una línea por grupo, con el formato «Nombre: v1, v2, v3…»:\nControl: 12, 15, 11, 14, 13\nIntervención: 16, 18, 15, 17, 19',
  prePost: 'Dos líneas pareadas (mismo orden de participantes):\nPre: 10, 12, 9, 14\nPost: 13, 15, 11, 16',
  correlacion: 'Dos líneas con los pares (mismo orden):\nX: 1.2, 3.4, 2.2, 4.1\nY: 10, 14, 12, 18',
  tablaContingencia: 'Tabla de frecuencias, una fila por categoría:\n10, 20\n25, 15',
  descriptivos: 'Una línea por variable: «Nombre: v1, v2, v3…»',
};

function laboratorio(rec, estado) {
  const area = el('textarea', {
    class: 'campo__control', id: 'lab-datos', rows: 5,
    placeholder: INSTRUCCIONES[rec.laboratorio],
  });
  const salida = el('div', {});
  const aviso = el('p', { class: 'error-validacion', role: 'alert', hidden: '' });

  return el(
    'div',
    { class: 'formulario', style: 'margin-top: 1.5rem' },
    el('h3', { class: 'formulario__titulo' }, 'Laboratorio: ensaye el análisis con datos reales o piloto'),
    el('div', { class: 'campo' },
      el('label', { class: 'campo__etiqueta', for: 'lab-datos' }, 'Datos'),
      area,
      el('div', { style: 'margin-top: 0.5rem' },
        botonCargarCSV(area, rec.laboratorio, (msg) => { aviso.textContent = msg; aviso.hidden = false; }))),
    aviso,
    el(
      'div',
      { class: 'formulario__acciones' },
      el('button', { class: 'boton-primario', type: 'button', onClick: ejecutar }, 'Verificar supuestos y analizar'),
      el('button', {
        class: 'boton-secundario', type: 'button',
        onClick: () => state.guardarAnalisis({
          salida: `── Plan de análisis ──\nTécnica principal : ${rec.nombre}\nAlternativa       : ${rec.alternativa.split('.')[0]}\nEfecto a reportar : ${rec.efecto ? rec.efecto.nombre : 'descriptivos e IC'}`,
          interpretacion:
            `Se planifica contrastar las hipótesis mediante ${rec.nombre.toLowerCase()}, ` +
            `previa verificación de sus supuestos; de incumplirse, se aplicará la ` +
            `alternativa planificada (${rec.alternativa.split('.')[0].toLowerCase()}). ` +
            (rec.efecto ? `Se reportará ${rec.efecto.nombre} como medida del tamaño del efecto.` : ''),
        }),
      }, 'Guardar el plan sin datos')
    ),
    salida
  );

  function ejecutar() {
    aviso.hidden = true;
    try {
      const { lineas, interpretacion, advertencias, grafico } = analizar(rec, area.value);
      const texto = lineas.join('\n');
      destruirGraficos(salida);
      const zonaGrafico = grafico ? el('div', { class: 'grafico' },
        el('p', { class: 'grafico__titulo' }, grafico.titulo),
        el('div', { class: 'grafico__lienzo' },
          el('canvas', { role: 'img', 'aria-label': grafico.titulo }))) : null;
      salida.replaceChildren(
        el('pre', { class: 'consola' }, texto),
        zonaGrafico,
        !disponible() && grafico
          ? el('p', { class: 'campo__ayuda' },
              'Gráficos no disponibles (sin conexión al CDN de Chart.js); la salida textual es completa.')
          : null,
        el('p', { class: 'decision__contexto', style: 'margin-top: 1rem' }, interpretacion),
        ...advertencias.map((a) =>
          el('p', { class: 'advertencia', role: 'note' },
            el('strong', {}, 'Advertencia metodológica. '), a)),
        el('button', {
          class: 'boton-primario', type: 'button',
          onClick: () => state.guardarAnalisis({ salida: texto, interpretacion }),
        }, 'Guardar en la matriz')
      );
      if (zonaGrafico && disponible()) {
        requestAnimationFrame(() => grafico.pintar(zonaGrafico.querySelector('canvas')));
      }
    } catch (e) {
      aviso.textContent = e.message;
      aviso.hidden = false;
    }
  }
}

/* ---- Parsers --------------------------------------------------------- */

function parseSeries(texto, minSeries, minN) {
  const series = texto.trim().split(/\n+/).map((linea) => {
    const [etiqueta, resto] = linea.includes(':') ? linea.split(/:(.+)/) : [null, linea];
    const valores = (resto ?? linea).split(/[,;\s]+/).filter(Boolean)
      .map((v) => parseFloat(v.replace(',', '.')));
    if (valores.some(Number.isNaN)) throw new Error(`Hay valores no numéricos en la línea «${linea.slice(0, 40)}…».`);
    return { etiqueta: etiqueta?.trim() ?? null, valores };
  });
  if (series.length < minSeries) throw new Error(`Se requieren al menos ${minSeries} series (líneas) de datos.`);
  if (series.some((s) => s.valores.length < minN)) throw new Error(`Cada serie necesita al menos ${minN} valores.`);
  return series;
}

const f = (x, d = 3) => Number(x).toFixed(d);
const pTexto = (p) => (p < 0.001 ? 'p < .001' : `p = ${f(p).replace('0.', '.')}`);

/* ---- Ejecución por modo ----------------------------------------------- */

function analizar(rec, texto) {
  const advertencias = [];
  const lineas = [];

  /* ===== Grupos independientes (t / ANOVA / MW / KW) ===== */
  if (rec.laboratorio === 'gruposContinua') {
    const series = parseSeries(texto, 2, 3);
    const grupos = series.map((s) => s.valores);
    const nombres = series.map((s, i) => s.etiqueta ?? `Grupo ${i + 1}`);

    lineas.push('── Descriptivos por grupo ──');
    grupos.forEach((g, i) => {
      const r = resumen(g);
      lineas.push(`${nombres[i].padEnd(14).slice(0, 14)} n=${String(r.n).padStart(3)}  M=${f(r.media, 2)}  DE=${f(r.de, 2)}  Mdn=${f(r.mediana, 2)}`);
    });

    // Supuestos
    lineas.push('', '── Verificación de supuestos ──');
    let normalidadOk = true;
    grupos.forEach((g, i) => {
      const k2 = dagostinoK2(g);
      if (k2 === null) {
        lineas.push(`normalidad ${nombres[i].slice(0, 10).padEnd(10)} : n<8, no evaluable`);
        advertencias.push(`El grupo ${nombres[i]} tiene n < 8: la normalidad no puede evaluarse; con muestras tan pequeñas prefiera la alternativa no paramétrica.`);
        normalidadOk = false;
      } else {
        const pasa = k2.p > 0.05;
        if (!pasa) normalidadOk = false;
        lineas.push(`normalidad ${nombres[i].slice(0, 10).padEnd(10)} : K²=${f(k2.k2, 2)}, ${pTexto(k2.p)} ${pasa ? '✓' : '✗'}`);
      }
    });
    const bf = brownForsythe(grupos);
    const homog = bf.p > 0.05;
    lineas.push(`homog. varianzas      : F(${bf.gl1},${bf.gl2})=${f(bf.F, 2)}, ${pTexto(bf.p)} ${homog ? '✓' : '✗'}`);

    lineas.push('', '── Prueba ──');

    if (grupos.length === 2) {
      if (!normalidadOk || rec.id === 'mannWhitney') {
        const mw = mannWhitney(grupos[0], grupos[1]);
        lineas.push(`U de Mann-Whitney  U=${f(mw.U, 1)}  z=${f(mw.z, 2)}  ${pTexto(mw.p)}`);
        lineas.push(`r rango-biserial   = ${f(mw.rbc)}`);
        const sig = mw.p < 0.05;
        const interpretacion =
          (rec.id !== 'mannWhitney'
            ? 'Dado el incumplimiento de la normalidad, se aplicó la alternativa planificada (U de Mann-Whitney). '
            : '') +
          `La prueba ${sig ? 'resultó' : 'no resultó'} estadísticamente significativa ` +
          `(U = ${f(mw.U, 1)}, z = ${f(mw.z, 2)}, ${pTexto(mw.p)}). ` +
          (sig
            ? `Existe evidencia de diferencia entre ${nombres[0]} y ${nombres[1]}, con un efecto de magnitud ${magnitud('r', mw.rbc)} (r = ${f(mw.rbc, 2)}).`
            : `No se halló evidencia de diferencia entre ${nombres[0]} y ${nombres[1]}; recuerde que esto no demuestra equivalencia, especialmente con n pequeños.`);
        advertencias.push('Valor p por aproximación normal con corrección de continuidad; con n por grupo < 10, el p exacto puede diferir.');
        return { lineas, interpretacion, advertencias, grafico: graficoGrupos(grupos, nombres) };
      }

      const t = tIndependiente(grupos[0], grupos[1]);
      const usar = homog ? t.student : t.welch;
      const nombrePrueba = homog ? 't de Student' : 't de Welch';
      if (!homog) advertencias.push('Las varianzas no son homogéneas: se reporta la corrección de Welch, tal como contempla el plan.');
      lineas.push(`${nombrePrueba.padEnd(18)} t(${f(usar.gl, homog ? 0 : 1)})=${f(usar.t, 2)}  ${pTexto(usar.p)}`);
      lineas.push(`d de Cohen         = ${f(t.d, 2)} (${magnitud('d', t.d)})`);
      const sig = usar.p < 0.05;
      const interpretacion =
        `La comparación de medias mediante ${nombrePrueba} ${sig ? 'resultó' : 'no resultó'} ` +
        `estadísticamente significativa (t(${f(usar.gl, homog ? 0 : 1)}) = ${f(usar.t, 2)}, ${pTexto(usar.p)}), ` +
        `con un tamaño del efecto ${magnitud('d', t.d)} (d = ${f(t.d, 2)}). ` +
        (sig
          ? `${nombres[t.mediaA > t.mediaB ? 0 : 1]} presentó la media más alta (${f(Math.max(t.mediaA, t.mediaB), 2)} vs. ${f(Math.min(t.mediaA, t.mediaB), 2)}).`
          : 'Antes de concluir ausencia de efecto, contraste este resultado con la potencia planificada: un p alto con potencia baja es ininterpretable.');
      return { lineas, interpretacion, advertencias, grafico: graficoGrupos(grupos, nombres) };
    }

    // 3+ grupos
    if (!normalidadOk || rec.id === 'kruskal') {
      const kw = kruskalWallis(grupos);
      lineas.push(`Kruskal-Wallis     H(${kw.gl})=${f(kw.H, 2)}  ${pTexto(kw.p)}`);
      const sig = kw.p < 0.05;
      const interpretacion =
        (rec.id !== 'kruskal' ? 'Ante el incumplimiento de la normalidad se aplicó Kruskal-Wallis. ' : '') +
        `La prueba ${sig ? 'resultó' : 'no resultó'} significativa (H(${kw.gl}) = ${f(kw.H, 2)}, ${pTexto(kw.p)}). ` +
        (sig
          ? 'Proceda con comparaciones por pares (Mann-Whitney con corrección de Bonferroni) para localizar las diferencias.'
          : 'No se halló evidencia de diferencias entre los grupos.');
      return { lineas, interpretacion, advertencias, grafico: graficoGrupos(grupos, nombres) };
    }
    const an = anovaUnFactor(grupos);
    lineas.push(`ANOVA un factor    F(${an.gl1},${an.gl2})=${f(an.F, 2)}  ${pTexto(an.p)}`);
    lineas.push(`eta cuadrado       = ${f(an.eta2)} (${magnitud('eta2', an.eta2)})`);
    if (!homog) advertencias.push('Varianzas no homogéneas con k grupos: considere ANOVA de Welch o Kruskal-Wallis para el informe final.');
    const sig = an.p < 0.05;
    const interpretacion =
      `El ANOVA ${sig ? 'resultó' : 'no resultó'} significativo (F(${an.gl1}, ${an.gl2}) = ${f(an.F, 2)}, ${pTexto(an.p)}), ` +
      `con un efecto ${magnitud('eta2', an.eta2)} (η² = ${f(an.eta2, 2)}). ` +
      (sig
        ? 'El ómnibus no indica qué pares difieren: aplique post hoc (Tukey HSD) y no múltiples t sin corrección.'
        : 'No se halló evidencia de diferencias entre las condiciones.');
    return { lineas, interpretacion, advertencias, grafico: graficoGrupos(grupos, nombres) };
  }

  /* ===== Pre-post ===== */
  if (rec.laboratorio === 'prePost') {
    const series = parseSeries(texto, 2, 3);
    const [pre, post] = [series[0].valores, series[1].valores];
    if (pre.length !== post.length) throw new Error('Pre y Post deben tener el mismo número de valores (pares).');

    const dif = post.map((y, i) => y - pre[i]);
    const k2 = dagostinoK2(dif);
    lineas.push('── Verificación de supuestos ──');
    let normal = true;
    if (k2 === null) {
      lineas.push('normalidad de las diferencias : n<8, no evaluable');
      normal = false;
      advertencias.push('Con n < 8 pares la normalidad de las diferencias no puede evaluarse: se aplica Wilcoxon por prudencia.');
    } else {
      normal = k2.p > 0.05;
      lineas.push(`normalidad de las diferencias : K²=${f(k2.k2, 2)}, ${pTexto(k2.p)} ${normal ? '✓' : '✗'}`);
    }
    lineas.push('', '── Prueba ──');

    if (!normal || rec.id === 'wilcoxon') {
      const w = wilcoxonSignos(pre, post);
      const r = w.z / Math.sqrt(w.n);
      lineas.push(`Wilcoxon (signos)  W=${f(w.W, 1)}  z=${f(w.z, 2)}  ${pTexto(w.p)}`);
      lineas.push(`r = z/√n           = ${f(r, 2)} (${magnitud('r', r)})`);
      const sig = w.p < 0.05;
      const interpretacion =
        `La prueba de Wilcoxon ${sig ? 'indica' : 'no indica'} un cambio significativo entre las mediciones ` +
        `(W = ${f(w.W, 1)}, z = ${f(w.z, 2)}, ${pTexto(w.p)}), con efecto ${magnitud('r', r)}. ` +
        'Recuerde que, sin grupo de comparación, el cambio observado no es atribuible a la intervención.';
      return { lineas, interpretacion, advertencias, grafico: graficoPrePost(pre, post) };
    }
    const t = tPareada(pre, post);
    lineas.push(`t pareada          t(${t.gl})=${f(t.t, 2)}  ${pTexto(t.p)}`);
    lineas.push(`d_z                = ${f(t.dz, 2)} (${magnitud('d', t.dz)})`);
    const sig = t.p < 0.05;
    const interpretacion =
      `La prueba t para muestras relacionadas ${sig ? 'resultó' : 'no resultó'} significativa ` +
      `(t(${t.gl}) = ${f(t.t, 2)}, ${pTexto(t.p)}; cambio medio = ${f(t.mediaDif, 2)}), ` +
      `con un efecto ${magnitud('d', t.dz)} (d_z = ${f(t.dz, 2)}). ` +
      'En un diseño de un solo grupo, este cambio admite explicaciones rivales (historia, maduración, regresión a la media): repórtelo con esa cautela.';
    return { lineas, interpretacion, advertencias, grafico: graficoPrePost(pre, post) };
  }

  /* ===== Correlación ===== */
  if (rec.laboratorio === 'correlacion') {
    const series = parseSeries(texto, 2, 5);
    const [x, y] = [series[0].valores, series[1].valores];
    if (x.length !== y.length) throw new Error('X e Y deben tener el mismo número de valores (pares).');

    lineas.push('── Verificación de supuestos ──');
    const k2x = dagostinoK2(x), k2y = dagostinoK2(y);
    let normal = true;
    for (const [nombre, k2] of [['X', k2x], ['Y', k2y]]) {
      if (k2 === null) { lineas.push(`normalidad ${nombre} : n<8, no evaluable`); normal = false; }
      else {
        const pasa = k2.p > 0.05;
        if (!pasa) normal = false;
        lineas.push(`normalidad ${nombre} : K²=${f(k2.k2, 2)}, ${pTexto(k2.p)} ${pasa ? '✓' : '✗'}`);
      }
    }
    lineas.push('', '── Prueba ──');

    if (!normal || rec.id === 'spearman') {
      const s = spearman(x, y);
      lineas.push(`rho de Spearman    ρ=${f(s.rho, 2)}  t(${s.gl})=${f(s.t, 2)}  ${pTexto(s.p)}`);
      const sig = s.p < 0.05;
      const interpretacion =
        (rec.id !== 'spearman' ? 'Ante el incumplimiento de la normalidad se reporta Spearman. ' : '') +
        `La correlación de rangos ${sig ? 'resultó' : 'no resultó'} significativa ` +
        `(ρ = ${f(s.rho, 2)}, ${pTexto(s.p)}), de magnitud ${magnitud('r', s.rho)} y dirección ${s.rho >= 0 ? 'positiva' : 'negativa'}. ` +
        'La asociación no informa dirección causal.';
      return { lineas, interpretacion, advertencias, grafico: graficoDispersion(x, y) };
    }
    const p = pearson(x, y);
    const reg = regresionLineal(x, y);
    lineas.push(`r de Pearson       r=${f(p.r, 2)}  t(${p.gl})=${f(p.t, 2)}  ${pTexto(p.p)}`);
    lineas.push(`r²                 = ${f(p.r2, 2)} (varianza compartida)`);
    lineas.push(`regresión simple   ŷ = ${f(reg.b0, 2)} + ${f(reg.b1, 2)}·x`);
    advertencias.push('Pearson presupone linealidad: inspeccione el diagrama de dispersión adjunto; si el patrón es curvo, ni r ni la recta lo representan.');
    const sig = p.p < 0.05;
    const interpretacion =
      `La correlación de Pearson ${sig ? 'resultó' : 'no resultó'} significativa ` +
      `(r(${p.gl}) = ${f(p.r, 2)}, ${pTexto(p.p)}), de magnitud ${magnitud('r', p.r)} y dirección ` +
      `${p.r >= 0 ? 'positiva' : 'negativa'}; las variables comparten un ${f(p.r2 * 100, 1)}% de varianza. ` +
      'Correlación no implica causalidad: la dirección del vínculo se sostiene, si acaso, por teoría.';
    return { lineas, interpretacion, advertencias, grafico: graficoDispersion(x, y) };
  }

  /* ===== Tabla de contingencia ===== */
  if (rec.laboratorio === 'tablaContingencia') {
    const filas = texto.trim().split(/\n+/).map((l) =>
      l.replace(/^[^:]*:/, '').split(/[,;\s]+/).filter(Boolean).map(Number));
    if (filas.length < 2 || filas[0].length < 2 || filas.some((fl) => fl.length !== filas[0].length || fl.some((v) => !Number.isInteger(v) || v < 0)))
      throw new Error('Ingrese una tabla rectangular de frecuencias enteras no negativas (mínimo 2×2).');

    const x2 = chiCuadrado(filas);
    lineas.push('── Prueba ──');
    lineas.push(`chi-cuadrado       χ²(${x2.gl})=${f(x2.x2, 2)}  ${pTexto(x2.p)}  N=${x2.N}`);
    lineas.push(`V de Cramér        = ${f(x2.v, 2)} (${magnitud('v', x2.v)})`);
    lineas.push(`esperada mínima    = ${f(x2.minEsperada, 2)}`);
    if (x2.celdasBajas / x2.totalCeldas > 0.2 || x2.minEsperada < 1) {
      advertencias.push('Más del 20% de las celdas tienen frecuencia esperada < 5 (o alguna < 1): el χ² pierde validez; use la prueba exacta de Fisher para el informe final.');
    }
    const sig = x2.p < 0.05;
    const interpretacion =
      `La prueba chi-cuadrado de independencia ${sig ? 'resultó' : 'no resultó'} significativa ` +
      `(χ²(${x2.gl}) = ${f(x2.x2, 2)}, ${pTexto(x2.p)}, N = ${x2.N}), con una asociación de magnitud ` +
      `${magnitud('v', x2.v)} (V de Cramér = ${f(x2.v, 2)}). ` +
      (sig
        ? 'La significación indica asociación entre las variables categóricas, no su dirección ni su causa: examine los residuos por celda para localizarla.'
        : 'No se halló evidencia de asociación entre las variables.');
    const filasEt = filas.map((_, i) => `Fila ${i + 1}`);
    const colsEt = filas[0].map((_, j) => `Col ${j + 1}`);
    return { lineas, interpretacion, advertencias,
      grafico: { titulo: 'Frecuencias observadas', pintar: (cv) => barrasContingencia(cv, filas, filasEt, colsEt) } };
  }

  /* ===== Descriptivos ===== */
  const series = parseSeries(texto, 1, 3);
  lineas.push('── Descriptivos ──');
  for (const s of series) {
    const r = resumen(s.valores);
    lineas.push(`${(s.etiqueta ?? 'Variable').padEnd(14).slice(0, 14)} n=${String(r.n).padStart(3)}  M=${f(r.media, 2)}  DE=${f(r.de, 2)}  Mdn=${f(r.mediana, 2)}  [${f(r.min, 1)}, ${f(r.max, 1)}]`);
  }
  const interpretacion =
    'Se reportan medidas de tendencia central, dispersión y rango por variable. ' +
    'Verifique que cada estadístico sea legítimo para el nivel de medición declarado: ' +
    'media y desviación estándar solo con variables métricas.';
  const primera = series[0];
  return { lineas, interpretacion, advertencias,
    grafico: primera.valores.length >= 8
      ? { titulo: `Histograma · ${primera.etiqueta ?? 'Variable'} (con normal teórica)`,
          pintar: (cv) => histogramaConNormal(cv, primera.valores, primera.etiqueta ?? 'Variable') }
      : null };
}


/* ---- Descriptores de gráfico por modo --------------------------------- */

function graficoGrupos(grupos, nombres) {
  return {
    titulo: 'Distribución por grupo (boxplot)',
    pintar: (cv) => boxplotGrupos(cv, grupos, nombres),
  };
}

function graficoPrePost(pre, post) {
  return {
    titulo: 'Trayectorias individuales y media (pre → post)',
    pintar: (cv) => lineasPrePost(cv, pre, post),
  };
}

function graficoDispersion(x, y) {
  return {
    titulo: 'Diagrama de dispersión con recta de regresión',
    pintar: (cv) => dispersionConTendencia(cv, x, y),
  };
}
