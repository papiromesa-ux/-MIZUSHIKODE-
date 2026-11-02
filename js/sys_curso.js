document.addEventListener('DOMContentLoaded', () => {
  // Verificamos si la clase 1 ya fue completada en el localStorage
  const clase1Completada = localStorage.getItem('mizushi_html_clase1') === 'true';

  const nodoClase1 = document.getElementById('nodo-clase-1');
  const nodoClase2 = document.getElementById('nodo-clase-2');
  const nodoClase3 = document.getElementById('nodo-clase-3');
  const msjBloqueo1 = document.getElementById('msj-bloqueo-1');
  const msjBloqueo2 = document.getElementById('msj-bloqueo-2');
  const msjBloqueo3 = document.getElementById('msj-bloqueo-3');

  // Si completó la clase 1, actualizamos la UI
  if (clase1Completada) {
    // Nodo 1 se marca como completado
    nodoClase1.className = 'clase-circulo completada';
    nodoClase1.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    
    // Nodo 2 se desbloquea
    nodoClase2.className = 'clase-circulo activa';
    nodoClase2.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
  }

  // Lógica de clics en los nodos
  document.querySelectorAll('.clase-circulo').forEach(nodo => {
    nodo.addEventListener('click', (e) => {
      const claseNum = e.currentTarget.getAttribute('data-clase');
      const estaBloqueada = e.currentTarget.classList.contains('bloqueada');

      if (estaBloqueada) {
        // Mostrar mensaje de error sin paneles
        const msj = document.getElementById(`msj-bloqueo-${claseNum}`);
        if (msj) {
          msj.style.display = 'block';
          setTimeout(() => { msj.style.display = 'none'; }, 2000);
        }
        return;
      }

      // Si no está bloqueada, redirigimos a la clase
      if (claseNum === '1') {
        window.location.href = 'clase1.html';
      } else if (claseNum === '2') {
        // Aquí iría clase2.html (aún no programada)
        alert("Clase 2 estará disponible pronto.");
      }
    });
  });
});
