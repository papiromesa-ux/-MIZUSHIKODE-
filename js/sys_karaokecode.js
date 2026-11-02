import { _db, _secAuth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

let usuarioActual = null;
onAuthStateChanged(_secAuth, (user) => { if (user) usuarioActual = user; });

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

    const tiempoAbierta = 800 + Math.random() * 1000;
    timeoutCerrarBoca = setTimeout(() => {
      if (bocaAbierta) {
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

  function cicloRitmo() {
    if (!isPlaying) return;
    const tiempoEspera = 1000 + Math.random() * 2000;
    setTimeout(() => {
      if (isPlaying) {
        abrirBoca();
        cicloRitmo();
      }
    }, tiempoEspera);
  }

  function cantar() {
    if (!isPlaying) return;

    if (bocaAbierta) {
      score += 20 + (combo * 5);
      combo++;
      actualizarUI();
      cerrarBoca();
      
      btnCantar.style.background = 'linear-gradient(135deg, #00ff88, #00f5ff)';
      setTimeout(() => { btnCantar.style.background = ''; }, 150);
    } else {
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

  async function finDelJuego() {
    isPlaying = false;
    cerrarBoca();
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = 'flex';

    // GUARDAR PUNTOS EN FIREBASE
    if (usuarioActual && score > 0) {
      try {
        const alumnoRef = doc(_db, "estudiantes", usuarioActual.uid);
        await updateDoc(alumnoRef, {
          xp: increment(score)
        });
      } catch (error) {
        console.error("Error al guardar puntos:", error);
      }
    }
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
    
    cicloRitmo();
  }

  btnCantar.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    cantar();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      cantar();
    }
  });

  btnRestart.addEventListener('click', iniciarJuego);

  iniciarJuego();
});
