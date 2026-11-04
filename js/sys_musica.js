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

  let currentTrackIndex = 0;
  let isPlaying = false;

  // Canciones reales
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

  // Relleno para simular 100 canciones
  for (let i = 1; i <= 80; i++) {
    canciones.push({ titulo: `Pista de Estudio #${i}`, src: "../musicaly/mizushikode.mp3" });
  }

  const artista = "ONGAKU Lofi";

  function renderizarLista() {
    listaContainer.innerHTML = '';
    canciones.forEach((cancion, index) => {
      const li = document.createElement('li');
      li.className = `cancion-item ${index === currentTrackIndex ? 'activa' : ''}`;
      li.innerHTML = `
        <div class="track-num">${index + 1}</div>
        <div class="track-name">
          <span class="title">${cancion.titulo}</span>
          <span class="artist">${artista}</span>
        </div>
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
    trackArtist.textContent = artista;

    document.querySelectorAll('.cancion-item').forEach((el, i) => {
      if (i === currentTrackIndex) el.classList.add('activa');
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

  renderizarLista();
  cargarCancion(0);
});
