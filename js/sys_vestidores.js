document.addEventListener('DOMContentLoaded', () => {
  let modeloActual = localStorage.getItem('mizushi_modelo_actual');

  const btnDescargarAlex = document.getElementById('btn-desc-alex');
  const btnEliminarAlex = document.getElementById('btn-elim-alex');

  const btnDescargarAndrea = document.getElementById('btn-desc-andrea');
  const btnEliminarAndrea = document.getElementById('btn-elim-andrea');

  function actualizarInterfaz() {
    // Ocultar todos los botones de eliminar por defecto
    btnEliminarAlex.style.display = 'none';
    btnEliminarAndrea.style.display = 'none';
    
    // Mostrar todos los de descargar
    btnDescargarAlex.style.display = 'flex';
    btnDescargarAndrea.style.display = 'flex';

    // Si Alexander está descargado
    if (modeloActual === 'alexander') {
      btnDescargarAlex.style.display = 'none';
      btnEliminarAlex.style.display = 'flex';
    } 
    // Si Andrea está descargada
    else if (modeloActual === 'andrea') {
      btnDescargarAndrea.style.display = 'none';
      btnEliminarAndrea.style.display = 'flex';
    }
  }

  // Eventos para Alexander
  if (btnDescargarAlex && btnEliminarAlex) {
    btnDescargarAlex.addEventListener('click', () => {
      localStorage.setItem('mizushi_modelo_actual', 'alexander');
      modeloActual = 'alexander';
      actualizarInterfaz();
    });

    btnEliminarAlex.addEventListener('click', () => {
      localStorage.removeItem('mizushi_modelo_actual');
      modeloActual = null;
      actualizarInterfaz();
    });
  }

  // Eventos para Andrea
  if (btnDescargarAndrea && btnEliminarAndrea) {
    btnDescargarAndrea.addEventListener('click', () => {
      localStorage.setItem('mizushi_modelo_actual', 'andrea');
      modeloActual = 'andrea';
      actualizarInterfaz();
    });

    btnEliminarAndrea.addEventListener('click', () => {
      localStorage.removeItem('mizushi_modelo_actual');
      modeloActual = null;
      actualizarInterfaz();
    });
  }

  actualizarInterfaz();
});
