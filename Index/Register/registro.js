document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registro-form');

    form.addEventListener('submit', (e) => {
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const telefonoInput = document.getElementById('telefono');
        const passwordInput = document.getElementById('password');
        const rolInput = document.getElementById('rol');

        // Validar todos los campos
        if (!nombreInput.checkValidity() || 
            !emailInput.checkValidity() || 
            !telefonoInput.checkValidity() || 
            !passwordInput.checkValidity() || 
            !rolInput.checkValidity()) {
            return; // Si algo está mal, los mensajes nativos se muestran automáticamente
        }

        e.preventDefault(); // Prevenir comportamiento predeterminado si deseas manejarlo manualmente

        // Si todo está correcto
        alert('Registro exitoso');
        // Aquí puedes agregar lógica adicional como guardar en una base de datos
        window.location.href = '../index.html'; // Redirigir después del registro
    });
});
