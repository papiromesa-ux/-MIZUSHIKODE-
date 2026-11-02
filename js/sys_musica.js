document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio-player');
  const btnPlay = document.getElementById('btn-play');
  const iconPlay = document.getElementById('icon-play');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const trackTitle = document.getElementById('track-title');
  const trackArtist = document.getElementById('track-artist');
  const listaContainer = document.getElementById('lista-canciones');
  const progressFill = document.getElementById('progress-fill');
  const progressBg = document.getElementById('progress-bg');
  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');

  let currentTrackIndex = 0;
  let isPlaying = false;

  // --- BASE DE DATOS DE CANCIONES (100 PISTAS) ---
  // Aquí es donde Karleotty meterá los enlaces reales.
  // Por ahora usamos un audio de prueba libre de derechos para que veas que funciona.
  const canciones = [];
  const audioPrueba = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  
  for (let i = 1; i <= 100; i++) {
    canciones.push({
      id: i,
      titulo: `Pista de Estudio #${i}`,
      artista: "MizushiKode Lofi",
      src: audioPrueba // Reemplazar con el enlace real de cada canción
    });
  }

  // --- FUNCIONES ---

  function formatearTiempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  function renderizarLista() {
    listaContainer.innerHTML = '';
    canciones.forEach((cancion, index) => {
      const li = document.createElement('li');
      li.className = `cancion-item ${index === currentTrackIndex ? 'activa' : ''}`;
      li.innerHTML = `
        <span>${cancion.titulo}</span>
        <span>${cancion.artista}</span>
      `;
      li.addEventListener('click', () => {
        cargarCancion(index);
        reproducir();
      });
      listaContainer.appendChild(li);
    });
  }

  function cargarCancion(index) {
    currentTrackIndex = index;
    const cancion = canciones[currentTrackIndex];
    
    audio.src = cancion.src;
    trackTitle.textContent = cancion.titulo;
    trackArtist.textContent = cancion.artista;

    // Resaltar en la lista
    document.querySelectorAll('.cancion-item').forEach((el, i) => {
      if (i === currentTrackIndex) el.classList.add('activa');
      else el.classList.remove('activa');
    });
  }

  function reproducir() {
    if (!audio.src) cargarCancion(0);
    
    audio.play().then(() => {
      isPlaying = true;
      iconPlay.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`; // Icono de Pausa
    }).catch(err => {
      console.error("Error al reproducir:", err);
    });
  }

  function pausar() {
    audio.pause();
    isPlaying = false;
    iconPlay.innerHTML = `<path d="M8 5v14l11-7z"/>`; // Icono de Play
  }

  function togglePlay() {
    if (isPlaying) pausar();
    else reproducir();
  }

  function siguienteCancion() {
    currentTrackIndex = (currentTrackIndex + 1) % canciones.length;
    cargarCancion(currentTrackIndex);
    if (isPlaying) reproducir();
  }

  function anteriorCancion() {
    currentTrackIndex = (currentTrackIndex - 1 + canciones.length) % canciones.length;
    cargarCancion(currentTrackIndex);
    if (isPlaying) reproducir();
  }

  // --- EVENTOS ---

  btnPlay.addEventListener('click', togglePlay);
  btnNext.addEventListener('click', siguienteCancion);
  btnPrev.addEventListener('click', anteriorCancion);

  // Actualizar barra de progreso
  audio.addEventListener('timeupdate', () => {
    const porcentaje = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${porcentaje || 0}%`;
    timeCurrent.textContent = formatearTiempo(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatearTiempo(audio.duration);
  });

  audio.addEventListener('ended', siguienteCancion);

  // Clic en la barra de progreso para saltar
  progressBg.addEventListener('click', (e) => {
    const rect = progressBg.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (audio.duration) {
      audio.currentTime = pos * audio.duration;
    }
  });

  // Inicializar
  renderizarLista();
  cargarCancion(0);
});
