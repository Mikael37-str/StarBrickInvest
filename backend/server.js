const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();

// ✅ CONFIGURACIÓN CORS ACTUALIZADA
app.use(cors({
  origin: '*', // Permite todas las origines
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// ==================== AUTENTICACIÓN ====================

// Registro
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';
    
    await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
      [name, email, hash, userRole]
    );
    
    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
    }
    
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: rows[0].id, role: rows[0].role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = rows[0];
    
    res.json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
  }
});

// ==================== PERFIL DE USUARIO ====================

app.get('/api/profile/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, email, role, bio FROM users WHERE id = ?', [req.params.id]);
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
});

app.put('/api/profile/:id', async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.params.id;
    
    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    await db.execute(
      'UPDATE users SET name = ?, bio = ? WHERE id = ?',
      [name, bio || null, userId]
    );
    
    const [updated] = await db.execute('SELECT id, name, email, role, bio FROM users WHERE id = ?', [userId]);
    
    res.json({ success: true, message: 'Perfil actualizado correctamente', user: updated[0] });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
  }
});

app.get('/api/profile/:id/collection', async (req, res) => {
  try {
    const [items] = await db.execute(`
      SELECT * FROM user_collection 
      WHERE user_id = ? 
      ORDER BY added_at DESC
    `, [req.params.id]);
    
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error al obtener colección:', error);
    res.status(500).json({ success: false, items: [] });
  }
});

// ==================== SETS Y MINIFIGURAS ====================

// Obtener sets
app.get('/api/sets', async (req, res) => {
  try {
    const [sets] = await db.execute('SELECT * FROM sets ORDER BY name');
    
    const setsWithBoolean = sets.map(set => ({
      ...set,
      retired: set.retired === 1
    }));
    
    res.json({ success: true, sets: setsWithBoolean });
  } catch (error) {
    console.error('Error al obtener sets:', error);
    res.status(500).json({ success: false, sets: [] });
  }
});

// Crear nuevo set (ADMIN)
app.post('/api/sets', async (req, res) => {
  try {
    const { set_id, name, year, pieces, price_usd, image_url, retired } = req.body;
    
    if (!set_id || !name) {
      return res.status(400).json({ success: false, message: 'ID y nombre son obligatorios' });
    }

    const [result] = await db.execute(
      'INSERT INTO sets (set_id, name, year, pieces, price_usd, image, retired) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [set_id, name, year || null, pieces || null, price_usd || null, image_url || null, retired || 0]
    );

    const [newSet] = await db.execute('SELECT * FROM sets WHERE id = ?', [result.insertId]);
    
    const setWithBoolean = {
      ...newSet[0],
      retired: newSet[0].retired === 1
    };
    
    res.json({ success: true, message: 'Set creado exitosamente', set: setWithBoolean });
  } catch (error) {
    console.error('Error al crear set:', error);
    res.status(500).json({ success: false, message: 'Error al crear set' });
  }
});

// Actualizar set (ADMIN)
app.put('/api/sets/:id', async (req, res) => {
  try {
    const { set_id, name, year, pieces, price_usd, image_url, retired } = req.body;
    const id = req.params.id;

    const [existing] = await db.execute('SELECT * FROM sets WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Set no encontrado' });
    }

    await db.execute(
      'UPDATE sets SET set_id = ?, name = ?, year = ?, pieces = ?, price_usd = ?, image = ?, retired = ? WHERE id = ?',
      [set_id, name, year, pieces, price_usd, image_url, retired, id]
    );

    const [updated] = await db.execute('SELECT * FROM sets WHERE id = ?', [id]);
    
    const setWithBoolean = {
      ...updated[0],
      retired: updated[0].retired === 1
    };
    
    res.json({ success: true, message: 'Set actualizado exitosamente', set: setWithBoolean });
  } catch (error) {
    console.error('Error al actualizar set:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar set' });
  }
});

// Eliminar set (ADMIN)
app.delete('/api/sets/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const [existing] = await db.execute('SELECT * FROM sets WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Set no encontrado' });
    }

    await db.execute('DELETE FROM sets WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Set eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar set:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar set' });
  }
});

