import { normalCdf, tCdf, fCdf, chi2Cdf } from '../js/stats/distribuciones.js';
import { tIndependiente, tPareada, anovaUnFactor, chiCuadrado, pearson, spearman, mannWhitney, kruskalWallis, magnitud } from '../js/stats/pruebas.js';
import { dagostinoK2, brownForsythe } from '../js/stats/supuestos.js';
import { alfaCronbach } from '../js/stats/confiabilidad.js';

let fallos = 0;
const cerca = (a, b, tol = 1e-3) => Math.abs(a - b) < tol;
const ok = (c, n) => { console.log((c ? 'OK   ' : 'FALLO') + ' ' + n); if (!c) fallos++; };

/* --- CDFs contra cuantiles de referencia (tablas/R) --- */
ok(cerca(normalCdf(1.959964), 0.975, 1e-5), 'Φ(1.95996) = .975');
ok(cerca(tCdf(2.063899, 24), 0.975, 1e-5), 't: P(T≤2.0639, 24gl) = .975');
ok(cerca(tCdf(1.812461, 10), 0.95, 1e-5), 't: P(T≤1.8125, 10gl) = .95');
ok(cerca(fCdf(4.256495, 2, 9), 0.95, 1e-5), 'F: P(F≤4.2565; 2,9) = .95');
ok(cerca(chi2Cdf(3.841459, 1), 0.95, 1e-5), 'χ²: P(X≤3.8415, 1gl) = .95');
ok(cerca(chi2Cdf(16.918978, 9), 0.95, 1e-5), 'χ²: P(X≤16.919, 9gl) = .95');

/* --- t independiente: caso verificable a mano --- */
// a = [1,2,3,4,5] (m=3, v=2.5); b = [3,4,5,6,7] (m=5, v=2.5)
// sp²=2.5, t = -2/√(2.5·0.4) = -2/1 = -2, gl=8, p = 2(1-tCdf(2,8)) ≈ .0805
const ti = tIndependiente([1,2,3,4,5], [3,4,5,6,7]);
ok(cerca(ti.student.t, -2) && ti.student.gl === 8, 't Student: t=-2, gl=8');
ok(cerca(ti.student.p, 0.0805, 1e-3), 't Student: p≈.0805');
ok(cerca(ti.d, -2 / Math.sqrt(2.5), 1e-6), 'd de Cohen = -1.2649');

/* --- t pareada --- */
// pre=[10,12,14], post=[12,15,16] → dif=[2,3,2], m=2.333, sd=0.5774, t=7.0, gl=2, p≈.0198
const tp = tPareada([10,12,14],[12,15,16]);
ok(cerca(tp.t, 7.0, 1e-3) && cerca(tp.p, 0.0198, 1e-3), 't pareada: t=7.00, p≈.0198');

/* --- ANOVA: ejemplo a mano --- */
// g1=[1,2,3], g2=[2,3,4], g3=[5,6,7] → medias 2,3,6; gran=11/3
// SCE = 3[(2-3.667)²+(3-3.667)²+(6-3.667)²] = 3[2.778+0.444+5.444] = 26
// SCD = 2+2+2 = 6; F = (26/2)/(6/6) = 13; gl 2,6; p = 1-fCdf(13,2,6) ≈ .00655
const an = anovaUnFactor([[1,2,3],[2,3,4],[5,6,7]]);
ok(cerca(an.F, 13, 1e-6) && cerca(an.p, 0.00655, 1e-4), 'ANOVA: F=13, p≈.0066');
ok(cerca(an.eta2, 26/32, 1e-6), 'η² = .8125');

/* --- Chi-cuadrado 2×2 con fórmula directa --- */
// [[10,20],[20,10]] → χ² = 60(100-400)²/30⁴ = 6.667, gl=1, p≈.0098, V=.333
const x2 = chiCuadrado([[10,20],[20,10]]);
ok(cerca(x2.x2, 6.6667, 1e-3) && cerca(x2.p, 0.00982, 1e-4), 'χ²=6.667, p≈.0098');
ok(cerca(x2.v, 1/3, 1e-4), 'V de Cramér = .333');

