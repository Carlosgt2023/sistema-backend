// =============================================
// RUTAS DE MEMBRESÍAS
// Maneja todas las operaciones CRUD de membresías
// =============================================

const express = require('express');
const router = express.Router();
const membershipsController = require('../controllers/membershipsController');

// =============================================
// ENDPOINTS DE MEMBRESÍAS
// =============================================

// Obtener todas las membresías
// GET /api/memberships
router.get('/', membershipsController.getAllMemberships);

// Obtener una membresía por ID
// GET /api/memberships/:id
router.get('/:id', membershipsController.getMembershipById);

// Buscar membresías por filtros
// GET /api/memberships/search?status=active&clientId=CLI001
router.get('/search/filter', membershipsController.searchMemberships);

// Crear nueva membresía
// POST /api/memberships
router.post('/', membershipsController.createMembership);

// Actualizar membresía existente
// PUT /api/memberships/:id
router.put('/:id', membershipsController.updateMembership);

// Eliminar membresía
// DELETE /api/memberships/:id
router.delete('/:id', membershipsController.deleteMembership);

// Obtener estadísticas de membresías
// GET /api/memberships/stats/summary
router.get('/stats/summary', membershipsController.getMembershipStats);

module.exports = router;
