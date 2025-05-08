        // Simulación de datos de base de datos (esto debe venir del backend)
        const cancionesBD = [
            "ABBA PADRE",
            "ALABANZAS AL SEÑOR",
            "ALABEMOS AL SEÑOR/SALMO 150",
            "ALEGRE LA MAÑANA",
            "ALÉGRENSE CORAZONES",
            "A TI LEVANTO MIS OJOS"
        ];

        let timeoutId;
        document.getElementById('busqueda').addEventListener('input', function () {
            clearTimeout(timeoutId); // Cancela el timeout anterior
            timeoutId = setTimeout(() => filtrarCanciones(), 300); // Espera 300ms
        });

        // Filtra canciones por texto
        function filtrarCanciones() {
            const texto = document.getElementById('busqueda').value.toLowerCase();
            const filtradas = cancionesBD.filter(c => c.toLowerCase().includes(texto));
            renderizarCanciones(filtradas);
        }

        // Renderiza la lista
        function renderizarCanciones(lista) {
            const contenedor = document.getElementById('lista-canciones');
            contenedor.innerHTML = '';
            lista.forEach((cancion, index) => {
                const item = document.createElement('li');
                item.innerHTML = `
                    <input type="checkbox" id="cancion-${index}" value="${cancion}">
                    <label for="cancion-${index}">${cancion}</label>
                `;
                contenedor.appendChild(item);
            });
        }

        // Escucha el evento 'input' en el campo de búsqueda
        document.getElementById('busqueda').addEventListener('input', function () {
            filtrarCanciones(); // Ejecuta el filtrado automáticamente
        });





        // Guarda las canciones seleccionadas (simulado)
        function guardarSeleccion() {
            const checkboxes = document.querySelectorAll('#lista-canciones input[type="checkbox"]:checked');
            const seleccionadas = Array.from(checkboxes).map(cb => cb.value);

            if (seleccionadas.length === 0) {
                alert("Selecciona al menos una canción.");
                return;
            }

            // Aquí iría el envío real al servidor
            console.log("Canciones seleccionadas:", seleccionadas);

            // Simulación de asignación a evento
            fetch('/asignar-canciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ canciones: seleccionadas, eventoId: 123 }) // reemplaza el ID por el real
            })
                .then(response => response.json())
                .then(data => alert("Canciones asignadas con éxito."))
                .catch(error => alert("Error al guardar canciones."));
        }

        // Inicializa la lista completa al cargar
        renderizarCanciones(cancionesBD);