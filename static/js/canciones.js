document.getElementById('busqueda').addEventListener('input', function() {
            const query = this.value;
            fetch(`/canciones?ajax=1&search=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(canciones => {
                    const listaCanciones = document.getElementById('lista-canciones');
                    listaCanciones.innerHTML = ''; // Limpia la lista actual
                    canciones.forEach((cancion, index) => {
                        const li = document.createElement('li');
                        li.classList.add('item'); // Mantén las clases para el diseño
                        li.innerHTML = `
                            <input type="checkbox" id="cancion-${index}" value="${cancion}">
                            <label for="cancion-${index}">${cancion}</label>
                        `;
                        listaCanciones.appendChild(li);
                    });
                });
        });


document.addEventListener('DOMContentLoaded', function () {
    const agregarBtn = document.querySelector('#btn-agregar');

    if (agregarBtn) {
        agregarBtn.addEventListener('click', function () {
            // Obtener las canciones seleccionadas por su ID
            const checkboxes = document.querySelectorAll('input[name="canciones"]:checked');
            const cancionesSeleccionadas = Array.from(checkboxes).map(checkbox => checkbox.value);

            console.log('Canciones seleccionadas:', cancionesSeleccionadas);

            if (cancionesSeleccionadas.length === 0) {
                alert('Por favor selecciona al menos una canción.');
                return;
            }

            // Enviar las canciones seleccionadas al servidor
            fetch('/agregar_canciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ canciones: cancionesSeleccionadas }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Canciones agregadas exitosamente.');
                    window.location.href = '/lista_canciones/' + tempListaId;
                } else {
                    alert('Error al agregar canciones: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error al enviar la solicitud:', error);
                alert('Ocurrió un error al agregar las canciones.');
            });
        });
    } else {
        console.error('El botón con ID #btn-agregar no se encontró en el DOM.');
    }
});
