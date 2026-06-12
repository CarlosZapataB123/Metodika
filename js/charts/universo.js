/**
 * charts/universo.js — Motor de visualización 3D del Observatorio.
 *
 * Escena Three.js con estética de universo: campo de estrellas, niebla
 * exponencial, materiales emisivos y luces de color. Controles de órbita
 * propios (arrastre = rotación, rueda = zoom) y rotación automática
 * suave en reposo. Este módulo se importa dinámicamente: si el CDN de
 * Three.js no está disponible, el resto de la aplicación no se ve
 * afectado.
 */

import * as THREE from 'three';
import {
  sectoresTorta, prepararBarras, prepararBoxplot,
  prepararDispersion, prepararSenderos,
} from './universoDatos.js';

const FONDO = 0x050810;
const PALETA = [0x4fa3d1, 0x7fae8f, 0xd9a348, 0xd98591, 0x9b8fd9, 0x5fd1c0];

/* ===================================================================
   Observatorio: escena persistente + render del gráfico solicitado
   =================================================================== */

export function crearObservatorio(contenedor) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(FONDO);
  contenedor.append(renderer.domElement);

  const escena = new THREE.Scene();
  escena.fog = new THREE.FogExp2(FONDO, 0.022);

  const camara = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

  // Luces
  escena.add(new THREE.AmbientLight(0x223044, 1.6));
  const luz1 = new THREE.PointLight(0xbfd8ee, 90); luz1.position.set(6, 9, 6);
  const luz2 = new THREE.PointLight(0x1d4e6b, 60); luz2.position.set(-7, 4, -5);
  escena.add(luz1, luz2);

  // Campo de estrellas
  escena.add(estrellas(900, 45));

  // Suelo de referencia
  const rejilla = new THREE.GridHelper(10, 20, 0x2c3a4c, 0x16202e);
  rejilla.material.transparent = true;
  rejilla.material.opacity = 0.4;
  escena.add(rejilla);

  // Contenedor del gráfico actual
  const mundo = new THREE.Group();
  escena.add(mundo);

  // Órbita propia
  const orbita = { theta: 0.85, phi: 1.05, radio: 9, objetivo: new THREE.Vector3(0, 1.2, 0) };
  let arrastrando = false, ultX = 0, ultY = 0, reposo = 0;

  const lienzo = renderer.domElement;
  lienzo.style.touchAction = 'none';
  lienzo.addEventListener('pointerdown', (e) => {
    arrastrando = true; ultX = e.clientX; ultY = e.clientY;
    lienzo.setPointerCapture(e.pointerId);
  });
  lienzo.addEventListener('pointermove', (e) => {
    if (!arrastrando) return;
    orbita.theta -= (e.clientX - ultX) * 0.006;
    orbita.phi = Math.min(1.45, Math.max(0.25, orbita.phi - (e.clientY - ultY) * 0.006));
    ultX = e.clientX; ultY = e.clientY; reposo = 0;
  });
  lienzo.addEventListener('pointerup', () => { arrastrando = false; });
  lienzo.addEventListener('wheel', (e) => {
    e.preventDefault();
    orbita.radio = Math.min(22, Math.max(4, orbita.radio + e.deltaY * 0.01));
  }, { passive: false });

  // Tamaño reactivo
  const ajustar = () => {
    const ancho = contenedor.clientWidth || 320;
    const alto = contenedor.clientHeight || 380;
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  };
  const observador = new ResizeObserver(ajustar);
  observador.observe(contenedor);
  ajustar();

  // Bucle
  let vivo = true;
  (function animar() {
    if (!vivo) return;
    requestAnimationFrame(animar);
    reposo += 1;
    if (!arrastrando && reposo > 90) orbita.theta += 0.0022; // giro suave
    const { theta, phi, radio, objetivo } = orbita;
    camara.position.set(
      objetivo.x + radio * Math.sin(phi) * Math.sin(theta),
      objetivo.y + radio * Math.cos(phi),
      objetivo.z + radio * Math.sin(phi) * Math.cos(theta)
    );
    camara.lookAt(objetivo);
    renderer.render(escena, camara);
  })();

  /** Reemplaza el gráfico actual por el del tipo y datos dados. */
  function pintar(tipo, series) {
    vaciar(mundo);
    CONSTRUCTORES[tipo](mundo, series);
    reposo = 0;
  }

  function destruir() {
    vivo = false;
    observador.disconnect();
    vaciar(mundo);
    renderer.dispose();
    lienzo.remove();
  }

  return { pintar, destruir };
}

