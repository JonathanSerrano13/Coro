document.addEventListener('DOMContentLoaded', () => {
    const editarBtn = document.getElementById('editar-btn');
    const guardarBtn = document.getElementById('guardar-btn');
    const cancelarBtn = document.getElementById('cancelar-btn');
    const eliminarBtn = document.getElementById('eliminar-btn');
    const regresarBtn = document.getElementById('regresar-btn');

    const formFields = Array.from(document.querySelectorAll('#detalles-evento-form input, #detalles-evento-form textarea'));

    // Obtener el ID del evento desde la URL
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (eventId) {
        cargarDetallesEvento(eventId);
    } else {
        alert("No se encontró el evento.");
        window.location.href = '../Eventos/Eventos.html';
    }

    // Función para habilitar edición
    editarBtn.addEventListener('click', () => {
        formFields.forEach(field => field.disabled = false);
        editarBtn.style.display = 'none';
        eliminarBtn.style.display = 'none';
        regresarBtn.style.display = 'none';
        cancelarBtn.style.display = 'inline';
        guardarBtn.style.display = 'inline';
    });

    // Función para cancelar edición
    cancelarBtn.addEventListener('click', () => {
        formFields.forEach(field => field.disabled = true);
        editarBtn.style.display = 'inline';
        eliminarBtn.style.display = 'inline';
        regresarBtn.style.display = 'inline';
        cancelarBtn.style.display = 'none';
        guardarBtn.style.display = 'none';
        cargarDetallesEvento(eventId); // Recargar datos originales
    });

    // Función para guardar cambios
    guardarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        guardarCambiosEvento(eventId);
        cancelarBtn.click(); // Simular clic en cancelar para regresar al estado inicial
    });

    // Función para eliminar evento
    eliminarBtn.addEventListener('click', () => {
        if (confirm("¿Estás seguro de eliminar este evento?")) {
            eliminarEvento(eventId);
        }
    });
});

// Función para cargar detalles del evento
function cargarDetallesEvento(eventId) {
    const dbRequest = indexedDB.open('EventosDB', 1);

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['eventos'], 'readonly');
        const objectStore = transaction.objectStore('eventos');
        const request = objectStore.get(Number(eventId));

        request.onsuccess = () => {
            const evento = request.result;
            if (evento) {
                document.getElementById('Nombre_Evento').value = evento.Nombre_Evento;
                document.getElementById('fecha').value = evento.Fecha;
                document.getElementById('hora').value = evento.Hora;
                document.getElementById('Ubicacion').value = evento.Ubicacion;
                document.getElementById('Descripcion').value = evento.Descripcion;
            } else {
                alert("No se encontró el evento.");
                window.location.href = '../VerDetalles/verDetalles.html';
            }
        };
    };
}

// Función para guardar cambios
function guardarCambiosEvento(eventId) {
    const dbRequest = indexedDB.open('EventosDB', 1);

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['eventos'], 'readwrite');
        const objectStore = transaction.objectStore('eventos');

        const eventoActualizado = {
            id: Number(eventId),
            Nombre_Evento: document.getElementById('Nombre_Evento').value,
            Fecha: document.getElementById('fecha').value,
            Hora: document.getElementById('hora').value,
            Ubicacion: document.getElementById('Ubicacion').value,
            Descripcion: document.getElementById('Descripcion').value
        };

        objectStore.put(eventoActualizado);
        alert('Cambios guardados con éxito.');
    };
}

// Función para eliminar evento
function eliminarEvento(eventId) {
    const dbRequest = indexedDB.open('EventosDB', 1);

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['eventos'], 'readwrite');
        const objectStore = transaction.objectStore('eventos');
        const request = objectStore.delete(Number(eventId));

        request.onsuccess = () => {
            alert('Evento eliminado con éxito.');
            window.location.href = '../Eventos/Eventos.html';
        };
    };
}