from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_mysqldb import MySQL
from datetime import datetime


app = Flask(__name__)

# Configuración para conectar con MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'coro'
app.secret_key = 'tu_clave_secreta_unica'


# Inicializar la conexión con MySQL
mysql = MySQL(app)



# Ruta para la página de inicio de sesión
@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        nombre = request.form['nombre']
        password = request.form['password']

        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM integrante WHERE Nombre = %s AND Contraseña = %s", (nombre, password))
        user = cur.fetchone()

        if user:
            session['user_id'] = user[0]
            return redirect(url_for('eventos'))
        else:
            flash('Nombre o contraseña incorrectos', 'danger')

        cur.close()

    return render_template('index.html')

# Ruta para la página de registro
@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        nombre = request.form['nombre']
        email = request.form['email']
        telefono = request.form['telefono']
        password = request.form['password']
        rol = request.form['rol']

        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM integrante WHERE Email = %s", (email,))
        existing_user = cur.fetchone()

        if existing_user:
            flash('El correo ya está registrado, por favor usa otro.', 'danger')
            return redirect(url_for('registro'))

        cur.execute("""INSERT INTO integrante (Nombre, Email, Telefono, Contraseña, Rol) 
                       VALUES (%s, %s, %s, %s, %s)""",
                    (nombre, email, telefono, password, rol))
        mysql.connection.commit()
        cur.close()

        flash('Registro exitoso.', 'success')
        return redirect(url_for('home'))  # Redirige al inicio de sesión

    return render_template('Register/Registro.html')

# Ruta para la página de eventos
@app.route('/eventos', methods=['GET'])
def eventos():
    if 'user_id' not in session:
        return redirect(url_for('home'))

    search_query = request.args.get('search', '')  # Obtener el término de búsqueda
    cur = mysql.connection.cursor()

    if search_query:
        # Si hay término de búsqueda, filtrar eventos por nombre
        query = "SELECT * FROM evento WHERE Nombre LIKE %s"
        cur.execute(query, ('%' + search_query + '%',))
    else:
        # Si no hay término de búsqueda, devolver todos los eventos
        cur.execute("SELECT * FROM evento")
    
    eventos = cur.fetchall()
    cur.close()

    if request.args.get('ajax'):  # Si la solicitud es AJAX, devolver los eventos como JSON
        return jsonify(eventos)

    # Si no es una solicitud AJAX, renderizar la plantilla HTML normal
    return render_template('Eventos/Eventos.html', eventos=eventos)

# Ruta para crear un evento
@app.route('/crearEvento', methods=['GET', 'POST'])
def crearEvento():
    if 'user_id' not in session:
        return redirect(url_for('home'))

    cur = mysql.connection.cursor()

    if request.method == 'GET':
        # Crear lista temporal si no existe
        if 'temp_lista_id' not in session:
            cur.execute("INSERT INTO listaCanciones (EventoID) VALUES (NULL)")
            mysql.connection.commit()
            cur.execute("SELECT LAST_INSERT_ID()")
            session['temp_lista_id'] = cur.fetchone()[0]

        return render_template('CrearEvento/crearEvento.html')

    if request.method == 'POST':
        # Guardar el evento
        nombre_evento = request.form['nombre_evento']
        fecha = request.form['fecha']
        hora = request.form['hora']
        ubicacion = request.form['ubicacion']
        descripcion = request.form['descripcion']
        temp_lista_id = session.get('temp_lista_id')

        cur.execute("""
            INSERT INTO evento (Nombre, FechaHora, Ubicacion, Descripcion) 
            VALUES (%s, %s, %s, %s)
        """, (nombre_evento, f"{fecha} {hora}", ubicacion, descripcion))
        mysql.connection.commit()

        cur.execute("SELECT LAST_INSERT_ID()")
        evento_id = cur.fetchone()[0]
        cur.execute("""
            UPDATE listaCanciones 
            SET EventoID = %s 
            WHERE ID = %s
        """, (evento_id, temp_lista_id))
        mysql.connection.commit()

        # Limpiar lista temporal
        session.pop('temp_lista_id', None)

        flash('Evento creado exitosamente.', 'success')
        return redirect(url_for('eventos'))
    
    
@app.route('/lista_canciones/<int:temp_lista_id>', methods=['GET', 'POST'])
def lista_canciones(temp_lista_id):
    cur = mysql.connection.cursor()

    if request.method == 'GET':
        # Recuperar las canciones asociadas a la lista en la tabla visualizacion
        cur.execute("""
            SELECT c.ID, c.Nombre, c.Partitura, c.Letra 
            FROM visualizacion v
            JOIN canciones c ON v.CancionID = c.ID
            WHERE v.ListaCancionesID = %s
        """, (temp_lista_id,))
        canciones = cur.fetchall()
        cur.close()

        # Renderizar la plantilla con las canciones de la lista
        return render_template('ListaCanciones/listaCanciones.html', canciones=canciones, temp_lista_id=temp_lista_id)

    if request.method == 'POST':
        # Recibir los IDs de canciones seleccionadas desde el frontend
        canciones_ids = request.json.get('canciones', [])
        if not canciones_ids:
            flash('No se seleccionaron canciones.', 'error')
            return redirect(url_for('lista_canciones', temp_lista_id=temp_lista_id))

        # Insertar las relaciones en la tabla visualizacion
        for cancion_id in canciones_ids:
            cur.execute("""
                INSERT INTO visualizacion (CancionID, ListaCancionesID) 
                VALUES (%s, %s)
            """, (cancion_id, temp_lista_id))
        mysql.connection.commit()
        cur.close()

        # Confirmar y redirigir
        flash('Canciones agregadas exitosamente.', 'success')
        return jsonify({'status': 'success'})  # Respuesta para el fetch en JS
    
