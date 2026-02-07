// =============================================
// RUTAS DE NOTIFICACIONES
// Maneja notificaciones de WhatsApp
// =============================================

const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

// Obtener membresías que requieren notificación
// GET /api/notifications/pending
router.get('/pending', notificationsController.getPendingNotifications);

// Enviar notificación por WhatsApp
// POST /api/notifications/send
router.post('/send', notificationsController.sendWhatsAppNotification);

// Verificar y enviar notificaciones automáticas
// POST /api/notifications/check-and-send
router.post('/check-and-send', notificationsController.checkAndNotifyExpiring);

// Obtener historial de notificaciones
// GET /api/notifications/history
router.get('/history', notificationsController.getNotificationHistory);

module.exports = router;