// Obtener minifiguras
app.get('/api/minifigures', async (req, res) => {
  try {
    const [minifigures] = await db.execute('SELECT * FROM minifigures ORDER BY name');
    res.json({ success: true, minifigures });
  } catch (error) {
    console.error('Error al obtener minifiguras:', error);
    res.status(500).json({ success: false, minifigures: [] });
  }
});

// Crear nueva minifigura (ADMIN)
app.post('/api/minifigures', async (req, res) => {
  try {
    const { minifig_id, name, year, appearances, avg_price_usd, image_url } = req.body;
    
    if (!minifig_id || !name) {
      return res.status(400).json({ success: false, message: 'ID y nombre son obligatorios' });
    }

    const [result] = await db.execute(
      'INSERT INTO minifigures (minifig_id, name, year, appearances, avg_price_usd, image) VALUES (?, ?, ?, ?, ?, ?)',
      [minifig_id, name, year || null, appearances || null, avg_price_usd || null, image_url || null]
    );

    const [newMinifig] = await db.execute('SELECT * FROM minifigures WHERE id = ?', [result.insertId]);
    
    res.json({ success: true, message: 'Minifigura creada exitosamente', minifigure: newMinifig[0] });
  } catch (error) {
    console.error('Error al crear minifigura:', error);
    res.status(500).json({ success: false, message: 'Error al crear minifigura' });
  }
});

// Actualizar minifigura (ADMIN)
app.put('/api/minifigures/:id', async (req, res) => {
  try {
    const { minifig_id, name, year, appearances, avg_price_usd, image_url } = req.body;
    const id = req.params.id;

    const [existing] = await db.execute('SELECT * FROM minifigures WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Minifigura no encontrada' });
    }

    await db.execute(
      'UPDATE minifigures SET minifig_id = ?, name = ?, year = ?, appearances = ?, avg_price_usd = ?, image = ? WHERE id = ?',
      [minifig_id, name, year, appearances, avg_price_usd, image_url, id]
    );

    const [updated] = await db.execute('SELECT * FROM minifigures WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Minifigura actualizada exitosamente', minifigure: updated[0] });
  } catch (error) {
    console.error('Error al actualizar minifigura:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar minifigura' });
  }
});

// Eliminar minifigura (ADMIN)
app.delete('/api/minifigures/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const [existing] = await db.execute('SELECT * FROM minifigures WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Minifigura no encontrada' });
    }

    await db.execute('DELETE FROM minifigures WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Minifigura eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar minifigura:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar minifigura' });
  }
});

// ==================== ARTÍCULOS ====================

// Obtener todos los artículos
app.get('/api/articles', async (req, res) => {
  try {
    const [articles] = await db.execute('SELECT * FROM articles ORDER BY created_at DESC');
    res.json({ success: true, articles });
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    res.status(500).json({ success: false, articles: [] });
  }
});

// Obtener un artículo por ID
app.get('/api/articles/:id', async (req, res) => {
  try {
    const [articles] = await db.execute('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    
    if (!articles.length) {
      return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
    }
    
    res.json({ success: true, article: articles[0] });
  } catch (error) {
    console.error('Error al obtener artículo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener artículo' });
  }
});

// Crear un nuevo artículo (solo admin)
app.post('/api/articles', async (req, res) => {
  try {
    console.log('📝 Datos recibidos:', req.body);
    
    const { title, content, category, image_url } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Título, contenido y categoría son obligatorios' 
      });
    }

    const validCategories = ['news', 'review', 'tutorial', 'market'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Categoría no válida' 
      });
    }

    console.log('💾 Guardando artículo con imagen URL:', image_url);

    const [result] = await db.execute(
      'INSERT INTO articles (title, content, category, image) VALUES (?, ?, ?, ?)',
      [title, content, category, image_url || null]
    );

    const [article] = await db.execute('SELECT * FROM articles WHERE id = ?', [result.insertId]);

    console.log('✅ Artículo creado:', article[0]);

    res.json({ 
      success: true, 
      message: 'Artículo creado exitosamente',
      article: article[0]
    });
  } catch (error) {
    console.error('❌ Error al crear artículo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear artículo: ' + error.message 
    });
  }
});