/* ===================================================================
   Constructores por tipo
   =================================================================== */

const CONSTRUCTORES = {
  barras(mundo, series) {
    const prep = prepararBarras(series);
    const cats = Math.max(...prep.map((s) => s.alturas.length));
    const esp = 0.95;
    const x0 = -((cats - 1) * esp) / 2;
    const z0 = -((prep.length - 1) * esp) / 2;

    prep.forEach((s, i) => {
      const color = PALETA[i % PALETA.length];
      s.alturas.forEach((h, j) => {
        const barra = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, h, 0.55),
          materialBrillo(color)
        );
        barra.position.set(x0 + j * esp, h / 2, z0 + i * esp);
        mundo.add(barra);
        mundo.add(texto(String(s.valores[j]), 0.34, '#cfd8e3')
          .translateX(x0 + j * esp).translateY(h + 0.28).translateZ(z0 + i * esp));
      });
      mundo.add(texto(s.nombre, 0.42, colorHex(color))
        .translateX(x0 + cats * esp * 0.62).translateY(0.15).translateZ(z0 + i * esp));
    });
    for (let j = 0; j < cats; j++) {
      mundo.add(texto(`C${j + 1}`, 0.34, '#7c8aa0')
        .translateX(x0 + j * esp).translateY(0.12).translateZ(z0 - esp));
    }
  },

  torta(mundo, series) {
    const valores = series.map((s) => s.valores[0]);
    const sectores = sectoresTorta(valores);
    const radio = 2.1;

    sectores.forEach((sec, i) => {
      const color = PALETA[i % PALETA.length];
      const alto = 0.35 + sec.proporcion * 0.9; // relieve proporcional
      const geo = new THREE.CylinderGeometry(
        radio, radio, alto, 48, 1, false, sec.inicio, sec.longitud
      );
      const malla = new THREE.Mesh(geo, materialBrillo(color));
      // Explosión: desplazar por la bisectriz del sector
      const bisectriz = sec.inicio + sec.longitud / 2;
      malla.position.set(
        Math.sin(bisectriz) * 0.12, alto / 2 + 0.02, Math.cos(bisectriz) * 0.12
      );
      mundo.add(malla);

      const et = `${series[i].etiqueta ?? 'Sector ' + (i + 1)} · ${(sec.proporcion * 100).toFixed(1)}%`;
      mundo.add(texto(et, 0.38, colorHex(color))
        .translateX(Math.sin(bisectriz) * (radio + 0.9))
        .translateY(alto + 0.5)
        .translateZ(Math.cos(bisectriz) * (radio + 0.9)));
    });
  },

  boxplot(mundo, series) {
    const { grupos, min, max } = prepararBoxplot(series);
    const esp = 1.5;
    const x0 = -((grupos.length - 1) * esp) / 2;

    grupos.forEach((g, i) => {
      const color = PALETA[i % PALETA.length];
      const x = x0 + i * esp;
      // Caja Q1–Q3
      const hCaja = Math.max(0.06, g.q3 - g.q1);
      const caja = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, hCaja, 0.7),
        materialBrillo(color, 0.55)
      );
      caja.position.set(x, g.q1 + hCaja / 2, 0);
      mundo.add(caja);
      // Mediana
      const mediana = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.035, 0.78),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      mediana.position.set(x, g.q2, 0);
      mundo.add(mediana);
      // Bigotes
      mundo.add(linea([x, g.bigoteInf, 0], [x, g.q1, 0], color));
      mundo.add(linea([x, g.q3, 0], [x, g.bigoteSup, 0], color));
      mundo.add(linea([x - 0.22, g.bigoteInf, 0], [x + 0.22, g.bigoteInf, 0], color));
      mundo.add(linea([x - 0.22, g.bigoteSup, 0], [x + 0.22, g.bigoteSup, 0], color));
      // Atípicos
      for (const y of g.atipicos) {
        const punto = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 12, 12),
          materialBrillo(0xd98591, 1, 0.9)
        );
        punto.position.set(x, y, 0);
        mundo.add(punto);
      }
      mundo.add(texto(g.nombre, 0.4, colorHex(color)).translateX(x).translateY(-0.35));
      mundo.add(texto(`Mdn ${g.crudos.q2.toFixed(1)}`, 0.3, '#cfd8e3')
        .translateX(x + 0.75).translateY(g.q2));
    });
    mundo.add(texto(String(min), 0.3, '#7c8aa0').translateX(x0 - 1.2).translateY(0));
    mundo.add(texto(String(max), 0.3, '#7c8aa0').translateX(x0 - 1.2).translateY(3.2));
  },

  dispersion(mundo, series) {
    const { puntos, nombres } = prepararDispersion(series);
    const geoEsfera = new THREE.SphereGeometry(0.06, 10, 10);
    puntos.forEach(([x, y, z], i) => {
      const malla = new THREE.Mesh(
        geoEsfera, materialBrillo(PALETA[0], 1, 0.85)
      );
      malla.position.set(x, y, z);
      mundo.add(malla);
    });
    // Ejes
    const L = 1.9;
    mundo.add(linea([-L, 0, 0], [L, 0, 0], 0x3c4a5c));
    mundo.add(linea([0, 0, 0], [0, 2 * L, 0], 0x3c4a5c));
    mundo.add(linea([0, 0, -L], [0, 0, L], 0x3c4a5c));
    mundo.add(texto(nombres[0], 0.36, '#9db4cc').translateX(L + 0.5).translateY(0.1));
    mundo.add(texto(nombres[1], 0.36, '#9db4cc').translateY(2 * L + 0.35));
    mundo.add(texto(nombres[2], 0.36, '#9db4cc').translateZ(L + 0.5).translateY(0.1));
  },

  sendero(mundo, series) {
    const sendas = prepararSenderos(series);
    sendas.forEach((s, i) => {
      const color = PALETA[i % PALETA.length];
      const vectores = s.puntos.map(([x, y, z]) => new THREE.Vector3(x, y, z));
      if (vectores.length >= 2) {
        const curva = new THREE.CatmullRomCurve3(vectores);
        const tubo = new THREE.Mesh(
          new THREE.TubeGeometry(curva, vectores.length * 8, 0.035, 8),
          materialBrillo(color, 1, 0.6)
        );
        mundo.add(tubo);
      }
      for (const [x, y, z] of s.puntos) {
        const nodo = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 10, 10), materialBrillo(color, 1, 0.9)
        );
        nodo.position.set(x, y, z);
        mundo.add(nodo);
      }
      const fin = s.puntos.at(-1);
      mundo.add(texto(s.nombre, 0.36, colorHex(color))
        .translateX(fin[0] + 0.55).translateY(fin[1] + 0.2).translateZ(fin[2]));
    });
    mundo.add(texto('tiempo →', 0.32, '#7c8aa0').translateX(1.6).translateY(-0.3));
  },
};

