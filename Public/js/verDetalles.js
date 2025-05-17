document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventoId = urlParams.get('id');

  const form = document.getElementById('detalles-evento-form');
  const nombreInput = document.getElementById('Nombre_Evento');
  const fechaInput = document.getElementById('fecha');
  const horaInput = document.getElementById('hora');
  const ubicacionInput = document.getElementById('Ubicacion');
  const descripcionInput = document.getElementById('Descripcion');

  if (!eventoId) {
    alert('ID del evento no especificado');
    window.location.href = 'Eventos.html';
    return;
  }

  // Cargar datos del evento
  fetch(`/api/eventos/${eventoId}`)
    .then(res => {
      if (!res.ok) throw new Error('Error al obtener evento');
      return res.json();
    })
    .then(evento => {
      nombreInput.value = evento.Nombre;

      // Separar fecha y hora de FechaHora (que es datetime)
      const fechaHora = new Date(evento.FechaHora);
      fechaInput.value = fechaHora.toISOString().slice(0, 10); // yyyy-mm-dd
      horaInput.value = fechaHora.toTimeString().slice(0,5);   // HH:mm

      ubicacionInput.value = evento.Ubicacion || '';
      descripcionInput.value = evento.Descripcion || '';
    })
    .catch(() => {
      alert('No se pudo cargar el evento');
      window.location.href = 'Eventos.html';
    });

  // Guardar cambios (submit del formulario)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Combinar fecha y hora en datetime string
    const fechaHoraStr = `${fechaInput.value} ${horaInput.value}:00`;

    const data = {
      Nombre: nombreInput.value.trim(),
      FechaHora: fechaHoraStr,
      Ubicacion: ubicacionInput.value.trim(),
      Descripcion: descripcionInput.value.trim(),
    };

    fetch(`/api/eventos/${eventoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al actualizar');
      return res.json();
    })
    .then(() => {
      alert('Evento actualizado correctamente');
      window.location.href = 'Eventos.html';
    })
    .catch(() => {
      alert('Error al actualizar evento');
    });
  });
});