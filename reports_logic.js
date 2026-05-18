/**
 * Motor de Generación de Reportes Financieros
 */
window.FinancialReports = {
    /**
     * Calcula los saldos de todas las cuentas basándose en el Libro Diario
     */
    calculateBalances: () => {
        const balances = {}; // { accountCode: { debit: 0, credit: 0, balance: 0 } }
        
        // Inicializar todas las cuentas del catálogo
        window.chartOfAccounts.forEach(acc => {
            balances[acc.code] = { debit: 0, credit: 0, balance: 0, name: acc.name, level: acc.level, type: acc.type };
        });

        // Sumar movimientos del diario directamente a la cuenta y a todos sus ancestros
        window.journalEntries.forEach(entry => {
            entry.items.forEach(item => {
                const code = item.accountCode;
                const parts = code.split('.');
                
                // Recorrer todos los ancestros de la cuenta (incluyéndola a ella misma)
                for (let i = 1; i <= parts.length; i++) {
                    const ancestorCode = parts.slice(0, i).join('.');
                    
                    if (!balances[ancestorCode]) {
                        // Inicializar dinámicamente si falta en el catálogo
                        const isDebitNature = ancestorCode.startsWith('1') || ancestorCode.startsWith('5') || ancestorCode.startsWith('6');
                        balances[ancestorCode] = {
                            debit: 0,
                            credit: 0,
                            balance: 0,
                            name: (ancestorCode === code) ? (item.accountName || `Cuenta ${code}`) : `Grupo ${ancestorCode}`,
                            level: i,
                            type: isDebitNature ? 'Asset' : 'Liability'
                        };
                    }
                    
                    balances[ancestorCode].debit += item.debit;
                    balances[ancestorCode].credit += item.credit;
                }
            });
        });

        // Calcular el saldo neto final para cada cuenta según su tipo
        Object.keys(balances).forEach(code => {
            const acc = balances[code];
            if (acc.type === 'Asset' || acc.type === 'Expense') {
                acc.balance = acc.debit - acc.credit;
            } else {
                acc.balance = acc.credit - acc.debit;
            }
        });

        return balances;
    },

    getIncomeStatement: (detailed = false) => {
        const balances = window.FinancialReports.calculateBalances();
        const revenue = [];
        const expenses = [];
        let totalRevenue = 0;
        let totalExpenses = 0;

        const sortedCodes = Object.keys(balances).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

        sortedCodes.forEach(code => {
            const acc = balances[code];

            const meetsCriteria = (acc.level === 2 || (detailed && acc.level > 2)) && Math.abs(acc.balance) > 0.009;

            if (meetsCriteria) {
                const accCopy = { ...acc, code };
                if (code.startsWith('4') || code.startsWith('7')) {
                    revenue.push(accCopy);
                }
                if (code.startsWith('5') || code.startsWith('6')) {
                    expenses.push(accCopy);
                }
            }
            
            if (acc.level === 1) {
                if (code.startsWith('4') || code.startsWith('7')) totalRevenue += acc.balance;
                if (code.startsWith('5') || code.startsWith('6')) totalExpenses += acc.balance;
            }
        });

        return {
            revenue,
            expenses,
            totalRevenue,
            totalExpenses,
            netIncome: totalRevenue - totalExpenses
        };
    },

    getBalanceSheet: (detailed = false) => {
        const balances = window.FinancialReports.calculateBalances();
        const income = window.FinancialReports.getIncomeStatement(false); // Obtener utilidad neta resumida
        
        const assets = [];
        const liabilities = [];
        const equity = [];
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;

        const sortedCodes = Object.keys(balances).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

        sortedCodes.forEach(code => {
            const acc = balances[code];
            
            const meetsCriteria = (acc.level === 2 || (detailed && acc.level > 2)) && Math.abs(acc.balance) > 0.009;

            if (meetsCriteria) {
                const accCopy = { ...acc, code };
                if (code.startsWith('1')) assets.push(accCopy);
                if (code.startsWith('2')) liabilities.push(accCopy);
                if (code.startsWith('3')) equity.push(accCopy);
            }
            
            if (acc.level === 1) {
                if (code.startsWith('1')) totalAssets = acc.balance;
                if (code.startsWith('2')) totalLiabilities = acc.balance;
                if (code.startsWith('3')) totalEquity = acc.balance;
            }
        });

        return {
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            totalEquity: totalEquity + income.netIncome,
            netIncome: income.netIncome
        };
    },

    getGeneralLedger: () => {
        const ledger = {};
        window.chartOfAccounts.forEach(acc => {
            ledger[acc.code] = { name: acc.name, movements: [] };
        });

        window.journalEntries.forEach(entry => {
            entry.items.forEach(item => {
                if (!ledger[item.accountCode]) {
                    ledger[item.accountCode] = { name: item.accountName, movements: [] };
                }
                ledger[item.accountCode].movements.push({
                    date: entry.date,
                    ref: entry.id,
                    desc: entry.description,
                    debit: item.debit,
                    credit: item.credit
                });
            });
        });

        return ledger;
    },

    getSalesBook: () => {
        // Filtrar solo operaciones que tengan datos fiscales completos (registradas por el módulo fiscal, tienen base imponible)
        return window.journalEntries.filter(entry => 
            entry.items.some(item => item.accountCode.startsWith('4') && item.base !== undefined)
        );
    },

    getPurchaseBook: () => {
        // Filtrar solo operaciones que tengan datos fiscales completos (registradas por el módulo fiscal, tienen base imponible)
        return window.journalEntries.filter(entry => 
            entry.items.some(item => (item.accountCode.startsWith('5') || item.accountCode.startsWith('6')) && item.base !== undefined)
        );
    },

    getRetenciones: () => {
        const iva = [];
        const islr = [];

        window.journalEntries.forEach(entry => {
            // Retención de IVA (Crédito a 2.1.02.03)
            const ivaItem = entry.items.find(i => i.accountCode === '2.1.02.03');
            if (ivaItem && ivaItem.credit > 0) {
                const taxItem = entry.items.find(i => i.rif || i.invoice || i.supplier);
                const purchaseItem = entry.items.find(i => (i.accountCode.startsWith('5') || i.accountCode.startsWith('6')) && i.debit > 0);
                
                iva.push({
                    entryId: entry.id,
                    date: entry.date,
                    rif: taxItem?.rif || '-',
                    name: taxItem?.supplier || '-',
                    invoice: taxItem?.invoice || '-',
                    control: taxItem?.control || '-',
                    base: purchaseItem ? purchaseItem.debit : (ivaItem.credit / 0.12),
                    iva: purchaseItem ? (purchaseItem.debit * 0.16) : (ivaItem.credit / 0.75 * 0.16),
                    retained: ivaItem.credit
                });
            }

            // Retención de ISLR (Crédito a 2.1.02.02)
            const islrItem = entry.items.find(i => i.accountCode === '2.1.02.02');
            if (islrItem && islrItem.credit > 0) {
                const taxItem = entry.items.find(i => i.rif || i.invoice || i.supplier);
                const purchaseItem = entry.items.find(i => (i.accountCode.startsWith('5') || i.accountCode.startsWith('6')) && i.debit > 0);
                
                // Estimar alícuota de ISLR
                const baseVal = purchaseItem ? purchaseItem.debit : (islrItem.credit / 0.02);
                const rateVal = baseVal > 0 ? (islrItem.credit / baseVal * 100) : 2;
                
                islr.push({
                    entryId: entry.id,
                    date: entry.date,
                    rif: taxItem?.rif || '-',
                    name: taxItem?.supplier || '-',
                    invoice: taxItem?.invoice || '-',
                    control: taxItem?.control || '-',
                    concept: entry.description?.split(' - ')[0] || 'Servicios Profesionales',
                    base: baseVal,
                    rate: parseFloat(rateVal.toFixed(1)),
                    retained: islrItem.credit
                });
            }
        });

        return { iva, islr };
    }
};