// Actualizar un artículo (solo admin)
app.put('/api/articles/:id', async (req, res) => {
  try {
    const { title, content, category, image_url } = req.body;
    const articleId = req.params.id;

    const [existing] = await db.execute('SELECT * FROM articles WHERE id = ?', [articleId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
    }

    let query = 'UPDATE articles SET ';
    const params = [];

    if (title) {
      query += 'title = ?, ';
      params.push(title);
    }

    if (content) {
      query += 'content = ?, ';
      params.push(content);
    }

    if (category) {
      query += 'category = ?, ';
      params.push(category);
    }

    if (image_url !== undefined) {
      query += 'image = ?, ';
      params.push(image_url);
    }

    query = query.slice(0, -2);
    query += ' WHERE id = ?';
    params.push(articleId);

    await db.execute(query, params);

    const [updated] = await db.execute('SELECT * FROM articles WHERE id = ?', [articleId]);

    res.json({ 
      success: true, 
      message: 'Artículo actualizado exitosamente',
      article: updated[0]
    });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar artículo' });
  }
});

// Eliminar un artículo (solo admin)
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const articleId = req.params.id;

    const [existing] = await db.execute('SELECT * FROM articles WHERE id = ?', [articleId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
    }

    await db.execute('DELETE FROM articles WHERE id = ?', [articleId]);

    res.json({ 
      success: true, 
      message: 'Artículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar artículo' });
  }
});

// ==================== COLECCIÓN ====================

