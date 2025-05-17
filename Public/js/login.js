 document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = e.target.email.value;
            const password = e.target.password.value;

            try {
                const res = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    window.location.href = '/View/Eventos.html'; // Redirige a Eventos.html
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Error al conectar con el servidor.');
            }
        });