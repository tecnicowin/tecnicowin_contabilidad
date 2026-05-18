/**
 * Catálogo de Cuentas Estándar para PYMES
 * Estructura basada en la naturaleza de las cuentas solicitada.
 */
const defaultAccounts = [
    { code: "1", name: "ACTIVO", type: "Asset", level: 1 },
    { code: "1.1", name: "Activo Corriente", type: "Asset", level: 2 },
    { code: "1.1.01", name: "Caja y Bancos", type: "Asset", level: 3 },
    { code: "1.1.01.01", name: "Caja Principal", type: "Asset", level: 4 },
    { code: "1.1.01.02", name: "Banco Nacional", type: "Asset", level: 4 },
    { code: "1.1.02", name: "Cuentas por Cobrar", type: "Asset", level: 3 },
    { code: "1.1.02.01", name: "IVA Crédito Fiscal", type: "Asset", level: 4 },
    { code: "1.1.02.02", name: "Clientes Nacionales", type: "Asset", level: 4 },
    { code: "1.1.03", name: "Inventarios", type: "Asset", level: 3 },
    
    { code: "1.2", name: "Activo No Corriente", type: "Asset", level: 2 },
    { code: "1.2.01", name: "Propiedad, Planta y Equipo", type: "Asset", level: 3 },
    { code: "1.2.01.01", name: "Vehículos", type: "Asset", level: 4 },
    { code: "1.2.01.02", name: "Mobiliario y Equipo", type: "Asset", level: 4 },

    { code: "2", name: "PASIVO", type: "Liability", level: 1 },
    { code: "2.1", name: "Pasivo Corriente", type: "Liability", level: 2 },
    { code: "2.1.01", name: "Cuentas por Pagar Proveedores", type: "Liability", level: 3 },
    { code: "2.1.01.01", name: "Proveedores Nacionales", type: "Liability", level: 4 },
    { code: "2.1.02", name: "Impuestos por Pagar (IVA/ISLR)", type: "Liability", level: 3 },
    { code: "2.1.02.01", name: "IVA Débito Fiscal", type: "Liability", level: 4 },
    { code: "2.1.02.02", name: "Retenciones de ISLR Acumuladas", type: "Liability", level: 4 },
    { code: "2.1.02.03", name: "Retención de IVA (Terceros)", type: "Liability", level: 4 },
    { code: "2.1.03", name: "Obligaciones Laborales", type: "Liability", level: 3 },

    { code: "3", name: "PATRIMONIO", type: "Equity", level: 1 },
    { code: "3.1", name: "Capital Social", type: "Equity", level: 2 },
    { code: "3.2", name: "Reservas", type: "Equity", level: 2 },
    { code: "3.3", name: "Resultados Acumulados", type: "Equity", level: 2 },

    { code: "4", name: "INGRESOS", type: "Revenue", level: 1 },
    { code: "4.1", name: "Ventas de Mercancía", type: "Revenue", level: 2 },
    { code: "4.2", name: "Prestación de Servicios", type: "Revenue", level: 2 },

    { code: "5", name: "COMPRAS", type: "Expense", level: 1 },
    { code: "5.1", name: "Compras de Materia Prima", type: "Expense", level: 2 },
    { code: "5.2", name: "Gastos de Importación", type: "Expense", level: 2 },

    { code: "6", name: "OTROS EGRESOS", type: "Expense", level: 1 },
    { code: "6.1", name: "Gastos Administrativos", type: "Expense", level: 2 },
    { code: "6.1.01", name: "Sueldos y Salarios", type: "Expense", level: 3 },
    { code: "6.1.02", name: "Servicios Públicos", type: "Expense", level: 3 },
    { code: "6.1.03", name: "Alquileres", type: "Expense", level: 3 },
    { code: "6.2", name: "Gastos de Ventas", type: "Expense", level: 2 },
    { code: "6.3", name: "Gastos Financieros", type: "Expense", level: 2 },

    { code: "7", name: "OTROS INGRESOS", type: "Revenue", level: 1 },
    { code: "7.1", name: "Ingresos por Intereses", type: "Revenue", level: 2 },
    { code: "7.2", name: "Venta de Activos en Desuso", type: "Revenue", level: 2 }
];

// Cargar desde LocalStorage o usar el default
const savedAccounts = localStorage.getItem('softwin_accounts');
window.chartOfAccounts = savedAccounts ? JSON.parse(savedAccounts) : defaultAccounts;

window.saveAccounts = () => {
    localStorage.setItem('softwin_accounts', JSON.stringify(window.chartOfAccounts));
};

window.createSubAccount = (parentCode, name) => {
    const parent = window.chartOfAccounts.find(a => a.code === parentCode);
    if (!parent) return null;

    // Buscar el siguiente correlativo para el hijo
    const siblings = window.chartOfAccounts.filter(a => a.code.startsWith(parentCode + '.'));
    let nextNum = 1;
    if (siblings.length > 0) {
        // Extraer el último número de los códigos de los hermanos
        const lastCodes = siblings.map(s => {
            const parts = s.code.split('.');
            return parseInt(parts[parts.length - 1]);
        }).filter(n => !isNaN(n));
        
        if (lastCodes.length > 0) {
            nextNum = Math.max(...lastCodes) + 1;
        }
    }

    const newCode = `${parentCode}.${String(nextNum).padStart(2, '0')}`;
    const newAcc = {
        code: newCode,
        name: name,
        type: parent.type,
        level: parent.level + 1
    };

    window.chartOfAccounts.push(newAcc);
    window.saveAccounts();
    return newAcc;
};


