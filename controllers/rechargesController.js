// =============================================
// CONTROLADOR DE RECARGAS
// Lógica de negocio para recargas
// =============================================

const { promisePool } = require('../config/database');

// Obtener todas las recargas
exports.getAllRecharges = async (req, res) => {
    try {
        const [rows] = await promisePool.query(`
            SELECT 
                r.*,
                m.client_name
            FROM recharges r
            LEFT JOIN memberships m ON r.client_id = m.client_id
            ORDER BY r.recharge_date DESC, r.created_at DESC
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener recargas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener recargas',
            error: error.message
        });
    }
};

// Obtener recargas por cliente
exports.getRechargesByClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        
        const [rows] = await promisePool.query(`
            SELECT 
                r.*,
                m.client_name
            FROM recharges r
            LEFT JOIN memberships m ON r.client_id = m.client_id
            WHERE r.client_id = ?
            ORDER BY r.recharge_date DESC
        `, [clientId]);
        
        // Calcular total de recargas
        const [total] = await promisePool.query(`
            SELECT SUM(amount) as total
            FROM recharges
            WHERE client_id = ?
        `, [clientId]);
        
        res.json({
            success: true,
            clientId: clientId,
            count: rows.length,
            totalAmount: parseFloat(total[0].total || 0),
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener recargas del cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener recargas del cliente',
            error: error.message
        });
    }
};

// Crear nueva recarga
exports.createRecharge = async (req, res) => {
    try {
        const { client_id, amount, recharge_date, note } = req.body;
        
        if (!client_id || !amount || !recharge_date) {
            return res.status(400).json({
                success: false,
                message: 'client_id, amount y recharge_date son requeridos'
            });
        }
        
        const [result] = await promisePool.query(`
            INSERT INTO recharges (client_id, amount, recharge_date, note)
            VALUES (?, ?, ?, ?)
        `, [client_id, amount, recharge_date, note || null]);
        
        const [newRecharge] = await promisePool.query(
            'SELECT * FROM recharges WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Recarga registrada exitosamente',
            data: newRecharge[0]
        });
    } catch (error) {
        console.error('Error al crear recarga:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear recarga',
            error: error.message
        });
    }
};

// Eliminar recarga
exports.deleteRecharge = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [existing] = await promisePool.query(
            'SELECT id FROM recharges WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recarga no encontrada'
            });
        }
        
        await promisePool.query('DELETE FROM recharges WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Recarga eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar recarga:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar recarga',
            error: error.message
        });
    }
};
