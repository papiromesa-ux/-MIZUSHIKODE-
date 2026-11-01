import { _secAuth } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

onAuthStateChanged(_secAuth, (_sysUser) => {
  if (_sysUser) window.location.replace("../index.html"); 
});

let _isLog = true;
const _frm = document.getElementById('authForm');
const _btn = document.getElementById('btnSubmit');
const _msg = document.getElementById('mensaje');
const _tgl = document.getElementById('toggleTextContainer');
const _grpName = document.getElementById('groupName');
const _grpConf = document.getElementById('groupConfirm');
const _grpSchool = document.getElementById('groupSchool');
const _emailInput = document.getElementById('email');
const _ttl = document.getElementById('formTitle');
const _sub = document.getElementById('formSub');

// Lógica de detección del correo institucional
_emailInput.addEventListener('input', (e) => {
  const val = e.target.value.trim().toLowerCase();
  if (val.endsWith('@clases.edu.sv')) {
    _grpSchool.style.display = 'block';
  } else {
    _grpSchool.style.display = 'none';
  }
});

_tgl.addEventListener('click', (e) => {
  if (e.target.id === 'toggleMode') {
    _isLog = !_isLog;
    _msg.className = "mensaje";
    _grpSchool.style.display = 'none'; 

    if (_isLog) {
      _ttl.innerHTML = "Recepción";
      _sub.textContent = "Ingresa tus credenciales de estudiante.";
      _btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" style="width:20px; margin-right:8px;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg> Entrar al Sistema`;
      _grpName.style.display = "none";
      _grpConf.style.display = "none";
      _tgl.innerHTML = '¿No tienes cuenta? <span id="toggleMode" style="color: var(--cian); cursor: pointer; font-weight: bold;">Regístrate aquí</span>';
    } else {
      _ttl.innerHTML = "Matrícula";
      _sub.textContent = "Registra tus datos para unirte a la academia.";
      _btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" style="width:20px; margin-right:8px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> Completar Registro`;
      _grpName.style.display = "block";
      _grpConf.style.display = "block";
      _tgl.innerHTML = '¿Ya tienes cuenta? <span id="toggleMode" style="color: var(--cian); cursor: pointer; font-weight: bold;">Inicia sesión aquí</span>';
    }
  }
});

_frm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const _eml = _emailInput.value;
  const _pwd = document.getElementById('password').value;
  
  if (!_isLog && _eml.endsWith('@clases.edu.sv')) {
    const school = document.getElementById('schoolSelect').value;
    if (!school) {
      _msg.textContent = "Por favor, selecciona tu institución educativa.";
      _msg.className = "mensaje error";
      return;
    }
  }

  _btn.textContent = "Procesando...";
  _btn.disabled = true;

  try {
    if (_isLog) {
      await signInWithEmailAndPassword(_secAuth, _eml, _pwd);
    } else {
      const _cnf = document.getElementById('confirmPassword').value;
      if (_pwd !== _cnf) throw new Error("Las contraseñas no coinciden.");
      const _nm = document.getElementById('name').value;
      const _crd = await createUserWithEmailAndPassword(_secAuth, _eml, _pwd);
      await updateProfile(_crd.user, { displayName: _nm });
    }
  } catch (_err) {
    let _m = _err.message || "Error: Revisa tus datos.";
    if (_err.code === 'auth/invalid-credential') _m = "Credenciales inválidas.";
    if (_err.code === 'auth/email-already-in-use') _m = "Este correo ya está registrado.";
    if (_err.code === 'auth/weak-password') _m = "La contraseña debe tener al menos 6 caracteres.";
    _msg.textContent = _m;
    _msg.className = "mensaje error";
    _btn.textContent = _isLog ? "Entrar al Sistema" : "Completar Registro";
    _btn.disabled = false;
  }
});

document.getElementById('btnGoogle').addEventListener('click', async () => {
  const _prv = new GoogleAuthProvider();
  try {
    await signInWithPopup(_secAuth, _prv);
  } catch (_err) {
    _msg.textContent = "Error al conectar con Google.";
    _msg.className = "mensaje error";
  }
});

document.getElementById('btnGithub').addEventListener('click', async () => {
  const _prv = new GithubAuthProvider();
  try {
    await signInWithPopup(_secAuth, _prv);
  } catch (_err) {
    _msg.textContent = "Error al conectar con GitHub. Verifica que el proveedor esté activado en Firebase.";
    _msg.className = "mensaje error";
  }
});
