// =============================================
// RUTAS DE REPORTES
// Maneja generación de reportes financieros
// =============================================

const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Obtener resumen financiero general
// GET /api/reports/summary
router.get('/summary', reportsController.getFinancialSummary);

// Obtener reporte detallado por rango de fechas
// GET /api/reports/detailed?startDate=2025-01-01&endDate=2025-12-31
router.get('/detailed', reportsController.getDetailedReport);

// Obtener reporte por mes
// GET /api/reports/monthly
router.get('/monthly', reportsController.getMonthlyReport);

// Exportar reporte a CSV
// GET /api/reports/export?startDate=2025-01-01&endDate=2025-12-31
router.get('/export', reportsController.exportReportCSV);

module.exports = router;
