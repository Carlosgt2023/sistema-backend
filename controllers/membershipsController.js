// =============================================
// CONTROLADOR DE MEMBRESÍAS
// Lógica de negocio para gestión de membresías
// =============================================

const { promisePool } = require('../config/database');

// =============================================
// OBTENER TODAS LAS MEMBRESÍAS
// =============================================
exports.getAllMemberships = async (req, res) => {
    try {
        const [rows] = await promisePool.query(`
            SELECT 
                id,
                client_id,
                client_name,
                service_name,
                provider,
                duration,
                purchase_date,
                expiration_date,
                purchase_price,
                sale_price,
                profit,
                access_email,
                access_password,
                security_pin,
                profile_name,
                whatsapp_number,
                notification_sent,
                status,
                DATEDIFF(expiration_date, CURDATE()) as days_until_expiry,
                created_at,
                updated_at
            FROM memberships
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener membresías:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener membresías',
            error: error.message
        });
    }
};

// =============================================
// OBTENER MEMBRESÍA POR ID
// =============================================
exports.getMembershipById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await promisePool.query(`
            SELECT 
                id,
                client_id,
                client_name,
                service_name,
                provider,
                duration,
                purchase_date,
                expiration_date,
                purchase_price,
                sale_price,
                profit,
                access_email,
                access_password,
                security_pin,
                profile_name,
                whatsapp_number,
                notification_sent,
                status,
                DATEDIFF(expiration_date, CURDATE()) as days_until_expiry,
                created_at,
                updated_at
            FROM memberships
            WHERE id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Membresía no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al obtener membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener membresía',
            error: error.message
        });
    }
};

// =============================================
// BUSCAR MEMBRESÍAS CON FILTROS
// =============================================
exports.searchMemberships = async (req, res) => {
    try {
        const { status, clientId, serviceName, provider } = req.query;
        
        let query = `
            SELECT 
                id,
                client_id,
                client_name,
                service_name,
                provider,
                duration,
                purchase_date,
                expiration_date,
                purchase_price,
                sale_price,
                profit,
                access_email,
                access_password,
                security_pin,
                profile_name,
                whatsapp_number,
                notification_sent,
                status,
                DATEDIFF(expiration_date, CURDATE()) as days_until_expiry
            FROM memberships
            WHERE 1=1
        `;
        
        const params = [];
        
        // Filtrar por estado
        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }
        
        // Filtrar por ID de cliente
        if (clientId) {
            query += ` AND client_id LIKE ?`;
            params.push(`%${clientId}%`);
        }
        
        // Filtrar por nombre de servicio
        if (serviceName) {
            query += ` AND service_name LIKE ?`;
            params.push(`%${serviceName}%`);
        }
        
        // Filtrar por proveedor
        if (provider) {
            query += ` AND provider LIKE ?`;
            params.push(`%${provider}%`);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const [rows] = await promisePool.query(query, params);
        
        res.json({
            success: true,
            count: rows.length,
            filters: { status, clientId, serviceName, provider },
            data: rows
        });
    } catch (error) {
        console.error('Error al buscar membresías:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar membresías',
            error: error.message
        });
    }
};

// =============================================
// CREAR NUEVA MEMBRESÍA
// =============================================
exports.createMembership = async (req, res) => {
    try {
        const {
            client_id,
            client_name,
            service_name,
            provider,
            duration,
            purchase_date,
            expiration_date,
            purchase_price,
            sale_price,
            access_email,
            access_password,
            security_pin,
            profile_name,
            whatsapp_number
        } = req.body;
        
        // Validación de campos requeridos
        if (!client_id || !client_name || !service_name || !provider || !duration || 
            !purchase_date || !expiration_date || !purchase_price || !sale_price || 
            !access_email || !access_password || !whatsapp_number) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos obligatorios deben ser proporcionados'
            });
        }
        
        const [result] = await promisePool.query(`
            INSERT INTO memberships (
                client_id, client_name, service_name, provider, duration,
                purchase_date, expiration_date, purchase_price, sale_price,
                access_email, access_password, security_pin, profile_name, whatsapp_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            client_id, client_name, service_name, provider, duration,
            purchase_date, expiration_date, purchase_price, sale_price,
            access_email, access_password, security_pin, profile_name, whatsapp_number
        ]);
        
        // Obtener la membresía recién creada
        const [newMembership] = await promisePool.query(
            'SELECT * FROM memberships WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Membresía creada exitosamente',
            data: newMembership[0]
        });
    } catch (error) {
        console.error('Error al crear membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear membresía',
            error: error.message
        });
    }
};

// =============================================
// ACTUALIZAR MEMBRESÍA
// =============================================
exports.updateMembership = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Verificar si la membresía existe
        const [existing] = await promisePool.query(
            'SELECT id FROM memberships WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Membresía no encontrada'
            });
        }
        
        // Construir query dinámica con los campos proporcionados
        const fields = [];
        const values = [];
        
        const allowedFields = [
            'client_id', 'client_name', 'service_name', 'provider', 'duration',
            'purchase_date', 'expiration_date', 'purchase_price', 'sale_price',
            'access_email', 'access_password', 'security_pin', 'profile_name',
            'whatsapp_number', 'notification_sent'
        ];
        
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(updateData[field]);
            }
        });
        
        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }
        
        values.push(id);
        
        await promisePool.query(
            `UPDATE memberships SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        
        // Obtener la membresía actualizada
        const [updated] = await promisePool.query(
            'SELECT * FROM memberships WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Membresía actualizada exitosamente',
            data: updated[0]
        });
    } catch (error) {
        console.error('Error al actualizar membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar membresía',
            error: error.message
        });
    }
};

// =============================================
// ELIMINAR MEMBRESÍA
// =============================================
exports.deleteMembership = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si existe
        const [existing] = await promisePool.query(
            'SELECT id FROM memberships WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Membresía no encontrada'
            });
        }
        
        await promisePool.query('DELETE FROM memberships WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Membresía eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar membresía:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar membresía',
            error: error.message
        });
    }
};

// =============================================
// OBTENER ESTADÍSTICAS
// =============================================
exports.getMembershipStats = async (req, res) => {
    try {
        // Total de membresías activas
        const [activeCount] = await promisePool.query(`
            SELECT COUNT(*) as count 
            FROM memberships 
            WHERE status = 'active'
        `);
        
        // Total de membresías por vencer
        const [expiringCount] = await promisePool.query(`
            SELECT COUNT(*) as count 
            FROM memberships 
            WHERE status = 'expiring'
        `);
        
        // Total de membresías vencidas
        const [expiredCount] = await promisePool.query(`
            SELECT COUNT(*) as count 
            FROM memberships 
            WHERE status = 'expired'
        `);
        
        // Totales financieros
        const [financials] = await promisePool.query(`
            SELECT 
                COUNT(*) as total_memberships,
                SUM(purchase_price) as total_costs,
                SUM(sale_price) as total_revenue,
                SUM(profit) as net_profit,
                AVG(profit) as avg_profit
            FROM memberships
        `);
        
        res.json({
            success: true,
            data: {
                active: activeCount[0].count,
                expiring: expiringCount[0].count,
                expired: expiredCount[0].count,
                total: financials[0].total_memberships,
                financials: {
                    totalCosts: parseFloat(financials[0].total_costs || 0),
                    totalRevenue: parseFloat(financials[0].total_revenue || 0),
                    netProfit: parseFloat(financials[0].net_profit || 0),
                    avgProfit: parseFloat(financials[0].avg_profit || 0)
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};
