document.querySelector('form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Previene el envío tradicional del formulario
    const formData = new FormData(this);

    try {
        const response = await fetch('{{ url_for("registro") }}', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Muestra el modal
                const modal = document.getElementById('success-modal');
                modal.classList.remove('hidden');

                // Redirige automáticamente después de 3 segundos
                setTimeout(() => {
                    window.location.href = '{{ url_for("home") }}';
                }, 3000);
            } else {
                alert('Error al registrar.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
