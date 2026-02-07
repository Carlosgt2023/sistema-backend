// =============================================
// SERVIDOR PRINCIPAL - BACKEND API
// Sistema de Gestión de Membresías
// =============================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

// Importar rutas
const membershipsRoutes = require('./routes/memberships');
const rechargesRoutes = require('./routes/recharges');
const reportsRoutes = require('./routes/reports');
const notificationsRoutes = require('./routes/notifications');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
    });
// =============================================
// MIDDLEWARES
// =============================================

// CORS - Permitir peticiones desde el frontend
app.use(cors({
    origin: '*', // En producción, especifica el dominio exacto
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser de JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging de peticiones
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toLocaleString()}`);
    next();
});

// =============================================
// RUTAS DE LA API
// =============================================

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: '🎯 API de Gestión de Membresías',
        version: '1.0.0',
        status: 'active',
        endpoints: {
            memberships: '/api/memberships',
            recharges: '/api/recharges',
            reports: '/api/reports',
            notifications: '/api/notifications'
        }
    });
});

// Rutas principales
app.use('/api/memberships', membershipsRoutes);
app.use('/api/recharges', rechargesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);

// =============================================
// CRON JOBS - TAREAS PROGRAMADAS
// =============================================

// Verificar membresías vencidas cada día a las 9:00 AM
cron.schedule('0 9 * * *', () => {
    console.log('🔔 Ejecutando verificación de membresías vencidas...');
    // Esta función se implementará en el controlador de notificaciones
    const { checkAndNotifyExpiring } = require('./controllers/notificationsController');
    checkAndNotifyExpiring();
});

// =============================================
// MANEJO DE ERRORES
// =============================================

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// =============================================
// INICIAR SERVIDOR
// =============================================

const startServer = async () => {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.error('❌ No se pudo conectar a la base de datos');
        console.log('Por favor verifica tu configuración en el archivo .env');
        console.log(process.env.DB_PASSWORD);
        process.exit(1);
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
        console.log('');
        console.log('════════════════════════════════════════════');
        console.log('🚀 Servidor iniciado exitosamente');
        console.log('════════════════════════════════════════════');
        console.log(`📡 Puerto: ${PORT}`);
        console.log(`🌐 URL: http://localhost:${PORT}`);
        console.log(`📊 API: http://localhost:${PORT}/api`);
        console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        console.log('════════════════════════════════════════════');
        console.log('');
    });
};

// Iniciar
startServer();

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('Error no manejado:', err);
    process.exit(1);
});
