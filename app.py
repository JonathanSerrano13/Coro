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
            session['user_id'] = user[0]  # Guardar el ID del usuario
            session['Rol'] = user[5]     # Asumimos que la columna 3 en la base de datos es el rol
            cur.close()
            return redirect(url_for('eventos'))
        else:
            flash('Nombre o contraseña incorrectos', 'danger')
            cur.close()

    return render_template('index.html')

@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user_id', None)  # Elimina el user_id de la sesión
    session.pop('Rol', None)  # Elimina el rol de la sesión, si también lo guardas
    return redirect(url_for('home'))  # Redirige a la página de inicio

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

    # Obtener el rol del usuario desde la sesión
    rol = session.get('Rol', 'Integrante')  # Por defecto 'integrante' si no está definido

    if request.args.get('ajax'):  # Si la solicitud es AJAX, devolver los eventos como JSON
        return jsonify(eventos)

    # Renderizar la plantilla eventos.html con los datos y el rol del usuario
    return render_template('Eventos/Eventos.html', eventos=eventos, rol=rol)


# Ruta para crear un evento
@app.route('/crearEvento', methods=['GET','POST'])
def crearEvento():
    if request.method == 'POST':
        # Obtener los datos del formulario
        nombre_evento = request.form['nombre_evento']
        fecha = request.form['fecha']  # Asegúrate de que este campo esté en el formulario
        hora = request.form['hora']  # Lo mismo para este campo
        ubicacion = request.form['ubicacion']
        descripcion = request.form['descripcion']

        # Concatenar fecha y hora en el formato adecuado para MySQL (YYYY-MM-DD HH:MM:SS)
        fecha_hora = f"{fecha} {hora}"

        cursor = mysql.connection.cursor()

        # Crear el evento
        cursor.execute("""
            INSERT INTO evento (Nombre, FechaHora, Ubicacion, Descripcion)
            VALUES (%s, %s, %s, %s)
        """, (nombre_evento, fecha_hora, ubicacion, descripcion))

        evento_id = cursor.lastrowid  # Obtener el ID del evento recién insertado

        # Relacionar la lista de canciones con el evento
        cursor.execute("UPDATE listaCanciones SET EventoID = %s WHERE EventoID IS NULL", (evento_id,))
        mysql.connection.commit()
        cursor.close()

        flash('Evento creado con éxito.')
        return redirect(url_for('eventos'))
    
    return render_template('CrearEvento/crearEvento.html')  # Si es GET, renderiza el formulario


 
# Visualizar la lista de canciones    
@app.route('/listaCanciones')
def lista_canciones():
    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT c.ID, c.Nombre
            FROM visualizacion v
            JOIN canciones c ON v.CancionID = c.ID
            JOIN listaCanciones lc ON v.ListaCancionesID = lc.ID
            WHERE lc.EventoID IS NULL
        """
        cursor.execute(query)
        canciones = cursor.fetchall()  # Lista de canciones relacionadas con listas temporales
        cursor.close()
        return render_template('ListaCanciones/listaCanciones.html', canciones=canciones)
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# Ruta para canciones
@app.route('/canciones', methods=['GET', 'POST'])
def canciones():
    if request.method == 'POST':
        try:
            data = request.get_json()  # Flask espera que el Content-Type sea application/json
            print('Datos recibidos:', data)
            return jsonify({'success': True, 'data': data}), 200
        except Exception as e:
            return jsonify({'error': 'Error procesando los datos', 'detalle': str(e)}), 400

    # Método GET
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT ID, Nombre FROM canciones")
    canciones = cursor.fetchall()
    return render_template('Canciones/canciones.html', canciones=canciones)

# Eliminar lista temporal si se cancela el evento
@app.route('/cancelarEvento', methods=['POST'])
def cancelar_evento():
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM listaCanciones WHERE EventoID IS NULL")
    mysql.connection.commit()
    flash('Evento cancelado y lista eliminada.')
    return redirect(url_for('crearEvento'))
    
    

# Ruta para agregar canciones a la lista de canciones de un evento
@app.route('/agregar_canciones', methods=['POST'])
def agregar_canciones():
    try:
        data = request.get_json()
        canciones_seleccionadas = data.get('canciones', [])

        if not canciones_seleccionadas:
            return jsonify({'error': 'Faltan canciones seleccionadas'}), 400

        # Crear una nueva lista de canciones temporal
        cursor = mysql.connection.cursor()
        cursor.execute('INSERT INTO listaCanciones (EventoID) VALUES (NULL)')
        temp_lista_id = cursor.lastrowid  # ID de la lista creada
        mysql.connection.commit()

        # Insertar las canciones seleccionadas en la lista temporal
        for cancion_id in canciones_seleccionadas:
            cursor.execute('INSERT INTO visualizacion (CancionID, ListaCancionesID) VALUES (%s, %s)', (cancion_id, temp_lista_id))
            mysql.connection.commit()
        
        cursor.close()
        return jsonify({'success': True, 'temp_lista_id': temp_lista_id})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para eliminar una canción
@app.route('/eliminar_cancion/<int:cancion_id>', methods=['DELETE'])
def eliminarCancion(cancion_id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM canciones WHERE ID = %s", (cancion_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"mensaje": "Canción eliminada exitosamente"}), 200


# Ruta para ver detalles del evento
@app.route('/verDetalles/<int:evento_id>', methods=['GET', 'POST'])
def ver_detalles(evento_id):
    cursor = mysql.connection.cursor()

    # Obtener los detalles del evento
    cursor.execute("SELECT * FROM evento WHERE ID = %s", (evento_id,))
    evento = cursor.fetchone()

    # Separar fecha y hora
    fecha_hora = evento[2]
    fecha = fecha_hora.strftime('%Y-%m-%d') if fecha_hora else ''
    hora = fecha_hora.strftime('%H:%M') if fecha_hora else ''

    # Obtener canciones asociadas al evento
    cursor.execute("""
        SELECT c.ID, c.Nombre 
        FROM canciones c
        INNER JOIN visualizacion v ON c.ID = v.CancionID
        INNER JOIN listaCanciones lc ON v.ListaCancionesID = lc.ID
        WHERE lc.EventoID = %s;
    """, (evento_id,))
    canciones = cursor.fetchall()

    cursor.close()

    return render_template(
        'VerDetalles/verDetalles.html',
        evento=evento,
        fecha=fecha,
        hora=hora,
        canciones=canciones,
        evento_id=evento_id  # Asegúrate de pasar el evento_id a la plantilla
    )
    
@app.route('/listaCancionesAgregadas/<int:evento_id>', methods=['GET'])
def lista_canciones_agregadas(evento_id):
    cursor = mysql.connection.cursor()

    # Obtener canciones asociadas al evento
    cursor.execute("""
        SELECT c.ID, c.Nombre
        FROM canciones c
        INNER JOIN visualizacion v ON c.ID = v.CancionID
        INNER JOIN listaCanciones lc ON v.ListaCancionesID = lc.ID
        WHERE lc.EventoID = %s;
    """, (evento_id,))
    canciones = cursor.fetchall()

    cursor.close()

    return render_template(
        'ListaCancionesAgregadas/listaCancionesAgregadas.html',
        canciones=canciones,
        evento_id=evento_id  # Pasar el evento_id a la plantilla
    )
    
    
    
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