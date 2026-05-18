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
    },

    getChangesInEquity: (startDate, endDate) => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        
        // Cuentas de patrimonio (nivel 2 o 3)
        const equityAccounts = window.chartOfAccounts.filter(acc => acc.code.startsWith('3') && acc.level >= 2);
        const movements = {};
        
        equityAccounts.forEach(acc => {
            movements[acc.code] = {
                code: acc.code,
                name: acc.name,
                initial: 0,
                increases: 0,
                decreases: 0,
                final: 0
            };
        });

        // Sumar movimientos del diario
        window.journalEntries.forEach(entry => {
            const entryDate = new Date(entry.date + 'T12:00:00');
            entry.items.forEach(item => {
                const code = item.accountCode;
                const matchAcc = equityAccounts.find(acc => code === acc.code || code.startsWith(acc.code + '.'));
                if (matchAcc) {
                    const m = movements[matchAcc.code];
                    if (entryDate < start) {
                        // Saldo inicial (Patrimonio es acreedor por naturaleza)
                        m.initial += (item.credit - item.debit);
                    } else if (entryDate >= start && entryDate <= end) {
                        m.increases += item.credit;
                        m.decreases += item.debit;
                    }
                }
            });
        });

        // Calcular saldo final
        Object.keys(movements).forEach(code => {
            const m = movements[code];
            m.final = m.initial + m.increases - m.decreases;
        });

        // Agregar Utilidad/Pérdida del periodo actual de manera dinámica
        let currentPeriodNetIncome = 0;
        window.journalEntries.forEach(entry => {
            const entryDate = new Date(entry.date + 'T12:00:00');
            if (entryDate >= start && entryDate <= end) {
                entry.items.forEach(item => {
                    if (item.accountCode.startsWith('4') || item.accountCode.startsWith('7')) {
                        currentPeriodNetIncome += item.credit - item.debit; // Ingresos
                    }
                    if (item.accountCode.startsWith('5') || item.accountCode.startsWith('6')) {
                        currentPeriodNetIncome -= item.debit - item.credit; // Egresos
                    }
                });
            }
        });

        return {
            movements: Object.values(movements),
            currentPeriodNetIncome
        };
    },

    getMonetaryGainLoss: (startDate, endDate) => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        
        let initialAssets = 0;
        let initialLiabilities = 0;
        
        let debitsAssets = 0;
        let creditsAssets = 0;
        let debitsLiabilities = 0;
        let creditsLiabilities = 0;

        window.journalEntries.forEach(entry => {
            const entryDate = new Date(entry.date + 'T12:00:00');
            entry.items.forEach(item => {
                const isMonetaryAsset = item.accountCode.startsWith('1.1.01') || item.accountCode.startsWith('1.1.02');
                const isMonetaryLiability = item.accountCode.startsWith('2.1');
                
                if (isMonetaryAsset) {
                    if (entryDate < start) {
                        initialAssets += (item.debit - item.credit);
                    } else if (entryDate >= start && entryDate <= end) {
                        debitsAssets += item.debit;
                        creditsAssets += item.credit;
                    }
                }
                
                if (isMonetaryLiability) {
                    if (entryDate < start) {
                        initialLiabilities += (item.credit - item.debit);
                    } else if (entryDate >= start && entryDate <= end) {
                        debitsLiabilities += item.debit;
                        creditsLiabilities += item.credit;
                    }
                }
            });
        });

        const finalAssets = initialAssets + debitsAssets - creditsAssets;
        const finalLiabilities = initialLiabilities + creditsLiabilities - debitsLiabilities;

        const initialPosition = initialAssets - initialLiabilities;
        const finalPosition = finalAssets - finalLiabilities;
        
        // Inflación mensual estimada (ej. 5.2% para PYMES)
        const inflationRate = 0.052;
        const averagePosition = (initialPosition + finalPosition) / 2;
        const monetaryGainLoss = - (averagePosition * inflationRate); // Si los activos netos son positivos, se pierde valor monetario (Pérdida)

        return {
            initialAssets,
            finalAssets,
            initialLiabilities,
            finalLiabilities,
            initialPosition,
            finalPosition,
            inflationRate: inflationRate * 100,
            monetaryGainLoss
        };
    },

    getCashFlow: (startDate, endDate) => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        
        let initialCash = 0;
        let operating = 0;
        let investing = 0;
        let financing = 0;

        window.journalEntries.forEach(entry => {
            const entryDate = new Date(entry.date + 'T12:00:00');
            
            // Verificar si el asiento afecta la caja o bancos (1.1.01)
            const cashItems = entry.items.filter(i => i.accountCode.startsWith('1.1.01'));
            const netCashImpact = cashItems.reduce((sum, i) => sum + (i.debit - i.credit), 0);

            if (entryDate < start) {
                initialCash += netCashImpact;
            } else if (entryDate >= start && entryDate <= end) {
                if (netCashImpact === 0) return;
                
                // Categorizar el flujo de efectivo según los otros ítems del asiento
                const otherItems = entry.items.filter(i => !i.accountCode.startsWith('1.1.01'));
                
                let isInvesting = false;
                let isFinancing = false;

                otherItems.forEach(i => {
                    if (i.accountCode.startsWith('1.2')) isInvesting = true; // Activo Fijo (Propiedad Planta y Equipo)
                    if (i.accountCode.startsWith('3')) isFinancing = true;   // Patrimonio
                });

                if (isInvesting) {
                    investing += netCashImpact;
                } else if (isFinancing) {
                    financing += netCashImpact;
                } else {
                    operating += netCashImpact; // Por defecto es operacional
                }
            }
        });

        const netChange = operating + investing + financing;
        const finalCash = initialCash + netChange;

        return {
            initialCash,
            operating,
            investing,
            financing,
            netChange,
            finalCash
        };
    }
};
