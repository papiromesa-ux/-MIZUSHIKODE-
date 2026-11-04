document.addEventListener('DOMContentLoaded', () => {
  // 1. Revisamos si hay música guardada en la memoria
  const estadoGuardado = JSON.parse(localStorage.getItem('ongaku_estado'));
  
  if (estadoGuardado && estadoGuardado.reproduciendo) {
    // Creamos el elemento de audio invisible
    const globalAudio = document.createElement('audio');
    globalAudio.id = 'global-audio';
    globalAudio.src = estadoGuardado.src;
    globalAudio.currentTime = estadoGuardado.tiempo;
    
    // Lo agregamos al HTML de forma invisible
    globalAudio.style.display = 'none';
    document.body.appendChild(globalAudio);

    // Intentar reproducir automáticamente
    globalAudio.play().catch((err) => {
      console.log("El navegador bloqueó el autoplay. El usuario debe darle play en la notificación de Android.", err);
    });

    // Guardar el progreso cada segundo para que no se pierda al navegar
    setInterval(() => {
      if (!globalAudio.paused) {
        const nuevoEstado = {
          reproduciendo: true,
          src: estadoGuardado.src,
          titulo: estadoGuardado.titulo,
          tiempo: globalAudio.currentTime
        };
        localStorage.setItem('ongaku_estado', JSON.stringify(nuevoEstado));
      }
    }, 1000);
  }
});
