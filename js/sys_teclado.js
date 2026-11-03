document.addEventListener('DOMContentLoaded', () => {
  // Buscamos si hay un área de texto de código en la página
  const inputCodigo = document.getElementById('codigoEstudiante') || document.getElementById('input-fase-2') || document.getElementById('input-fase-4') || document.getElementById('input-fase-5');
  
  if (!inputCodigo) return; // Si no hay input, no hacemos nada

  // Creamos el contenedor del teclado dinámicamente
  const tecladoContainer = document.createElement('div');
  tecladoContainer.id = 'teclado-virtual';
  tecladoContainer.style.display = 'none';
  tecladoContainer.innerHTML = `
    <div class="teclado-fila">
      <button class="tecla" data-key="q">q</button>
      <button class="tecla" data-key="w">w</button>
      <button class="tecla" data-key="e">e</button>
      <button class="tecla" data-key="r">r</button>
      <button class="tecla" data-key="t">t</button>
      <button class="tecla" data-key="y">y</button>
      <button class="tecla" data-key="u">u</button>
      <button class="tecla" data-key="i">i</button>
      <button class="tecla" data-key="o">o</button>
      <button class="tecla" data-key="p">p</button>
    </div>
    <div class="teclado-fila">
      <button class="tecla" data-key="a">a</button>
      <button class="tecla" data-key="s">s</button>
      <button class="tecla" data-key="d">d</button>
      <button class="tecla" data-key="f">f</button>
      <button class="tecla" data-key="g">g</button>
      <button class="tecla" data-key="h">h</button>
      <button class="tecla" data-key="j">j</button>
      <button class="tecla" data-key="k">k</button>
      <button class="tecla" data-key="l">l</button>
      <button class="tecla" data-key="ñ">ñ</button>
    </div>
    <div class="teclado-fila">
      <button class="tecla" data-key="z">z</button>
      <button class="tecla" data-key="x">x</button>
      <button class="tecla" data-key="c">c</button>
      <button class="tecla" data-key="v">v</button>
      <button class="tecla" data-key="b">b</button>
      <button class="tecla" data-key="n">n</button>
      <button class="tecla" data-key="m">m</button>
      <button class="tecla" data-key=",">,</button>
      <button class="tecla" data-key=".">.</button>
      <button class="tecla btn-borrar" data-key="Backspace">Borrar</button>
    </div>
    <div class="teclado-fila teclado-codigo">
      <button class="tecla" data-key=" ">Espacio</button>
      <button class="tecla" data-key="<">&lt;</button>
      <button class="tecla" data-key=">">&gt;</button>
      <button class="tecla" data-key="/">/</button>
      <button class="tecla" data-key="=">=</button>
      <button class="tecla" data-key="'">'</button>
      <button class="tecla" data-key='"'>"</button>
      <button class="tecla" data-key="(">(</button>
      <button class="tecla" data-key=")">)</button>
      <button class="tecla" data-key="{">{</button>
      <button class="tecla" data-key="}">}</button>
      <button class="tecla" data-key=";">;</button>
    </div>
  `;
  document.body.appendChild(tecladoContainer);

  // Evitar que el teclado nativo del celular salga al tocar el input
  inputCodigo.setAttribute('inputmode', 'none'); // Oculta el teclado nativo en Android/iOS modernos
  
  inputCodigo.addEventListener('focus', () => {
    tecladoContainer.style.display = 'block';
    inputCodigo.blur(); // Quitamos el foco para que no salga el teclado de verdad
  });

  // Ocultar el teclado virtual si se toca fuera de él
  document.addEventListener('click', (e) => {
    if (!tecladoContainer.contains(e.target) && e.target !== inputCodigo) {
      tecladoContainer.style.display = 'none';
    }
  });

  // Lógica de las teclas
  tecladoContainer.addEventListener('pointerdown', (e) => {
    if (e.target.classList.contains('tecla')) {
      e.preventDefault(); // Evita que la página haga scroll
      const key = e.target.getAttribute('data-key');
      
      // Efecto visual al presionar
      e.target.style.transform = 'scale(0.9)';
      setTimeout(() => { e.target.style.transform = 'scale(1)'; }, 100);

      if (key === 'Backspace') {
        inputCodigo.value = inputCodigo.value.slice(0, -1);
      } else if (key === 'Enter') {
        inputCodigo.value += '\n';
      } else {
        inputCodigo.value += key;
      }
      
      // Mantenemos el scroll al final del input
      inputCodigo.scrollTop = inputCodigo.scrollHeight;
    }
  });
});
