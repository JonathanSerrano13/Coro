const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta para login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Faltan datos' });
    }

    // Buscar usuario en tabla 'integrante' por Email
    const query = 'SELECT * FROM integrante WHERE Email = ?';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en base de datos' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];

        if (password === user.Contraseña) {
            return res.json({ message: 'Login exitoso', user: { id: user.ID, nombre: user.Nombre, rol: user.Rol } });
        } else {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
    });
});


router.post('/registro', (req, res) => {
  const { nombre, email, telefono, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  // Verificar si ya existe el email
  const checkQuery = 'SELECT * FROM integrante WHERE Email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en base de datos' });

    if (results.length > 0) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    // Insertar nuevo usuario
    const insertQuery = 'INSERT INTO integrante (Nombre, Email, Telefono, Contraseña, Rol) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [nombre, email, telefono || null, password, rol], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error al registrar usuario' });

      return res.status(201).json({ message: 'Usuario registrado con éxito', userId: result.insertId });
    });
  });
});

// Obtener lista de eventos (solo id y nombre)
router.get('/eventos', (req, res) => {
  const query = 'SELECT ID, Nombre FROM evento ORDER BY FechaHora DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener eventos' });
    res.json(results);
  });
});

// Borrar evento por ID
router.delete('/eventos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM evento WHERE ID = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al borrar evento' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Evento no encontrado' });
    res.json({ message: 'Evento eliminado con éxito' });
  });
});


// Crear nuevo evento
router.post('/eventos', (req, res) => {
    const { Nombre, FechaHora, Ubicacion, Descripcion } = req.body;

    if (!Nombre || !FechaHora || !Ubicacion) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const sql = `INSERT INTO evento (Nombre, FechaHora, Ubicacion, Descripcion) VALUES (?, ?, ?, ?)`;

    db.query(sql, [Nombre, FechaHora, Ubicacion, Descripcion], (err, result) => {
        if (err) {
            console.error('Error al insertar evento:', err);
            return res.status(500).json({ message: 'Error en la base de datos' });
        }
        res.status(201).json({ message: 'Evento creado', id: result.insertId });
    });
});

// Obtener detalles de evento por ID
router.get('/eventos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM evento WHERE ID = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener evento' });
    if (results.length === 0) return res.status(404).json({ message: 'Evento no encontrado' });
    res.json(results[0]);
  });
});

// Actualizar evento por ID
router.put('/eventos/:id', (req, res) => {
  const { id } = req.params;
  const { Nombre, FechaHora, Ubicacion, Descripcion } = req.body;

  if (!Nombre || !FechaHora || !Ubicacion) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  const query = 'UPDATE evento SET Nombre = ?, FechaHora = ?, Ubicacion = ?, Descripcion = ? WHERE ID = ?';
  db.query(query, [Nombre, FechaHora, Ubicacion, Descripcion, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar evento' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Evento no encontrado' });
    res.json({ message: 'Evento actualizado' });
  });
});

module.exports = router;
