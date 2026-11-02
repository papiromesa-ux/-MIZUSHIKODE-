document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('game-board');
  const scoreEl = document.getElementById('score');
  const comboEl = document.getElementById('combo');
  const vidasContainer = document.getElementById('vidas-container');
  const gameOverScreen = document.getElementById('game-over-screen');
  const finalScoreEl = document.getElementById('final-score');
  const btnRestart = document.getElementById('btn-restart');
  const btnKeys = document.querySelectorAll('.btn-key');
  
  const COLUMNAS = 4;
  const VELOCIDAD_BASE = 2.5;
  const TIEMPO_APARICION = 800;
  const ZONA_IMPACTO = 40;
  const ETIQUETAS = ['<div>', '{ }', ';', 'const', 'if()', '=>', '<p>', 'let'];

  let score = 0;
  let combo = 0;
  let vidas = 3;
  let isPlaying = true;
  let notasActivas = [];
  let intervaloSpawn = null;
  let animationFrame = null;

  function dibujarVidas() {
  vidasContainer.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const corazon = document.createElement('span');
    corazon.className = 'corazon' + (i >= vidas ? ' perdido' : '');
    
    // Icono SVG en lugar de emoji (Cero emojis en el código)
    corazon.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;
    vidasContainer.appendChild(corazon);
  }
}

  function crearNota() {
    if (!isPlaying) return;
    const columna = Math.floor(Math.random() * COLUMNAS);
    const etiqueta = ETIQUETAS[Math.floor(Math.random() * ETIQUETAS.length)];
    
    const nota = document.createElement('div');
    nota.className = `nota col-${columna}`;
    nota.textContent = etiqueta;
    nota.style.top = '-100px';
    
    board.appendChild(nota);
    notasActivas.push({ element: nota, columna: columna, y: -100, golpeada: false });
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

  function gameLoop() {
    if (!isPlaying) return;

    const boardHeight = board.clientHeight;
    const hitLineY = boardHeight * 0.85;

    for (let i = notasActivas.length - 1; i >= 0; i--) {
      const nota = notasActivas[i];
      
      if (!nota.golpeada) {
        nota.y += VELOCIDAD_BASE;
        nota.element.style.top = `${nota.y}px`;

        if (nota.y > hitLineY + ZONA_IMPACTO) {
          // Nota fallada
          nota.element.style.opacity = '0.3';
          setTimeout(() => { if (nota.element.parentNode) board.removeChild(nota.element); }, 200);
          notasActivas.splice(i, 1);
          perderVida();
        }
      } else {
        nota.element.style.transform = 'scale(1.5)';
        nota.element.style.opacity = '0';
        setTimeout(() => { if (nota.element.parentNode) board.removeChild(nota.element); }, 100);
        notasActivas.splice(i, 1);
      }
    }
    animationFrame = requestAnimationFrame(gameLoop);
  }

  function tocarTecla(columna) {
    if (!isPlaying) return;

    const btn = document.querySelector(`.btn-key[data-key="${columna}"]`);
    if (btn) {
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 100);
    }

    const boardHeight = board.clientHeight;
    const hitLineY = boardHeight * 0.85;
    let acierto = false;

    for (let i = 0; i < notasActivas.length; i++) {
      const nota = notasActivas[i];
      if (nota.columna === columna && !nota.golpeada && Math.abs(nota.y - hitLineY) < ZONA_IMPACTO) {
        nota.golpeada = true;
        acierto = true;
        score += 10 + (combo * 2);
        combo++;
        actualizarUI();
        break;
      }
    }

    if (!acierto) {
      perderCombo();
    }
  }

  function perderCombo() {
    combo = 0;
    actualizarUI();
  }

  function perderVida() {
    vidas--;
    perderCombo(); // Al fallar una nota, se pierde el combo
    dibujarVidas();
    
    if (vidas <= 0) {
      finDelJuego();
    }
  }

  function finDelJuego() {
    isPlaying = false;
    clearInterval(intervaloSpawn);
    cancelAnimationFrame(animationFrame);
    
    // Detener todas las notas activas
    notasActivas.forEach(n => { if (n.element.parentNode) board.removeChild(n.element); });
    notasActivas = [];
    
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = 'flex';
  }

  function iniciarJuego() {
    score = 0;
    combo = 0;
    vidas = 3;
    isPlaying = true;
    notasActivas = [];
    board.innerHTML = '<div class="hit-line"></div>'; // Limpiar tablero y poner la línea
    
    dibujarVidas();
    actualizarUI();
    gameOverScreen.style.display = 'none';
    
    intervaloSpawn = setInterval(crearNota, TIEMPO_APARICION);
    animationFrame = requestAnimationFrame(gameLoop);
  }

  btnKeys.forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      tocarTecla(parseInt(btn.getAttribute('data-key')));
    });
  });

  document.addEventListener('keydown', (e) => {
    const teclas = ['a', 's', 'd', 'f'];
    const col = teclas.indexOf(e.key.toLowerCase());
    if (col !== -1) tocarTecla(col);
  });

  btnRestart.addEventListener('click', iniciarJuego);

  // Iniciar por primera vez
  iniciarJuego();
});
