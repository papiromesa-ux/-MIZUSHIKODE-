import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from './libs/three-vrm.module.js';

document.addEventListener('DOMContentLoaded', () => {
  const _vrmContainer = document.getElementById('vrm-container');
  const _textoAvatar = document.getElementById('texto-avatar');
  const _nombreAvatarActual = document.getElementById('nombre-avatar-actual');

  if (_vrmContainer) {
    window.cargarModelo3D = async (nombreModelo, nombreMostrar) => {
      try {
        const ruta = `Modelos/Modelos%20de%20preterminado/${nombreModelo}.vrm`;
        const response = await fetch(ruta);
        if (!response.ok) throw new Error("No se encontró el archivo .vrm");
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const _scene = new THREE.Scene();
        const _camera = new THREE.PerspectiveCamera(30, _vrmContainer.clientWidth / _vrmContainer.clientHeight, 0.1, 20);
        _camera.position.set(0, 1.4, 4.5);
        _camera.lookAt(0, 1.2, 0);

        const _renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        _renderer.setPixelRatio(window.devicePixelRatio);
        
        const _loader = new GLTFLoader();
        _loader.register((parser) => new VRMLoaderPlugin(parser));

        _loader.load(
          url, 
          (gltf) => {
            if (_textoAvatar) _textoAvatar.style.display = 'block';
            if (_nombreAvatarActual) _nombreAvatarActual.textContent = nombreMostrar;
            
            _vrmContainer.innerHTML = '';
            _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
            _vrmContainer.appendChild(_renderer.domElement);

            const _vrm = gltf.userData.vrm;
            VRMUtils.rotateVRM0(_vrm);
            _vrm.scene.position.set(0, 0, 0);
            _scene.add(_vrm.scene);

            const _ambient = new THREE.AmbientLight(0xffffff, 1.2);
            _scene.add(_ambient);
            const _lightCyan = new THREE.DirectionalLight(0x00f5ff, 3);
            _lightCyan.position.set(2, 3, 2);
            _scene.add(_lightCyan);
            const _lightMagenta = new THREE.DirectionalLight(0xff2e97, 3);
            _lightMagenta.position.set(-2, 3, 1);
            _scene.add(_lightMagenta);

            const _clock = new THREE.Clock();
            const _animate = () => {
              requestAnimationFrame(_animate);
              const _delta = _clock.getDelta();
              if (_vrm) {
                _vrm.update(_delta);
                _vrm.scene.position.y = Math.sin(_clock.elapsedTime) * 0.05;
              }
              _renderer.render(_scene, _camera);
            };
            _animate();
          },
          undefined,
          (error) => { console.error("Error al dibujar el modelo 3D:", error); }
        );
      } catch (error) { console.error("Error crítico al cargar el modelo 3D:", error); }
    };

    // LÓGICA DE DESCARGA: Solo carga si el alumno lo descargó en Vestidores
    const modeloGuardado = localStorage.getItem('mizushi_modelo_actual');
    if (modeloGuardado) {
      const nombre = modeloGuardado === 'alexander' ? 'Alexander' : 'Andrea';
      window.cargarModelo3D(modeloGuardado, nombre);
    } else {
      // Si no hay modelo, nos aseguramos de que el texto de "Ve al Vestidor" se vea.
      if (_textoAvatar) _textoAvatar.style.display = 'block'; 
    }
  }
});