/* --- Pearson y Spearman --- */
// x=1..5, y=[2,4,5,4,5]: sxy=6, sxx=10, syy=6 → r=6/√60=.7746
// t = .7746√(3/.4) = 2.121, p(3gl) ≈ .124
const pe = pearson([1,2,3,4,5],[2,4,5,4,5]);
ok(cerca(pe.r, 0.7746, 1e-4) && cerca(pe.p, 0.1241, 1e-3), 'Pearson r=.7746, p≈.124');
const sp = spearman([1,2,3,4,5],[1,4,9,16,25]);
ok(cerca(sp.rho, 1, 1e-9), 'Spearman: monotónica perfecta → ρ=1');

/* --- Mann-Whitney --- */
// a=[1,2,3], b=[4,5,6]: U=0; σ=√(9·7/12)=2.2913; z=(4.5-0.5)/2.2913=1.7457; p≈.0809
const mw = mannWhitney([1,2,3],[4,5,6]);
ok(mw.U === 0 && cerca(mw.p, 0.0809, 1e-3), 'Mann-Whitney: U=0, p≈.081 (aprox.)');
ok(cerca(mw.rbc, 1, 1e-9), 'rango-biserial = 1 (separación total)');

/* --- Kruskal-Wallis sin empates --- */
// [[1,2],[3,4],[5,6]]: rangos 1..6; H = 12/(6·7)·(Σ R²/n) − 3·7
// R: (3)²/2+(7)²/2+(11)²/2 = 4.5+24.5+60.5=89.5 → H = 2/7·89.5 − 21 = 4.571, gl=2, p≈.1017
const kw = kruskalWallis([[1,2],[3,4],[5,6]]);
ok(cerca(kw.H, 4.5714, 1e-3) && cerca(kw.p, 0.1017, 1e-3), 'Kruskal-Wallis: H=4.571, p≈.102');

/* --- Supuestos --- */
// Datos ~normales: p alta; datos muy asimétricos: p baja
const normalitos = [4.2,5.1,4.8,5.5,4.9,5.2,4.7,5.0,5.3,4.6,5.1,4.95,5.05,4.85,5.15,4.75,5.25,4.9,5.1,5.0];
const sesgados = [1,1,1,1,2,2,2,3,3,4,5,7,9,14,20,30,45,70,110,200];
ok(dagostinoK2(normalitos).p > 0.05, 'K²: datos simétricos no rechazan normalidad');
ok(dagostinoK2(sesgados).p < 0.01, 'K²: datos sesgados rechazan normalidad');
ok(dagostinoK2([1,2,3]) === null, 'K²: null con n<8');

const bfIgual = brownForsythe([[1,2,3,4,5],[11,12,13,14,15]]);
ok(bfIgual.p > 0.5, 'Brown-Forsythe: varianzas iguales → p alta');
const bfDist = brownForsythe([[5,5.1,4.9,5.05,4.95],[1,10,2,9,0,11]]);
ok(bfDist.p < 0.05, 'Brown-Forsythe: varianzas muy distintas → p baja');

/* --- Alfa de Cronbach: cálculo a mano --- */
// matriz 4×3: [[1,2,1],[2,3,2],[3,4,3],[4,5,4]]
// var ítems = 5/3 cada uno → Σ=5; totales=[4,7,10,13], var=15
// α = 3/2 · (1 − 5/15) = 1.0
const ac = alfaCronbach([[1,2,1],[2,3,2],[3,4,3],[4,5,4]]);
ok(cerca(ac.alfa, 1.0, 1e-9), 'α de Cronbach = 1.0 (ítems paralelos perfectos)');

/* --- Magnitudes --- */
ok(magnitud('d', 0.55) === 'mediano' && magnitud('eta2', 0.15) === 'grande', 'umbrales de Cohen');

process.exit(fallos ? 1 : 0);
