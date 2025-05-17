const form = document.getElementById('registroForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const telefono = form.telefono.value.trim();
  const password = form.password.value.trim();
  const rol = form.rol.value;

  const res = await fetch('/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, telefono, password, rol }),
  });

  const data = await res.json();

  if (res.ok) {
    alert('Registro exitoso');
    window.location.href = '/index.html';
  } else {
    alert(data.message || 'Error en registro');
  }
});
