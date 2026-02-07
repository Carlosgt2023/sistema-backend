-- =============================================
-- DATOS DE EJEMPLO PARA TESTING
-- Sistema de Gestión de Membresías
-- =============================================

USE membresias_db;

-- Limpiar datos existentes (CUIDADO: Esto borrará todos los datos)
-- Descomenta estas líneas solo si quieres empezar desde cero
-- TRUNCATE TABLE notifications_log;
-- TRUNCATE TABLE recharges;
-- TRUNCATE TABLE memberships;

-- =============================================
-- INSERTAR MEMBRESÍAS DE EJEMPLO
-- =============================================

INSERT INTO memberships (
    client_id, client_name, service_name, provider, duration,
    purchase_date, expiration_date, purchase_price, sale_price,
    access_email, access_password, security_pin, profile_name, whatsapp_number
) VALUES 
-- Membresías ACTIVAS (con varios meses por delante)
(
    'CLI001', 'Juan Pérez González', 'Netflix Premium', 'Netflix Inc.', 3,
    '2025-01-15', '2025-04-15', 135.00, 180.00,
    'juan.netflix@example.com', 'NetPass123!', '1234', 'Juan', '50212345678'
),
(
    'CLI002', 'María García López', 'Spotify Premium Familiar', 'Spotify AB', 6,
    '2025-01-10', '2025-07-10', 360.00, 450.00,
    'maria.spotify@example.com', 'SpotPass456!', '5678', 'María', '50298765432'
),
(
    'CLI003', 'Carlos López Martínez', 'Disney+ Premium', 'The Walt Disney Company', 12,
    '2024-12-01', '2025-12-01', 600.00, 800.00,
    'carlos.disney@example.com', 'DisneyPass789!', '9012', 'Carlos', '50287654321'
),

-- Membresías POR VENCER (en los próximos 7 días)
(
    'CLI004', 'Ana Rodríguez Sánchez', 'Amazon Prime Video', 'Amazon', 1,
    '2025-01-10', '2025-02-10', 45.00, 60.00,
    'ana.prime@example.com', 'PrimePass321!', '3456', 'Ana', '50276543210'
),
(
    'CLI005', 'Luis Hernández Torres', 'HBO Max', 'Warner Bros', 2,
    '2024-12-12', '2025-02-12', 90.00, 120.00,
    'luis.hbo@example.com', 'HBOPass654!', '6789', 'Luis', '50265432109'
),

-- Membresías VENCIDAS (ya pasaron la fecha)
(
    'CLI006', 'Elena Morales Castro', 'YouTube Premium', 'Google LLC', 1,
    '2024-12-05', '2025-01-05', 40.00, 55.00,
    'elena.youtube@example.com', 'YTPass987!', '2345', 'Elena', '50254321098'
),
(
    'CLI007', 'Roberto Díaz Ramírez', 'Apple TV+', 'Apple Inc.', 3,
    '2024-10-01', '2025-01-01', 120.00, 165.00,
    'roberto.appletv@example.com', 'ApplePass147!', '7890', 'Roberto', '50243210987'
),

-- Más membresías activas de diferentes servicios
(
    'CLI008', 'Patricia Gómez Ruiz', 'Crunchyroll Premium', 'Sony Pictures', 6,
    '2025-01-20', '2025-07-20', 180.00, 240.00,
    'patricia.crunch@example.com', 'CrunchPass258!', '4567', 'Patricia', '50232109876'
),
(
    'CLI009', 'Fernando Ortiz Luna', 'Paramount+', 'Paramount Global', 1,
    '2025-02-01', '2025-03-01', 35.00, 50.00,
    'fernando.paramount@example.com', 'ParaPass369!', '8901', 'Fernando', '50221098765'
),
(
    'CLI010', 'Sandra Jiménez Vega', 'Star+', 'The Walt Disney Company', 3,
    '2025-01-25', '2025-04-25', 105.00, 145.00,
    'sandra.star@example.com', 'StarPass741!', '1230', 'Sandra', '50210987654'
),

-- Membresías con diferentes proveedores
(
    'CLI011', 'Miguel Ángel Vargas', 'Peacock Premium', 'NBCUniversal', 2,
    '2025-01-18', '2025-03-18', 70.00, 95.00,
    'miguel.peacock@example.com', 'PeaPass852!', '4561', 'Miguel', '50209876543'
),
(
    'CLI012', 'Gabriela Núñez Silva', 'Discovery+', 'Warner Bros Discovery', 1,
    '2025-02-03', '2025-03-03', 30.00, 45.00,
    'gabriela.discovery@example.com', 'DiscPass963!', '7892', 'Gabriela', '50298765430'
),

