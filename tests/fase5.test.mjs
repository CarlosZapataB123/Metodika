import { regresionLineal } from '../js/stats/pruebas.js';
import { histograma, cuartiles, densidadNormal } from '../js/stats/descriptivos.js';
import { parseCSV, columnasATexto } from '../js/ui/csv.js';

let fallos = 0;
const cerca = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;
const ok = (c, n) => { console.log((c ? 'OK   ' : 'FALLO') + ' ' + n); if (!c) fallos++; };

/* --- Regresión lineal: x=1..5, y=[2,4,5,4,5] → b1=.6, b0=2.2, r²=.6 --- */
const r = regresionLineal([1,2,3,4,5],[2,4,5,4,5]);
ok(cerca(r.b1, 0.6) && cerca(r.b0, 2.2), 'regresión: b0=2.2, b1=0.6');
ok(cerca(r.r2, 0.6), 'regresión: r² = .60 (coincide con r de Pearson²)');
ok(cerca(r.p, 0.1241, 1e-3), 'regresión: p de la pendiente = p de r (.124)');

/* --- Histograma de Sturges --- */
const h = histograma([1,2,3,4,5,6,7,8]);
ok(h.bins.length === 4 && h.bins.reduce((a,b)=>a+b.n,0) === 8, 'Sturges: 8 datos → 4 intervalos, conteo completo');
ok(h.bins.at(-1).n >= 1, 'el máximo cae en el último intervalo (borde inclusivo)');

/* --- Cuartiles tipo 7 (como R): 1..9 → Q1=3, Q2=5, Q3=7 --- */
const q = cuartiles([1,2,3,4,5,6,7,8,9]);
ok(q.q1 === 3 && q.q2 === 5 && q.q3 === 7, 'cuartiles tipo 7 sobre 1..9');

/* --- Densidad normal estándar en 0 = 0.39894 --- */
ok(cerca(densidadNormal(0, 0, 1), 0.3989423, 1e-6), 'φ(0) = .39894');

/* --- CSV: delimitador coma --- */
const c1 = parseCSV('Control,Intervencion\n12,16\n15,18\n11,15');
ok(c1.length === 2 && c1[0].nombre === 'Control' && c1[0].valores.join() === '12,15,11', 'CSV coma: 2 columnas correctas');

/* --- CSV europeo: punto y coma + coma decimal --- */
const c2 = parseCSV('X;Y\n1,5;10,2\n2,5;14,8');
ok(cerca(c2[0].valores[0], 1.5) && cerca(c2[1].valores[1], 14.8), 'CSV europeo: coma decimal convertida');

/* --- Vertido al formato del laboratorio --- */
ok(columnasATexto(c1, 'gruposContinua') === 'Control: 12, 15, 11\nIntervencion: 16, 18, 15', 'vertido gruposContinua');
ok(columnasATexto(c2, 'correlacion').startsWith('X: 1.5'), 'vertido correlacion');
ok(columnasATexto(c1, 'prePost') === 'Pre: 12, 15, 11\nPost: 16, 18, 15', 'vertido prePost');
ok(columnasATexto(c1, 'matriz') === '12, 16\n15, 18\n11, 15', 'vertido matriz (alfa): filas reconstruidas');

/* --- CSV con celdas vacías y filas cortas no rompe --- */
const c3 = parseCSV('A,B\n1,2\n3,\n5,6');
ok(c3[0].valores.length === 3 && c3[1].valores.length === 2, 'celdas vacías omitidas sin error');

process.exit(fallos ? 1 : 0);