/* ===================================================================
   Utilidades de escena
   =================================================================== */

function estrellas(n, radio) {
  const posiciones = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = radio * (0.5 + Math.random() * 0.5);
    const t = Math.random() * 2 * Math.PI;
    const p = Math.acos(2 * Math.random() - 1);
    posiciones[i * 3] = r * Math.sin(p) * Math.cos(t);
    posiciones[i * 3 + 1] = r * Math.cos(p) * 0.7 + 4;
    posiciones[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0x9db8d8, size: 0.09, transparent: true, opacity: 0.85,
    depthWrite: false, sizeAttenuation: true,
  }));
}

function materialBrillo(color, opacidad = 1, emision = 0.45) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: emision,
    roughness: 0.35,
    metalness: 0.15,
    transparent: opacidad < 1,
    opacity: opacidad,
  });
}

function linea(a, b, color) {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...a), new THREE.Vector3(...b),
  ]);
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color }));
}

/** Sprite de texto vía canvas (etiquetas en el espacio). */
function texto(cadena, escala = 0.4, color = '#cfd8e3') {
  const lienzo = document.createElement('canvas');
  const ctx = lienzo.getContext('2d');
  const fuente = "500 48px 'IBM Plex Sans', sans-serif";
  ctx.font = fuente;
  const ancho = Math.ceil(ctx.measureText(cadena).width) + 24;
  lienzo.width = ancho;
  lienzo.height = 64;
  ctx.font = fuente;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(cadena, 12, 34);
  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: textura, transparent: true, depthWrite: false,
  }));
  sprite.scale.set((ancho / 64) * escala, escala, 1);
  return sprite;
}

const colorHex = (c) => '#' + c.toString(16).padStart(6, '0');

function vaciar(grupo) {
  while (grupo.children.length) {
    const hijo = grupo.children.pop();
    hijo.traverse?.((n) => {
      n.geometry?.dispose();
      if (n.material) {
        (Array.isArray(n.material) ? n.material : [n.material]).forEach((m) => {
          m.map?.dispose();
          m.dispose();
        });
      }
    });
    grupo.remove(hijo);
  }
}
