/**
 * tema.js — Alternador de tema claro/oscuro.
 *
 * Módulo autónomo: lee/escribe el atributo data-tema en <html> y
 * persiste la preferencia. Sin preferencia guardada, los tokens CSS
 * siguen a prefers-color-scheme del sistema. Si este módulo se
 * elimina, la aplicación funciona igual.
 */

const CLAVE = 'metodika.tema';

const guardada = () => {
  try { return localStorage.getItem(CLAVE); } catch { return null; }
};

const efectivo = () =>
  document.documentElement.dataset.tema ??
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro');

export function iniciarTema(boton) {
  const previa = guardada();
  if (previa) document.documentElement.dataset.tema = previa;
  pintar(boton);

  boton.addEventListener('click', () => {
    const nuevo = efectivo() === 'oscuro' ? 'claro' : 'oscuro';
    document.documentElement.dataset.tema = nuevo;
    try { localStorage.setItem(CLAVE, nuevo); } catch { /* sin persistencia */ }
    pintar(boton);
    // Notificar a quien dibuje con colores computados (gráficos)
    document.dispatchEvent(new CustomEvent('temacambiado'));
  });
}

function pintar(boton) {
  const oscuro = efectivo() === 'oscuro';
  boton.textContent = oscuro ? '◑' : '◐';
  boton.setAttribute(
    'aria-label',
    oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
  );
  boton.title = boton.getAttribute('aria-label');
}