// Añadir artículo a la colección
app.post('/api/collection/add', async (req, res) => {
  try {
    console.log('📦 Datos recibidos:', req.body);
    
    const { userId, itemType, itemId, quantity, paidPrice, condition, notes } = req.body;
    
    if (!userId || !itemType || !itemId || !quantity || paidPrice === undefined) {
      console.error('❌ Faltan campos requeridos');
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos' 
      });
    }

    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(paidPrice);

    if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'La cantidad debe estar entre 1 y 1000' 
      });
    }

    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 999999.99) {
      return res.status(400).json({ 
        success: false, 
        message: 'El precio debe estar entre 0 y 999,999.99' 
      });
    }

    if (!['set', 'minifigure'].includes(itemType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipo de artículo inválido' 
      });
    }

    const validCondition = ['new', 'used'].includes(condition) ? condition : 'new';
    const cleanNotes = notes ? notes.trim().substring(0, 500) : null;

    const [userExists] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (!userExists.length) {
      console.error('❌ Usuario no encontrado:', userId);
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    let itemInfo;
    if (itemType === 'set') {
      const [sets] = await db.execute('SELECT * FROM sets WHERE id = ?', [itemId]);
      if (!sets.length) {
        console.error('❌ Set no encontrado:', itemId);
        return res.status(404).json({ success: false, message: 'Set no encontrado' });
      }
      itemInfo = sets[0];
      console.log('✅ Set encontrado:', itemInfo.name);
    } else {
      const [minifigs] = await db.execute('SELECT * FROM minifigures WHERE id = ?', [itemId]);
      if (!minifigs.length) {
        console.error('❌ Minifigura no encontrada:', itemId);
        return res.status(404).json({ success: false, message: 'Minifigura no encontrada' });
      }
      itemInfo = minifigs[0];
      console.log('✅ Minifigura encontrada:', itemInfo.name);
    }

    const [existing] = await db.execute(
      'SELECT * FROM user_collection WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [userId, itemType, itemId]
    );

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + parsedQuantity;
      await db.execute(
        'UPDATE user_collection SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, existing[0].id]
      );
      
      console.log('✅ Cantidad actualizada:', newQuantity);
      return res.json({ 
        success: true, 
        message: 'Cantidad actualizada en la colección',
        updated: true
      });
    }

    const imageUrl = itemInfo.image || null;

    console.log('💾 Insertando en base de datos...');

    const [result] = await db.execute(
      `INSERT INTO user_collection 
       (user_id, item_type, item_id, name, quantity, paid_price_usd, condition_status, notes, image, added_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        itemType,
        itemId,
        itemInfo.name,
        parsedQuantity,
        parsedPrice,
        validCondition,
        cleanNotes,
        imageUrl
      ]
    );

    console.log('✅ Artículo añadido exitosamente, ID:', result.insertId);

    res.json({ 
      success: true, 
      message: 'Artículo añadido a la colección exitosamente',
      itemId: result.insertId
    });
  } catch (error) {
    console.error('❌ Error al añadir a colección:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error al añadir artículo a la colección: ' + error.message 
    });
  }
});

// Obtener colección completa del usuario con estadísticas
app.get('/api/collection/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const [items] = await db.execute(
      `SELECT * FROM user_collection 
       WHERE user_id = ? 
       ORDER BY added_at DESC`,
      [userId]
    );

    let totalValue = 0;
    let totalInvested = 0;
    let totalSets = 0;
    let totalMinifigures = 0;

    items.forEach(item => {
      const paidPrice = parseFloat(item.paid_price_usd) || 0;
      const quantity = parseInt(item.quantity) || 0;
      
      totalInvested += paidPrice * quantity;
      
      if (item.item_type === 'set') {
        totalSets += quantity;
      } else {
        totalMinifigures += quantity;
      }
    });

    for (let item of items) {
      let currentPrice = 0;
      if (item.item_type === 'set') {
        const [sets] = await db.execute('SELECT price_usd FROM sets WHERE id = ?', [item.item_id]);
        currentPrice = sets.length ? (parseFloat(sets[0].price_usd) || 0) : 0;
      } else {
        const [minifigs] = await db.execute('SELECT avg_price_usd FROM minifigures WHERE id = ?', [item.item_id]);
        currentPrice = minifigs.length ? (parseFloat(minifigs[0].avg_price_usd) || 0) : 0;
      }
      totalValue += currentPrice * (parseInt(item.quantity) || 0);
    }

    const stats = {
      totalItems: items.length,
      totalSets,
      totalMinifigures,
      totalInvested: totalInvested.toFixed(2),
      totalValue: totalValue.toFixed(2),
      profitLoss: (totalValue - totalInvested).toFixed(2),
      profitLossPercentage: totalInvested > 0 
        ? (((totalValue - totalInvested) / totalInvested) * 100).toFixed(2) 
        : '0.00'
    };

    res.json({ 
      success: true, 
      items,
      stats
    });
  } catch (error) {
    console.error('Error al obtener colección:', error);
    res.status(500).json({ 
      success: false, 
      items: [],
      stats: {}
    });
  }
});

// Eliminar artículo de la colección
app.delete('/api/collection/:collectionId', async (req, res) => {
  try {
    const collectionId = req.params.collectionId;

    const [existing] = await db.execute(
      'SELECT * FROM user_collection WHERE id = ?',
      [collectionId]
    );

    if (!existing.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Artículo no encontrado en la colección' 
      });
    }

    await db.execute('DELETE FROM user_collection WHERE id = ?', [collectionId]);

    res.json({ 
      success: true, 
      message: 'Artículo eliminado de la colección' 
    });
  } catch (error) {
    console.error('Error al eliminar de colección:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar artículo' 
    });
  }
});

// Actualizar artículo en la colección
app.put('/api/collection/:collectionId', async (req, res) => {
  try {
    const collectionId = req.params.collectionId;
    const { quantity, paidPrice, condition, notes } = req.body;

    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(paidPrice);

    if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'La cantidad debe estar entre 1 y 1000' 
      });
    }

    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 999999.99) {
      return res.status(400).json({ 
        success: false, 
        message: 'El precio debe estar entre 0 y 999,999.99' 
      });
    }

    const validCondition = ['new', 'used'].includes(condition) ? condition : 'new';
    const cleanNotes = notes ? notes.trim().substring(0, 500) : null;

    const [existing] = await db.execute(
      'SELECT * FROM user_collection WHERE id = ?',
      [collectionId]
    );

    if (!existing.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Artículo no encontrado en la colección' 
      });
    }

    await db.execute(
      `UPDATE user_collection 
       SET quantity = ?, paid_price_usd = ?, condition_status = ?, notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [parsedQuantity, parsedPrice, validCondition, cleanNotes, collectionId]
    );

    const [updated] = await db.execute(
      'SELECT * FROM user_collection WHERE id = ?',
      [collectionId]
    );

    res.json({ 
      success: true, 
      message: 'Artículo actualizado exitosamente',
      item: updated[0]
    });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar artículo' 
    });
  }
});

// ==================== SERVIDOR ====================

app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Servidor en puerto ${process.env.PORT || 3000}`);
});