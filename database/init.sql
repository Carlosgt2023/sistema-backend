-- =============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Gestión de Membresías
-- =============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS membresias_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE membresias_db;

-- =============================================
-- TABLA: memberships (Membresías)
-- Almacena toda la información de las membresías de clientes
-- =============================================
CREATE TABLE IF NOT EXISTS memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    duration INT NOT NULL COMMENT 'Duración en meses',
    purchase_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    profit DECIMAL(10, 2) AS (sale_price - purchase_price) STORED COMMENT 'Ganancia calculada automáticamente',
    access_email VARCHAR(150) NOT NULL,
    access_password VARCHAR(100) NOT NULL,
    security_pin VARCHAR(20),
    profile_name VARCHAR(50),
    whatsapp_number VARCHAR(20) NOT NULL,
    notification_sent BOOLEAN DEFAULT FALSE COMMENT 'Indica si se envió notificación de vencimiento',
    status ENUM('active', 'expired', 'expiring') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client_id (client_id),
    INDEX idx_expiration_date (expiration_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: recharges (Recargas)
-- Almacena el historial de recargas realizadas a los clientes
-- =============================================
CREATE TABLE IF NOT EXISTS recharges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    recharge_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_client_id (client_id),
    INDEX idx_recharge_date (recharge_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: notifications_log (Registro de Notificaciones)
-- Almacena el historial de notificaciones enviadas
-- =============================================
CREATE TABLE IF NOT EXISTS notifications_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    membership_id INT NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    INDEX idx_membership_id (membership_id),
    INDEX idx_sent_date (sent_date),
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- VISTA: active_memberships
-- Vista que muestra solo las membresías activas
-- =============================================
CREATE OR REPLACE VIEW active_memberships AS
SELECT 
    m.*,
    DATEDIFF(m.expiration_date, CURDATE()) as days_until_expiry
FROM memberships m
WHERE m.expiration_date >= CURDATE()
ORDER BY m.expiration_date ASC;

-- =============================================
-- VISTA: expiring_memberships
-- Vista que muestra membresías que vencen en los próximos 7 días
-- =============================================
CREATE OR REPLACE VIEW expiring_memberships AS
SELECT 
    m.*,
    DATEDIFF(m.expiration_date, CURDATE()) as days_until_expiry
FROM memberships m
WHERE m.expiration_date >= CURDATE() 
  AND m.expiration_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY m.expiration_date ASC;

-- =============================================
-- VISTA: expired_memberships
-- Vista que muestra membresías vencidas
-- =============================================
CREATE OR REPLACE VIEW expired_memberships AS
SELECT 
    m.*,
    DATEDIFF(CURDATE(), m.expiration_date) as days_expired
FROM memberships m
WHERE m.expiration_date < CURDATE()
ORDER BY m.expiration_date DESC;

-- =============================================
-- VISTA: financial_summary
-- Vista para reportes financieros
-- =============================================
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    DATE_FORMAT(purchase_date, '%Y-%m') as month,
    COUNT(*) as total_memberships,
    SUM(purchase_price) as total_costs,
    SUM(sale_price) as total_revenue,
    SUM(profit) as total_profit,
    AVG(profit) as avg_profit_per_membership,
    (SUM(profit) / SUM(purchase_price)) * 100 as profit_margin_percentage
FROM memberships
GROUP BY DATE_FORMAT(purchase_date, '%Y-%m')
ORDER BY month DESC;

-- =============================================
-- PROCEDIMIENTO ALMACENADO: sp_get_financial_report
-- Genera reporte financiero entre fechas
-- =============================================
DELIMITER //

CREATE PROCEDURE sp_get_financial_report(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        m.id,
        m.client_id,
        m.client_name,
        m.service_name,
        m.provider,
        m.purchase_date,
        m.purchase_price,
        m.sale_price,
        m.profit,
        (m.profit / m.purchase_price) * 100 as margin_percentage
    FROM memberships m
    WHERE m.purchase_date BETWEEN p_start_date AND p_end_date
    ORDER BY m.purchase_date ASC;
    
    -- Resumen totales
    SELECT 
        COUNT(*) as total_memberships,
        SUM(m.purchase_price) as total_costs,
        SUM(m.sale_price) as total_revenue,
        SUM(m.profit) as net_profit,
        AVG(m.profit) as avg_profit,
        (SUM(m.profit) / SUM(m.purchase_price)) * 100 as overall_margin
    FROM memberships m
    WHERE m.purchase_date BETWEEN p_start_date AND p_end_date;
END //

DELIMITER ;

-- =============================================
-- PROCEDIMIENTO ALMACENADO: sp_check_expiring_memberships
-- Verifica membresías por vencer y actualiza flag de notificación
-- =============================================
DELIMITER //

CREATE PROCEDURE sp_check_expiring_memberships()
BEGIN
    -- Retorna membresías que requieren notificación
    SELECT 
        m.id,
        m.client_id,
        m.client_name,
        m.service_name,
        m.whatsapp_number,
        m.expiration_date,
        DATEDIFF(m.expiration_date, CURDATE()) as days_until_expiry,
        m.notification_sent
    FROM memberships m
    WHERE (
        -- Vencidas hoy o en los próximos 7 días
        m.expiration_date >= CURDATE() 
        AND m.expiration_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    )
    OR (
        -- Ya vencidas
        m.expiration_date < CURDATE()
    )
    ORDER BY m.expiration_date ASC;
END //

DELIMITER ;

-- =============================================
-- FUNCIÓN: fn_get_membership_status
-- Retorna el estado de una membresía
-- =============================================
DELIMITER //

CREATE FUNCTION fn_get_membership_status(p_expiration_date DATE)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE days_diff INT;
    DECLARE status_result VARCHAR(20);
    
    SET days_diff = DATEDIFF(p_expiration_date, CURDATE());
    
    IF days_diff < 0 THEN
        SET status_result = 'expired';
    ELSEIF days_diff <= 7 THEN
        SET status_result = 'expiring';
    ELSE
        SET status_result = 'active';
    END IF;
    
    RETURN status_result;
END //

DELIMITER ;

-- =============================================
-- TRIGGER: trg_update_notification_flag
-- Actualiza el flag de notificación cuando se registra en el log
-- =============================================
DELIMITER //

CREATE TRIGGER trg_update_notification_flag
AFTER INSERT ON notifications_log
FOR EACH ROW
BEGIN
    IF NEW.status = 'sent' THEN
        UPDATE memberships 
        SET notification_sent = TRUE 
        WHERE id = NEW.membership_id;
    END IF;
END //

DELIMITER ;

-- =============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- Puedes descomentar para insertar datos de prueba
-- =============================================

/*
INSERT INTO memberships (
    client_id, client_name, service_name, provider, duration,
    purchase_date, expiration_date, purchase_price, sale_price,
    access_email, access_password, security_pin, profile_name, whatsapp_number
) VALUES 
(
    'CLI001', 'Juan Pérez', 'Netflix Premium', 'Netflix Inc.', 1,
    '2025-01-15', '2025-02-15', 45.00, 60.00,
    'juan.netflix@example.com', 'Pass123!', '1234', 'Juan', '50212345678'
),
(
    'CLI002', 'María García', 'Spotify Premium', 'Spotify AB', 3,
    '2025-01-10', '2025-04-10', 120.00, 150.00,
    'maria.spotify@example.com', 'Pass456!', '5678', 'María', '50298765432'
),
(
    'CLI003', 'Carlos López', 'Disney+', 'The Walt Disney Company', 6,
    '2024-12-01', '2025-06-01', 250.00, 320.00,
    'carlos.disney@example.com', 'Pass789!', '9012', 'Carlos', '50287654321'
);

INSERT INTO recharges (client_id, amount, recharge_date, note) VALUES
('CLI001', 100.00, '2025-01-20', 'Recarga de saldo mensual'),
('CLI002', 150.00, '2025-01-22', 'Recarga especial');
*/

-- =============================================
-- VERIFICACIÓN DE CREACIÓN
-- =============================================

SELECT 'Base de datos creada exitosamente!' as mensaje;

SHOW TABLES;

SELECT 
    'Tablas creadas:' as info,
    COUNT(*) as total_tablas
FROM information_schema.tables 
WHERE table_schema = 'membresias_db';
