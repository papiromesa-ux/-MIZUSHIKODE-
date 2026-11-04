document.addEventListener('DOMContentLoaded', () => {
  // --- NAVEGACIÓN DE PESTAÑAS (TABS) ---
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('active'));
      
      item.classList.add('active');
      const tabId = item.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // --- REPRODUCTOR PEQUEÑO Y GRANDE ---
  const audio = document.getElementById('audio-player');
  const btnPlay = document.getElementById('btn-play');
  const iconPlay = document.getElementById('icon-play');
  const trackTitle = document.getElementById('track-title');
  const trackArtist = document.getElementById('track-artist');
  const listaContainer = document.getElementById('lista-canciones');
  const progressFill = document.getElementById('progress-fill');
  const buscador = document.getElementById('buscador');

  const deezerPlayer = document.querySelector('.deezer-player');
  const fullPlayer = document.getElementById('full-player');
  const btnCloseFull = document.getElementById('btn-close-full');
  const fullTrackTitle = document.getElementById('full-track-title');
  const fullTrackArtist = document.getElementById('full-track-artist');
  const fullProgressFill = document.getElementById('full-progress-fill');
  const fullTimeCurrent = document.getElementById('full-time-current');
  const fullTimeTotal = document.getElementById('full-time-total');
  const btnPlayFull = document.getElementById('btn-play-full');
  const iconPlayFull = document.getElementById('icon-play-full');
  const btnPrevFull = document.getElementById('btn-prev-full');
  const btnNextFull = document.getElementById('btn-next-full');

  // Botones de acción
  const btnHeart = document.getElementById('btn-heart');
  const btnHeartFull = document.getElementById('btn-heart-full');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnRepeat = document.getElementById('btn-repeat');

  let currentTrackIndex = 0;
  let isPlaying = false;
  let isShuffle = false;
  let isRepeat = false;

  // Cargar Favoritos guardados en el celular
  let favoritos = JSON.parse(localStorage.getItem('ongaku_favs')) || [];

  // Base de datos de canciones
  const canciones = [
    { titulo: "MizushiKode (Himno Oficial)", src: "../musicaly/mizushikode.mp3" },
    { titulo: "Aeroe", src: "../musicaly/aeroe.mp3" },
    { titulo: "Dream", src: "../musicaly/dream.mp3" },
    { titulo: "Filesstack", src: "../musicaly/filesstack.mp3" },
    { titulo: "Malicia (For You Zalgert)", src: "../musicaly/malicia(for-you-zalgert).mp3" },
    { titulo: "Minor Watz", src: "../musicaly/minor-watz.mp3" },
    { titulo: "PWA (For You Zalgert)", src: "../musicaly/pwa(for-you-zalgert).mp3" },
    { titulo: "Sadcore", src: "../musicaly/sadcore.mp3" }
  ];
  for(let i=1; i<=5; i++) canciones.push({ titulo: `Piano ${i}`, src: `../musicaly/piano${i}.mp3` });
  canciones.push({ titulo: "Piano Sad 1", src: "../musicaly/pianosad1.mp3" });
  canciones.push({ titulo: "Piano Sad 2", src: "../musicaly/pianosad2.mp3" });
  canciones.push({ titulo: "Violin Sad 1", src: "../musicaly/violinsad1.mp3" });
  canciones.push({ titulo: "Violin Sad 2", src: "../musicaly/violinsad2.mp3" });
  for (let i = 1; i <= 80; i++) canciones.push({ titulo: `Pista de Estudio #${i}`, src: "../musicaly/mizushikode.mp3" });

  const artista = "ONGAKU Lofi";

  // --- FUNCIONES DE TIEMPO Y UI ---
  function formatearTiempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  function actualizarCorazones(tituloCancion) {
    const esFav = favoritos.includes(tituloCancion);
    if (esFav) {
      btnHeart.classList.add('active');
      btnHeartFull.classList.add('active');
    } else {
      btnHeart.classList.remove('active');
      btnHeartFull.classList.remove('active');
    }
  }

  // --- LÓGICA DE FAVORITOS ---
  function toggleFavorito() {
    const cancionActual = canciones[currentTrackIndex].titulo;
    if (favoritos.includes(cancionActual)) {
      favoritos = favoritos.filter(t => t !== cancionActual);
    } else {
      favoritos.push(cancionActual);
    }
    localStorage.setItem('ongaku_favs', JSON.stringify(favoritos));
    actualizarCorazones(cancionActual);
  }

  btnHeart.addEventListener('click', toggleFavorito);
  btnHeartFull.addEventListener('click', toggleFavorito);

  // --- LÓGICA DE ALEATORIO Y REPETIR ---
  btnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle('active', isShuffle);
  });

  btnRepeat.addEventListener('click', () => {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle('active', isRepeat);
  });

  // --- REPRODUCCIÓN ---
  function renderizarLista(listaParaMostrar = canciones) {
    listaContainer.innerHTML = '';
    if (listaParaMostrar.length === 0) {
      listaContainer.innerHTML = '<p style="color: var(--texto-dim); text-align: center; margin-top: 20px;">No se encontraron canciones.</p>';
      return;
    }
    listaParaMostrar.forEach((cancion) => {
      const indexOriginal = canciones.findIndex(c => c.titulo === cancion.titulo);
      const li = document.createElement('li');
      li.className = `cancion-item ${indexOriginal === currentTrackIndex ? 'activa' : ''}`;
      li.innerHTML = `
        <div class="track-num">${indexOriginal + 1}</div>
        <div class="track-name">
          <span class="title">${cancion.titulo}</span>
          <span class="artist">${artista}</span>
        </div>
      `;
      li.addEventListener('click', () => {
        cargarCancion(indexOriginal);
        reproducir();
      });
      listaContainer.appendChild(li);
    });
  }

  // Búsqueda
  buscador.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase().trim();
    const resultados = canciones.filter(c => c.titulo.toLowerCase().includes(texto));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="tab-favoritos"]').classList.add('active');
    document.getElementById('tab-favoritos').classList.add('active');
    const tituloLista = document.querySelector('#tab-favoritos .deezer-title');
    tituloLista.textContent = texto ? `Resultados: "${texto}"` : "Todas las Canciones";
    renderizarLista(resultados);
  });

  function cargarCancion(index) {
    currentTrackIndex = index;
    const cancion = canciones[currentTrackIndex];
    audio.src = cancion.src;
    
    trackTitle.textContent = cancion.titulo;
    trackArtist.textContent = artista;
    fullTrackTitle.textContent = cancion.titulo;
    fullTrackArtist.textContent = artista;

    actualizarCorazones(cancion.titulo);

    document.querySelectorAll('.cancion-item').forEach((el) => {
      const titleText = el.querySelector('.title').textContent;
      if (titleText === cancion.titulo) el.classList.add('activa');
      else el.classList.remove('activa');
    });
  }

  function reproducir() {
    if (!audio.src) cargarCancion(0);
    audio.play().then(() => {
      isPlaying = true;
      iconPlay.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`; 
      iconPlayFull.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`; 
    }).catch(err => console.error(err));
  }

  function pausar() {
    audio.pause();
    isPlaying = false;
    iconPlay.innerHTML = `<path d="M8 5v14l11-7z"/>`; 
    iconPlayFull.innerHTML = `<path d="M8 5v14l11-7z"/>`; 
  }

  function togglePlay() {
    if (isPlaying) pausar();
    else reproducir();
  }

  function siguienteCancion() {
    if (isShuffle) {
      // Reproducir una canción al azar
      currentTrackIndex = Math.floor(Math.random() * canciones.length);
    } else {
      // Reproducir la siguiente en orden
      currentTrackIndex = (currentTrackIndex + 1) % canciones.length;
    }
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
  btnPlayFull.addEventListener('click', togglePlay);
  btnNextFull.addEventListener('click', siguienteCancion);
  btnPrevFull.addEventListener('click', anteriorCancion);

  deezerPlayer.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    fullPlayer.classList.add('active');
  });

  btnCloseFull.addEventListener('click', () => {
    fullPlayer.classList.remove('active');
  });

  // Lógica cuando termina una canción
  audio.addEventListener('ended', () => {
    if (isRepeat) {
      audio.currentTime = 0;
      audio.play();
    } else {
      siguienteCancion();
    }
  });

  audio.addEventListener('timeupdate', () => {
    const porcentaje = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${porcentaje || 0}%`;
    fullProgressFill.style.width = `${porcentaje || 0}%`;
    fullTimeCurrent.textContent = formatearTiempo(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    fullTimeTotal.textContent = formatearTiempo(audio.duration);
  });

  // Inicializar
  renderizarLista();
  cargarCancion(0);
});
