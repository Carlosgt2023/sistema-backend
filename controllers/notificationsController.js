// =============================================
// CONTROLADOR DE NOTIFICACIONES
// Lógica para notificaciones de WhatsApp
// =============================================

const { promisePool } = require('../config/database');

// Obtener membresías pendientes de notificación
exports.getPendingNotifications = async (req, res) => {
    try {
        const [rows] = await promisePool.query(`
            CALL sp_check_expiring_memberships()
        `);
        
        res.json({
            success: true,
            count: rows[0].length,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al obtener notificaciones pendientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener notificaciones pendientes',
            error: error.message
        });
    }
};

// Generar mensaje de WhatsApp personalizado
function generateWhatsAppMessage(clientName, serviceName, expirationDate, daysUntilExpiry) {
    const today = new Date();
    const expDate = new Date(expirationDate);
    
    let message = '';
    
    if (daysUntilExpiry < 0) {
        // Servicio vencido
        message = `Hola ${clientName},\n\n⚠️ Su membresía de *${serviceName}* ha vencido el ${formatDate(expirationDate)}.\n\nPor favor, contacte con nosotros para renovar su servicio.\n\n¡Gracias por su preferencia! 😊`;
    } else if (daysUntilExpiry === 0) {
        // Vence hoy
        message = `Hola ${clientName},\n\n🔔 Su membresía de *${serviceName}* vence HOY (${formatDate(expirationDate)}).\n\nRenueve ahora para no perder el servicio.\n\n¡Gracias! 😊`;
    } else {
        // Por vencer
        message = `Hola ${clientName},\n\n🔔 Su membresía de *${serviceName}* vencerá en ${daysUntilExpiry} día(s) (${formatDate(expirationDate)}).\n\nRenueve a tiempo para mantener activo su servicio.\n\n¡Gracias por su preferencia! 😊`;
    }
    
    return message;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Enviar notificación por WhatsApp
exports.sendWhatsAppNotification = async (req, res) => {
    try {
        const { membershipId } = req.body;
        
        if (!membershipId) {
            return res.status(400).json({
                success: false,
                message: 'membershipId es requerido'
            });
        }
        
        // Obtener información de la membresía
        const [membership] = await promisePool.query(`
            SELECT 
                id,
                client_name,
                service_name,
                whatsapp_number,
                expiration_date,
                DATEDIFF(expiration_date, CURDATE()) as days_until_expiry
            FROM memberships
            WHERE id = ?
        `, [membershipId]);
        
        if (membership.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Membresía no encontrada'
            });
        }
        
        const data = membership[0];
        
        // Generar mensaje personalizado
        const message = generateWhatsAppMessage(
            data.client_name,
            data.service_name,
            data.expiration_date,
            data.days_until_expiry
        );
        
        // Generar URL de WhatsApp
        const whatsappNumber = data.whatsapp_number.replace(/\D/g, ''); // Remover caracteres no numéricos
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Registrar en el log de notificaciones
        await promisePool.query(`
            INSERT INTO notifications_log (
                membership_id, client_name, service_name, whatsapp_number, message, status
            ) VALUES (?, ?, ?, ?, ?, 'sent')
        `, [
            data.id,
            data.client_name,
            data.service_name,
            data.whatsapp_number,
            message
        ]);
        
        res.json({
            success: true,
            message: 'Notificación preparada',
            data: {
                whatsappUrl: whatsappUrl,
                messagePreview: message,
                clientName: data.client_name,
                serviceName: data.service_name
            }
        });
        
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar notificación',
            error: error.message
        });
    }
};

// Verificar y notificar membresías por vencer (Tarea automática)
exports.checkAndNotifyExpiring = async () => {
    try {
        console.log('🔍 Verificando membresías por vencer...');
        
        const [memberships] = await promisePool.query(`
            CALL sp_check_expiring_memberships()
        `);
        
        const toNotify = memberships[0];
        
        if (toNotify.length === 0) {
            console.log('✅ No hay membresías que requieran notificación');
            return;
        }
        
        console.log(`📧 ${toNotify.length} membresía(s) requieren notificación`);
        
        // Aquí podrías integrar una API de WhatsApp Business
        // Por ahora, solo registramos en el log
        for (const membership of toNotify) {
            const message = generateWhatsAppMessage(
                membership.client_name,
                membership.service_name,
                membership.expiration_date,
                membership.days_until_expiry
            );
            
            await promisePool.query(`
                INSERT INTO notifications_log (
                    membership_id, client_name, service_name, whatsapp_number, message, status
                ) VALUES (?, ?, ?, ?, ?, 'pending')
            `, [
                membership.id,
                membership.client_name,
                membership.service_name,
                membership.whatsapp_number,
                message
            ]);
            
            console.log(`  - Notificación preparada para: ${membership.client_name}`);
        }
        
        console.log('✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error en verificación automática:', error);
    }
};

// Obtener historial de notificaciones
exports.getNotificationHistory = async (req, res) => {
    try {
        const [rows] = await promisePool.query(`
            SELECT 
                n.*,
                m.client_id
            FROM notifications_log n
            LEFT JOIN memberships m ON n.membership_id = m.id
            ORDER BY n.sent_date DESC
            LIMIT 100
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener historial de notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial',
            error: error.message
        });
    }
};
