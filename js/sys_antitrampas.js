// /// SISTEMA ANTI-TRAMPA DEEPSEEK (MODO ESTRICTO) \\\

export function crearAntiTrampas(opts = {}) {
  let infractor = false;
  let tiempoSalida = 0;
  const TIEMPO_LIMITE = 2000; // 2 segundos máximo fuera de la pantalla

  // Función que te manda a la pantalla de bloqueo
  function expulsar(motivo) {
    if (infractor) return;
    infractor = true;
    window.location.href = `bloqueo.html?motivo=${encodeURIComponent(motivo)}`;
  }

  // 1. Detector de Visibilidad y Foco
  function evaluarEstado() {
    if (infractor) return;

    // Si la página está oculta (cambió de pestaña o app)
    if (document.hidden) {
      if (!tiempoSalida) tiempoSalida = Date.now();
      return;
    }

    // Si la ventana no tiene el foco (abrió el teclado, menú, etc.)
    if (!document.hasFocus()) {
      if (!tiempoSalida) tiempoSalida = Date.now();
      return;
    }

    // Si volvió a la página, revisamos cuánto tiempo estuvo fuera
    if (tiempoSalida) {
      const tiempoFuera = Date.now() - tiempoSalida;
      if (tiempoFuera > TIEMPO_LIMITE) {
        expulsar("multitarea");
        return;
      }
      tiempoSalida = 0; // Si volvió rápido, perdonamos
    }
  }

  // 2. Detector de Congelamiento (El anti-Android definitivo)
  let ultimoLatido = Date.now();
  setInterval(() => {
    if (infractor) return;
    const ahora = Date.now();
    const diferencia = ahora - ultimoLatido;
    
    // Si el intervalo se retrasó más de 2.5 segundos, el celular congeló la página
    if (diferencia > 2500) {
      expulsar("multitarea");
      return;
    }
    ultimoLatido = ahora;
  }, 300); // Revisa cada 0.3 segundos

  // 3. Escuchas de eventos
  document.addEventListener("visibilitychange", evaluarEstado);
  window.addEventListener("blur", evaluarEstado);
  window.addEventListener("focus", evaluarEstado);
  
  // Bloquear clic derecho e inspección
  document.addEventListener("contextmenu", (e) => { e.preventDefault(); expulsar("menu-contextual"); });
  document.addEventListener("keydown", (e) => {
    const k = String(e.key || "").toLowerCase();
    if (k === "f12" || (e.ctrlKey && e.shiftKey && k === "i") || (e.ctrlKey && k === "u")) {
      e.preventDefault(); expulsar("inspector");
    }
  });

  return {
    activar() { infractor = false; tiempoSalida = 0; ultimoLatido = Date.now(); },
    desactivar() { infractor = true; }
  };
}
