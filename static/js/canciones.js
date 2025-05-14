document.addEventListener('DOMContentLoaded', function () {
    // Manejo de búsqueda de canciones
    const searchInput = document.getElementById('busqueda');
    const listaCanciones = document.getElementById('lista-canciones');
    
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value;
            fetch(`/canciones?ajax=1&search=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(canciones => {
                    listaCanciones.innerHTML = '';
                    canciones.forEach(cancion => {
                        const li = document.createElement('li');
                        li.classList.add('item');
                        li.innerHTML = `
                            <input type="checkbox" id="cancion-${cancion[0]}" value="${cancion[0]}" name="canciones">
                            <label >${cancion[1]}</label>
                        `;
                        listaCanciones.appendChild(li);
                    });
                })
                .catch(error => {
                    console.error('Error al buscar canciones:', error);
                    alert('Error al buscar canciones. Intenta nuevamente.');
                });
        });
    }

    // Manejo de agregar canciones seleccionadas
    const agregarBtn = document.querySelector('#btn-agregar');
    if (agregarBtn) {
        agregarBtn.addEventListener('click', function (e) {
            e.preventDefault(); // Evitar el comportamiento por defecto del formulario
            const checkboxes = document.querySelectorAll('input[name="canciones"]:checked');
            const cancionesSeleccionadas = Array.from(checkboxes).map(cb => cb.value);

            if (cancionesSeleccionadas.length === 0) {
                alert('Por favor selecciona al menos una canción.');
                return;
            }

            fetch('/agregar_canciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ canciones: cancionesSeleccionadas })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = `/lista_canciones`;
                    } else {
                        alert(data.error || 'Error al agregar canciones.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Ocurrió un error inesperado. Intenta nuevamente.');
                });
        });
    }
});
