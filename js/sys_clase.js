import { _secAuth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { crearAntiTrampas } from "./sys_antitrampas.js";

// 1. Seguridad de sesión (Si no hay usuario, patada al login)
onAuthStateChanged(_secAuth, (_u) => {
  if (!_u) window.location.replace("login.html");
});

// 2. Iniciar el Anti-Trampas (Modo EstrICTO)
const _anti = crearAntiTrampas({
  alExpulsar: ({ motivo }) => {
    // Redirección directa a la pantalla de bloqueo
    window.location.href = `bloqueo.html?motivo=${encodeURIComponent(motivo)}`;
  }
});

// 3. Activar el anti-trampas
document.body.classList.add('en-examen');
_anti.activar();

document.addEventListener('DOMContentLoaded', () => {
  let faseActual = 1;
  let vidas = 3;

  const btnSiguiente = document.getElementById('btn-siguiente');
  const btnReintentar = document.getElementById('btn-reintentar');
  const pantallaGameOver = document.getElementById('pantalla-game-over');
  const faseViews = document.querySelectorAll('.fase-view');
  const pasosCirculos = document.querySelectorAll('.fase-paso');
  const corazones = document.querySelectorAll('.corazon');

  function actualizarVidasUI() {
    corazones.forEach((corazon, index) => {
      if (index >= vidas) {
        corazon.classList.add('perdido');
      } else {
        corazon.classList.remove('perdido');
      }
    });

    if (vidas <= 0) {
      pantallaGameOver.style.display = 'flex';
    }
  }

  function restarVida() {
    vidas--;
    actualizarVidasUI();
  }

  function mostrarError(fase, mensaje) {
    const msj = document.getElementById(`msj-error-${fase}`);
    if (msj) {
      msj.textContent = mensaje;
      msj.style.display = 'block';
      setTimeout(() => { msj.style.display = 'none'; }, 2000);
    }
  }

  function cambiarFase(nuevaFase) {
    faseViews.forEach(view => view.classList.remove('active'));
    document.getElementById(`fase-${nuevaFase}`).classList.add('active');

    pasosCirculos.forEach((paso, index) => {
      if (index + 1 < nuevaFase) paso.className = 'fase-paso completada';
      else if (index + 1 === nuevaFase) paso.className = 'fase-paso activa';
      else paso.className = 'fase-paso';
    });

    faseActual = nuevaFase;
  }

  function validarFaseActual() {
    let esCorrecto = false;

    if (faseActual === 1) {
      esCorrecto = true;
    } 
    else if (faseActual === 2) {
      const input = document.getElementById('input-fase-2').value.trim().toLowerCase();
      if (input === 'p') esCorrecto = true;
      else mostrarError(2, "Incorrecto. Intenta de nuevo. (Pista: Es la letra P)");
    }
    else if (faseActual === 3) {
      mostrarError(3, "Por favor, selecciona una opción.");
      return;
    }
    else if (faseActual === 4) {
      const input = document.getElementById('input-fase-4').value.trim().toLowerCase().replace(/\s+/g, '');
      if (input === '</h1>') esCorrecto = true;
      else mostrarError(4, "Etiqueta incorrecta. Debe ser exactamente </h1>");
    }
    else if (faseActual === 5) {
      const input = document.getElementById('input-fase-5').value.trim().toLowerCase().replace(/\s+/g, '');
      if (input === 'console.log("hola");') esCorrecto = true;
      else mostrarError(5, "Comando incorrecto. Revisa las comillas y el punto y coma.");
    }

    if (esCorrecto) {
      if (faseActual === 5) {
        // GUARDAR PROGRESO Y DESACTIVAR ANTI-TRAMPA
        localStorage.setItem('mizushi_html_clase1', 'true');
        _anti.desactivar(); // <--- IMPORTANTE: Apagamos el anti-trampas al terminar
        
        btnSiguiente.innerHTML = `Volver al Mapa <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
        btnSiguiente.onclick = () => window.location.href = 'curso-html.html';
      } else {
        cambiarFase(faseActual + 1);
      }
    } else {
      restarVida();
    }
  }

  btnSiguiente.addEventListener('click', validarFaseActual);

  const botonesOpcion = document.querySelectorAll('.opcion-btn');
  botonesOpcion.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const esCorrecta = e.target.getAttribute('data-respuesta') === 'correcta';
      if (esCorrecta) {
        cambiarFase(4);
      } else {
        mostrarError(3, "Esa no es la etiqueta correcta.");
        restarVida();
      }
    });
  });

  btnReintentar.addEventListener('click', () => {
    vidas = 3;
    actualizarVidasUI();
    pantallaGameOver.style.display = 'none';
    cambiarFase(1);
    
    document.getElementById('input-fase-2').value = '';
    document.getElementById('input-fase-4').value = '';
    document.getElementById('input-fase-5').value = '';
    
    btnSiguiente.innerHTML = "Siguiente Fase";
  });

  actualizarVidasUI();
});
