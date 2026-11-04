export const GRACIA_MS = 2000;
export const MAX_AVISOS = 1;

export function crearMotor(opts = {}) {
  const gracia = opts.gracia ?? GRACIA_MS;
  const ahora = opts.ahora ?? (() => Date.now());
  const setT = opts.setT ?? ((f, ms) => setTimeout(f, ms));
  const clearT = opts.clearT ?? ((id) => clearTimeout(id));
  const alExpulsar = opts.alExpulsar ?? (() => {});

  let activo = false, expulsado = false, sospecha = null, ultimoLatido = 0;

  function expulsar(motivo) {
    if (expulsado) return;
    expulsado = true;
    if (sospecha) { clearT(sospecha.timer); sospecha = null; }
    activo = false;
    alExpulsar({ motivo });
  }

  function abrir(motivo, duro) {
    if (sospecha || expulsado) return;
    if (duro) { expulsar(motivo); return; }
    const s = { motivo, inicio: ahora(), timer: null };
    s.timer = setT(() => expulsar(s.motivo), gracia);
    sospecha = s;
  }

  function cerrar() {
    if (!sospecha) return;
    const s = sospecha;
    sospecha = null;
    clearT(s.timer);
    if (ahora() - s.inicio >= gracia) { expulsar(s.motivo); }
  }

  return {
    activar() { activo = true; expulsado = false; ultimoLatido = ahora(); },
    desactivar() { activo = false; if (sospecha) { clearT(sospecha.timer); sospecha = null; } },
    expulsarYa(motivo) { if (activo) expulsar(motivo); },
    evaluar(p) {
      if (!activo || expulsado) return;
      
      // 1. Si la pantalla no está visible, expulsión inmediata
      if (!p.visible) { abrir("multitarea", true); return; }
      
      // 2. Si la ventana se redujo (pantalla dividida), expulsión inmediata
      if (p.reducido) { abrir("ventana-dividida", true); return; }
      
      // 3. Si pierde el foco
      if (!p.enfocado) { abrir("ventana", false); return; }
      
      // 4. El detector de congelamiento: Si pasan más de 2.5s sin latido, expulsión
      const tiempoSinLatido = ahora() - ultimoLatido;
      if (tiempoSinLatido > 1000) {
        abrir("multitarea", true);
        return;
      }
      ultimoLatido = ahora(); // Actualizamos el latido
      
      cerrar();
    }
  };
}

export function conectarDOM(motor, cfg = {}) {
  const doc = cfg.doc ?? document;
  const win = cfg.win ?? window;
  const intervaloMs = 200; // Revisa 5 veces por segundo
  let baseAlto = doc.documentElement.clientHeight;
  let baseAncho = doc.documentElement.clientWidth;

  function presencia() {
    const r = doc.documentElement;
    const alto = r.clientHeight || win.innerHeight;
    const ancho = r.clientWidth || win.innerWidth;
    const reducido = baseAlto > 0 && (alto < baseAlto * 0.75 || ancho < baseAncho * 0.75);

    return {
      visible: doc.visibilityState !== "hidden",
      enfocado: typeof doc.hasFocus === "function" ? doc.hasFocus() : true,
      reducido: reducido
    };
  }

  const evaluar = () => motor.evaluar(presencia());

  doc.addEventListener("visibilitychange", evaluar);
  win.addEventListener("blur", evaluar);
  win.addEventListener("focus", evaluar);
  win.addEventListener("resize", evaluar);
  win.addEventListener("pagehide", () => motor.evaluar({ visible: false, enfocado: false, reducido: false }));

  const sondeo = setInterval(evaluar, intervaloMs);
  return { evaluar, desconectar() { clearInterval(sondeo); } };
}

export function crearAntiTrampas(opts = {}) {
  const motor = crearMotor({
    gracia: opts.graciaMs,
    alExpulsar: opts.alExpulsar ?? (({ motivo }) => { window.location.href = `bloqueo.html?motivo=${encodeURIComponent(motivo)}`; })
  });
  const dom = conectarDOM(motor);
  return {
    motor,
    activar() { dom.evaluar(); motor.activar(); },
    desactivar() { motor.desactivar(); },
    expulsarYa(m) { motor.expulsarYa(m); },
    desconectar() { dom.desconectar(); }
  };
}
