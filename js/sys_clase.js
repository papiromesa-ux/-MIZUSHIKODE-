document.addEventListener('DOMContentLoaded', () => {
  let faseActual = 1;
  let vidas = 3;

  const btnSiguiente = document.getElementById('btn-siguiente');
  const btnReintentar = document.getElementById('btn-reintentar');
  const pantallaGameOver = document.getElementById('pantalla-game-over');
  const faseViews = document.querySelectorAll('.fase-view');
  const pasosCirculos = document.querySelectorAll('.fase-paso');
  const corazones = document.querySelectorAll('.corazon');

  // --- FUNCIONES DE LÓGICA ---

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
      setTimeout(() => { msj.style.display = 'none'; }, 2000); // Se oculta en 2s
    }
  }

  function cambiarFase(nuevaFase) {
    // Ocultar todas las vistas
    faseViews.forEach(view => view.classList.remove('active'));
    
    // Mostrar la nueva
    document.getElementById(`fase-${nuevaFase}`).classList.add('active');

    // Actualizar barra superior
    pasosCirculos.forEach((paso, index) => {
      if (index + 1 < nuevaFase) {
        paso.className = 'fase-paso completada';
      } else if (index + 1 === nuevaFase) {
        paso.className = 'fase-paso activa';
      } else {
        paso.className = 'fase-paso';
      }
    });

    faseActual = nuevaFase;
  }

  // --- VALIDACIONES POR FASE ---

  function validarFaseActual() {
    let esCorrecto = false;

    if (faseActual === 1) {
      esCorrecto = true; // Teoría, siempre avanza
    } 
    else if (faseActual === 2) {
      const input = document.getElementById('input-fase-2').value.trim().toLowerCase();
      if (input === 'p') esCorrecto = true;
      else mostrarError(2, "Incorrecto. Intenta de nuevo. (Pista: Es la letra P)");
    }
    else if (faseActual === 3) {
      // La validación de la Fase 3 ocurre en los botones, no aquí.
      // Si llega aquí es porque no seleccionó nada.
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
        // Fin de la clase (por ahora)
        btnSiguiente.textContent = "¡Clase Completada!";
        btnSiguiente.disabled = true;
        // Aquí iría la lógica para guardar el progreso y volver al aula
      } else {
        cambiarFase(faseActual + 1);
      }
    } else {
      restarVida();
    }
  }

  // --- EVENTOS ---

  // Botón de Siguiente
  btnSiguiente.addEventListener('click', validarFaseActual);

  // Botones de Opción Múltiple (Fase 3)
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

  // Botón de Reintentar (Game Over)
  btnReintentar.addEventListener('click', () => {
    vidas = 3;
    actualizarVidasUI();
    pantallaGameOver.style.display = 'none';
    cambiarFase(1);
    
    // Limpiar inputs
    document.getElementById('input-fase-2').value = '';
    document.getElementById('input-fase-4').value = '';
    document.getElementById('input-fase-5').value = '';
    
    btnSiguiente.textContent = "Siguiente Fase";
    btnSiguiente.disabled = false;
  });

  // Iniciar
  actualizarVidasUI();
});
