// =============================================
// CONTROLADOR DE REPORTES
// Lógica para generación de reportes financieros
// =============================================

const { promisePool } = require('../config/database');

// Obtener resumen financiero general
exports.getFinancialSummary = async (req, res) => {
    try {
        const [summary] = await promisePool.query(`
            SELECT 
                COUNT(*) as total_memberships,
                SUM(purchase_price) as total_costs,
                SUM(sale_price) as total_revenue,
                SUM(profit) as net_profit,
                AVG(profit) as avg_profit_per_membership,
                (SUM(profit) / SUM(purchase_price)) * 100 as profit_margin_percentage
            FROM memberships
        `);
        
        const [statusBreakdown] = await promisePool.query(`
            SELECT 
                status,
                COUNT(*) as count,
                SUM(profit) as profit
            FROM memberships
            GROUP BY status
        `);
        
        res.json({
            success: true,
            data: {
                overall: {
                    totalMemberships: summary[0].total_memberships,
                    totalCosts: parseFloat(summary[0].total_costs || 0),
                    totalRevenue: parseFloat(summary[0].total_revenue || 0),
                    netProfit: parseFloat(summary[0].net_profit || 0),
                    avgProfit: parseFloat(summary[0].avg_profit_per_membership || 0),
                    profitMargin: parseFloat(summary[0].profit_margin_percentage || 0)
                },
                byStatus: statusBreakdown
            }
        });
    } catch (error) {
        console.error('Error al obtener resumen financiero:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener resumen financiero',
            error: error.message
        });
    }
};

// Obtener reporte detallado por rango de fechas
exports.getDetailedReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate y endDate son requeridos'
            });
        }
        
        // Usar procedimiento almacenado
        const [detailedResults] = await promisePool.query(
            'CALL sp_get_financial_report(?, ?)',
            [startDate, endDate]
        );
        
        // El procedimiento retorna 2 result sets
        const details = detailedResults[0]; // Detalles individuales
        const totals = detailedResults[1][0]; // Resumen totales
        
        res.json({
            success: true,
            period: {
                startDate,
                endDate
            },
            summary: {
                totalMemberships: totals.total_memberships,
                totalCosts: parseFloat(totals.total_costs || 0),
                totalRevenue: parseFloat(totals.total_revenue || 0),
                netProfit: parseFloat(totals.net_profit || 0),
                avgProfit: parseFloat(totals.avg_profit || 0),
                overallMargin: parseFloat(totals.overall_margin || 0)
            },
            details: details
        });
    } catch (error) {
        console.error('Error al obtener reporte detallado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte detallado',
            error: error.message
        });
    }
};

// Obtener reporte mensual
exports.getMonthlyReport = async (req, res) => {
    try {
        const [monthlyData] = await promisePool.query(`
            SELECT * FROM financial_summary
            ORDER BY month DESC
            LIMIT 12
        `);
        
        res.json({
            success: true,
            data: monthlyData
        });
    } catch (error) {
        console.error('Error al obtener reporte mensual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte mensual',
            error: error.message
        });
    }
};

// Exportar reporte a CSV
exports.exportReportCSV = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate y endDate son requeridos'
            });
        }
        
        const [rows] = await promisePool.query(`
            SELECT 
                client_id,
                client_name,
                service_name,
                provider,
                purchase_date,
                expiration_date,
                purchase_price,
                sale_price,
                profit,
                (profit / purchase_price) * 100 as margin_percentage
            FROM memberships
            WHERE purchase_date BETWEEN ? AND ?
            ORDER BY purchase_date ASC
        `, [startDate, endDate]);
        
        // Construir CSV
        let csv = 'ID Cliente,Nombre Cliente,Servicio,Proveedor,Fecha Compra,Fecha Vencimiento,Costo,Venta,Ganancia,Margen %\n';
        
        rows.forEach(row => {
            csv += `"${row.client_id}","${row.client_name}","${row.service_name}","${row.provider}",`;
            csv += `"${row.purchase_date}","${row.expiration_date}",`;
            csv += `${row.purchase_price},${row.sale_price},${row.profit},${row.margin_percentage.toFixed(2)}\n`;
        });
        
        // Enviar CSV como descarga
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_${startDate}_${endDate}.csv"`);
        res.send(csv);
        
    } catch (error) {
        console.error('Error al exportar reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar reporte',
            error: error.message
        });
    }
};