# Ruta para canciones
@app.route('/canciones', methods=['GET'])
def canciones():
    search_query = request.args.get('search', '')  # Obtén el término de búsqueda desde los parámetros de consulta
    cur = mysql.connection.cursor()
    if search_query:
        query = "SELECT Nombre FROM canciones WHERE Nombre LIKE %s"
        cur.execute(query, ('%' + search_query + '%',))
    else:
        cur.execute("SELECT Nombre FROM canciones")
    canciones = [row[0] for row in cur.fetchall()]
    cur.close()
    
    if request.args.get('ajax'):  # Si la solicitud es desde AJAX, devuelve JSON
        return jsonify(canciones)
    
    temp_id = session.get('temp_lista_id')  # Asegúrate de que temp_lista_id esté en sesión
    return render_template('Canciones/Canciones.html',
                           canciones=canciones,
                           temp_lista_id=temp_id)
    
    

# Ruta para agregar canciones a la lista de canciones de un evento
@app.route('/agregar_canciones', methods=['POST'])
def agregar_canciones():
    try:
        data = request.get_json()

        if not data or not 'canciones' in data:
            return jsonify({'status': 'error', 'message': 'No se proporcionaron canciones.'}), 400

        canciones_ids = data['canciones']

        # Asegúrate de manejar la base de datos aquí correctamente
        # Por ejemplo, inserta las canciones en la tabla `visualizacion`...

        return jsonify({'status': 'success', 'message': 'Canciones agregadas correctamente.'}), 200
    except Exception as e:
        # Log de error para facilitar la depuración
        app.logger.error(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Ocurrió un error en el servidor.'}), 500



# Ruta para eliminar una canción
@app.route('/eliminar_cancion/<int:cancion_id>', methods=['DELETE'])
def eliminarCancion(cancion_id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM canciones WHERE ID = %s", (cancion_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"mensaje": "Canción eliminada exitosamente"}), 200


# Ruta para ver detalles del evento
@app.route('/ver_detalles/<int:evento_id>', methods=['GET', 'POST'])
def ver_detalles(evento_id):
    if 'user_id' not in session:
        return redirect(url_for('home'))

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM evento WHERE id = %s", (evento_id,))
    evento = cur.fetchone()
    cur.close()

    if evento:
        fecha_formateada = evento[2].strftime('%Y-%m-%d')
        hora_formateada = evento[2].strftime('%H:%M:%S')
        return render_template('VerDetalles/verDetalles.html', evento=evento, fecha=fecha_formateada, hora=hora_formateada)
    else:
        flash('Evento no encontrado', 'danger')
        return redirect(url_for('eventos'))
    
# Ruta para eliminar un evento@app.route('/borrar_evento/<int:evento_id>', methods=['POST'])
@app.route('/borrar_evento/<int:evento_id>', methods=['DELETE'])
def borrar_evento(evento_id):
    if 'user_id' not in session:
        return redirect(url_for('home'))

    cur = mysql.connection.cursor()

    # Eliminar las relaciones de canciones del evento en la tabla visualizacion
    cur.execute("DELETE FROM visualizacion WHERE ListaCancionesID IN (SELECT ID FROM listaCanciones WHERE EventoID = %s)", (evento_id,))
    mysql.connection.commit()

    # Eliminar la lista de canciones asociada al evento
    cur.execute("DELETE FROM listaCanciones WHERE EventoID = %s", (evento_id,))
    mysql.connection.commit()

    # Eliminar el evento
    cur.execute("DELETE FROM evento WHERE id = %s", (evento_id,))
    mysql.connection.commit()

    cur.close()

    return jsonify({'status': 'success'})

# Ruta para actualizar un evento
@app.route('/editar_evento/<int:evento_id>', methods=['POST'])
def editar_evento(evento_id):
    if 'user_id' not in session:
        return redirect(url_for('home'))

    # Asegúrate de que los campos existen en el formulario antes de acceder a ellos
    try:
        nombre_evento = request.form['nombre_evento']
        fecha = request.form['fecha']
        hora = request.form['hora']
        ubicacion = request.form['ubicacion']
        descripcion = request.form['descripcion']
    except KeyError as e:
        flash(f"El campo {str(e)} no fue enviado en el formulario.", 'danger')
        return redirect(url_for('ver_detalles', evento_id=evento_id))

    # Actualizar el evento en la base de datos
    cur = mysql.connection.cursor()
    cur.execute("""
        UPDATE evento
        SET Nombre = %s, FechaHora = %s, Ubicacion = %s, Descripcion = %s
        WHERE id = %s
    """, (nombre_evento, f"{fecha} {hora}", ubicacion, descripcion, evento_id))

    mysql.connection.commit()
    cur.close()

    flash('Evento actualizado exitosamente', 'success')
    return redirect(url_for('eventos'))



if __name__ == '__main__':
    app.run(debug=True)
