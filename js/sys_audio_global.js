document.addEventListener('DOMContentLoaded', () => {
  // 1. Revisamos si hay música guardada en la memoria
  const estadoGuardado = JSON.parse(localStorage.getItem('ongaku_estado'));
  
  if (estadoGuardado && estadoGuardado.reproduciendo) {
    // Creamos el elemento de audio global
    const globalAudio = document.createElement('audio');
    globalAudio.id = 'global-audio';
    globalAudio.src = estadoGuardado.src;
    globalAudio.currentTime = estadoGuardado.tiempo;
    document.body.appendChild(globalAudio);

    // Creamos la interfaz flotante (el mini reproductor)
    const miniPlayer = document.createElement('div');
    miniPlayer.className = 'global-player';
    miniPlayer.innerHTML = `
      <div class="global-player-info">
        <span id="global-title">${estadoGuardado.titulo}</span>
        <span id="global-artist">ONGAKU</span>
      </div>
      <div class="global-player-controls">
        <button id="global-play-btn" class="global-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
        <a href="pages/musica.html" class="global-btn" style="text-decoration:none;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
        </a>
      </div>
    `;
    document.body.appendChild(miniPlayer);

    const btnGlobalPlay = document.getElementById('global-play-btn');
    let isPlayingGlobal = true;

    // Intentar reproducir automáticamente
    globalAudio.play().catch(() => {
      // Si el navegador bloquea el autoplay, mostramos el botón de Play
      isPlayingGlobal = false;
      btnGlobalPlay.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>`;
    });

    // Guardar el progreso cada segundo
    setInterval(() => {
      if (isPlayingGlobal) {
        const nuevoEstado = {
          reproduciendo: true,
          src: estadoGuardado.src,
          titulo: estadoGuardado.titulo,
          tiempo: globalAudio.currentTime
        };
        localStorage.setItem('ongaku_estado', JSON.stringify(nuevoEstado));
      }
    }, 1000);

    // Botón de Play/Pausa
    btnGlobalPlay.addEventListener('click', () => {
      if (isPlayingGlobal) {
        globalAudio.pause();
        isPlayingGlobal = false;
        btnGlobalPlay.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>`;
        const nuevoEstado = { ...estadoGuardado, reproduciendo: false };
        localStorage.setItem('ongaku_estado', JSON.stringify(nuevoEstado));
      } else {
        globalAudio.play();
        isPlayingGlobal = true;
        btnGlobalPlay.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
        const nuevoEstado = { ...estadoGuardado, reproduciendo: true };
        localStorage.setItem('ongaku_estado', JSON.stringify(nuevoEstado));
      }
    });
  }
});
