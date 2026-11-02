import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');

  // 1. Configuración básica de la escena
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050508, 0.03);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 4, 14);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 2. Luces (Moradas y Cyan para el estilo Cyberpunk)
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const luzMorada = new THREE.PointLight(0x8b2fc9, 100, 50);
  luzMorada.position.set(-5, 5, 5);
  scene.add(luzMorada);

  const luzCyan = new THREE.PointLight(0x00f5ff, 100, 50);
  luzCyan.position.set(5, 5, 5);
  scene.add(luzCyan);

  // 3. El Suelo
  const sueloGeo = new THREE.PlaneGeometry(100, 100);
  const sueloMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.2, metalness: 0.8 });
  const suelo = new THREE.Mesh(sueloGeo, sueloMat);
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = -2;
  scene.add(suelo);

  // 4. Crear la palabra PAPIROMESA en bloques
  const palabra = "PAPIROMESA";
  const letras = [];
  const anchoLetra = 1.2;
  const espacio = 0.2;
  
  // Calculamos la posición inicial para que quede centrado
  const anchoTotal = (palabra.length * (anchoLetra + espacio)) - espacio;
  let startX = -(anchoTotal / 2) + (anchoLetra / 2);

  // Función para crear una textura con la letra dibujada
  function crearTexturaLetra(letra) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Fondo transparente
    ctx.clearRect(0, 0, 256, 256);
    
    // Dibujar la letra
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 200px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letra, 128, 128);

    const textura = new THREE.CanvasTexture(canvas);
    return textura;
  }

  for (let i = 0; i < palabra.length; i++) {
    const letraStr = palabra[i];
    
    // Un "ladrillo" 3D para cada letra
    const geo = new THREE.BoxGeometry(anchoLetra, anchoLetra, anchoLetra * 0.5);
    const mat = new THREE.MeshStandardMaterial({
      map: crearTexturaLetra(letraStr),
      color: 0xffffff,
      emissive: 0x3b1b5c,
      emissiveIntensity: 0.5,
      transparent: true
    });
    
    const mesh = new THREE.Mesh(geo, mat);
    
    // Posición inicial (arriba en el cielo)
    const targetX = startX + (i * (anchoLetra + espacio));
    mesh.position.set(targetX, 15 + (i * 2), 0); // Escalonados para que caigan uno por uno
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.z = Math.random() * Math.PI;
    
    scene.add(mesh);
    letras.push({
      mesh: mesh,
      targetY: 0,
      velocidad: 0,
      cayendo: true,
      rotacionVel: (Math.random() - 0.5) * 0.1
    });
  }

  // 5. El Molino de Papel (Un cilindro que cruzará al final)
  const molinoGeo = new THREE.CylinderGeometry(2, 2, 4, 32);
  // Le damos un color textura papel
  const molinoMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8 });
  const molino = new THREE.Mesh(molinoGeo, molinoMat);
  molino.rotation.z = Math.PI / 2;
  molino.position.set(-20, 0, 1); // Empieza fuera de pantalla a la izquierda
  scene.add(molino);

  let animacionTerminada = false;
  let molinoAvanzando = false;

  // 6. Bucle de animación
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Física de las letras
    let todasCayeron = true;

    letras.forEach((l, index) => {
      if (l.cayendo) {
        // Aplicar gravedad
        l.velocidad -= 30 * delta;
        l.mesh.position.y += l.velocidad * delta;
        
        // Rotar mientras cae
        l.mesh.rotation.x += l.rotacionVel;
        l.mesh.rotation.z += l.rotacionVel;

        // Si toca el suelo
        if (l.mesh.position.y <= l.targetY) {
          l.mesh.position.y = l.targetY;
          
          // Rebote (si viene con mucha velocidad)
          if (Math.abs(l.velocidad) > 5) {
            l.velocidad = -l.velocidad * 0.3; // Pierde energía
          } else {
            // Se asienta
            l.velocidad = 0;
            l.cayendo = false;
            l.mesh.rotation.x = 0; // Se endereza
            l.mesh.rotation.z = 0;
            l.mesh.position.y += 0.5; // Pequeño salto al asentarse
          }
        }
        todasCayeron = false;
      }
    });

    // Cuando todas las letras hayan caído, activar el molino
    if (todasCayeron && !molinoAvanzando) {
      molinoAvanzando = true;
    }

    // Animación del molino
    if (molinoAvanzando) {
      molino.position.x += 8 * delta; // Avanza a la derecha
      
      // Hacer que ruede (rotar sobre su eje X)
      molino.rotation.x -= 4 * delta;

      // Si el molino pasa por encima de las letras, "se las lleva"
      letras.forEach(l => {
        if (l.mesh.position.x < molino.position.x + 2 && !animacionTerminada) {
          // Hacemos que las letras se achiquen y desaparezcan (como si se las tragara)
          if (l.mesh.scale.x > 0) {
            l.mesh.scale.x -= 2 * delta;
            l.mesh.scale.y -= 2 * delta;
            l.mesh.scale.z -= 2 * delta;
          }
        }
      });

      // Si el molino sale de la pantalla por la derecha
      if (molino.position.x > 20) {
        animacionTerminada = true;
        // Opcional: reiniciar la animación después de un rato
        // setTimeout(() => { location.reload(); }, 3000);
      }
    }

    renderer.render(scene, camera);
  }

  // Ajustar al redimensionar
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
});
