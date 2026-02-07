// =============================================
// RUTAS DE RECARGAS
// Maneja todas las operaciones de recargas
// =============================================

const express = require('express');
const router = express.Router();
const rechargesController = require('../controllers/rechargesController');

// Obtener todas las recargas
// GET /api/recharges
router.get('/', rechargesController.getAllRecharges);

// Obtener recargas por cliente
// GET /api/recharges/client/:clientId
router.get('/client/:clientId', rechargesController.getRechargesByClient);

// Crear nueva recarga
// POST /api/recharges
router.post('/', rechargesController.createRecharge);

// Eliminar recarga
// DELETE /api/recharges/:id
router.delete('/:id', rechargesController.deleteRecharge);

module.exports = router;
