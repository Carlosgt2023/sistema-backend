// =============================================
// CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS
// =============================================

const mysql = require('mysql2');
require('dotenv').config();

// Crear pool de conexiones para mejor rendimiento
// El pool maneja múltiples conexiones de manera eficiente
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'membresias_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10, // Máximo 10 conexiones simultáneas
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Convertir a promesas para usar async/await
const promisePool = pool.promise();

// Función para verificar la conexión
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Conexión exitosa a MySQL');
        console.log(`📦 Base de datos: ${process.env.DB_NAME}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar a MySQL:', error.message);
        return false;
    }
};

// Función para ejecutar queries de manera segura
const executeQuery = async (sql, params = []) => {
    try {
        const [results] = await promisePool.execute(sql, params);
        return { success: true, data: results };
    } catch (error) {
        console.error('Error en query:', error);
        return { success: false, error: error.message };
    }
};

// Exportar pool y funciones útiles
module.exports = {
    pool,
    promisePool,
    testConnection,
    executeQuery
};
