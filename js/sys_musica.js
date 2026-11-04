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

  // --- LÓGICA DEL REPRODUCTOR ---
  const audio = document.getElementById('audio-player');
  const btnPlay = document.getElementById('btn-play');
  const iconPlay = document.getElementById('icon-play');
  const trackTitle = document.getElementById('track-title');
  const trackArtist = document.getElementById('track-artist');
  const listaContainer = document.getElementById('lista-canciones');
  const progressFill = document.getElementById('progress-fill');
  const buscador = document.getElementById('buscador');

  let currentTrackIndex = 0;
  let isPlaying = false;

  // Base de datos de canciones (17 reales + relleno de prueba)
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

  for (let i = 1; i <= 80; i++) {
    canciones.push({ titulo: `Pista de Estudio #${i}`, src: "../musicaly/mizushikode.mp3" });
  }

  const artista = "ONGAKU Lofi";

  // Función para renderizar la lista (ahora acepta un filtro)
  function renderizarLista(listaParaMostrar = canciones) {
    listaContainer.innerHTML = '';
    
    if (listaParaMostrar.length === 0) {
      listaContainer.innerHTML = '<p style="color: var(--texto-dim); text-align: center; margin-top: 20px;">No se encontraron canciones.</p>';
      return;
    }

    listaParaMostrar.forEach((cancion) => {
      // Buscamos el índice original para que al hacer clic se reproduzca la canción correcta
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

  // --- LÓGICA DEL BUSCADOR ---
  buscador.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase().trim();
    
    // Filtrar canciones
    const resultados = canciones.filter(c => c.titulo.toLowerCase().includes(texto));
    
    // Cambiar automáticamente a la pestaña de la lista (Favoritos/Biblioteca)
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    
    const tabFavoritosBtn = document.querySelector('.nav-item[data-tab="tab-favoritos"]');
    if (tabFavoritosBtn) tabFavoritosBtn.classList.add('active');
    document.getElementById('tab-favoritos').classList.add('active');

    // Actualizar el título de la pestaña
    const tituloLista = document.querySelector('#tab-favoritos .deezer-title');
    if (texto) {
      tituloLista.textContent = `Resultados: "${texto}"`;
    } else {
      tituloLista.textContent = "Todas las Canciones";
    }

    renderizarLista(resultados);
  });

  // --- FUNCIONES DE AUDIO ---
  function cargarCancion(index) {
    currentTrackIndex = index;
    const cancion = canciones[currentTrackIndex];
    
    audio.src = cancion.src;
    trackTitle.textContent = cancion.titulo;
    trackArtist.textContent = artista;

    document.querySelectorAll('.cancion-item').forEach((el, i) => {
      // Como ahora la lista puede estar filtrada, verificamos el título
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
    }).catch(err => {
      console.error("Error al reproducir:", err);
    });
  }

  function pausar() {
    audio.pause();
    isPlaying = false;
    iconPlay.innerHTML = `<path d="M8 5v14l11-7z"/>`; 
  }

  function togglePlay() {
    if (isPlaying) pausar();
    else reproducir();
  }

  // --- EVENTOS ---
  btnPlay.addEventListener('click', togglePlay);

  audio.addEventListener('timeupdate', () => {
    const porcentaje = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${porcentaje || 0}%`;
  });

  audio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % canciones.length;
    cargarCancion(currentTrackIndex);
    reproducir();
  });

  window.reproducirAleatorio = () => {
    const randomIndex = Math.floor(Math.random() * canciones.length);
    cargarCancion(randomIndex);
    reproducir();
  };

  // Inicializar
  renderizarLista();
  cargarCancion(0);
});
