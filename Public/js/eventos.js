document.addEventListener('DOMContentLoaded', () => {
  const listaEventos = document.getElementById('lista-eventos');
  const buscarInput = document.getElementById('buscar-input');

  // Función para cargar eventos desde backend
  async function cargarEventos() {
    try {
      const res = await fetch('/api/eventos');
      const eventos = await res.json();

      // Limpiar lista
      listaEventos.innerHTML = '';

      if (eventos.length === 0) {
        listaEventos.innerHTML = '<li>No hay eventos disponibles.</li>';
        return;
      }

      // Renderizar eventos
      eventos.forEach(evento => {
        const li = document.createElement('li');
        li.classList.add('item');
        li.dataset.eventoId = evento.ID; // o el nombre de campo ID

        li.innerHTML = `
          <span class="icono">♦</span>
          <div class="info-evento">
            <span class="nombre">${evento.Nombre}</span>
          </div>
          <div class="acciones">
            <button class="btn-ver-detalles" onclick="verDetalles(${evento.ID})">Detalles</button>
            <button class="btn-borrar"> <i class="fi fi-rr-trash"></i> </button>
          </div>
        `;

        // Evento para borrar
        li.querySelector('.btn-borrar').addEventListener('click', () => {
          if (confirm(`¿Eliminar evento "${evento.Nombre}"?`)) {
            borrarEvento(evento.ID);
          }
        });

        listaEventos.appendChild(li);
      });
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      listaEventos.innerHTML = '<li>Error al cargar eventos.</li>';
    }
  }

  // Función para borrar evento
  async function borrarEvento(id) {
    try {
      const res = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        cargarEventos();
      } else {
        alert('Error al eliminar evento');
      }
    } catch {
      alert('Error al eliminar evento');
    }
  }

  // Función para ver detalles - redirigir a página con ID
  window.verDetalles = function (id) {
    window.location.href = `verDetalles.html?id=${id}`;
  };

  // Filtrar eventos por búsqueda
  buscarInput.addEventListener('input', () => {
    const filtro = buscarInput.value.toLowerCase();
    document.querySelectorAll('#lista-eventos .item').forEach(li => {
      const nombre = li.querySelector('.nombre').textContent.toLowerCase();
      li.style.display = nombre.includes(filtro) ? '' : 'none';
    });
  });

  // Cargar eventos al inicio
  cargarEventos();
});
