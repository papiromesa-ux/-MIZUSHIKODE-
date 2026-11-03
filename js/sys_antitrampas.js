export const GRACIA_MS = 2000; // Reducido a 2 segundos para ser más estricto
export const MAX_AVISOS = 1;   // 1 solo aviso, a la segunda te expulsa

export function crearMotor(opts = {}) {
  const gracia = opts.gracia ?? GRACIA_MS;
  const maxAvisos = opts.maxAvisos ?? MAX_AVISOS;
  const ahora = opts.ahora ?? (() => Date.now());
  const setT = opts.setT ?? ((f, ms) => setTimeout(f, ms));
  const clearT = opts.clearT ?? ((id) => clearTimeout(id));
  const alAviso = opts.alAviso ?? (() => {});
  const alExpulsar = opts.alExpulsar ?? (() => {});

  let activo = false, expulsado = false, avisos = 0, sospecha = null, ultimoCierre = -1e9;

  function expulsar(motivo) {
    if (expulsado) return;
    expulsado = true;
    if (sospecha) { clearT(sospecha.timer); sospecha = null; }
    activo = false;
    alExpulsar({ motivo, avisos });
  }

  function abrir(motivo, duro) {
    if (sospecha) return;
    
    // Si es un fallo muy grave (cambio de pestaña), no damos aviso, expulsamos ya
    if (duro) {
      expulsar(motivo);
      return;
    }

    const rebote = ahora() - ultimoCierre < 1000;
    if (!rebote) avisos++;
    if (avisos > maxAvisos) { expulsar(motivo + "-reincidente"); return; }
    
    const s = { motivo, duro, inicio: ahora(), timer: null };
    // Si no vuelve en 2 segundos, lo expulsamos
    s.timer = setT(() => expulsar(s.motivo), gracia);
    sospecha = s;
    alAviso({ motivo, graciaMs: gracia, avisos, max: maxAvisos });
  }

  function cerrar() {
    if (!sospecha) return;
    const s = sospecha;
    sospecha = null;
    clearT(s.timer);
    ultimoCierre = ahora();
    
    // Calculamos el tiempo real que pasó (incluso si el celular congeló la pantalla)
    const transcurrido = ahora() - s.inicio;
    if (transcurrido >= gracia) { 
      expulsar(s.motivo); 
      return; 
    }
  }

  return {
    activar() { activo = true; expulsado = false; if (sospecha) { clearT(sospecha.timer); sospecha = null; } },
    desactivar() { activo = false; if (sospecha) { clearT(sospecha.timer); sospecha = null; } },
    expulsarYa(motivo) { if (activo) expulsar(motivo); },
    evaluar(p) {
      if (!activo || expulsado) return;
      
      // SI LA PANTALLA ESTÁ OCULTA (CAMBIO DE APP/PESTAÑA) -> EXPULSIÓN INMEDIATA
      if (!p.visible) { 
        abrir("multitarea", true); 
        return; 
      }
      
      // SI SE REDUJO LA PANTALLA (PANTALLA DIVIDIDA) -> EXPULSIÓN INMEDIATA
      if (p.reducido) { 
        abrir("ventana-dividida", true); 
        return; 
      }
      
      // SI PIERDE EL FOCO (SE ABRE EL ASISTENTE O BARRA DE NOTIFICACIONES)
      if (!p.enfocado) {
        abrir("ventana", false); // Da 2 segundos de gracia
        return;
      }
      
      // Si todo está bien, cierra la sospecha
      cerrar();
    }
  };
}

export function conectarDOM(motor, cfg = {}) {
  const doc = cfg.doc ?? document;
  const win = cfg.win ?? window;
  const intervaloMs = cfg.intervaloMs ?? 300; // Revisa 3 veces por segundo
  const limpiar = [];

  let baseAlto = doc.documentElement.clientHeight;
  let baseAncho = doc.documentElement.clientWidth;

  function presencia() {
    const r = doc.documentElement;
    const alto = r.clientHeight || win.innerHeight;
    const ancho = r.clientWidth || win.innerWidth;
    
    // Detecta si la pantalla se volvió a la mitad (pantalla dividida)
    const reducido = baseAlto > 0 && (alto < baseAlto * 0.75 || ancho < baseAncho * 0.75);

    return {
      visible: doc.visibilityState !== "hidden",
      enfocado: typeof doc.hasFocus === "function" ? doc.hasFocus() : true,
      reducido: reducido
    };
  }

  const evaluar = () => motor.evaluar(presencia());

  // Escuchas de eventos críticos
  doc.addEventListener("visibilitychange", evaluar);
  win.addEventListener("blur", evaluar);
  win.addEventListener("focus", evaluar);
  win.addEventListener("resize", evaluar);
  win.addEventListener("pagehide", () => motor.evaluar({ visible: false, enfocado: false, reducido: false }));

  // Sondeo constante (por si el navegador oculta los eventos)
  const sondeo = setInterval(evaluar, intervaloMs);
  limpiar.push(() => clearInterval(sondeo));

  // Bloquear clic derecho e inspección
  doc.addEventListener("contextmenu", (e) => { if (motor.estaActivo && motor.estaActivo()) { e.preventDefault(); motor.expulsarYa("menu-contextual"); } });
  doc.addEventListener("keydown", (e) => {
    const k = String(e.key || "").toLowerCase();
    if (k === "f12" || (e.ctrlKey && e.shiftKey && k === "i") || (e.ctrlKey && k === "u")) {
      e.preventDefault(); motor.expulsarYa("inspector");
    }
  });

  return { evaluar, desconectar() { limpiar.splice(0).forEach((f) => f()); } };
}

export function crearAntiTrampas(opts = {}) {
  const motor = crearMotor({
    gracia: opts.graciaMs,
    maxAvisos: opts.maxAvisos,
    alAviso: () => {}, // Ignoramos el aviso visual, vamos directo al bloqueo
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
