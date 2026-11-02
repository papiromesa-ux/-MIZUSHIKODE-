document.addEventListener('DOMContentLoaded', () => {
  const scoreEl = document.getElementById('score');
  const comboEl = document.getElementById('combo');
  const vidasContainer = document.getElementById('vidas-container');
  const personajeBox = document.getElementById('personaje-box');
  const estadoBoca = document.getElementById('estado-boca');
  const btnCantar = document.getElementById('btn-cantar');
  const gameOverScreen = document.getElementById('game-over-screen');
  const finalScoreEl = document.getElementById('final-score');
  const btnRestart = document.getElementById('btn-restart');

  let score = 0;
  let combo = 0;
  let vidas = 3;
  let isPlaying = true;
  let bocaAbierta = false;
  let timeoutCerrarBoca = null;
  let intervaloJuego = null;

  function dibujarVidas() {
    vidasContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const corazon = document.createElement('span');
      corazon.className = 'corazon' + (i >= vidas ? ' perdido' : '');
      // SVG Corazón (Cero emojis)
      corazon.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
      vidasContainer.appendChild(corazon);
    }
  }

  function actualizarUI() {
    scoreEl.textContent = score;
    if (combo > 1) {
      comboEl.textContent = `x${combo}`;
      comboEl.style.color = 'var(--cian)';
      if (combo >= 5) {
        comboEl.textContent = `x${combo} ¡VELOZ!`;
        comboEl.style.color = '#00ff88';
      }
    } else {
      comboEl.textContent = 'x1';
      comboEl.style.color = 'var(--magenta)';
    }
  }

  function abrirBoca() {
    if (!isPlaying || bocaAbierta) return;
    bocaAbierta = true;
    estadoBoca.className = 'estado-boca abierta';
    estadoBoca.textContent = 'LA LA LA!';
    personajeBox.classList.add('abierto');

    // La boca se cierra después de un tiempo aleatorio
    const tiempoAbierta = 800 + Math.random() * 1000; // Entre 0.8s y 1.8s
    timeoutCerrarBoca = setTimeout(() => {
      if (bocaAbierta) {
        // Si se cierra la boca y el jugador NO cantó, pierde vida
        cerrarBoca();
        perderVida(); 
      }
    }, tiempoAbierta);
  }

  function cerrarBoca() {
    bocaAbierta = false;
    estadoBoca.className = 'estado-boca cerrada';
    estadoBoca.textContent = 'Zzz';
    personajeBox.classList.remove('abierto');
    clearTimeout(timeoutCerrarBoca);
  }

  // Ciclo que decide cuándo el personaje canta
  function cicloRitmo() {
    if (!isPlaying) return;
    
    // Espera un tiempo aleatorio antes de abrir la boca de nuevo
    const tiempoEspera = 1000 + Math.random() * 2000; // Entre 1s y 3s
    setTimeout(() => {
      if (isPlaying) {
        abrirBoca();
        cicloRitmo(); // Se vuelve a llamar a sí mismo
      }
    }, tiempoEspera);
  }

  function cantar() {
    if (!isPlaying) return;

    if (bocaAbierta) {
      // ¡Acierto!
      score += 20 + (combo * 5);
      combo++;
      actualizarUI();
      cerrarBoca();
      
      // Pequeño efecto de acierto
      btnCantar.style.background = 'linear-gradient(135deg, #00ff88, #00f5ff)';
      setTimeout(() => { btnCantar.style.background = ''; }, 150);
    } else {
      // Fallo: cantó cuando estaba cerrada
      perderVida();
      btnCantar.style.background = 'linear-gradient(135deg, #ff0000, #660000)';
      setTimeout(() => { btnCantar.style.background = ''; }, 150);
    }
  }

  function perderVida() {
    vidas--;
    combo = 0;
    actualizarUI();
    dibujarVidas();
    if (vidas <= 0) {
      finDelJuego();
    }
  }

  function finDelJuego() {
    isPlaying = false;
    cerrarBoca();
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = 'flex';
  }

  function iniciarJuego() {
    score = 0;
    combo = 0;
    vidas = 3;
    isPlaying = true;
    bocaAbierta = false;
    
    dibujarVidas();
    actualizarUI();
    gameOverScreen.style.display = 'none';
    cerrarBoca();
    
    // Iniciar el ciclo de la IA
    cicloRitmo();
  }

  btnCantar.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    cantar();
  });

  // Soporte para barra espaciadora
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      cantar();
    }
  });

  btnRestart.addEventListener('click', iniciarJuego);

  iniciarJuego();
});
