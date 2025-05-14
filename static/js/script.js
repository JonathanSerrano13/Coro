document.getElementById("registro-form").addEventListener("submit", function (e) {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const password = document.getElementById("password").value.trim();
    const rol = document.getElementById("rol").value;

    if (!nombre || !email || !telefono || !password || !rol) {
        e.preventDefault(); // Evita el envío del formulario
        alert("Por favor, completa todos los campos.");
    }
});

