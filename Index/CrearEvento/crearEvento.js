document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crear-evento-form');
    const nombreEventoInput = document.getElementById('Nombre_Evento');
    const fechaInput = document.getElementById('fecha');
    const horaInput = document.getElementById('hora');
    const ubicacionInput = document.getElementById('Ubicacion');
    const descripcionInput = document.getElementById('Descripcion');

    const dbRequest = indexedDB.open('EventosDB', 1);

    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('eventos')) {
            db.createObjectStore('eventos', { keyPath: 'id', autoIncrement: true });
        }
    };

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;

        // Guardar evento solo cuando se haga submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();  // Evita que el formulario se envíe automáticamente

            const nombreEvento = nombreEventoInput.value.trim();
            const fecha = fechaInput.value;
            const hora = horaInput.value;
            const ubicacion = ubicacionInput.value.trim();
            const descripcion = descripcionInput.value.trim();

            // Validar solo si los campos están vacíos
            if (nombreEvento === '' || fecha === '') {
                alert('Por favor ingresa todos los campos obligatorios');
                return;  // No sigue ejecutando el código
            }

            const nuevoEvento = {
                Nombre_Evento: nombreEvento,
                Fecha: fecha,
                Hora: hora,
                Ubicacion: ubicacion,
                Descripcion: descripcion
            };

            const transaction = db.transaction(['eventos'], 'readwrite');
            const objectStore = transaction.objectStore('eventos');
            objectStore.add(nuevoEvento);

            transaction.oncomplete = () => {
                alert('Evento creado con éxito');
                window.location.href = '../Eventos/eventos.html';  // Redirigir a la lista de eventos
            };

            transaction.onerror = () => {
                alert('Error al guardar el evento');
            };
        });
    };

    dbRequest.onerror = (event) => {
        console.error('Error al abrir la base de datos:', event.target.errorCode);
    };
});