-- Cliente con múltiples servicios
(
    'CLI003', 'Carlos López Martínez', 'Spotify Individual', 'Spotify AB', 3,
    '2025-01-22', '2025-04-22', 90.00, 115.00,
    'carlos.spotify@example.com', 'CarlosSpot159!', '3457', 'Carlos Music', '50287654321'
),

-- Membresía por vencer mañana
(
    'CLI013', 'Andrea Castillo Mora', 'Apple Music', 'Apple Inc.', 1,
    CURDATE() - INTERVAL 29 DAY, CURDATE() + INTERVAL 1 DAY, 38.00, 52.00,
    'andrea.applemusic@example.com', 'AppleM753!', '9013', 'Andrea', '50287654322'
),

-- Membresía que vence hoy
(
    'CLI014', 'Ricardo Mendoza Pérez', 'Google One', 'Google LLC', 1,
    CURDATE() - INTERVAL 30 DAY, CURDATE(), 42.00, 58.00,
    'ricardo.googleone@example.com', 'GoogleO951!', '2346', 'Ricardo', '50276543211'
);

-- =============================================
-- INSERTAR RECARGAS DE EJEMPLO
-- =============================================

INSERT INTO recharges (client_id, amount, recharge_date, note) VALUES
('CLI001', 100.00, '2025-01-20', 'Recarga mensual - Pago adelantado'),
('CLI002', 150.00, '2025-01-22', 'Recarga especial por renovación'),
('CLI003', 200.00, '2025-01-15', 'Pago de membresía anual'),
('CLI001', 50.00, '2025-02-01', 'Recarga adicional'),
('CLI004', 60.00, '2025-01-25', 'Primera recarga del cliente'),
('CLI005', 75.00, '2025-02-03', 'Recarga por servicios adicionales'),
('CLI008', 120.00, '2025-01-28', 'Pago semestral'),
('CLI003', 100.00, '2025-02-05', 'Recarga por servicio adicional Spotify');

-- =============================================
-- INSERTAR LOG DE NOTIFICACIONES (EJEMPLO)
-- =============================================

INSERT INTO notifications_log (membership_id, client_name, service_name, whatsapp_number, message, status) VALUES
(
    6, 'Elena Morales Castro', 'YouTube Premium', '50254321098',
    'Hola Elena,\n\n⚠️ Su membresía de *YouTube Premium* ha vencido el 05/01/2025.\n\nPor favor, contacte con nosotros para renovar su servicio.\n\n¡Gracias por su preferencia! 😊',
    'sent'
),
(
    7, 'Roberto Díaz Ramírez', 'Apple TV+', '50243210987',
    'Hola Roberto,\n\n⚠️ Su membresía de *Apple TV+* ha vencido el 01/01/2025.\n\nPor favor, contacte con nosotros para renovar su servicio.\n\n¡Gracias por su preferencia! 😊',
    'sent'
);

-- =============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =============================================

-- Contar membresías por estado
SELECT 
    status,
    COUNT(*) as cantidad
FROM memberships
GROUP BY status;

-- Ver resumen financiero
SELECT 
    COUNT(*) as total_membresias,
    SUM(purchase_price) as costos_totales,
    SUM(sale_price) as ingresos_totales,
    SUM(profit) as ganancia_neta,
    AVG(profit) as ganancia_promedio
FROM memberships;

-- Ver membresías por vencer (próximos 7 días)
SELECT 
    client_name,
    service_name,
    expiration_date,
    DATEDIFF(expiration_date, CURDATE()) as dias_restantes
FROM memberships
WHERE expiration_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY expiration_date ASC;

-- Ver membresías vencidas
SELECT 
    client_name,
    service_name,
    expiration_date,
    DATEDIFF(CURDATE(), expiration_date) as dias_vencidos
FROM memberships
WHERE expiration_date < CURDATE()
ORDER BY expiration_date DESC;

-- Total de recargas
SELECT 
    COUNT(*) as total_recargas,
    SUM(amount) as monto_total
FROM recharges;

-- Recargas por cliente
SELECT 
    r.client_id,
    m.client_name,
    COUNT(*) as num_recargas,
    SUM(r.amount) as total_recargado
FROM recharges r
LEFT JOIN memberships m ON r.client_id = m.client_id
GROUP BY r.client_id, m.client_name
ORDER BY total_recargado DESC;

SELECT '✅ Datos de ejemplo insertados correctamente!' as mensaje;
