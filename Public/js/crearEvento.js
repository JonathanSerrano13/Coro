document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-crear-evento');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre_evento').value.trim();
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const ubicacion = document.getElementById('ubicacion').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        if (!nombre || !fecha || !hora || !ubicacion) {
            alert('Por favor, completa todos los campos obligatorios');
            return;
        }

        const fechaHora = `${fecha} ${hora}:00`;

        const data = {
            Nombre: nombre,
            FechaHora: fechaHora,
            Ubicacion: ubicacion,
            Descripcion: descripcion || null,
        };

        try {
            const res = await fetch('/api/eventos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                alert('Evento creado con éxito');
                window.location.href = 'Eventos.html';
            } else {
                const errorData = await res.json();
                alert('Error al crear evento: ' + (errorData.message || res.statusText));
            }
        } catch (error) {
            alert('Error en la conexión al servidor');
            console.error(error);
        }
    });
});


//Para inhabilitar la seleccion de dias que no son actuales 
document.addEventListener('DOMContentLoaded', function () {
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaMin = `${anio}-${mes}-${dia}`;
    fechaInput.min = fechaMin; // Establece la fecha mínima
});


//Abrir google-maps en ubicacion.
function abrirGoogleMaps() {
    window.open("https://www.google.com/maps", "_blank");
}


