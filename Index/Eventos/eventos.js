document.addEventListener('DOMContentLoaded', () => {
    const dbRequest = indexedDB.open('EventosDB', 1);

    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('eventos')) {
            db.createObjectStore('eventos', { keyPath: 'id', autoIncrement: true });
        }
    };

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;

        // Cargar eventos
        cargarEventos(db);

        // Configurar campo de búsqueda
        const inputBusqueda = document.getElementById('buscar-input');
        inputBusqueda.addEventListener('input', () => {
            buscarEventos(inputBusqueda.value, db);
        });
    };

    dbRequest.onerror = (event) => {
        console.error('Error al abrir la base de datos:', event.target.errorCode);
    };
});

// Función para cargar todos los eventos desde la base de datos
function cargarEventos(db) {
    const transaction = db.transaction(['eventos'], 'readonly');
    const objectStore = transaction.objectStore('eventos');
    const request = objectStore.getAll();

    request.onsuccess = () => {
        const eventos = request.result;
        renderizarEventos(eventos);
    };

    request.onerror = () => {
        console.error('Error al obtener los eventos');
    };
}

// Función para buscar eventos en tiempo real
function buscarEventos(query, db) {
    const transaction = db.transaction(['eventos'], 'readonly');
    const objectStore = transaction.objectStore('eventos');
    const request = objectStore.getAll();

    request.onsuccess = () => {
        const eventos = request.result;

        // Filtrar eventos según el texto ingresado
        const eventosFiltrados = eventos.filter(evento =>
            evento.Nombre_Evento.toLowerCase().includes(query.toLowerCase())
        );

        renderizarEventos(eventosFiltrados);
    };

    request.onerror = () => {
        console.error('Error al buscar eventos');
    };
}

// Función para renderizar los eventos en la UI
function renderizarEventos(eventos) {
    const lista = document.getElementById('lista-eventos');
    lista.innerHTML = ''; // Limpiar la lista antes de volver a renderizar

    if (eventos.length === 0) {
        lista.innerHTML = '<li class="no-results">No hay eventos programados</li>';
    } else {
        eventos.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));

        eventos.forEach((evento) => {
            const li = document.createElement('li');
            li.className = 'item';
            li.innerHTML = `
                <span class="icono">♦</span>
                <div class="info-evento">
                    <span class="nombre">${evento.Nombre_Evento}</span>
                </div>
                <button class="btn-ver-detalles" data-id="${evento.id}">Detalles</button>
            `;
            lista.appendChild(li);

            // Evento para el botón de ver detalles
            const btnVerDetalles = li.querySelector('.btn-ver-detalles');
            btnVerDetalles.addEventListener('click', () => {
                const eventoId = btnVerDetalles.getAttribute('data-id');
                window.location.href = `../VerDetalles/verDetalles.html?id=${eventoId}`;
            });
        });
    }
}
