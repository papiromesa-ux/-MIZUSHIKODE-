document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('game-board');
  const scoreEl = document.getElementById('score');
  const comboEl = document.getElementById('combo');
  const btnKeys = document.querySelectorAll('.btn-key');
  
  // Configuración del juego
  const COLUMNAS = 4;
  const VELOCIDAD_BASE = 2.5; // Pixeles por frame
  const TIEMPO_APARICION = 800; // Milisegundos entre cada nota
  const ZONA_IMPACTO = 40; // Píxeles de margen de error (más alto = más fácil)
  
  // Textos que caerán en las notas (Temática de código)
  const ETIQUETAS = ['<div>', '{ }', ';', 'const', 'if()', '=>', '<p>', 'let'];

  let score = 0;
  let combo = 0;
  let isPlaying = true;
  let notasActivas = [];
  let ultimoSpawn = 0;

  // Función para crear una nota nueva
  function crearNota() {
    if (!isPlaying) return;

    const columna = Math.floor(Math.random() * COLUMNAS);
    const etiqueta = ETIQUETAS[Math.floor(Math.random() * ETIQUETAS.length)];
    
    const nota = document.createElement('div');
    nota.className = `nota col-${columna}`;
    nota.textContent = etiqueta;
    nota.style.top = '-100px'; // Empieza arriba de la pantalla
    
    board.appendChild(nota);
    
    notasActivas.push({
      element: nota,
      columna: columna,
      y: -100,
      golpeada: false
    });
  }

  // Función para actualizar los puntos en pantalla
  function actualizarUI() {
    scoreEl.textContent = score;
    if (combo > 1) {
      comboEl.textContent = `x${combo}`;
      comboEl.style.color = 'var(--cian)';
      if (combo >= 5) {
        comboEl.textContent = `x${combo} ¡VELOZ!`;
        comboEl.style.color = '#00ff88'; // Color verde para los combos altos
      }
    } else {
      comboEl.textContent = 'x1';
      comboEl.style.color = 'var(--magenta)';
    }
  }

  // El bucle principal del juego (animación)
  function gameLoop() {
    if (!isPlaying) return;

    const boardHeight = board.clientHeight;
    const hitLineY = boardHeight * 0.85; // La línea está al 85% de la altura

    for (let i = notasActivas.length - 1; i >= 0; i--) {
      const nota = notasActivas[i];
      
      if (!nota.golpeada) {
        nota.y += VELOCIDAD_BASE;
        nota.element.style.top = `${nota.y}px`;

        // Si la nota pasa la línea de impacto sin ser golpeada
        if (nota.y > hitLineY + ZONA_IMPACTO) {
          perderCombo();
          nota.element.style.opacity = '0.3'; // Se vuelve transparente
          setTimeout(() => {
            if (nota.element.parentNode) board.removeChild(nota.element);
          }, 200);
          notasActivas.splice(i, 1);
        }
      } else {
        // Animación de nota golpeada (desaparece)
        nota.element.style.transform = 'scale(1.5)';
        nota.element.style.opacity = '0';
        setTimeout(() => {
          if (nota.element.parentNode) board.removeChild(nota.element);
        }, 100);
        notasActivas.splice(i, 1);
      }
    }

    requestAnimationFrame(gameLoop);
  }

  // Lógica cuando el jugador toca una tecla
  function tocarTecla(columna) {
    if (!isPlaying) return;

    // Efecto visual en el botón
    const btn = document.querySelector(`.btn-key[data-key="${columna}"]`);
    if (btn) {
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 100);
    }

    const boardHeight = board.clientHeight;
    const hitLineY = boardHeight * 0.85;
    let acierto = false;

    // Buscar si hay alguna nota en esa columna cerca de la línea de impacto
    for (let i = 0; i < notasActivas.length; i++) {
      const nota = notasActivas[i];
      
      if (nota.columna === columna && !nota.golpeada) {
        // Verificar si está dentro de la zona de impacto
        if (Math.abs(nota.y - hitLineY) < ZONA_IMPACTO) {
          nota.golpeada = true;
          acierto = true;
          score += 10 + (combo * 2); // Más puntos si tienes combo
          combo++;
          actualizarUI();
          break;
        }
      }
    }

    if (!acierto) {
      // Si tocó la tecla sin que hubiera nota (o fuera de tiempo)
      perderCombo();
    }
  }

  function perderCombo() {
    if (combo > 2) {
      // Aquí podríamos reproducir un sonido de fallo
    }
    combo = 0;
    actualizarUI();
  }

  // --- CONTROLES ---

  // Controles táctiles / Clic
  btnKeys.forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // Evita doble toque en celular
      const col = parseInt(btn.getAttribute('data-key'));
      tocarTecla(col);
    });
  });

  // Controles de Teclado (PC)
  document.addEventListener('keydown', (e) => {
    const teclas = ['a', 's', 'd', 'f'];
    const col = teclas.indexOf(e.key.toLowerCase());
    if (col !== -1) {
      tocarTecla(col);
    }
  });

  // --- INICIAR JUEGO ---
  // Bucle para crear notas cada cierto tiempo
  setInterval(crearNota, TIEMPO_APARICION);
  
  // Iniciar el bucle de animación
  requestAnimationFrame(gameLoop);
});
