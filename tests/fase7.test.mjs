import {
  sectoresTorta, normalizar, prepararBarras, prepararBoxplot,
  prepararDispersion, prepararSenderos, EJEMPLOS,
} from '../js/charts/universoDatos.js';
import { parseSeries } from '../js/ui/series.js';

let fallos = 0;
const cerca = (a, b, tol = 1e-9) => Math.abs(a - b) < tol;
const ok = (c, n) => { console.log((c ? 'OK   ' : 'FALLO') + ' ' + n); if (!c) fallos++; };

/* --- Sectores de torta --- */
const s = sectoresTorta([1, 1, 2]);
ok(cerca(s.reduce((a, x) => a + x.longitud, 0), 2 * Math.PI), 'los sectores suman 2π');
ok(cerca(s[2].proporcion, 0.5) && cerca(s[2].inicio, Math.PI), 'proporciones y ángulos de inicio correctos');
let lanzo = false; try { sectoresTorta([0, 0]); } catch { lanzo = true; }
ok(lanzo, 'torta con total 0 rechazada');

/* --- Normalización --- */
ok(JSON.stringify(normalizar([0, 5, 10], 0, 2)) === '[0,1,2]', 'normalizar mapea linealmente');
ok(normalizar([7, 7, 7], -1, 1).every((v) => v === 0), 'serie constante → punto medio');

/* --- Barras --- */
const b = prepararBarras([{ etiqueta: 'A', valores: [10, 20] }, { etiqueta: null, valores: [5, 40] }]);
ok(cerca(b[1].alturas[1], 3) && cerca(b[0].alturas[0], 0.75), 'alturas normalizadas al máximo global');
ok(b[1].nombre === 'Serie 2', 'serie sin etiqueta recibe nombre');
lanzo = false; try { prepararBarras([{ valores: [-1, 2] }]); } catch { lanzo = true; }
ok(lanzo, 'barras con negativos rechazadas');

/* --- Boxplot: cuartiles tipo 7 sobre 1..9 → caja 3-7, mediana 5 --- */
const bp = prepararBoxplot([{ etiqueta: 'G', valores: [1,2,3,4,5,6,7,8,9] }]);
const g = bp.grupos[0];
ok(cerca(g.crudos.q1, 3) && cerca(g.crudos.q2, 5) && cerca(g.crudos.q3, 7), 'cuartiles correctos');
ok(g.atipicos.length === 0 && cerca(g.bigoteInf, 0) && cerca(g.bigoteSup, 3.2), 'bigotes en min/max escalados, sin atípicos');
const bp2 = prepararBoxplot([{ valores: [10,11,12,13,14,15,16,17,40] }]);
ok(bp2.grupos[0].atipicos.length === 1, 'el valor 40 se detecta como atípico (regla 1.5·IQR)');

/* --- Dispersión --- */
const d = prepararDispersion([
  { etiqueta: 'X', valores: [1,2,3,4] },
  { etiqueta: 'Y', valores: [10,20,30,40] },
  { etiqueta: 'Z', valores: [5,5,6,7] },
]);
ok(d.puntos.length === 4 && d.nombres.join() === 'X,Y,Z', 'dispersión: 4 puntos y nombres');
ok(d.puntos.every(p => p[0] >= -1.7 && p[0] <= 1.7 && p[1] >= 0), 'coordenadas dentro del volumen');
lanzo = false; try { prepararDispersion([{ valores: [1,2,3] }, { valores: [1,2,3] }]); } catch { lanzo = true; }
ok(lanzo, 'dispersión exige tres series');

/* --- Senderos --- */
const se = prepararSenderos([{ etiqueta: 'C1', valores: [1,2,3] }, { etiqueta: 'C2', valores: [3,2,1] }]);
ok(se.length === 2 && se[0].puntos.length === 3, 'dos trayectorias de tres puntos');
ok(cerca(se[0].puntos[0][0], -2) && cerca(se[0].puntos[2][0], 2), 'eje de tiempo de −2 a 2');
ok(cerca(se[0].puntos[2][1], 2.6) && cerca(se[1].puntos[0][1], 2.6), 'escala Y común entre series');
ok(cerca(se[0].puntos[0][2], -0.45) && cerca(se[1].puntos[0][2], 0.45), 'series separadas en Z');

/* --- Ejemplos: todos parseables con los mínimos de su tipo --- */
const minimos = { barras: [1,1], torta: [2,1], boxplot: [1,5], dispersion: [3,3], sendero: [1,2] };
for (const [tipo, gen] of Object.entries(EJEMPLOS)) {
  const [ms, mn] = minimos[tipo];
  let pasa = true;
  try {
    const series = parseSeries(gen(), ms, mn);
    if (tipo === 'torta' && series.some(x => x.valores.length !== 1)) pasa = false;
    if (tipo === 'dispersion' && series.length < 3) pasa = false;
  } catch { pasa = false; }
  ok(pasa, `ejemplo «${tipo}» es válido para su propio tipo`);
}

process.exit(fallos ? 1 : 0);
