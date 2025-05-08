document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir el envío predeterminado del formulario

        const nombreInput = document.getElementById('nombre');
        const passwordInput = document.getElementById('password');

        const nombre = nombreInput.value.trim();
        const password = passwordInput.value.trim();

        if (!nombre || !password) {
            alert('Por favor, completa todos los campos obligatorios');
        } else {
            alert('Inicio de sesión exitoso');
            // Redirigir a la página principal o de eventos
            window.location.href = './Eventos/Eventos.html';
        }
    });
});
