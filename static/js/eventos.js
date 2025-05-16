document.addEventListener('DOMContentLoaded', () => {
    const listaEventos = document.querySelector('#lista-eventos');

    // Función para mostrar mensaje si no hay eventos
    function verificarEventos() {
        // Si no hay eventos, mostramos el mensaje "No hay eventos"
        if (listaEventos.children.length === 0) {
            const mensaje = document.createElement('li');
            mensaje.classList.add('item', 'mensaje-sin-eventos');
            mensaje.innerHTML = `
                <div class="info-evento">
                    <span class="nombre" >No hay eventos programados.</span>
                </div>
            `;
            listaEventos.appendChild(mensaje);
        } else {
            const mensaje = document.querySelector('.mensaje-sin-eventos');
            if (mensaje) {
                mensaje.remove(); // Si hay eventos, eliminamos el mensaje
            }
        }
    }

    // Inicializa la lista al cargar
    verificarEventos();

    // Agregar un evento desde `crearEvento`
    const params = new URLSearchParams(window.location.search);
    if (params.has('evento')) {
        const nuevoEventoNombre = params.get('evento');
        const nuevoEvento = document.createElement('li');
        nuevoEvento.classList.add('item');
        nuevoEvento.innerHTML = `
            <span class="icono">♦</span>
            <div class="info-evento">
                <span class="nombre">${nuevoEventoNombre}</span>
            </div>
            <div class="acciones">
                <button class="btn-ver-detalles">Detalles</button>
                <button class="btn-borrar">
                    <i class="fi fi-rr-trash"></i>
                </button>
            </div>
        `;
        listaEventos.appendChild(nuevoEvento);
        verificarEventos();
    }

    // Función para borrar evento
    const botonesBorrar = document.querySelectorAll('.btn-borrar');
    botonesBorrar.forEach(boton => {
        boton.addEventListener('click', (event) => {
            const eventoId = boton.getAttribute('data-id');

            fetch(`/borrar_evento/${eventoId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    // Borrar el evento de la vista
                    boton.closest('.item').remove();
                    // Verificar si quedan eventos
                    verificarEventos();
                } else {
                    console.error('Error al borrar el evento');
                }
            })
            .catch(error => {
                console.error('Error al realizar la solicitud de borrado:', error);
            });
        });
    });

});


document.getElementById('buscar-input').addEventListener('input', function() {
    const query = this.value;

    // Realizar la solicitud AJAX para buscar los eventos
    fetch(`/eventos?search=${query}&ajax=1`)
        .then(response => response.json())
        .then(eventos => {
            const listaEventos = document.getElementById('lista-eventos');
            listaEventos.innerHTML = '';  // Limpiar la lista actual

            // Si hay eventos, añadirlos a la lista
            if (eventos.length > 0) {
                eventos.forEach(evento => {
                    const li = document.createElement('li');
                    li.className = 'item';
                    li.dataset.eventoId = evento[0];

                    li.innerHTML = `
                        <span class="icono">♦</span>
                        <div class="info-evento">
                            <span class="nombre">${evento[1]}</span>
                        </div>
                        <div class="acciones">
                            <button class="btn-ver-detalles" onclick="window.location.href='/evento/${evento[0]}'">Detalles</button>
                            <button class="btn-borrar" data-id="${evento[0]}"><i class="fi fi-rr-trash"></i></button>
                        </div>
                    `;

                    listaEventos.appendChild(li);
                });
            } else {
                listaEventos.innerHTML = '<li>No se encontraron eventos.</li>';
            }
        })
        .catch(error => {
            console.error('Error al obtener los eventos:', error);
        });
});

document.addEventListener('DOMContentLoaded', function () {
    fetch('/limpiar_listas_temporales', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Listas temporales eliminadas correctamente.');
        } else {
            console.error('Error al limpiar listas temporales:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});