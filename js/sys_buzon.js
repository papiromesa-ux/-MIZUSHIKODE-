document.addEventListener('DOMContentLoaded', () => {
  const btnEnviar = document.getElementById('btnEnviarReporte');
  const inputNombre = document.getElementById('nombreReporte');
  const inputTipo = document.getElementById('tipoReporte');
  const inputMensaje = document.getElementById('mensajeReporte');
  const msjError = document.getElementById('msj-error');

  btnEnviar.addEventListener('click', () => {
    const nombre = inputNombre.value.trim();
    const tipo = inputTipo.value;
    const mensaje = inputMensaje.value.trim();

    if (!nombre || !mensaje) {
      msjError.textContent = "Por favor, llena tu nombre y el mensaje antes de enviar.";
      msjError.style.display = 'block';
      return;
    }

    msjError.style.display = 'none';

    const numero = "50368405099";
    const texto = `Hola, soy ${nombre} de la Academia MizushiKode.%0A%0A*Tipo:* ${tipo}%0A*Reporte:* ${mensaje}`;
    const url = `https://wa.me/${numero}?text=${texto}`;
    
    window.open(url, '_blank');
  });
});
