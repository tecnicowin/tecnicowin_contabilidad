// Contabilidad Total - Logic & Routing
document.addEventListener('DOMContentLoaded', () => {
    // Persistence & State
    window.companyData = JSON.parse(localStorage.getItem('accounting_company_data')) || {
        name: 'Soluciones PYME S.A.',
        rif: 'J-12345678-9',
        address: 'Av. Principal, Edif. Centro, Caracas, Venezuela.',
        currency: 'USD'
    };

    window.saveConfig = (data) => {
        window.companyData = data;
        localStorage.setItem('accounting_company_data', JSON.stringify(data));
        alert('Configuración Guardada con Éxito');
    };

    // Initialize Lucide Icons
    lucide.createIcons();

    // Module Management
    const navItems = document.querySelectorAll('.nav-item');
    const moduleTitle = document.getElementById('current-module-title');
    const moduleContainer = document.getElementById('module-container');

    const modules = {
        dashboard: {
            title: 'Dashboard Operativo',
            render: renderDashboard
        },
        accounting: {
            title: 'Contabilizar Comprobantes (Diario)',
            render: renderAccounting
        },
        sales_purchases: {
            title: 'Registro de Ventas & Compras (SENIAT)',
            render: renderSalesPurchases
        },
        chart: {
            title: 'Plan de Cuentas (Catálogo)',
            render: renderChartOfAccounts
        },
        banking: {
            title: 'Bancos & Conciliación',
            render: renderBanking
        },
        taxes: {
            title: 'Control del IVA (Débito vs Crédito)',
            render: renderTaxes
        },
        islr: {
            title: 'Impuesto sobre la Renta (ISLR)',
            render: renderISLR
        },
        reports: {
            title: 'Estados Financieros',
            render: renderReports
        },
        queries: {
            title: 'Consultas Generales & Auditoría',
            render: renderQueries
        },
        retenciones: {
            title: 'Comprobantes de Retención',
            render: renderRetenciones
        },
        settings: {
            title: 'Configuración del Sistema',
            render: renderSettings
        }
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const moduleKey = item.getAttribute('data-module');
            
            // Update UI Active State
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Load Module
            loadModule(moduleKey);
        });
    });

    function loadModule(key) {
        const module = modules[key];
        if (!module) return;

        // Limpiar clases residuales de modales o de impresión
        document.body.classList.remove('retencion-modal-open');

        // Update Title
        moduleTitle.textContent = module.title;

        // Transition Effect
        moduleContainer.style.opacity = '0';
        
        setTimeout(() => {
            module.render(moduleContainer);
            moduleContainer.style.opacity = '1';
            lucide.createIcons(); // Re-initialize icons for new content
        }, 200);
    }

    // Cargar automáticamente el módulo de Dashboard con datos dinámicos reales al inicio
    loadModule('dashboard');

    // --- Module Renderers ---

    function renderDashboard(container) {
        let totalRev = 0, totalExp = 0, retPagar = 0;
        if(window.FinancialReports) {
            const inc = window.FinancialReports.getIncomeStatement();
            totalRev = inc.totalRevenue;
            totalExp = inc.totalExpenses;
            
            // Retenciones por pagar: Ej. cuenta 2.1.02.02 y 2.1.02.03
            const bals = window.FinancialReports.calculateBalances();
            retPagar += (bals['2.1.02.02']?.balance || 0);
            retPagar += (bals['2.1.02.03']?.balance || 0);
        }

        const margin = totalRev > 0 ? ((totalRev - totalExp) / totalRev * 100).toFixed(1) : 0;

        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="stats-card">
                    <div class="card-header">
                        <span class="card-title">Liquidez Corriente</span>
                        <i data-lucide="trending-up" class="text-success"></i>
                    </div>
                    <div class="card-value">2.45</div>
                    <div class="card-footer">
                        <span class="text-success">+12%</span> vs mes anterior
                    </div>
                </div>
                <div class="stats-card">
                    <div class="card-header">
                        <span class="card-title">Ventas Netas</span>
                        <i data-lucide="dollar-sign" class="text-primary"></i>
                    </div>
                    <div class="card-value">$${totalRev.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                    <div class="card-footer">
                        <span class="text-primary">+8%</span> este periodo
                    </div>
                </div>
                <div class="stats-card">
                    <div class="card-header">
                        <span class="card-title">Margen Operativo</span>
                        <i data-lucide="percent" class="text-accent"></i>
                    </div>
                    <div class="card-value">${margin}%</div>
                    <div class="card-footer">
                        <span class="text-accent">Estable</span> vs promedio
                    </div>
                </div>
                <div class="stats-card">
                    <div class="card-header">
                        <span class="card-title">Retenciones por Enterar</span>
                        <i data-lucide="alert-circle" class="text-danger"></i>
                    </div>
                    <div class="card-value">$${retPagar.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                    <div class="card-footer">
                        Vence en <span class="text-danger">3 días</span>
                    </div>
                </div>
            </div>

            <div class="main-grid mt-2">
                <div class="grid-col span-2">
                    <div class="glass-card main-chart-card">
                        <div class="card-header">
                            <h3>Ingresos vs Egresos (Mes Actual)</h3>
                        </div>
                        <div class="chart-placeholder" style="padding: 2rem; height: 300px;">
                            <div class="bar-chart" style="display: flex; align-items: flex-end; justify-content: space-around; height: 100%; width: 100%; gap: 2rem;">
                                <div class="chart-column" style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; justify-content: flex-end;">
                                    <span style="font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">$${totalRev.toLocaleString(undefined, {minimumFractionDigits:0})}</span>
                                    <div class="bar" style="height: ${totalRev > 0 ? 80 : 5}%; width: 60px; background: linear-gradient(to top, var(--primary), var(--primary-light)); border-radius: 8px 8px 0 0; transition: height 1s;"></div>
                                    <span style="margin-top: 0.5rem; font-size: 0.8rem; font-weight: 600;">Ingresos</span>
                                </div>
                                <div class="chart-column" style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; justify-content: flex-end;">
                                    <span style="font-weight: 700; color: var(--danger); margin-bottom: 0.5rem;">$${totalExp.toLocaleString(undefined, {minimumFractionDigits:0})}</span>
                                    <div class="bar" style="height: ${totalExp > 0 ? (totalExp/totalRev*80).toFixed(0) : 5}%; width: 60px; background: linear-gradient(to top, var(--danger), #fca5a5); border-radius: 8px 8px 0 0; transition: height 1s;"></div>
                                    <span style="margin-top: 0.5rem; font-size: 0.8rem; font-weight: 600;">Egresos</span>
                                </div>
                                <div class="chart-column" style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; justify-content: flex-end;">
                                    <span style="font-weight: 700; color: var(--accent); margin-bottom: 0.5rem;">$${(totalRev-totalExp).toLocaleString(undefined, {minimumFractionDigits:0})}</span>
                                    <div class="bar" style="height: ${totalRev > totalExp ? ((totalRev-totalExp)/totalRev*80).toFixed(0) : 5}%; width: 60px; background: linear-gradient(to top, var(--accent), #34d399); border-radius: 8px 8px 0 0; transition: height 1s;"></div>
                                    <span style="margin-top: 0.5rem; font-size: 0.8rem; font-weight: 600;">Utilidad</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid-col">
                    <div class="glass-card recent-activity">
                        <div class="card-header">
                            <h3>Últimos Movimientos</h3>
                        </div>
                        <div class="activity-list" style="max-height: 300px; overflow-y: auto;">
                            ${window.journalEntries.slice().reverse().slice(0, 4).map(e => `
                                <div class="activity-item">
                                    <div class="activity-icon ${e.items.some(i => i.credit > 0 && i.accountCode.startsWith('1.1.01')) ? 'icon-orange' : 'icon-blue'}">
                                        <i data-lucide="${e.items.some(i => i.credit > 0 && i.accountCode.startsWith('1.1.01')) ? 'arrow-up-right' : 'check'}"></i>
                                    </div>
                                    <div class="activity-details">
                                        <p class="activity-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${e.description}</p>
                                        <p class="activity-time">${e.date}</p>
                                    </div>
                                    <div class="activity-amount">$${e.items.reduce((s,i)=>s+i.debit,0).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    function renderAccounting(container) {
        const today = new Date().toISOString().split('T')[0];
        const initialId = window.generateEntryId(today);

        let html = `
            <div class="accounting-view">
                <div class="glass-card main-form-card">
                    <div class="card-header main-header">
                        <div class="header-info">
                            <i data-lucide="book-open"></i>
                            <div>
                                <h3>Registro de Comprobante Contable</h3>
                                <p>Periodo Actual: ${new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <div class="header-id-box">
                            <span>Nro. Comprobante</span>
                            <strong id="display-entry-id">${initialId}</strong>
                        </div>
                    </div>

                    <form id="form-new-entry" class="form-accounting">
                        <!-- Sección 1: Encabezado -->
                        <div class="form-section" style="background: #e2e8f0; padding: 1.5rem; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 1.5rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                            <h4 style="margin-bottom: 1.5rem; color: var(--primary); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="info" style="width: 18px; height: 18px;"></i> 1. Datos del Encabezado
                            </h4>
                            <div class="form-top-grid">
                                <div class="form-group">
                                    <label>Fecha de Registro <span style="color: var(--danger);">*</span></label>
                                    <input type="date" id="entry-date" value="${today}" required style="border-left: 3px solid var(--primary);">
                                </div>
                                <div class="form-group">
                                    <label>Tipo de Comprobante <span style="color: var(--danger);">*</span></label>
                                    <select id="entry-type" required style="border-left: 3px solid var(--primary);">
                                        <option value="Diario">Diario</option>
                                        <option value="Ingreso">Ingreso</option>
                                        <option value="Egreso">Egreso</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Moneda <span style="color: var(--danger);">*</span></label>
                                    <select id="entry-currency" required style="border-left: 3px solid var(--primary);">
                                        <option value="Local">Local (Bs)</option>
                                        <option value="Extranjera">Extranjera (USD)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Tasa de Cambio <span style="color: var(--danger);">*</span></label>
                                    <input type="number" step="0.0001" id="entry-exchange" value="1.0000" required style="border-left: 3px solid var(--primary); background: white;">
                                </div>
                                <div class="form-group xl" style="grid-column: 1 / -1;">
                                    <label>Descripción General (Glosa) <span style="color: var(--danger);">*</span></label>
                                    <div class="concept-input-group">
                                        <input type="text" id="entry-desc" list="list-concepts" placeholder="Ej. Pago de nómina mes actual..." required style="border-left: 3px solid var(--primary);">
                                        <datalist id="list-concepts">
                                            ${window.commonConcepts.map(c => `<option value="${c}">`).join('')}
                                        </datalist>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sección 2: Soportes -->
                        <div class="form-section" style="background: #ffedd5; padding: 1.5rem; border-radius: 12px; border: 1px solid #fdba74; margin-bottom: 1.5rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                            <h4 style="margin-bottom: 1.5rem; color: var(--warning); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="paperclip" style="width: 18px; height: 18px;"></i> 2. Soportes y Referencias (Opcional)
                            </h4>
                            <div class="form-top-grid" style="grid-template-columns: 1fr 1fr;">
                                <div class="form-group large">
                                    <label>Factura N°</label>
                                    <input type="text" id="entry-doc-invoice" placeholder="Ej. 00001234" style="background: white;">
                                </div>
                                <div class="form-group large">
                                    <label>Cheque / Transferencia N°</label>
                                    <input type="text" id="entry-doc-ref" placeholder="Ej. 0451239992" style="background: white;">
                                </div>
                            </div>
                        </div>

                        <!-- Sección 3: Detalles -->
                        <div class="entry-lines-container" style="background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: var(--shadow-sm);">
                            <div style="padding: 1rem 1.5rem; border-bottom: 1px solid #cbd5e1; background: #94a3b8; border-radius: 12px 12px 0 0; display: flex; align-items: center; gap: 0.5rem;">
                                <h4 style="color: white; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; margin: 0;"><i data-lucide="list" style="width: 18px; height: 18px;"></i> 3. Detalle de Movimientos (Partida Doble)</h4>
                            </div>
                            
                            <div class="lines-header" style="background: white; padding: 1rem 1.5rem; margin: 0; border-bottom: 2px solid var(--border-color);">
                                <span class="col-acc">Cuenta Contable / Código</span>
                                <span class="col-debe">Debe</span>
                                <span class="col-haber">Haber</span>
                                <span class="col-act"></span>
                            </div>
                            <div id="entry-lines-list">
                                <!-- Líneas dinámicas -->
                            </div>
                            <button type="button" class="btn-text" id="btn-add-line">
                                <i data-lucide="plus-circle"></i> Añadir Nueva Línea
                            </button>
                        </div>

                        <div class="entry-footer">
                            <div class="totals-display">
                                <div class="total-item" id="box-debit">
                                    <span>Total Debe</span>
                                    <strong id="total-debit">$0.00</strong>
                                </div>
                                <div class="total-item" id="box-credit">
                                    <span>Total Haber</span>
                                    <strong id="total-credit">$0.00</strong>
                                </div>
                                <div class="total-item diff" id="diff-box">
                                    <span>Diferencia</span>
                                    <strong id="total-diff">$0.00</strong>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="reset" class="btn-secondary">Limpiar Formulario</button>
                                <button type="submit" class="btn-primary large" id="btn-save-entry" disabled>
                                    <i data-lucide="save"></i> Postear Comprobante
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        container.innerHTML = html;
        applyAccountingStyles();
        setupAccountingForm();
        
        // Cargar datos si estamos en modo edición
        if (window.currentEditEntry) {
            loadEntryDataIntoForm(window.currentEditEntry);
        }
    }

    function loadEntryDataIntoForm(entry) {
        document.getElementById('entry-date').value = entry.date;
        document.getElementById('entry-desc').value = entry.description;
        document.getElementById('display-entry-id').textContent = entry.id;
        
        if (entry.type) document.getElementById('entry-type').value = entry.type;
        if (entry.currency) document.getElementById('entry-currency').value = entry.currency;
        if (entry.exchange) document.getElementById('entry-exchange').value = entry.exchange;
        if (entry.docInvoice) document.getElementById('entry-doc-invoice').value = entry.docInvoice;
        if (entry.docRef) document.getElementById('entry-doc-ref').value = entry.docRef;

        
        const list = document.getElementById('entry-lines-list');
        list.innerHTML = '';
        entry.items.forEach(item => {
            const lineDiv = addEntryLine();
            if (!lineDiv) return;
            
            lineDiv.querySelector('.line-debit').value = item.debit;
            lineDiv.querySelector('.line-credit').value = item.credit;
            
            const select = lineDiv.querySelector('.line-acc');
            select.value = item.accountCode;
            
            if (item.lineDesc) lineDiv.querySelector('.line-detail').value = item.lineDesc;
            
            // Disparar cambio para mostrar meta si aplica
            select.dispatchEvent(new Event('change'));

            // Si tiene datos fiscales
            if (item.rif) {
                lineDiv.querySelector('.line-rif').value = item.rif;
                lineDiv.querySelector('.line-aux-name').value = item.supplier;
                lineDiv.querySelector('.line-invoice').value = item.invoice;
                lineDiv.querySelector('.line-control').value = item.control;
            }
        });
        updateAccountingTotals();
        const btnSave = document.getElementById('btn-save-entry');
        if (btnSave) btnSave.innerHTML = '<i data-lucide="refresh-cw"></i> Actualizar Comprobante';
        lucide.createIcons();
    }

    function setupAccountingForm() {
        const linesList = document.getElementById('entry-lines-list');
        const dateInput = document.getElementById('entry-date');
        const displayId = document.getElementById('display-entry-id');
        
        dateInput.onchange = () => {
            displayId.textContent = window.generateEntryId(dateInput.value);
        };

        document.getElementById('btn-add-line').onclick = () => addEntryLine();

        addEntryLine();
        addEntryLine();

        const entryForm = document.getElementById('form-new-entry');
        if (entryForm) {
            entryForm.onsubmit = (e) => {
                e.preventDefault();
                saveFullEntry();
            };
        }
    }

    function addEntryLine() {
        const linesList = document.getElementById('entry-lines-list');
        if (!linesList) return null;
        const div = document.createElement('div');
            div.className = 'entry-line-complex';
            
            const detailAccounts = window.chartOfAccounts.filter(a => a.level >= 2);
            let options = detailAccounts.map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('');

            div.innerHTML = `
                <div class="line-main" style="align-items: flex-start; padding: 1rem 1.5rem; border-bottom: 1px dashed var(--border-color);">
                    <div class="col-acc" style="display:flex; flex-direction:column; gap:8px;">
                        <select class="line-acc" required style="border-left: 3px solid var(--accent); padding: 0.6rem; background: rgba(255,255,255,0.8);">
                            <option value="">-- Seleccione Cuenta Contable --</option>
                            ${options}
                        </select>
                        <div style="display:flex; align-items:center; gap: 0.5rem; padding-left: 0.5rem;">
                            <i data-lucide="corner-down-right" style="color: var(--text-muted); width: 16px; height: 16px;"></i>
                            <input type="text" class="line-detail" placeholder="Descripción de Detalles de esta línea (Opcional)" style="font-size:0.85rem; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; background: rgba(255,255,255,0.8); width: 100%;">
                        </div>
                    </div>
                    <div class="col-debe"><input type="number" step="0.01" class="line-debit" value="0" style="text-align: right; font-weight: 600; padding: 0.6rem; color: var(--success); font-size: 1rem;"></div>
                    <div class="col-haber"><input type="number" step="0.01" class="line-credit" value="0" style="text-align: right; font-weight: 600; padding: 0.6rem; color: var(--danger); font-size: 1rem;"></div>
                    <div class="col-act" style="padding-top: 0.3rem;"><button type="button" class="btn-remove-line" title="Eliminar línea">&times;</button></div>
                </div>
                <div class="line-meta" style="display: none;">
                    <div class="meta-inputs">
                        <input type="text" class="line-rif" placeholder="RIF/CI">
                        <input type="text" class="line-aux-name" placeholder="Nombre Tercero">
                        <input type="text" class="line-invoice" placeholder="Nro Factura">
                        <input type="text" class="line-control" placeholder="Nro Control">
                    </div>
                </div>
            `;

            linesList.appendChild(div);

            const select = div.querySelector('.line-acc');
            select.onchange = () => {
                const code = select.value;
                if (code.startsWith('2.1.01') || code.startsWith('1.1.02') || code.startsWith('5') || code.startsWith('6')) {
                    div.querySelector('.line-meta').style.display = 'block';
                } else {
                    div.querySelector('.line-meta').style.display = 'none';
                }
            };

            div.querySelectorAll('input').forEach(i => i.oninput = updateAccountingTotals);
        div.querySelector('.btn-remove-line').onclick = () => { div.remove(); updateAccountingTotals(); };
        return div;
    }




    function updateAllSelectors(selectedCode) {
        const detailAccounts = window.chartOfAccounts.filter(a => a.level >= 2);
        let options = detailAccounts.map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('');
        
        document.querySelectorAll('.line-acc').forEach(select => {
            const currentVal = select.value;
            select.innerHTML = `
                <option value="">Seleccione Cuenta...</option>
                ${options}
            `;
            if (currentVal === 'NEW') select.value = selectedCode;
            else select.value = currentVal;
        });
    }

    function updateAccountingTotals() {
        let debits = 0, credits = 0;
        document.querySelectorAll('.line-debit').forEach(i => debits += parseFloat(i.value || 0));
        document.querySelectorAll('.line-credit').forEach(i => credits += parseFloat(i.value || 0));

        const diff = Math.abs(debits - credits);
        document.getElementById('total-debit').textContent = `$${debits.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        document.getElementById('total-credit').textContent = `$${credits.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        document.getElementById('total-diff').textContent = `$${diff.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

        const btnSave = document.getElementById('btn-save-entry');
        if (diff < 0.01 && debits > 0) {
            btnSave.disabled = false;
            document.getElementById('diff-box').style.color = 'var(--success)';
        } else {
            btnSave.disabled = true;
            document.getElementById('diff-box').style.color = 'var(--danger)';
        }
    }

    function saveFullEntry() {
        const date = document.getElementById('entry-date').value;
        const desc = document.getElementById('entry-desc').value;
        const type = document.getElementById('entry-type').value;
        const currency = document.getElementById('entry-currency').value;
        const exchange = parseFloat(document.getElementById('entry-exchange').value || 1);
        const docInvoice = document.getElementById('entry-doc-invoice').value;
        const docRef = document.getElementById('entry-doc-ref').value;
        const id = document.getElementById('display-entry-id').textContent;

        const items = [];
        document.querySelectorAll('.entry-line-complex').forEach(line => {
            const select = line.querySelector('.line-acc');
            if (!select.value || select.value === 'NEW') return;
            
            const code = select.value;
            const name = select.options[select.selectedIndex].text.split(' - ')[1];
            const deb = parseFloat(line.querySelector('.line-debit').value || 0);
            const cre = parseFloat(line.querySelector('.line-credit').value || 0);

            if (deb > 0 || cre > 0) {
                items.push({
                    accountCode: code,
                    accountName: name,
                    lineDesc: line.querySelector('.line-detail').value,
                    debit: deb,
                    credit: cre,
                    rif: line.querySelector('.line-rif')?.value,
                    supplier: line.querySelector('.line-aux-name')?.value,
                    invoice: line.querySelector('.line-invoice')?.value,
                    control: line.querySelector('.line-control')?.value
                });
            }
        });

        const entryData = { id, date, description: desc, type, currency, exchange, docInvoice, docRef, items, status: 'Posted' };

        if (window.currentEditEntry) {
            const index = window.journalEntries.findIndex(e => e.id === window.currentEditEntry.id);
            if (index !== -1) {
                window.journalEntries[index] = entryData;
                alert('Comprobante Actualizado Correctamente: ' + id);
            }
            window.currentEditEntry = null;
        } else {
            window.addEntry(entryData);
            alert('Asiento Posteado Correctamente: ' + id);
        }
        
        window.saveEntries();
        renderAccounting(document.getElementById('module-container'));
    }

    function renderSalesPurchases(container) {
        const today = new Date().toISOString().split('T')[0];
        let html = `
            <div class="sales-purchases-view">
                <div class="glass-card main-form-card">
                    <div class="card-header main-header accent-header">
                        <div class="header-info">
                            <i data-lucide="shopping-cart"></i>
                            <div>
                                <h3>Registro Fiscal de Facturas</h3>
                                <p>Control de IVA y Generación Automática de Asientos</p>
                            </div>
                        </div>
                        <div class="header-id-box">
                            <span>Nro. Comprobante</span>
                            <strong id="fiscal-display-id">...</strong>
                        </div>
                        <div class="type-selector-header">
                            <label class="radio-tab">
                                <input type="radio" name="op-type" value="PURCHASE" checked>
                                <span>Compra / Gasto</span>
                            </label>
                            <label class="radio-tab">
                                <input type="radio" name="op-type" value="SALE">
                                <span>Venta / Ingreso</span>
                            </label>
                        </div>
                    </div>

                    <form id="form-fiscal-op" class="form-accounting">
                        <div class="form-section" style="background: #e2e8f0; padding: 1.5rem; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 1.5rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                            <div class="form-grid-modal mb-2" style="grid-template-columns: 1.5fr 2fr;">
                                <div class="form-group">
                                    <div class="form-section-title" style="margin-top: 0;">PROVEEDOR / CLIENTE</div>
                                    <div class="form-group mb-1">
                                        <label>RIF / CI</label>
                                        <input type="text" id="fiscal-rif" placeholder="J-00000000-0" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Razón Social / Nombre</label>
                                        <input type="text" id="fiscal-name" placeholder="Nombre completo" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="form-section-title" style="margin-top: 0;">DATOS FISCALES</div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                        <div class="form-group">
                                            <label>Nro. Factura</label>
                                            <input type="text" id="fiscal-invoice" required>
                                        </div>
                                        <div class="form-group">
                                            <label>Nro. Control</label>
                                            <input type="text" id="fiscal-control" required>
                                        </div>
                                    </div>
                                    <div class="form-group mt-1">
                                        <label>Fecha de Operación</label>
                                        <input type="date" id="fiscal-date" value="${today}" required>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-section" style="background: #e2e8f0; padding: 1.5rem; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 1.5rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                            <div class="form-section-title" style="margin-top: 0;">MONTOS Y DISTRIBUCIÓN (IVA 16%)</div>
                            <div class="amounts-summary-grid mb-2" style="background: white; border: 1px solid var(--border-color);">
                                <div class="amount-box">
                                    <label>Base Imponible</label>
                                    <input type="number" step="0.01" id="fiscal-base" value="0.00" class="input-large">
                                </div>
                                <div class="amount-box accent">
                                    <label>IVA (16%)</label>
                                    <input type="number" step="0.01" id="fiscal-iva" value="0.00" class="input-large" readonly>
                                </div>
                                <div class="amount-box">
                                    <label>Monto Exento</label>
                                    <input type="number" step="0.01" id="fiscal-exempt" value="0.00" class="input-large">
                                </div>
                                <div class="amount-box highlight" style="background: #e0e7ff;">
                                    <label>Total Factura</label>
                                    <input type="number" step="0.01" id="fiscal-total" value="0.00" class="input-large total-input">
                                </div>
                            </div>
                        </div>

                        <div class="form-section" style="background: #e2e8f0; padding: 1.5rem; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 1.5rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                            <div class="form-section-title" style="margin-top: 0;">CONTABILIZACIÓN AUTOMÁTICA</div>
                            <div class="form-grid-modal">
                                <div class="form-group">
                                    <label id="label-acc-op">Cuenta de Gasto/Compra</label>
                                    <select id="fiscal-acc-op" required>
                                        <option value="">Seleccione Cuenta...</option>
                                        ${window.chartOfAccounts.filter(a => a.code.startsWith('5') || a.code.startsWith('6') || a.code.startsWith('4')).map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Contrapartida (Pago/Cobro)</label>
                                    <select id="fiscal-acc-pay" required>
                                        <option value="">Seleccione Cuenta...</option>
                                        ${window.chartOfAccounts.filter(a => a.code.startsWith('1.1.01') || a.code.startsWith('2.1.01') || a.code.startsWith('1.1.02')).map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section" style="background: #ffedd5; padding: 1.5rem; border-radius: 12px; border: 1px solid #fdba74; margin-bottom: 1.5rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                            <div class="form-section-title" style="margin-top: 0;">RETENCIONES Y AJUSTES ADICIONALES <span style="font-weight:400;font-size:0.7rem;opacity:0.7;">(Opcional — IVA Retenido, ISLR, etc.)</span></div>
                            <div id="fiscal-extra-lines-container" class="extra-lines-container">
                                <!-- Líneas adicionales se insertan aquí -->
                            </div>
                            <button type="button" class="btn-text" id="btn-add-fiscal-line" style="margin-bottom: 0;">
                                <i data-lucide="plus-circle"></i> Agregar Línea de Retención / Ajuste
                            </button>
                        </div>

                        <div class="entry-footer" style="margin-top: 2rem;">
                            <p class="text-muted small">Al guardar, el sistema generará automáticamente el comprobante correlativo en el libro diario.</p>
                            <div class="form-actions">
                                <button type="reset" class="btn-secondary">Limpiar</button>
                                <button type="submit" class="btn-primary large">
                                    <i data-lucide="save"></i> Registrar Factura y Generar Asiento
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
        container.innerHTML = html;
        applyAccountingStyles(); // Re-aplicar estilos para asegurar consistencia
        applySalesStyles();
        setupFiscalForm();
        lucide.createIcons();
    }

    function applySalesStyles() {
        const style = document.createElement('style');
        style.id = 'sales-styles';
        style.textContent = `
            .amounts-summary-grid { 
                display: grid; 
                grid-template-columns: repeat(4, 1fr); 
                gap: 0.75rem; 
                background: rgba(0,0,0,0.03); 
                padding: 1rem; 
                border-radius: 12px; 
                border: 1px solid var(--border-color);
                width: 100%;
                box-sizing: border-box;
            }
            .amount-box { 
                display: flex; 
                flex-direction: column; 
                gap: 0.5rem; 
                overflow: hidden;
            }
            .amount-box input {
                width: 100%;
                font-size: 1.5rem !important;
                font-weight: 700;
                text-align: right;
                padding: 0.5rem !important;
            }
            .amount-box label { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; white-space: nowrap; }
            .amount-box.accent label { color: var(--primary); }
            .amount-box.highlight { 
                background: rgba(99, 102, 241, 0.08); 
                padding: 0.5rem; 
                border-radius: 8px; 
                border: 1px solid var(--primary);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
            }
            .form-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--border-color);
            }
            .btn-primary.large {
                padding: 0.8rem 2rem;
                font-size: 1rem;
            }
        `;
        if(!document.getElementById('sales-styles')) document.head.appendChild(style);
    }
    function setupFiscalForm() {
        const baseIn = document.getElementById('fiscal-base');
        const ivaIn = document.getElementById('fiscal-iva');
        const exemptIn = document.getElementById('fiscal-exempt');
        const totalIn = document.getElementById('fiscal-total');
        const dateIn = document.getElementById('fiscal-date');
        const displayId = document.getElementById('fiscal-display-id');
        const typeRadios = document.querySelectorAll('input[name="op-type"]');
        const labelOp = document.getElementById('label-acc-op');
        const accOp = document.getElementById('fiscal-acc-op');

        const updateId = () => {
            displayId.textContent = window.generateEntryId(dateIn.value);
        };

        const updateAmounts = (source) => {
            const base = parseFloat(baseIn.value || 0);
            const exempt = parseFloat(exemptIn.value || 0);
            
            if (source === 'base') {
                const iva = base * 0.16;
                ivaIn.value = iva.toFixed(2);
                totalIn.value = (base + iva + exempt).toFixed(2);
            } else if (source === 'exempt') {
                const iva = parseFloat(ivaIn.value || 0);
                totalIn.value = (base + iva + exempt).toFixed(2);
            } else if (source === 'total') {
                const total = parseFloat(totalIn.value || 0);
                // Si el usuario cambia el total, asumimos que el exento se mantiene y recalculamos base e iva
                const net = total - exempt;
                const newBase = net / 1.16;
                baseIn.value = newBase.toFixed(2);
                ivaIn.value = (newBase * 0.16).toFixed(2);
            }
        };

        updateId();
        dateIn.onchange = updateId;
        baseIn.oninput = () => updateAmounts('base');
        exemptIn.oninput = () => updateAmounts('exempt');
        totalIn.oninput = () => updateAmounts('total');

        typeRadios.forEach(r => r.onchange = () => {
            const isPurchase = document.querySelector('input[name="op-type"]:checked').value === 'PURCHASE';
            labelOp.textContent = isPurchase ? 'Cuenta de Gasto/Compra' : 'Cuenta de Venta/Ingreso';
            
            // Re-filtrar cuentas según tipo
            const filtered = window.chartOfAccounts.filter(a => isPurchase ? (a.code.startsWith('5') || a.code.startsWith('6')) : a.code.startsWith('4'));
            accOp.innerHTML = '<option value="">Seleccione Cuenta...</option>' + filtered.map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('');
        });

        document.getElementById('form-fiscal-op').onsubmit = (e) => {
            e.preventDefault();
            generateFiscalEntry();
        };

        const btnAddFiscal = document.getElementById('btn-add-fiscal-line');
        if (btnAddFiscal) {
            btnAddFiscal.onclick = () => {
                const container = document.getElementById('fiscal-extra-lines-container');
                const div = document.createElement('div');
                div.className = 'fiscal-extra-line';
                div.style.marginBottom = '0.5rem';
                div.innerHTML = `
                    <div class="line-main" style="display: grid; grid-template-columns: 2fr 1fr 1fr 40px; gap: 0.5rem; align-items: center;">
                        <div class="col-acc">
                            <select class="extra-acc" required style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);">
                                <option value="">Seleccione Cuenta de Retención/Ajuste...</option>
                                ${window.chartOfAccounts.filter(a => a.level >= 2).map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-debe"><input type="number" step="0.01" class="extra-debit" value="0" placeholder="Debe" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);"></div>
                        <div class="col-haber"><input type="number" step="0.01" class="extra-credit" value="0" placeholder="Haber" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);"></div>
                        <div class="col-act"><button type="button" class="btn-remove-line" style="width: 100%; padding: 0.5rem; background: var(--danger); color: white; border: none; border-radius: 4px; cursor: pointer;">&times;</button></div>
                    </div>
                `;
                container.appendChild(div);
                div.querySelector('.btn-remove-line').onclick = () => div.remove();
            };
        }
    }

    function generateFiscalEntry() {
        const type = document.querySelector('input[name="op-type"]:checked').value;
        const rif = document.getElementById('fiscal-rif').value;
        const name = document.getElementById('fiscal-name').value;
        const invoice = document.getElementById('fiscal-invoice').value;
        const control = document.getElementById('fiscal-control').value;
        const date = document.getElementById('fiscal-date').value;
        const base = parseFloat(document.getElementById('fiscal-base').value || 0);
        const iva = parseFloat(document.getElementById('fiscal-iva').value || 0);
        const exempt = parseFloat(document.getElementById('fiscal-exempt').value || 0);
        const total = parseFloat(document.getElementById('fiscal-total').value || 0);
        const accOpCode = document.getElementById('fiscal-acc-op').value;
        const accPayCode = document.getElementById('fiscal-acc-pay').value;

        if (!accOpCode || !accPayCode) {
            alert('Por favor seleccione las cuentas contables principales');
            return;
        }

        const accOpName = window.chartOfAccounts.find(a => a.code === accOpCode)?.name || accOpCode;
        const accPayName = window.chartOfAccounts.find(a => a.code === accPayCode)?.name || accPayCode;

        // Cuentas de IVA (1.1.02.01 Crédito Fiscal / 2.1.02.01 Débito Fiscal)
        const ivaCode = type === 'PURCHASE' ? '1.1.02.01' : '2.1.02.01';
        const ivaName = type === 'PURCHASE' ? 'IVA Crédito Fiscal' : 'IVA Débito Fiscal';

        const entryId = window.generateEntryId(date);
        const items = [];

        // Recoger líneas adicionales (retenciones, ISLR, etc.)
        const extraLines = [];
        document.querySelectorAll('.fiscal-extra-line').forEach(line => {
            const selAcc = line.querySelector('.extra-acc');
            const inpDeb = line.querySelector('.extra-debit');
            const inpCre = line.querySelector('.extra-credit');
            if (!selAcc || !selAcc.value) return;
            const deb = parseFloat(inpDeb?.value || 0);
            const cre = parseFloat(inpCre?.value || 0);
            if (deb > 0 || cre > 0) {
                const accName = window.chartOfAccounts.find(a => a.code === selAcc.value)?.name || selAcc.value;
                extraLines.push({ accountCode: selAcc.value, accountName: accName, debit: deb, credit: cre });
            }
        });

        // Calcular total ajustado por retenciones (lo que realmente paga/cobra)
        const totalRetDebit  = extraLines.reduce((s, l) => s + l.debit, 0);
        const totalRetCredit = extraLines.reduce((s, l) => s + l.credit, 0);

        if (type === 'PURCHASE') {
            // DEBE: Gasto/Compra (base + exento)
            if (base + exempt > 0) {
                items.push({
                    accountCode: accOpCode, accountName: accOpName,
                    debit: base + exempt, credit: 0,
                    rif, supplier: name, invoice, control, base, iva, exempt
                });
            }
            // DEBE: IVA Crédito Fiscal (solo si hay IVA)
            if (iva > 0) {
                items.push({
                    accountCode: ivaCode, accountName: ivaName,
                    debit: iva, credit: 0,
                    rif, supplier: name, invoice, control, base, iva, exempt
                });
            }
            // HABER: Líneas adicionales (ej: retención de IVA como crédito del proveedor)
            extraLines.forEach(l => items.push(l));
            // HABER: Cuenta de pago (total menos retenciones que actúan como crédito)
            const netPay = total - totalRetCredit + totalRetDebit;
            items.push({ accountCode: accPayCode, accountName: accPayName, debit: 0, credit: netPay });

        } else { // SALE
            // DEBE: Cuenta de cobro (total menos retenciones recibidas)
            const netReceive = total - totalRetDebit + totalRetCredit;
            items.push({ accountCode: accPayCode, accountName: accPayName, debit: netReceive, credit: 0 });
            // DEBE: Líneas adicionales (ej: retención de IVA recibida)
            extraLines.forEach(l => items.push(l));
            // HABER: Ingreso/Venta (base + exento)
            if (base + exempt > 0) {
                items.push({
                    accountCode: accOpCode, accountName: accOpName,
                    debit: 0, credit: base + exempt,
                    rif, supplier: name, invoice, control, base, iva, exempt
                });
            }
            // HABER: IVA Débito Fiscal (solo si hay IVA)
            if (iva > 0) {
                items.push({
                    accountCode: ivaCode, accountName: ivaName,
                    debit: 0, credit: iva,
                    rif, supplier: name, invoice, control, base, iva, exempt
                });
            }
        }

        const description = `${type === 'PURCHASE' ? 'Compra' : 'Venta'} según Factura #${invoice} - ${name}`;
        window.addEntry({ id: entryId, date, description, items, status: 'Posted' });
        alert(`¡Factura Registrada!\nComprobante: ${entryId}`);
        renderSalesPurchases(document.getElementById('module-container'));
    }

    function applyAccountingStyles() {
        const style = document.createElement('style');
        style.id = 'accounting-styles';
        style.textContent = `
            .main-form-card { max-width: 1000px; margin: 0 auto; padding: 0; overflow: hidden; }
            .main-header { padding: 2rem; background: var(--primary); color: white; border-bottom: none; display: flex; justify-content: space-between; align-items: center; }
            .header-info { display: flex; align-items: center; gap: 1.5rem; }
            .header-info i { width: 40px; height: 40px; stroke-width: 2.5px; }
            .header-info h3 { margin: 0; font-size: 1.4rem; }
            .header-info p { margin: 0; font-size: 0.85rem; opacity: 0.8; }
            
            .header-id-box { background: rgba(0,0,0,0.2); padding: 0.75rem 1.5rem; border-radius: 8px; text-align: right; }
            .header-id-box span { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; }
            .header-id-box strong { font-size: 1.5rem; font-family: monospace; }
            
            .form-accounting { padding: 2rem; }
            .form-top-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; margin-bottom: 2rem; }
            .form-group.large input { font-size: 1.1rem; padding: 0.75rem; border: 2px solid var(--border-color); }
            
            .entry-lines-container { background: #f8fafc; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; }
            .lines-header { display: flex; gap: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); margin-bottom: 1rem; font-weight: 700; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
            
            .entry-line-complex { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px dashed var(--border-color); }
            .line-main { display: flex; gap: 1.5rem; }
            .line-meta { margin-top: 0.75rem; padding: 1rem; background: white; border-radius: 8px; border: 1px solid var(--border-color); }
            .meta-inputs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
            .meta-inputs input { font-size: 0.8rem; padding: 0.5rem; }
            
            .col-acc { flex: 1; }
            .col-debe, .col-haber { width: 150px; }
            .col-act { width: 40px; display: flex; align-items: center; }
            
            .line-acc { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); font-weight: 600; }
            .line-debit, .line-credit { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: right; font-weight: 700; color: var(--primary); font-size: 1rem; }
            
            .btn-remove-line { background: #fee2e2; color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
            .btn-remove-line:hover { background: #ef4444; color: white; transform: scale(1.1); }
            
            .entry-footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid var(--border-color); padding-top: 2rem; }
            .totals-display { display: flex; gap: 3rem; }
            .total-item { text-align: right; }
            .total-item span { display: block; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
            .total-item strong { font-size: 1.6rem; color: var(--secondary); }
            .total-item.diff { border-left: 2px solid var(--border-color); padding-left: 2rem; }
            
            .btn-primary.large { padding: 1rem 2rem; font-size: 1.1rem; box-shadow: var(--shadow-lg); }
            .btn-close-quick { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
            .text-primary { color: var(--primary); }
            .accent-header { background: linear-gradient(135deg, var(--primary), var(--accent)); }
            .type-selector-header { display: flex; background: rgba(255,255,255,0.1); padding: 0.25rem; border-radius: 10px; }
            .radio-tab { cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s; color: white; opacity: 0.7; }
            .radio-tab:has(input:checked) { background: white; color: var(--primary); opacity: 1; font-weight: 700; }
            .radio-tab input { display: none; }
            .form-section-title { font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; margin: 1.5rem 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); }
            .input-large { font-size: 1.4rem !important; height: auto !important; padding: 0.75rem !important; font-weight: 700; color: var(--secondary); text-align: right; }
            .total-input { background: rgba(99, 102, 241, 0.05); color: var(--primary); border-color: var(--primary) !important; }
            .mb-2 { margin-bottom: 2rem; }
        `;
        if(!document.getElementById('accounting-styles')) document.head.appendChild(style);
    }

    function renderChartOfAccounts(container) {
        let html = `
            <div class="glass-card">
                <div class="card-header">
                    <h3>Catálogo de Cuentas</h3>
                    <div class="header-actions">
                        <button class="btn-secondary" id="btn-export-json" title="Exportar JSON"><i data-lucide="download"></i> JSON</button>
                        <button class="btn-secondary" id="btn-export-csv" title="Exportar CSV"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button class="btn-secondary" id="btn-import-json" title="Importar JSON"><i data-lucide="upload"></i> Importar</button>
                        <input type="file" id="input-import-file" style="display: none;" accept=".json">
                        <button class="btn-primary" id="btn-add-account">+ Nueva Cuenta</button>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-header">
                        <span class="col-code">Código</span>
                        <span class="col-name">Nombre de la Cuenta</span>
                        <span class="col-type">Naturaleza</span>
                        <span class="col-actions">Acciones</span>
                    </div>
                    <div class="chart-body" id="chart-body-list">
        `;

        const renderRows = () => {
            let rowsHtml = '';
            window.chartOfAccounts.sort((a, b) => a.code.localeCompare(b.code, undefined, {numeric: true, sensitivity: 'base'}));
            
            window.chartOfAccounts.forEach(acc => {
                const indent = (acc.level - 1) * 24;
                const isBold = acc.level <= 2 ? 'font-weight: 700;' : '';
                const color = acc.level === 1 ? 'color: var(--primary);' : '';
                const levelClass = `level-${acc.level}`;
                
                rowsHtml += `
                    <div class="chart-row ${levelClass}" style="padding-left: ${indent}px; ${isBold} ${color}">
                        <span class="col-code">${acc.code}</span>
                        <span class="col-name">${acc.name}</span>
                        <span class="col-type">${acc.type}</span>
                        <span class="col-actions">
                            <button class="btn-icon btn-edit-acc" data-code="${acc.code}" title="Editar"><i data-lucide="edit-2"></i></button>
                            <button class="btn-icon btn-delete-acc" data-code="${acc.code}" title="Eliminar"><i data-lucide="trash-2"></i></button>
                        </span>
                    </div>
                `;
            });
            return rowsHtml;
        };

        html += renderRows();
        html += `
                    </div>
                </div>
            </div>

            <!-- Modal Nueva Cuenta -->
            <div id="modal-account" class="modal">
                <div class="modal-content glass-card">
                    <div class="modal-header">
                        <h3>Nueva Cuenta Contable</h3>
                        <button type="button" class="btn-close">&times;</button>
                    </div>
                    <form id="form-new-account" class="modal-body">
                        <div class="form-group" id="group-select-edit" style="display: none;">
                            <label>Opcional: Seleccionar cuenta para editar</label>
                            <select id="acc-select-to-edit">
                                <option value="">-- Nueva Cuenta --</option>
                                ${window.chartOfAccounts.map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-grid-modal">
                            <div class="form-group">
                                <label>Código de Cuenta</label>
                                <input type="text" id="acc-code" placeholder="X.X.XX.XX" required>
                            </div>
                            <div class="form-group">
                                <label>Nombre de la Cuenta</label>
                                <input type="text" id="acc-name" placeholder="Ej: Banco Mercantil" required>
                            </div>
                        </div>
                        <div class="form-grid-modal">
                            <div class="form-group">
                                <label>Grupo (Naturaleza)</label>
                                <select id="acc-type" required>
                                    <option value="Asset">Activo</option>
                                    <option value="Liability">Pasivo</option>
                                    <option value="Equity">Patrimonio</option>
                                    <option value="Revenue">Ingresos</option>
                                    <option value="Expense">Egresos / Compras</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Función de la Cuenta</label>
                                <select id="acc-function" required>
                                    <option value="Title">De Título (Agrupadora)</option>
                                    <option value="Movement" selected>De Movimiento (Detalle)</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Jerarquía</label>
                            <select id="acc-hierarchy" required>
                                <option value="Principal">Principal (Nivel 1-3)</option>
                                <option value="Auxiliar">Auxiliar (Detalle Final)</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary btn-close">Cancelar</button>
                            <button type="submit" class="btn-primary">Guardar Cuenta</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        container.innerHTML = html;
        applyChartStyles();
        setupAccountEventListeners();
    }

    function setupAccountEventListeners() {
        const modal = document.getElementById('modal-account');
        const btnAdd = document.getElementById('btn-add-account');
        const btnClose = document.querySelectorAll('.btn-close');
        const form = document.getElementById('form-new-account');
        const modalTitle = modal.querySelector('h3');
        let editingCode = null;

        btnAdd.onclick = () => {
            editingCode = null;
            modalTitle.textContent = 'Nueva Cuenta Contable';
            form.reset();
            document.getElementById('group-select-edit').style.display = 'block';
            modal.classList.add('show');
        };

        const selectToEdit = document.getElementById('acc-select-to-edit');
        if (selectToEdit) {
            selectToEdit.onchange = () => {
                const code = selectToEdit.value;
                if (!code) {
                    form.reset();
                    editingCode = null;
                    return;
                }
                const acc = window.chartOfAccounts.find(a => a.code === code);
                if (acc) {
                    editingCode = code;
                    document.getElementById('acc-code').value = acc.code;
                    document.getElementById('acc-name').value = acc.name;
                    document.getElementById('acc-type').value = acc.type;
                    if (acc.function) document.getElementById('acc-function').value = acc.function;
                    if (acc.hierarchy) document.getElementById('acc-hierarchy').value = acc.hierarchy;
                }
            };
        }

        // Exportar JSON
        document.getElementById('btn-export-json').onclick = () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.chartOfAccounts, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "catalogo_cuentas.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        };

        // Exportar CSV
        document.getElementById('btn-export-csv').onclick = () => {
            let csvContent = "data:text/csv;charset=utf-8,Codigo,Nombre,Naturaleza,Nivel\n";
            window.chartOfAccounts.forEach(acc => {
                csvContent += `${acc.code},"${acc.name}",${acc.type},${acc.level}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "catalogo_cuentas.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
        };

        // Importar JSON
        const importBtn = document.getElementById('btn-import-json');
        const fileInput = document.getElementById('input-import-file');
        
        importBtn.onclick = () => fileInput.click();
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (Array.isArray(imported) && imported.length > 0 && imported[0].code) {
                        if (confirm(`Se han detectado ${imported.length} cuentas. ¿Desea reemplazar su catálogo actual?`)) {
                            window.chartOfAccounts = imported;
                            window.saveAccounts();
                            renderChartOfAccounts(document.getElementById('module-container'));
                        }
                    } else {
                        alert("El archivo no tiene el formato de catálogo válido.");
                    }
                } catch (err) {
                    alert("Error al leer el archivo JSON.");
                }
            };
            reader.readAsText(file);
        };

        btnClose.forEach(btn => btn.onclick = () => modal.classList.remove('show'));

        document.querySelectorAll('.btn-edit-acc').forEach(btn => {
            btn.onclick = () => {
                const code = btn.dataset.code;
                const acc = window.chartOfAccounts.find(a => a.code === code);
                if (acc) {
                    editingCode = code;
                    modalTitle.textContent = 'Editar Cuenta Contable';
                    document.getElementById('group-select-edit').style.display = 'none';
                    document.getElementById('acc-code').value = acc.code;
                    document.getElementById('acc-name').value = acc.name;
                    document.getElementById('acc-type').value = acc.type;
                    if (acc.function) document.getElementById('acc-function').value = acc.function;
                    if (acc.hierarchy) document.getElementById('acc-hierarchy').value = acc.hierarchy;
                    modal.classList.add('show');
                }
            };
        });

        document.querySelectorAll('.btn-delete-acc').forEach(btn => {
            btn.onclick = () => {
                const code = btn.dataset.code;
                const hasMovements = window.journalEntries.some(e => e.items.some(i => i.accountCode === code));
                
                if (hasMovements) {
                    alert("No se puede eliminar la cuenta " + code + " porque ya tiene asientos contables registrados.");
                    return;
                }

                if (confirm("¿Está seguro de eliminar la cuenta " + code + "? Esta acción no se puede deshacer.")) {
                    window.chartOfAccounts = window.chartOfAccounts.filter(a => a.code !== code);
                    window.saveAccounts();
                    renderChartOfAccounts(document.getElementById('module-container'));
                }
            };
        });

        form.onsubmit = (e) => {
            e.preventDefault();
            const code = document.getElementById('acc-code').value;
            const name = document.getElementById('acc-name').value;
            const type = document.getElementById('acc-type').value;
            const func = document.getElementById('acc-function').value;
            const hierarchy = document.getElementById('acc-hierarchy').value;
            
            if (!code || !name) return;

            const level = code.split('.').length;
            const newAccount = { 
                code, 
                name, 
                type, 
                level,
                function: func,
                hierarchy: hierarchy
            };
            
            if (!window.chartOfAccounts) window.chartOfAccounts = [];

            if (editingCode) {
                // Actualizar existente
                const index = window.chartOfAccounts.findIndex(a => a.code === editingCode);
                if (index !== -1) window.chartOfAccounts[index] = newAccount;
            } else {
                // Verificar si ya existe
                if (window.chartOfAccounts.some(a => a.code === code)) {
                    alert("Error: El código de cuenta ya existe.");
                    return;
                }
                window.chartOfAccounts.push(newAccount);
            }

            window.saveAccounts();
            modal.classList.remove('show');
            setTimeout(() => {
                renderChartOfAccounts(document.getElementById('module-container'));
            }, 100);
        };
    }

    function applyChartStyles() {
        const style = document.createElement('style');
        style.id = 'chart-styles';
        style.textContent = `
            .chart-container { padding: 1rem; }
            .chart-header { display: flex; padding: 1rem; background: rgba(0,0,0,0.02); border-radius: 8px; margin-bottom: 0.5rem; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
            .chart-row { display: flex; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); transition: background 0.2s; cursor: pointer; position: relative; }
            .chart-row:hover { background: rgba(99, 102, 241, 0.05); }
            .col-code { width: 140px; flex-shrink: 0; font-family: monospace; }
            .col-name { flex: 1; }
            .col-type { width: 120px; text-align: right; font-size: 0.75rem; opacity: 0.7; }
            .col-actions { width: 100px; text-align: center; }
            .btn-icon { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; transition: color 0.2s; }
            .btn-icon:hover { color: var(--primary); }
            .btn-edit-acc:hover { color: var(--info); }
            .btn-delete-acc:hover { color: var(--danger); }
            .chart-row .btn-icon i { width: 16px; height: 16px; }
            .level-1 { font-size: 1.1rem; border-bottom: 2px solid var(--border-color); margin-top: 1.5rem; background: rgba(99, 102, 241, 0.02); }
            .level-2 { font-size: 1rem; margin-top: 0.5rem; }
            .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
            .modal.show { display: flex; }
            .modal-content { width: 550px; padding: 2rem; animation: slideUp 0.3s ease; }
            .form-grid-modal { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
            .modal-header h3 { margin: 0; }
            .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
            .form-group { margin-bottom: 1.25rem; }
            .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted); }
            .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit; }
            .modal-body .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
            .btn-secondary { background: #e2e8f0; color: var(--text-main); border: none; padding: 0.6rem 1.2rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        if(!document.getElementById('chart-styles')) document.head.appendChild(style);
    }

    function renderBanking(container) {
        // Inicializar datos de conciliación si no existen
        if (!window.bankReconData) {
            window.bankReconData = JSON.parse(localStorage.getItem('softwin_bank_recon')) || {};
        }
        window.saveBankRecon = () => {
            localStorage.setItem('softwin_bank_recon', JSON.stringify(window.bankReconData));
        };

        const bankAccounts = window.chartOfAccounts.filter(a => a.code.startsWith('1.1.01') && a.level >= 3);
        
        container.innerHTML = `
            <div class="banking-layout">
                <div class="glass-card main-form-card" style="max-width: 1200px;">
                    <div class="card-header main-header" style="background: linear-gradient(135deg, #0f172a, #1e293b);">
                        <div class="header-info">
                            <i data-lucide="landmark"></i>
                            <div>
                                <h3>Conciliación Bancaria</h3>
                                <p>Revisión y Cuadre de Cuentas de Efectivo y Bancos</p>
                            </div>
                        </div>
                        <div class="header-actions">
                            <select id="recon-bank-select" style="padding: 0.5rem; border-radius: 8px; font-weight: 600; min-width: 250px; color: var(--secondary);">
                                <option value="">Seleccione una cuenta bancaria...</option>
                                ${bankAccounts.map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div id="recon-workspace" style="display: none; padding: 2rem;">
                        <div class="recon-formula-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                            <!-- Ajuste Libros -->
                            <div class="recon-box" style="background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; box-shadow: var(--shadow-sm);">
                                <h4 style="color: var(--secondary); margin-bottom: 1rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem;">Ajuste al Saldo en Libros</h4>
                                <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;"><span>Saldo Final de tus Libros</span> <strong id="recon-sys-balance">$0.00</strong></div>
                                <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem; color: var(--success); font-size: 0.9rem;"><span>➕ Notas de Crédito (Ej. Intereses ganados)</span> <span id="recon-lib-plus">$0.00</span></div>
                                <div style="display:flex; justify-content:space-between; margin-bottom: 1rem; color: var(--danger); font-size: 0.9rem;"><span>➖ Notas de Débito (Ej. Comisiones y cargos)</span> <span id="recon-lib-minus">$0.00</span></div>
                                <div style="display:flex; justify-content:space-between; border-top: 1px dashed var(--border-color); padding-top: 0.5rem; font-size: 1.2rem;">
                                    <strong>🟰 Saldo Libros Ajustado</strong> <strong id="recon-lib-adjusted" style="color: var(--primary);">$0.00</strong>
                                </div>
                            </div>
                            
                            <!-- Ajuste Banco -->
                            <div class="recon-box" style="background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; box-shadow: var(--shadow-sm);">
                                <h4 style="color: var(--secondary); margin-bottom: 1rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem;">Ajuste al Saldo del Banco</h4>
                                <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span>Saldo Final del Extracto</span> 
                                    <input type="number" step="0.01" id="recon-bank-balance" value="0.00" style="width: 150px; text-align: right; font-weight: 700; border: 1px solid var(--border-color); border-radius: 4px; padding: 0.25rem;">
                                </div>
                                <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem; color: var(--success); font-size: 0.9rem;"><span>➕ Depósitos en tránsito (no tildados)</span> <span id="recon-bnk-plus">$0.00</span></div>
                                <div style="display:flex; justify-content:space-between; margin-bottom: 1rem; color: var(--danger); font-size: 0.9rem;"><span>➖ Cheques pendientes (no tildados)</span> <span id="recon-bnk-minus">$0.00</span></div>
                                <div style="display:flex; justify-content:space-between; border-top: 1px dashed var(--border-color); padding-top: 0.5rem; font-size: 1.2rem;">
                                    <strong>🟰 Saldo Bancario Ajustado</strong> <strong id="recon-bnk-adjusted" style="color: var(--primary);">$0.00</strong>
                                </div>
                            </div>
                        </div>

                        <div id="recon-status-box" style="background: white; padding: 1.5rem; border-radius: 12px; border: 2px solid var(--danger); text-align: center; margin-bottom: 2rem;">
                            <label style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Diferencia No Conciliada (Libros vs Banco)</label>
                            <strong id="recon-unreconciled-diff" style="display:block; font-size: 2.5rem; color: var(--danger); margin-top: 0.5rem;">$0.00</strong>
                            <p id="recon-status-text" style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">El Saldo Bancario Ajustado debe ser exactamente igual al Saldo en Libros Ajustado.</p>
                        </div>

                        <div class="recon-operations">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h4 style="color: var(--primary); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">Operaciones Registradas (Marque las que aparecen en el estado de cuenta)</h4>
                                <button type="button" class="btn-secondary" id="btn-add-manual-recon"><i data-lucide="plus"></i> Añadir Movimiento Bancario No Contabilizado</button>
                            </div>
                            
                            <div class="table-scroll" style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
                                <table class="report-table" style="width: 100%; border-collapse: collapse;">
                                    <thead style="position: sticky; top: 0; background: var(--background); z-index: 10;">
                                        <tr>
                                            <th style="width: 50px; text-align: center;">Ok</th>
                                            <th>Fecha</th>
                                            <th>Ref/Comprobante</th>
                                            <th>Concepto</th>
                                            <th class="text-right">Cargo (+)</th>
                                            <th class="text-right">Abono (-)</th>
                                            <th>Origen</th>
                                        </tr>
                                    </thead>
                                    <tbody id="recon-tbody">
                                        <!-- Se llena dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Manual Recon Entry -->
            <div id="modal-manual-recon" class="modal">
                <div class="modal-content glass-card" style="width: 500px;">
                    <div class="modal-header">
                        <h3>Partida Conciliatoria (No en Libros)</h3>
                        <button type="button" class="btn-close-manual">&times;</button>
                    </div>
                    <form id="form-manual-recon" class="modal-body">
                        <div class="form-group">
                            <label>Fecha del Movimiento</label>
                            <input type="date" id="man-recon-date" required>
                        </div>
                        <div class="form-group">
                            <label>Referencia Bancaria</label>
                            <input type="text" id="man-recon-ref" required>
                        </div>
                        <div class="form-group">
                            <label>Concepto</label>
                            <input type="text" id="man-recon-desc" required>
                        </div>
                        <div class="form-grid-modal">
                            <div class="form-group">
                                <label>Tipo de Movimiento</label>
                                <select id="man-recon-type" required>
                                    <option value="debit">Ingreso / Depósito (+)</option>
                                    <option value="credit">Egreso / Cheque (-)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Monto</label>
                                <input type="number" step="0.01" id="man-recon-amount" required>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary btn-close-manual">Cancelar</button>
                            <button type="submit" class="btn-primary">Añadir a Conciliación</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        setupBankingLogic();
        lucide.createIcons();
    }

    function setupBankingLogic() {
        const bankSelect = document.getElementById('recon-bank-select');
        const workspace = document.getElementById('recon-workspace');
        const sysBalanceEl = document.getElementById('recon-sys-balance');
        const bankBalanceIn = document.getElementById('recon-bank-balance');
        
        const libPlusEl = document.getElementById('recon-lib-plus');
        const libMinusEl = document.getElementById('recon-lib-minus');
        const libAdjustedEl = document.getElementById('recon-lib-adjusted');
        
        const bnkPlusEl = document.getElementById('recon-bnk-plus');
        const bnkMinusEl = document.getElementById('recon-bnk-minus');
        const bnkAdjustedEl = document.getElementById('recon-bnk-adjusted');

        const unreconDiffEl = document.getElementById('recon-unreconciled-diff');
        const statusBox = document.getElementById('recon-status-box');
        const statusText = document.getElementById('recon-status-text');
        const tbody = document.getElementById('recon-tbody');

        const modalManual = document.getElementById('modal-manual-recon');
        
        let currentCode = null;
        let systemBalance = 0;
        let operations = [];

        bankSelect.onchange = () => {
            currentCode = bankSelect.value;
            if (!currentCode) {
                workspace.style.display = 'none';
                return;
            }
            workspace.style.display = 'block';
            
            // Inicializar datos del banco si no existen
            if (!window.bankReconData[currentCode]) {
                window.bankReconData[currentCode] = { bankBalance: 0, checkedIds: [], manualEntries: [] };
            }

            const data = window.bankReconData[currentCode];
            bankBalanceIn.value = data.bankBalance.toFixed(2);
            
            // Calcular saldo en libros
            const balances = window.FinancialReports.calculateBalances();
            systemBalance = balances[currentCode] ? balances[currentCode].balance : 0;
            sysBalanceEl.textContent = '$' + systemBalance.toLocaleString(undefined, {minimumFractionDigits:2});

            loadOperations();
        };

        function loadOperations() {
            operations = [];
            const data = window.bankReconData[currentCode];

            // 1. Obtener de Libros (Diario)
            window.journalEntries.forEach(entry => {
                entry.items.forEach((item, idx) => {
                    if (item.accountCode === currentCode) {
                        operations.push({
                            id: `sys-${entry.id}-${idx}`,
                            date: entry.date,
                            ref: item.invoice || item.control || entry.id,
                            desc: entry.description,
                            debit: item.debit,
                            credit: item.credit,
                            origin: 'Sistema',
                            checked: data.checkedIds.includes(`sys-${entry.id}-${idx}`)
                        });
                    }
                });
            });

            // 2. Obtener Manuales
            data.manualEntries.forEach(man => {
                operations.push({
                    id: man.id,
                    date: man.date,
                    ref: man.ref,
                    desc: man.desc,
                    debit: man.type === 'debit' ? man.amount : 0,
                    credit: man.type === 'credit' ? man.amount : 0,
                    origin: 'Manual/Banco',
                    checked: data.checkedIds.includes(man.id)
                });
            });

            // Ordenar por fecha
            operations.sort((a, b) => new Date(a.date) - new Date(b.date));

            renderOperationsTable();
            updateReconciliationMath();
        }

        function renderOperationsTable() {
            tbody.innerHTML = operations.map(op => `
                <tr style="background: ${op.checked ? 'rgba(16, 185, 129, 0.05)' : 'transparent'}; transition: background 0.2s;">
                    <td style="text-align: center;">
                        <input type="checkbox" class="recon-check" data-id="${op.id}" ${op.checked ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
                    </td>
                    <td>${op.date}</td>
                    <td>${op.ref}</td>
                    <td>${op.desc}</td>
                    <td class="text-right" style="color:var(--success); font-weight:600;">${op.debit > 0 ? '$'+op.debit.toLocaleString(undefined,{minimumFractionDigits:2}) : ''}</td>
                    <td class="text-right" style="color:var(--danger); font-weight:600;">${op.credit > 0 ? '$'+op.credit.toLocaleString(undefined,{minimumFractionDigits:2}) : ''}</td>
                    <td><span style="font-size:0.7rem; padding: 2px 6px; border-radius:4px; background: ${op.origin === 'Sistema' ? 'var(--primary-light)' : 'var(--warning)'}; color:white;">${op.origin}</span></td>
                </tr>
            `).join('');

            // Listeners para los checkboxes
            document.querySelectorAll('.recon-check').forEach(chk => {
                chk.onchange = (e) => {
                    const id = e.target.dataset.id;
                    const data = window.bankReconData[currentCode];
                    if (e.target.checked) {
                        if (!data.checkedIds.includes(id)) data.checkedIds.push(id);
                    } else {
                        data.checkedIds = data.checkedIds.filter(i => i !== id);
                    }
                    window.saveBankRecon();
                    const tr = e.target.closest('tr');
                    tr.style.background = e.target.checked ? 'rgba(16, 185, 129, 0.05)' : 'transparent';
                    updateReconciliationMath();
                };
            });
        }

        function updateReconciliationMath() {
            const data = window.bankReconData[currentCode];
            const bankBalance = parseFloat(bankBalanceIn.value || 0);
            data.bankBalance = bankBalance;
            window.saveBankRecon();

            let depositosTransito = 0;
            let chequesPendientes = 0;
            let notasCreditoManuales = 0;
            let notasDebitoManuales = 0;

            operations.forEach(op => {
                // Sistema NO tildado -> partidas en tránsito (solo en libros, no en banco)
                if (op.origin === 'Sistema' && !op.checked) {
                    if (op.debit > 0) depositosTransito += op.debit;
                    if (op.credit > 0) chequesPendientes += op.credit;
                }
                // Manual/Banco -> partidas que están en el banco pero no en el sistema
                // Un ingreso en el banco no contabilizado es una nota de crédito a mi favor (suma a libros)
                if (op.origin === 'Manual/Banco') {
                    if (op.debit > 0) notasCreditoManuales += op.debit;
                    if (op.credit > 0) notasDebitoManuales += op.credit;
                }
            });

            // Ajuste Banco
            bnkPlusEl.textContent = '$' + depositosTransito.toLocaleString(undefined, {minimumFractionDigits:2});
            bnkMinusEl.textContent = '$' + chequesPendientes.toLocaleString(undefined, {minimumFractionDigits:2});
            const bnkAdjusted = bankBalance + depositosTransito - chequesPendientes;
            bnkAdjustedEl.textContent = '$' + bnkAdjusted.toLocaleString(undefined, {minimumFractionDigits:2});

            // Ajuste Libros
            libPlusEl.textContent = '$' + notasCreditoManuales.toLocaleString(undefined, {minimumFractionDigits:2});
            libMinusEl.textContent = '$' + notasDebitoManuales.toLocaleString(undefined, {minimumFractionDigits:2});
            const libAdjusted = systemBalance + notasCreditoManuales - notasDebitoManuales;
            libAdjustedEl.textContent = '$' + libAdjusted.toLocaleString(undefined, {minimumFractionDigits:2});

            // Diferencia
            const unreconDiff = Math.abs(bnkAdjusted - libAdjusted);
            unreconDiffEl.textContent = '$' + unreconDiff.toLocaleString(undefined, {minimumFractionDigits:2});

            if (unreconDiff < 0.01) {
                statusBox.style.borderColor = 'var(--success)';
                unreconDiffEl.style.color = 'var(--success)';
                statusText.innerHTML = '¡Conciliación Exitosa! 🎉 Los saldos ajustados coinciden perfectamente.';
            } else {
                statusBox.style.borderColor = 'var(--danger)';
                unreconDiffEl.style.color = 'var(--danger)';
                statusText.innerHTML = 'El Saldo Bancario Ajustado debe ser exactamente igual al Saldo en Libros Ajustado.';
            }
        }

        bankBalanceIn.oninput = updateReconciliationMath;

        // Modal Logic
        document.getElementById('btn-add-manual-recon').onclick = () => {
            document.getElementById('form-manual-recon').reset();
            document.getElementById('man-recon-date').value = new Date().toISOString().split('T')[0];
            modalManual.classList.add('show');
        };

        document.querySelectorAll('.btn-close-manual').forEach(btn => {
            btn.onclick = () => modalManual.classList.remove('show');
        });

        document.getElementById('form-manual-recon').onsubmit = (e) => {
            e.preventDefault();
            const manualOp = {
                id: 'man-' + Date.now(),
                date: document.getElementById('man-recon-date').value,
                ref: document.getElementById('man-recon-ref').value,
                desc: document.getElementById('man-recon-desc').value,
                type: document.getElementById('man-recon-type').value,
                amount: parseFloat(document.getElementById('man-recon-amount').value)
            };

            window.bankReconData[currentCode].manualEntries.push(manualOp);
            // Por defecto, lo manual asume que ya está en el banco, así que lo "tildamos" para que quede como pendiente de contabilizar en libros
            window.bankReconData[currentCode].checkedIds.push(manualOp.id);
            window.saveBankRecon();

            modalManual.classList.remove('show');
            loadOperations();
        };
    }

    function renderTaxes(container) {
        let debitoFiscal = 0;
        let creditoFiscal = 0;
        let retIVA = 0;

        if (window.FinancialReports) {
            const balances = window.FinancialReports.calculateBalances();
            debitoFiscal = balances['2.1.02.01'] ? balances['2.1.02.01'].balance : 0;
            creditoFiscal = balances['1.1.02.01'] ? balances['1.1.02.01'].balance : 0;
            retIVA = balances['2.1.02.03'] ? Math.abs(balances['2.1.02.03'].balance) : 0;
        }

        const ivaNeto = debitoFiscal - creditoFiscal;
        const textoIva = ivaNeto >= 0 ? 'Impuesto a Pagar' : 'Crédito a Favor';
        const colorIva = ivaNeto >= 0 ? 'var(--danger)' : 'var(--success)';

        container.innerHTML = `
            <div class="taxes-view" style="animation: fadeIn 0.5s ease;">
                <div class="glass-card" style="margin-bottom: 2rem;">
                    <div class="card-header">
                        <div class="header-info" style="display:flex; align-items:center; gap: 1rem;">
                            <i data-lucide="percent" style="color: var(--primary); width: 32px; height: 32px;"></i>
                            <div>
                                <h3 style="margin:0;">Control del IVA (Débito vs Crédito)</h3>
                                <p style="margin:0; font-size: 0.85rem; opacity: 0.7;">Posición neta de impuestos indirectos del periodo actual</p>
                            </div>
                        </div>
                    </div>
                    <div class="tax-summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; padding: 2rem; background: rgba(0,0,0,0.02); border-radius: 0 0 12px 12px;">
                        <div class="tax-box" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); text-align: center; box-shadow: var(--shadow-sm);">
                            <span style="display:block; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">Débito Fiscal (Ventas)</span>
                            <strong style="font-size: 2rem; color: var(--secondary);">$${debitoFiscal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                        </div>
                        <div class="tax-box" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); text-align: center; box-shadow: var(--shadow-sm);">
                            <span style="display:block; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">Crédito Fiscal (Compras)</span>
                            <strong style="font-size: 2rem; color: var(--secondary);">$${creditoFiscal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                        </div>
                        <div class="tax-box" style="background: white; padding: 1.5rem; border-radius: 12px; border: 2px solid ${colorIva}; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <span style="display:block; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">Saldo Neto (${textoIva})</span>
                            <strong style="font-size: 2.2rem; color: ${colorIva};">$${Math.abs(ivaNeto).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                        </div>
                    </div>
                </div>

                <div class="taxes-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                    <div class="glass-card" style="padding: 1.5rem;">
                        <div class="card-header" style="padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
                            <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="landmark" style="color: var(--primary); width: 20px; height: 20px;"></i>
                                Retenciones por Enterar
                            </h3>
                        </div>
                        <div style="padding: 0.5rem 0;">
                            <div class="report-line" style="display:flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
                                <span>Retención de IVA (Terceros)</span>
                                <strong style="font-size: 1.2rem; color: var(--secondary);">$${retIVA.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                            </div>
                            <div style="text-align: right; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                                <button class="btn-primary btn-tax-export-xml" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 8px; background: linear-gradient(to right, #10b981, #059669); border:none; color:white; font-weight:700; cursor:pointer;">
                                    <i data-lucide="download" style="width:18px; height:18px;"></i> Exportar XML SENIAT
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(244, 63, 94, 0.05)); border: 1px solid var(--border-color);">
                        <h4 style="margin: 0 0 0.5rem; color: var(--primary); font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="info" style="width:18px; height:18px;"></i>
                            Información sobre el IVA
                        </h4>
                        <p style="margin: 0; font-size: 0.8rem; line-height: 1.5; color: var(--text-muted);">
                            El IVA en Venezuela es un impuesto indirecto de declaración periódica obligatoria. El saldo neto se calcula automáticamente restando el Crédito Fiscal (acumulado por compras) del Débito Fiscal (acumulado por ventas).
                        </p>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        const btnTaxExportXml = container.querySelector('.btn-tax-export-xml');
        if (btnTaxExportXml) {
            btnTaxExportXml.onclick = () => {
                const retData = window.FinancialReports.getRetenciones();
                exportarIVASENIAT(retData.iva);
            };
        }
    }

    function renderISLR(container) {
        let utilidadContable = 0;
        let retISLR = 0;

        if (window.FinancialReports) {
            const balances = window.FinancialReports.calculateBalances();
            retISLR = balances['2.1.02.02'] ? Math.abs(balances['2.1.02.02'].balance) : 0;
            
            const income = window.FinancialReports.getIncomeStatement();
            utilidadContable = income.netIncome || 0;
        }

        container.innerHTML = `
            <div class="islr-view" style="animation: fadeIn 0.5s ease;">
                <div class="glass-card" style="margin-bottom: 2rem;">
                    <div class="card-header" style="display:flex; align-items:center; gap: 1rem;">
                        <i data-lucide="scale" style="color: var(--primary); width: 32px; height: 32px;"></i>
                        <div>
                            <h3 style="margin:0;">Impuesto sobre la Renta (ISLR)</h3>
                            <p style="margin:0; font-size: 0.85rem; opacity: 0.7;">Proyección y Estimación del ISLR sobre Utilidades Operacionales</p>
                        </div>
                    </div>
                </div>

                <div class="taxes-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
                    <!-- Calculadora Interactiva de Conciliación Fiscal -->
                    <div class="glass-card" style="padding: 1.5rem;">
                        <div class="card-header" style="padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
                            <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="calculator" style="color: var(--primary); width: 20px; height: 20px;"></i>
                                Conciliación Fiscal Interactiva
                            </h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                            <div>
                                <label style="font-weight: 700; font-size: 0.85rem; color: var(--secondary); display: block; margin-bottom: 0.5rem;">Utilidad Neta Contable (Estado de Resultados)</label>
                                <div style="position: relative;">
                                    <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--text-muted);">$</span>
                                    <input type="text" id="islr-utilidad-contable" readonly value="${utilidadContable.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}" style="width: 100%; padding: 0.6rem 1rem 0.6rem 2rem; border-radius: 8px; border: 1px solid var(--border-color); background: #f8fafc; font-weight: 700; color: var(--secondary);">
                                </div>
                            </div>
                            
                            <div>
                                <label for="islr-no-deducibles" style="font-weight: 700; font-size: 0.85rem; color: var(--secondary); display: block; margin-bottom: 0.5rem;">Gastos No Deducibles (+)</label>
                                <div style="position: relative;">
                                    <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--text-muted);">$</span>
                                    <input type="number" step="0.01" id="islr-no-deducibles" value="0.00" style="width: 100%; padding: 0.6rem 1rem 0.6rem 2rem; border-radius: 8px; border: 1px solid var(--border-color); font-weight: 600; color: var(--secondary);">
                                </div>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Ej: Multas, patentes vencidas, gastos sin soporte fiscal.</span>
                            </div>

                            <div>
                                <label for="islr-exentos" style="font-weight: 700; font-size: 0.85rem; color: var(--secondary); display: block; margin-bottom: 0.5rem;">Ingresos Exentos / Exonerados (-)</label>
                                <div style="position: relative;">
                                    <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--text-muted);">$</span>
                                    <input type="number" step="0.01" id="islr-exentos" value="0.00" style="width: 100%; padding: 0.6rem 1rem 0.6rem 2rem; border-radius: 8px; border: 1px solid var(--border-color); font-weight: 600; color: var(--secondary);">
                                </div>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Ej: Intereses bancarios exonerados, rentas exentas.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Cuadro de Impuesto Proyectado y Cuentas -->
                    <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div class="card-header" style="padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
                                <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <i data-lucide="percent" style="color: var(--primary); width: 20px; height: 20px;"></i>
                                    Provisión y Liquidación Estimada
                                </h3>
                            </div>
                            
                            <div style="background: rgba(0,0,0,0.02); border-radius: 12px; padding: 1.25rem; border: 1px dashed var(--border-color); margin-bottom: 1.5rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">
                                    <span>Base Imponible (Utilidad Fiscal):</span>
                                    <strong id="islr-utilidad-fiscal" style="color: var(--secondary);">$${utilidadContable.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">
                                    <span>Alícuota Aplicada (Persona Jurídica):</span>
                                    <strong>34,00% (Tarifa 2 Máx)</strong>
                                </div>
                                <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 0.75rem 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: 700; color: var(--secondary);">Impuesto de ISLR Determinado:</span>
                                    <strong id="islr-determinado" style="font-size: 1.4rem; color: var(--primary);">$${(utilidadContable * 0.34).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                                </div>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
                                    <span style="color: var(--text-muted);">Retenciones de ISLR Acumuladas (-)</span>
                                    <strong id="islr-retenciones-val" style="color: var(--secondary); font-weight: 600;">$${retISLR.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 1rem; padding: 0.75rem 0; font-weight: 700;">
                                    <span style="color: var(--secondary);">Provisión Neta por Pagar (Cierre):</span>
                                    <strong id="islr-neto" style="color: var(--danger); font-size: 1.25rem;">$${Math.max(0, (utilidadContable * 0.34) - retISLR).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                                </div>
                            </div>
                        </div>

                        <div style="background: rgba(59, 130, 246, 0.08); border-left: 4px solid var(--primary); padding: 1rem; border-radius: 0 8px 8px 0; margin-top: 1.5rem;">
                            <p style="font-size: 0.75rem; color: var(--secondary); margin: 0; line-height: 1.4;">
                                <i data-lucide="info" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 0.25rem; color: var(--primary);"></i>
                                <strong>Nota Contable:</strong> La alícuota corporativa en Venezuela se rige por la Tarifa 2 del ISLR (hasta 34%). Puedes estimar tu conciliación agregando gastos no deducibles o rentas exentas en tiempo real.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="taxes-grid mt-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin-top:2rem;">
                    <div class="glass-card" style="padding: 1.5rem;">
                        <div class="card-header" style="padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
                            <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="landmark" style="color: var(--primary); width: 20px; height: 20px;"></i>
                                Retenciones por Enterar (ISLR)
                            </h3>
                        </div>
                        <div style="padding: 0.5rem 0;">
                            <div class="report-line" style="display:flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
                                <span>Retenciones de ISLR Acumuladas</span>
                                <strong style="font-size: 1.2rem; color: var(--secondary);">$${retISLR.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                            </div>
                            <div style="text-align: right; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                                <button class="btn-primary btn-tax-export-txt" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 8px; background: linear-gradient(to right, #3b82f6, #2563eb); border:none; color:white; font-weight:700; cursor:pointer;">
                                    <i data-lucide="download" style="width:18px; height:18px;"></i> Exportar TXT SENIAT
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(59, 130, 246, 0.05)); border: 1px solid var(--border-color);">
                        <h4 style="margin: 0 0 0.5rem; color: var(--primary); font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="info" style="width:18px; height:18px;"></i>
                            Declaración del ISLR (Decreto 1.808)
                        </h4>
                        <p style="margin: 0; font-size: 0.8rem; line-height: 1.5; color: var(--text-muted);">
                            La declaración de retenciones de ISLR ante el portal del SENIAT exige la carga masiva en formato de texto plano (.txt), separando cada registro con punto y coma (;). Recuerde presionar Enter al final de la última línea.
                        </p>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();

        const btnTaxExportTxt = container.querySelector('.btn-tax-export-txt');
        if (btnTaxExportTxt) {
            btnTaxExportTxt.onclick = () => {
                const retData = window.FinancialReports.getRetenciones();
                exportarISLRSENIAT(retData.islr);
            };
        }

        // Lógica de cálculo interactiva de ISLR
        const noDeduciblesInput = document.getElementById('islr-no-deducibles');
        const exentosInput = document.getElementById('islr-exentos');
        const utilidadFiscalLabel = document.getElementById('islr-utilidad-fiscal');
        const determinadoLabel = document.getElementById('islr-determinado');
        const netoLabel = document.getElementById('islr-neto');

        const recalculateISLR = () => {
            const noDeducibles = parseFloat(noDeduciblesInput.value || 0);
            const exentos = parseFloat(exentosInput.value || 0);
            
            const utilidadFiscal = utilidadContable + noDeducibles - exentos;
            const islrDeterminado = Math.max(0, utilidadFiscal * 0.34);
            const islrNeto = Math.max(0, islrDeterminado - retISLR);

            utilidadFiscalLabel.textContent = '$' + utilidadFiscal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            determinadoLabel.textContent = '$' + islrDeterminado.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            netoLabel.textContent = '$' + islrNeto.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

            if (islrNeto === 0) {
                netoLabel.style.color = 'var(--success)';
            } else {
                netoLabel.style.color = 'var(--danger)';
            }
        };

        noDeduciblesInput.oninput = recalculateISLR;
        exentosInput.oninput = recalculateISLR;
    }

    let currentReportView = 'summarized';

    function renderReports(container) {
        container.innerHTML = `
            <div class="reports-container">
                <div class="report-tabs">
                    <button class="tab-btn active" data-tab="income">Resultados</button>
                    <button class="tab-btn" data-tab="balance">Balance</button>
                    <button class="tab-btn" data-tab="diario">Libro Diario</button>
                    <button class="tab-btn" data-tab="mayor">Libro Mayor</button>
                    <button class="tab-btn" data-tab="inventario">Inventario</button>
                    <button class="tab-btn" data-tab="ventas">Ventas</button>
                    <button class="tab-btn" data-tab="compras">Compras</button>
                </div>

                <div class="export-actions" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; flex-wrap: wrap;">
                    <div id="report-presentation-toggle" style="display: flex; align-items: center; gap: 0.75rem;">
                        <i data-lucide="layers" style="color: var(--primary); width: 20px; height: 20px;"></i>
                        <span style="font-weight: 700; font-size: 0.9rem; color: var(--secondary);">Presentación:</span>
                        <div class="btn-group" style="display: inline-flex; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: white; padding: 2px; box-shadow: var(--shadow-sm);">
                            <button class="toggle-view-btn ${currentReportView === 'summarized' ? 'active' : ''}" data-view="summarized" style="border: none; background: ${currentReportView === 'summarized' ? 'var(--primary)' : 'transparent'}; color: ${currentReportView === 'summarized' ? 'white' : 'var(--text-muted)'}; padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s;">Resumido</button>
                            <button class="toggle-view-btn ${currentReportView === 'detailed' ? 'active' : ''}" data-view="detailed" style="border: none; background: ${currentReportView === 'detailed' ? 'var(--primary)' : 'transparent'}; color: ${currentReportView === 'detailed' ? 'white' : 'var(--text-muted)'}; padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s;">Detallado</button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="btn-secondary" id="btn-print-report"><i data-lucide="printer"></i> Imprimir / PDF</button>
                        <button class="btn-secondary" id="btn-excel-report"><i data-lucide="file-spreadsheet"></i> Exportar Excel (CSV)</button>
                    </div>
                </div>

                <div id="report-content" class="report-view">
                </div>
            </div>
        `;

        const tabs = container.querySelectorAll('.tab-btn');
        const toggler = container.querySelector('#report-presentation-toggle');

        const refreshActiveTab = () => {
            const activeTab = container.querySelector('.tab-btn.active').dataset.tab;
            
            // Mostrar u ocultar el conmutador según corresponda
            if (activeTab === 'income' || activeTab === 'balance' || activeTab === 'mayor') {
                toggler.style.display = 'flex';
            } else {
                toggler.style.display = 'none';
            }

            const isDetailed = currentReportView === 'detailed';
            if (activeTab === 'income') renderIncomeStatement(window.FinancialReports.getIncomeStatement(isDetailed));
            else if (activeTab === 'balance') renderBalanceSheet(window.FinancialReports.getBalanceSheet(isDetailed));
            else if (activeTab === 'diario') renderLibroDiario();
            else if (activeTab === 'mayor') renderLibroMayor("", isDetailed);
            else if (activeTab === 'inventario') renderLibroInventario();
            else if (activeTab === 'ventas') renderLibroVentas();
            else if (activeTab === 'compras') renderLibroCompras();
        };

        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                refreshActiveTab();
            };
        });

        // Configurar botones del conmutador de presentación
        const viewButtons = container.querySelectorAll('.toggle-view-btn');
        viewButtons.forEach(btn => {
            btn.onclick = () => {
                currentReportView = btn.dataset.view;
                viewButtons.forEach(b => {
                    const isActive = b.dataset.view === currentReportView;
                    b.style.background = isActive ? 'var(--primary)' : 'transparent';
                    b.style.color = isActive ? 'white' : 'var(--text-muted)';
                });
                refreshActiveTab();
            };
        });

        document.getElementById('btn-print-report').onclick = () => window.print();
        document.getElementById('btn-excel-report').onclick = () => exportToCSV();

        refreshActiveTab();
        applyReportStyles();
        lucide.createIcons();
    }

    function exportToCSV() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        let csvContent = "data:text/csv;charset=utf-8,";
        let fileName = `Reporte_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
        const rows = document.querySelectorAll('#report-content tr, #report-content .report-line');
        
        rows.forEach(row => {
            let cols;
            if (row.tagName === 'TR') {
                cols = row.querySelectorAll('td');
            } else {
                // Obtener sólo los hijos directos para evitar redundancia
                cols = Array.from(row.children);
            }
            if (cols.length > 0) {
                const rowData = cols.map(c => `"${c.innerText.replace(/"/g, '""').trim()}"`).join(",");
                csvContent += rowData + "\r\n";
            }
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function renderFinancialLine(acc) {
        const isDetailed = currentReportView === 'detailed';
        let styleStr = "";
        let prefix = "";
        
        if (isDetailed) {
            let indent = (acc.level - 2) * 1.5; // level 2 -> 0rem, level 3 -> 1.5rem, level 4 -> 3rem
            let fontWeight = acc.level === 2 ? '700' : (acc.level === 3 ? '600' : '400');
            let color = acc.level === 2 ? 'var(--secondary)' : (acc.level === 3 ? 'var(--text-muted)' : 'var(--text-normal)');
            let fontSize = acc.level === 2 ? '0.92rem' : (acc.level === 3 ? '0.86rem' : '0.80rem');
            let padding = acc.level === 2 ? '0.5rem 0' : '0.25rem 0';
            let borderBottom = acc.level === 2 ? '1px solid rgba(0,0,0,0.05)' : 'none';
            
            styleStr = `display:flex; justify-content:space-between; align-items:center; padding: ${padding}; border-bottom: ${borderBottom}; font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color};`;
            prefix = `<span style="padding-left: ${indent}rem; display: flex; align-items: center; gap: 0.5rem;">
                ${acc.level < 4 ? `<strong>${acc.code}</strong>` : `<span style="opacity: 0.6;">${acc.code}</span>`}
                ${acc.name}
            </span>`;
        } else {
            styleStr = "";
            prefix = `<span>${acc.name}</span>`;
        }

        return `
            <div class="report-line" style="${styleStr}">
                ${prefix}
                <span class="amount" style="${(isDetailed && acc.level === 2) ? 'font-weight: 700;' : ''}">$${acc.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
        `;
    }

    function renderIncomeStatement(data) {
        const content = document.getElementById('report-content');
        content.innerHTML = `
            <div class="glass-card report-paper">
                <div class="report-header-text">
                    <h2>${window.companyData.name}</h2>
                    <h3>Estado de Resultados</h3>
                    <p>Al 31 de Mayo de 2026</p>
                    <hr>
                </div>
                <div class="report-body">
                    <div class="report-section">
                        <h4>INGRESOS OPERACIONALES</h4>
                        ${data.revenue.map(r => renderFinancialLine(r)).join('')}
                        <div class="report-line total"><span>TOTAL INGRESOS</span><span class="amount">$${data.totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
                    </div>
                    <div class="report-section">
                        <h4>EGRESOS Y COSTOS</h4>
                        ${data.expenses.map(e => renderFinancialLine(e)).join('')}
                        <div class="report-line total"><span>TOTAL EGRESOS</span><span class="amount">$${data.totalExpenses.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
                    </div>
                    <div class="report-result ${data.netIncome >= 0 ? 'profit' : 'loss'}"><span>UTILIDAD / PÉRDIDA DEL EJERCICIO</span><span class="amount">$${data.netIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
                </div>
            </div>
        `;
    }

    function renderBalanceSheet(data) {
        const content = document.getElementById('report-content');
        content.innerHTML = `
            <div class="glass-card report-paper">
                <div class="report-header-text">
                    <h2>${window.companyData.name}</h2>
                    <h3>Balance General</h3>
                    <p>Al 31 de Mayo de 2026</p>
                    <hr>
                </div>
                <div class="balance-grid">
                    <div class="balance-column">
                        <h4>ACTIVOS</h4>
                        ${data.assets.map(a => renderFinancialLine(a)).join('')}
                        <div class="report-line grand-total"><span>TOTAL ACTIVOS</span><span class="amount">$${data.totalAssets.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
                    </div>
                    <div class="balance-column">
                        <h4>PASIVO</h4>
                        ${data.liabilities.map(l => renderFinancialLine(l)).join('')}
                        <div class="report-line total"><span>TOTAL PASIVOS</span><span class="amount">$${data.totalLiabilities.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
                        <h4 class="mt-2">PATRIMONIO</h4>
                        ${data.equity.map(e => renderFinancialLine(e)).join('')}
                        <div class="report-line"><span>Utilidad del Periodo</span><span class="amount">$${data.netIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
                        <div class="report-line grand-total"><span>TOTAL PASIVO + PATRIMONIO</span><span class="amount">$${(data.totalLiabilities + data.totalEquity).toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
                    </div>
                </div>
                <div class="accounting-check">
                    ${Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01 ? '<span class="text-success"><i data-lucide="check-circle"></i> Balance Cuadrado</span>' : '<span class="text-danger"><i data-lucide="alert-triangle"></i> Diferencia en Balance</span>'}
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    function renderLibroDiario() {
        const content = document.getElementById('report-content');
        let html = `<div class="glass-card report-paper"><div class="report-header-text"><h2>${window.companyData.name}</h2><h3>Libro Diario</h3><p>Periodo: Mayo 2026</p><hr></div><div class="report-body"><table class="report-table"><thead><tr><th>Fecha</th><th>Código</th><th>Cuenta / Descripción</th><th class="text-right">Debe</th><th class="text-right">Haber</th></tr></thead><tbody>`;
        window.journalEntries.forEach(entry => {
            html += `<tr class="entry-header-row"><td colspan="3"><strong>Asiento: ${entry.id} - ${entry.description}</strong></td><td colspan="2" class="text-right"><strong>${entry.date}</strong></td></tr>`;
            entry.items.forEach(item => {
                html += `<tr><td></td><td>${item.accountCode}</td><td style="padding-left: ${item.credit > 0 ? '2rem' : '0'}">${item.accountName}</td><td class="text-right">${item.debit > 0 ? '$'+item.debit.toLocaleString() : ''}</td><td class="text-right">${item.credit > 0 ? '$'+item.credit.toLocaleString() : ''}</td></tr>`;
            });
        });
        html += `</tbody></table></div></div>`;
        content.innerHTML = html;
    }

    function renderLibroMayor(selectedAccountCode = "", detailed = true) {
        const ledger = window.FinancialReports.getGeneralLedger();
        const content = document.getElementById('report-content');
        
        // Obtener cuentas con movimientos ordenadas por código
        const activeAccounts = Object.keys(ledger)
            .filter(code => ledger[code].movements.length > 0)
            .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

        let filterHtml = `
            <div class="no-print ledger-filter-container" style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px); border: 1px solid var(--border-color); padding: 1.25rem 2rem; border-radius: var(--radius-lg); margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; box-shadow: var(--shadow-sm); animation: fadeIn 0.5s ease;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i data-lucide="filter" style="color: var(--primary); width: 22px; height: 22px;"></i>
                    <div>
                        <label for="ledger-filter-select" style="font-weight: 700; font-size: 0.95rem; color: var(--secondary); display: block;">Filtrar Libro Mayor</label>
                        <p style="margin: 0; font-size: 0.75rem; color: var(--text-muted);">Seleccione una cuenta específica para ver su extracto o ver todas juntas</p>
                    </div>
                </div>
                <select id="ledger-filter-select" class="form-control" style="padding: 0.6rem 1.2rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-weight: 600; color: var(--secondary); min-width: 320px; background: white; font-family: inherit; transition: all 0.2s ease;">
                    <option value="">-- Ver Todas las Cuentas --</option>
                    ${activeAccounts.map(code => `<option value="${code}" ${selectedAccountCode === code ? 'selected' : ''}>${code} - ${ledger[code].name}</option>`).join('')}
                </select>
            </div>
        `;

        let html = filterHtml + `<div class="glass-card report-paper"><div class="report-header-text"><h2>${window.companyData.name}</h2><h3>Libro Mayor (${detailed ? 'Detallado' : 'Resumido'})</h3><p>Periodo: Mayo 2026</p><hr></div><div class="report-body">`;

        let accountsToRender = selectedAccountCode ? [selectedAccountCode] : activeAccounts;

        if (accountsToRender.length === 0) {
            html += `<p class="text-center" style="padding: 4rem; color: var(--text-muted); font-size: 1rem;"><i data-lucide="alert-circle" style="width: 48px; height: 48px; display: block; margin: 0 auto 1rem; color: var(--warning);"></i>No se encontraron movimientos para los criterios seleccionados.</p>`;
        } else if (!detailed) {
            // Render de vista resumida del Libro Mayor (Consolidado de saldos)
            let tableBodyHtml = "";
            let grandTotalDebe = 0;
            let grandTotalHaber = 0;

            accountsToRender.forEach(code => {
                const acc = ledger[code];
                if (!acc || acc.movements.length === 0) return;

                let totalDebe = 0;
                let totalHaber = 0;
                acc.movements.forEach(m => {
                    totalDebe += m.debit;
                    totalHaber += m.credit;
                });

                const isDebitNature = code.startsWith('1') || code.startsWith('5') || code.startsWith('6');
                const finalBalance = isDebitNature ? (totalDebe - totalHaber) : (totalHaber - totalDebe);

                grandTotalDebe += totalDebe;
                grandTotalHaber += totalHaber;

                const indent = (code.split('.').length - 1) * 1.25;

                tableBodyHtml += `
                    <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;">
                        <td style="padding: 0.75rem 1rem; font-family: monospace; font-weight: 700; color: var(--secondary);">${code}</td>
                        <td style="padding: 0.75rem 1rem; padding-left: ${indent + 1}rem; font-weight: ${code.split('.').length <= 2 ? '700' : '400'}; color: var(--text-main);">${acc.name}</td>
                        <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 600; color: var(--text-main);">$${totalDebe.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 600; color: var(--text-main);">$${totalHaber.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 700; color: ${finalBalance >= 0 ? 'var(--success)' : 'var(--danger)'};">$${finalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                `;
            });

            html += `
                <div class="mayor-resumido-section" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm);">
                    <table class="report-table" style="width: 100%; border-collapse: collapse; margin-top: 0; font-size: 0.85rem;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid var(--border-color);">
                                <th style="padding: 1rem; font-weight: 700; text-align: left; color: var(--secondary);">Código</th>
                                <th style="padding: 1rem; font-weight: 700; text-align: left; color: var(--secondary);">Cuenta Contable</th>
                                <th style="padding: 1rem; font-weight: 700; text-align: right; color: var(--secondary);">Total Debe</th>
                                <th style="padding: 1rem; font-weight: 700; text-align: right; color: var(--secondary);">Total Haber</th>
                                <th style="padding: 1rem; font-weight: 700; text-align: right; color: var(--secondary);">Saldo Acumulado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableBodyHtml}
                            <tr style="background: #f8fafc; border-top: 2px solid var(--border-color); font-weight: 800; font-size: 0.9rem;">
                                <td colspan="2" style="padding: 1rem; text-align: right; color: var(--secondary);">TOTALES CONSOLIDADOS:</td>
                                <td style="padding: 1rem; text-align: right; color: var(--primary);">$${grandTotalDebe.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td style="padding: 1rem; text-align: right; color: var(--primary);">$${grandTotalHaber.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td style="padding: 1rem; text-align: right; color: var(--secondary);">$${(grandTotalDebe - grandTotalHaber).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            accountsToRender.forEach(code => {
                const acc = ledger[code];
                if (!acc || acc.movements.length === 0) return;

                html += `
                    <div class="mayor-account-section" style="margin-bottom: 2.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); page-break-inside: avoid;">
                        <div class="mayor-header" style="background: linear-gradient(135deg, var(--sidebar-bg), #1e293b); color: white; padding: 1rem 1.5rem; font-size: 0.95rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div>
                                <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--primary-light); font-weight: 700; display: block; margin-bottom: 0.2rem;">Cuenta Contable</span>
                                <strong style="font-size: 1.05rem;">${code} - ${acc.name}</strong>
                            </div>
                            <span style="font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-weight: 600; border: 1px solid rgba(255,255,255,0.15);">Nivel ${code.split('.').length}</span>
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="report-table mini" style="width: 100%; border-collapse: collapse; margin-top: 0; font-size: 0.85rem;">
                                <thead>
                                    <tr style="background: #f8fafc; border-bottom: 2px solid var(--border-color);">
                                        <th style="padding: 0.75rem 1.25rem; font-weight: 700; text-align: left; color: var(--text-muted);">Fecha</th>
                                        <th style="padding: 0.75rem 1.25rem; font-weight: 700; text-align: left; color: var(--text-muted);">Ref</th>
                                        <th style="padding: 0.75rem 1.25rem; font-weight: 700; text-align: left; color: var(--text-muted);">Concepto</th>
                                        <th style="padding: 0.75rem 1.25rem; font-weight: 700; text-align: right; color: var(--text-muted);">Debe</th>
                                        <th style="padding: 0.75rem 1.25rem; font-weight: 700; text-align: right; color: var(--text-muted);">Haber</th>
                                        <th style="padding: 0.75rem 1.25rem; font-weight: 700; text-align: right; color: var(--text-muted);">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>`;

                let runningBalance = 0;
                const isDebitNature = code.startsWith('1') || code.startsWith('5') || code.startsWith('6');

                acc.movements.forEach(m => {
                    if (isDebitNature) {
                        runningBalance += (m.debit - m.credit);
                    } else {
                        runningBalance += (m.credit - m.debit);
                    }

                    const debeStr = m.debit > 0 ? '$' + m.debit.toLocaleString() : '-';
                    const haberStr = m.credit > 0 ? '$' + m.credit.toLocaleString() : '-';
                    const saldoStr = '$' + runningBalance.toLocaleString();

                    html += `
                        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;">
                            <td style="padding: 0.75rem 1.25rem; white-space: nowrap;">${m.date}</td>
                            <td style="padding: 0.75rem 1.25rem;"><span class="text-mono" style="font-family: monospace; font-weight: 600; color: var(--text-muted);">${m.ref}</span></td>
                            <td style="padding: 0.75rem 1.25rem;">${m.desc}</td>
                            <td style="padding: 0.75rem 1.25rem; text-align: right; font-weight: 600; color: ${m.debit > 0 ? 'var(--text-main)' : 'var(--text-muted)'};">${debeStr}</td>
                            <td style="padding: 0.75rem 1.25rem; text-align: right; font-weight: 600; color: ${m.credit > 0 ? 'var(--text-main)' : 'var(--text-muted)'};">${haberStr}</td>
                            <td style="padding: 0.75rem 1.25rem; text-align: right; font-weight: 700; color: var(--secondary);">${saldoStr}</td>
                        </tr>
                    `;
                });

                html += `</tbody></table></div></div>`;
            });
        }

        html += `</div></div>`;
        content.innerHTML = html;

        // Registrar el selector de filtro
        const filterSelect = document.getElementById('ledger-filter-select');
        if (filterSelect) {
            filterSelect.onchange = () => {
                renderLibroMayor(filterSelect.value, currentReportView === 'detailed');
            };
            
            filterSelect.onfocus = () => {
                filterSelect.style.borderColor = 'var(--primary)';
                filterSelect.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            };
            filterSelect.onblur = () => {
                filterSelect.style.borderColor = 'var(--border-color)';
                filterSelect.style.boxShadow = 'none';
            };
        }
        
        lucide.createIcons();
    }

    function renderLibroVentas() {
        const sales = window.FinancialReports.getSalesBook();
        const content = document.getElementById('report-content');
        
        let totalGeneral = 0;
        let totalBase = 0;
        let totalIva = 0;
        let totalExempt = 0;
        let totalRet = 0;

        const rowsHtml = sales.map(e => {
            // Buscar item con datos fiscales reales guardados por generateFiscalEntry
            const taxItem = e.items.find(i => i.base !== undefined || i.rif || i.invoice);
            
            // Leer datos REALES del asiento — NO recalcular desde el total
            const base   = taxItem?.base   ?? 0;
            const iva    = taxItem?.iva    ?? 0;
            const exempt = taxItem?.exempt ?? 0;
            const total  = base + iva + exempt;
            
            // Buscar retención (ej. IVA Retenido por el cliente: Activo o menor pago, típicamente débito en cuenta de Retención)
            const retItems = e.items.filter(i => (i.accountName.toLowerCase().includes('retencion') || i.accountName.toLowerCase().includes('retenido')) && i.debit > 0);
            const ret = retItems.reduce((acc, i) => acc + i.debit, 0);

            totalGeneral += total;
            totalBase    += base;
            totalIva     += iva;
            totalExempt  += exempt;
            totalRet     += ret;

            const alicuota = base > 0 ? '16%' : (exempt > 0 ? 'Exenta' : '-');

            return `<tr>
                <td>${e.date}</td>
                <td>${taxItem?.rif || '-'}</td>
                <td>${taxItem?.supplier || 'Venta a Contado'}</td>
                <td>${taxItem?.invoice || e.id}</td>
                <td>${taxItem?.control || '-'}</td>
                <td class="text-right">$${total.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                <td class="text-right">${exempt > 0 ? '$'+exempt.toLocaleString(undefined,{minimumFractionDigits:2}) : '-'}</td>
                <td class="text-right">${base > 0 ? '$'+base.toLocaleString(undefined,{minimumFractionDigits:2}) : '-'}</td>
                <td class="text-center">${alicuota}</td>
                <td class="text-right">${iva > 0 ? '$'+iva.toLocaleString(undefined,{minimumFractionDigits:2}) : '-'}</td>
                <td class="text-right">${ret > 0 ? '$'+ret.toLocaleString(undefined,{minimumFractionDigits:2}) : '-'}</td>
            </tr>`;
        }).join('');

        content.innerHTML = `
            <div class="glass-card report-paper wider">
                <div class="report-header-text">
                    <h2>${window.companyData.name}</h2>
                    <p>RIF: ${window.companyData.rif}</p>
                    <h3>LIBRO DE VENTAS</h3>
                    <p>Mes: Mayo 2026</p>
                    <hr>
                </div>
                <div class="table-scroll">
                    <table class="report-table seniat">
                        <thead>
                            <tr>
                                <th rowspan="2">Fecha</th>
                                <th rowspan="2">RIF Cliente</th>
                                <th rowspan="2">Nombre o Razón Social</th>
                                <th rowspan="2">Nro. Factura</th>
                                <th rowspan="2">Nro. Control</th>
                                <th rowspan="2">Total Ventas (Inc. IVA)</th>
                                <th rowspan="2">Ventas Exentas</th>
                                <th colspan="3">Operaciones Gravadas</th>
                                <th rowspan="2">IVA Retenido</th>
                            </tr>
                            <tr>
                                <th>Base Imponible</th>
                                <th>% Alícuota</th>
                                <th>Impuesto IVA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                        <tfoot>
                            <tr class="row-totals">
                                <td colspan="5" class="text-right"><strong>TOTALES GENERALES:</strong></td>
                                <td class="text-right"><strong>$${totalGeneral.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></td>
                                <td class="text-right"><strong>$${totalExempt.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></td>
                                <td class="text-right"><strong>$${totalBase.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></td>
                                <td></td>
                                <td class="text-right"><strong>$${totalIva.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></td>
                                <td class="text-right"><strong>$${totalRet.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="fiscal-summary-box mt-2">
                    <h4>RESUMEN DE VENTAS Y DÉBITOS FISCALES</h4>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>Total Ventas Internas Gravadas:</span>
                            <strong>$${totalBase.toLocaleString(undefined,{minimumFractionDigits:2})}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Total Débito Fiscal IVA (16%):</span>
                            <strong>$${totalIva.toLocaleString(undefined,{minimumFractionDigits:2})}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Total Ventas Exentas:</span>
                            <strong>$${totalExempt.toLocaleString(undefined,{minimumFractionDigits:2})}</strong>
                        </div>
                        <div class="summary-item highlight">
                            <span>TOTAL VENTAS DEL PERIODO:</span>
                            <strong>$${totalGeneral.toLocaleString(undefined,{minimumFractionDigits:2})}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
        applyFiscalStyles();
    }


    function renderLibroCompras() {
        const purchases = window.FinancialReports.getPurchaseBook();
        const content = document.getElementById('report-content');

        let totalGeneral = 0;
        let totalBase = 0;
        let totalIva = 0;
        let totalExempt = 0;
        let totalRet = 0;

        const rowsHtml = purchases.map(e => {
            const taxItem = e.items.find(i => i.rif || i.invoice); 
            const base = taxItem?.base || 0;
            const iva = taxItem?.iva || 0;
            const exempt = taxItem?.exempt || 0;
            const total = base + iva + exempt;
            
            const retItems = e.items.filter(i => (i.accountName.toLowerCase().includes('retencion') || i.accountName.toLowerCase().includes('retenido')) && i.credit > 0);
            const ret = retItems.reduce((acc, i) => acc + i.credit, 0);

            totalGeneral += total;
            totalBase += base;
            totalIva += iva;
            totalExempt += exempt;
            totalRet += ret;

            return `<tr><td>${e.date}</td><td>${taxItem?.rif || '-'}</td><td>${taxItem?.supplier || '-'}</td><td>${taxItem?.invoice || e.id}</td><td>${taxItem?.control || '-'}</td><td class="text-right">$${total.toLocaleString(undefined, {minimumFractionDigits:2})}</td><td class="text-right">${exempt > 0 ? '$'+exempt.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td><td class="text-right">${base > 0 ? '$'+base.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td><td class="text-center">${base > 0 ? '16%' : '-'}</td><td class="text-right">${iva > 0 ? '$'+iva.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td><td class="text-right">${ret > 0 ? '$'+ret.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td></tr>`;
        }).join('');

        content.innerHTML = `
            <div class="glass-card report-paper wider">
                <div class="report-header-text">
                    <h2>${window.companyData.name}</h2>
                    <p>RIF: ${window.companyData.rif}</p>
                    <h3>LIBRO DE COMPRAS</h3>
                    <p>Mes: Mayo 2026</p>
                    <hr>
                </div>
                <div class="table-scroll">
                    <table class="report-table seniat">
                        <thead>
                            <tr>
                                <th rowspan="2">Fecha</th>
                                <th rowspan="2">RIF Proveedor</th>
                                <th rowspan="2">Nombre o Razón Social</th>
                                <th rowspan="2">Nro. Factura</th>
                                <th rowspan="2">Nro. Control</th>
                                <th rowspan="2">Total Compras (Inc. IVA)</th>
                                <th rowspan="2">Compras Exentas</th>
                                <th colspan="3">Compras Internas Gravadas</th>
                                <th rowspan="2">IVA Retenido</th>
                            </tr>
                            <tr>
                                <th>Base Imponible</th>
                                <th>% Alícuota</th>
                                <th>Impuesto IVA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                        <tfoot>
                            <tr class="row-totals">
                                <td colspan="5" class="text-right"><strong>TOTALES GENERALES:</strong></td>
                                <td class="text-right"><strong>$${totalGeneral.toLocaleString(undefined, {minimumFractionDigits:2})}</strong></td>
                                <td class="text-right"><strong>$${totalExempt.toLocaleString(undefined, {minimumFractionDigits:2})}</strong></td>
                                <td class="text-right"><strong>$${totalBase.toLocaleString(undefined, {minimumFractionDigits:2})}</strong></td>
                                <td></td>
                                <td class="text-right"><strong>$${totalIva.toLocaleString(undefined, {minimumFractionDigits:2})}</strong></td>
                                <td class="text-right"><strong>$${totalRet.toLocaleString(undefined, {minimumFractionDigits:2})}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="fiscal-summary-box mt-2">
                    <h4>RESUMEN DE COMPRAS Y CRÉDITOS FISCALES</h4>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>Total Compras Internas Gravadas:</span>
                            <strong>$${totalBase.toLocaleString(undefined, {minimumFractionDigits:2})}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Total Compras Exentas:</span>
                            <strong>$${totalExempt.toLocaleString(undefined, {minimumFractionDigits:2})}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Total Crédito Fiscal IVA (16%):</span>
                            <strong>$${totalIva.toLocaleString(undefined, {minimumFractionDigits:2})}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Total IVA Retenido por el Agente:</span>
                            <strong>$${totalRet.toLocaleString(undefined, {minimumFractionDigits:2})}</strong>
                        </div>
                        <div class="summary-item highlight">
                            <span>TOTAL COMPRAS DEL PERIODO:</span>
                            <strong>$${totalGeneral.toLocaleString(undefined, {minimumFractionDigits:2})}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
        applyFiscalStyles();
    }

    function applyFiscalStyles() {
        const style = document.createElement('style');
        style.id = 'fiscal-report-styles';
        style.textContent = `
            .row-totals { background: #f8fafc; border-top: 2px solid #1e293b; }
            .row-totals td { padding: 0.75rem !important; color: #1e293b; }
            .fiscal-summary-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.5rem; background: #fff; page-break-inside: avoid; }
            .fiscal-summary-box h4 { margin: 0 0 1rem 0; font-size: 0.9rem; color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; }
            .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .summary-item { display: flex; justify-content: space-between; font-size: 0.85rem; border-bottom: 1px dashed #e2e8f0; padding-bottom: 0.5rem; }
            .summary-item.highlight { background: #f8fafc; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--primary); grid-column: span 2; font-size: 1rem; color: var(--primary); }
            @media print {
                .fiscal-summary-box { margin-top: 2rem; border-color: #1e293b; }
            }
        `;
        if(!document.getElementById('fiscal-report-styles')) document.head.appendChild(style);
    }

    function renderLibroInventario() {
        const balances = window.FinancialReports.calculateBalances();
        const content = document.getElementById('report-content');
        let html = `<div class="glass-card report-paper"><div class="report-header-text"><h2>${window.companyData.name}</h2><h3>Libro de Inventario y Balances</h3><p>Al 31 de Mayo de 2026</p><hr></div><table class="report-table"><thead><tr><th>Código</th><th>Cuenta / Activo</th><th class="text-right">Cantidad Estimada</th><th class="text-right">Valor Unitario</th><th class="text-right">Total Valorizado</th></tr></thead><tbody>`;
        Object.keys(balances).forEach(code => {
            const acc = balances[code];
            if (code.startsWith('1.1.03') || code.startsWith('1.2.01')) {
                html += `<tr class="${acc.level === 3 ? 'font-weight-700' : ''}"><td>${code}</td><td style="padding-left: ${(acc.level-3)*1.5}rem">${acc.name}</td><td class="text-right">-</td><td class="text-right">-</td><td class="text-right">$${acc.balance.toLocaleString()}</td></tr>`;
            }
        });
        html += `</tbody></table></div>`;
        content.innerHTML = html;
    }

    function applyReportStyles() {
        const style = document.createElement('style');
        style.id = 'report-styles';
        style.textContent = `
            .reports-container { position: relative; }
            .export-actions { display: flex; gap: 1rem; margin-bottom: 1.5rem; justify-content: flex-end; }
            .export-actions .btn-secondary { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: white; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
            .export-actions .btn-secondary:hover { background: #f8fafc; border-color: var(--primary); color: var(--primary); }
            .report-tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; flex-wrap: wrap; }
            .tab-btn { background: none; border: none; padding: 0.5rem 1rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; color: var(--text-muted); transition: all 0.2s; font-size: 0.85rem; }
            .tab-btn.active { background: var(--primary); color: white; box-shadow: var(--shadow-md); }
            .report-paper { max-width: 1000px; margin: 0 auto; padding: 2.5rem; background: white; color: #1e293b; box-shadow: 0 0 40px rgba(0,0,0,0.05); }
            .report-header-text { text-align: center; margin-bottom: 2rem; }
            .report-header-text h2 { color: var(--primary); margin-bottom: 0.25rem; font-size: 1.5rem; }
            .report-header-text h3 { text-transform: uppercase; letter-spacing: 2px; font-size: 1.1rem; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem; }
            .report-table th { background: #f8fafc; padding: 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 700; color: #475569; }
            .report-table td { padding: 0.75rem; border-bottom: 1px solid #f1f5f9; }
            .entry-header-row { background: #f1f5f9; }
            .mayor-account-section { margin-bottom: 3rem; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            .mayor-header { background: var(--primary); color: white; padding: 0.75rem 1rem; font-size: 0.95rem; }
            .report-table.mini td { padding: 0.5rem 1rem; font-size: 0.85rem; }
            .report-section { margin-bottom: 2rem; }
            .report-section h4, .balance-column h4 { border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; color: var(--primary); }
            .report-line { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.95rem; border-bottom: 1px solid #f1f5f9; }
            .report-line.total { border-top: 2px solid #1e293b; border-bottom: none; font-weight: 700; margin-top: 0.5rem; padding-top: 0.75rem; }
            .report-line.grand-total { border-top: 2px solid #1e293b; border-bottom: 4px double #1e293b; font-weight: 800; margin-top: 1rem; padding-top: 1rem; font-size: 1rem; }
            .report-result { margin-top: 3rem; padding: 1.5rem; border-radius: 8px; display: flex; justify-content: space-between; font-weight: 800; font-size: 1.2rem; }
            .report-result.profit { background: rgba(16, 185, 129, 0.1); color: var(--success); }
            .report-result.loss { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
            .balance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; }
            .mt-2 { margin-top: 2rem; }
            .accounting-check { margin-top: 3rem; text-align: center; font-weight: 600; font-size: 0.85rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); }
            .accounting-check span { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
            .report-paper.wider { max-width: 1200px; }
            .table-scroll { overflow-x: auto; width: 100%; }
            .report-table.seniat { font-size: 0.75rem; min-width: 1000px; }
            .report-table.seniat th { font-size: 0.7rem; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; }
            .report-table.seniat td { border: 1px solid #f1f5f9; padding: 0.4rem; }
            .text-center { text-align: center; }
        `;
        if(!document.getElementById('report-styles')) document.head.appendChild(style);
    }

    function renderQueries(container) {
        const today = new Date().toISOString().split('T')[0];
        const firstDay = today.substring(0, 8) + '01';
        
        container.innerHTML = `
            <div class="queries-view">
                <div class="glass-card query-filters-card" style="margin-bottom: 1rem;">
                    <div class="card-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color);">
                        <h3 style="font-size: 1rem; margin: 0;">Filtros de Búsqueda</h3>
                    </div>
                    <form id="form-queries" class="query-form" style="padding: 1.5rem;">
                        <div class="query-grid">
                            <div class="form-group">
                                <label>Desde</label>
                                <input type="date" id="filter-date-from" value="${firstDay}">
                            </div>
                            <div class="form-group">
                                <label>Hasta</label>
                                <input type="date" id="filter-date-to" value="${today}">
                            </div>
                            <div class="form-group">
                                <label>Cuenta Contable</label>
                                <select id="filter-account">
                                    <option value="">Todas las cuentas</option>
                                    ${(window.chartOfAccounts || []).map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Descripción / Concepto</label>
                                <input type="text" id="filter-desc" placeholder="Buscar texto...">
                            </div>
                        </div>
                        <div class="query-actions" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); display: flex; justify-content: flex-end; gap: 1rem;">
                            <button type="reset" class="btn-secondary">Limpiar</button>
                            <button type="submit" class="btn-primary">Ejecutar Consulta</button>
                        </div>
                    </form>
                </div>

                <div class="glass-card">
                    <div class="card-header" style="padding: 1rem 1.5rem;">
                        <h3 style="font-size: 1rem; margin: 0;">Resultados de la Consulta</h3>
                    </div>
                    <div class="table-container" style="padding: 0 1.5rem 1.5rem 1.5rem;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>ID</th>
                                    <th>Cuenta</th>
                                    <th>Descripción</th>
                                    <th class="text-right">Debe</th>
                                    <th class="text-right">Haber</th>
                                    <th class="text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="query-results">
                                <tr><td colspan="7" class="text-center" style="padding: 3rem;">Use los filtros para buscar movimientos</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        const form = document.getElementById('form-queries');
        form.onsubmit = (e) => { e.preventDefault(); performQuery(); };
        applyQueryStyles();
        lucide.createIcons();
    }

    function performQuery() {
        const from = document.getElementById('filter-date-from').value;
        const to = document.getElementById('filter-date-to').value;
        const account = document.getElementById('filter-account').value;
        const desc = document.getElementById('filter-desc').value.toLowerCase();
        const resultsBody = document.getElementById('query-results');
        resultsBody.innerHTML = '';
        let resultsFound = 0;

        window.journalEntries.forEach(entry => {
            if (from && entry.date < from) return;
            if (to && entry.date > to) return;
            if (desc && !entry.description.toLowerCase().includes(desc)) return;
            
            entry.items.forEach(item => {
                if (account && item.accountCode !== account) return;
                resultsFound++;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.date}</td>
                    <td><span class="text-mono">${entry.id}</span></td>
                    <td><small>${item.accountCode}</small><br>${item.accountName}</td>
                    <td>${entry.description}</td>
                    <td class="text-right">${item.debit > 0 ? '$'+item.debit.toLocaleString() : '-'}</td>
                    <td class="text-right">${item.credit > 0 ? '$'+item.credit.toLocaleString() : '-'}</td>
                    <td class="text-center">
                        <button class="btn-icon text-primary btn-edit-entry" data-id="${entry.id}" title="Editar Asiento Completo">
                            <i data-lucide="edit-3"></i>
                        </button>
                    </td>
                `;
                resultsBody.appendChild(row);
            });
        });

        document.querySelectorAll('.btn-edit-entry').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const entry = window.journalEntries.find(e => e.id === id);
                if (entry) {
                    window.currentEditEntry = entry;
                    document.querySelector('[data-module="accounting"]').click();
                }
            };
        });

        if (resultsFound === 0) resultsBody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron movimientos con estos filtros</td></tr>';
        lucide.createIcons();
    }

    function applyQueryStyles() {
        const style = document.createElement('style');
        style.id = 'query-styles';
        style.textContent = `
            .query-filters { margin-bottom: 1rem !important; }
            .query-form { padding: 1.5rem; } 
            .query-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; } 
            .query-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; } 
            .text-center { text-align: center; padding: 2rem !important; color: var(--text-muted); }
        `;
        if(!document.getElementById('query-styles')) document.head.appendChild(style);
    }

    function renderRetenciones(container) {
        const data = window.FinancialReports.getRetenciones();
        
        if (!window.activeRetentionTab) {
            window.activeRetentionTab = 'iva';
        }

        const renderTabContent = () => {
            const isIva = window.activeRetentionTab === 'iva';
            const records = isIva ? data.iva : data.islr;
            
            let tableHTML = "";
            if (isIva) {
                tableHTML = `
                    <div class="header-actions no-print" style="display:flex; justify-content:flex-end; gap:0.75rem; margin-bottom:1rem; padding: 0 1.5rem;">
                        <button class="btn-secondary btn-export-xml" style="background:linear-gradient(to right, #10b981, #059669); color:white; border:none; padding:0.6rem 1.2rem; border-radius:8px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:0.5rem;">
                            <i data-lucide="download" style="width:16px; height:16px;"></i> Exportar XML SENIAT
                        </button>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Fecha Emisión</th>
                                <th>Nro. Comprobante (14 Dígitos)</th>
                                <th>RIF Proveedor</th>
                                <th>Razón Social</th>
                                <th class="text-right">Base Imponible</th>
                                <th class="text-right">IVA Causado</th>
                                <th class="text-right">IVA Retenido</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${records.map(r => {
                                const dateObj = new Date(r.date || '2026-05-17');
                                const year = dateObj.getFullYear() || 2026;
                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                const seq = String(r.entryId || '1').split('-')[0].slice(-8).padStart(8, '0');
                                const compNum = `${year}${month}${seq}`;
                                const rData = encodeURIComponent(JSON.stringify(r));
                                return `
                                    <tr>
                                        <td>${r.date}</td>
                                        <td><span class="text-mono" style="font-weight:700; color: var(--primary);">${compNum}</span></td>
                                        <td>${r.rif}</td>
                                        <td>${r.name}</td>
                                        <td class="text-right">$${(r.base || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td class="text-right">$${(r.iva || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td class="text-right"><strong class="text-primary">$${(r.retained || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                                        <td>
                                            <button class="btn-icon btn-view-ret-iva" data-ret="${rData}" style="display:inline-flex; align-items:center; gap:0.25rem;">
                                                <i data-lucide="eye" style="width:14px; height:14px;"></i> Ver Comprobante
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                            ${records.length === 0 ? '<tr><td colspan="8" class="text-center">No hay retenciones de IVA registradas este mes</td></tr>' : ''}
                        </tbody>
                    </table>
                `;
            } else {
                tableHTML = `
                    <div class="header-actions no-print" style="display:flex; justify-content:flex-end; gap:0.75rem; margin-bottom:1rem; padding: 0 1.5rem;">
                        <button class="btn-secondary btn-export-txt" style="background:linear-gradient(to right, #3b82f6, #2563eb); color:white; border:none; padding:0.6rem 1.2rem; border-radius:8px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:0.5rem;">
                            <i data-lucide="download" style="width:16px; height:16px;"></i> Exportar TXT SENIAT
                        </button>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Fecha Pago</th>
                                <th>Nro. Comprobante Secuencial</th>
                                <th>RIF Proveedor</th>
                                <th>Razón Social</th>
                                <th>Concepto Legal (Decreto 1.808)</th>
                                <th class="text-right">Base Imponible</th>
                                <th class="text-right">% Alic.</th>
                                <th class="text-right">ISLR Retenido</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${records.map(r => {
                                const seq = String(r.entryId || '1').split('-')[0].slice(-4).padStart(4, '0');
                                const compNum = `ISLR-2026-${seq}`;
                                const rData = encodeURIComponent(JSON.stringify(r));
                                return `
                                    <tr>
                                        <td>${r.date}</td>
                                        <td><span class="text-mono" style="font-weight:700; color: var(--secondary);">${compNum}</span></td>
                                        <td>${r.rif}</td>
                                        <td>${r.name}</td>
                                        <td><span class="badge success" style="font-size:0.75rem;">${r.concept || 'Servicios'}</span></td>
                                        <td class="text-right">$${(r.base || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td class="text-right">${r.rate || 2}%</td>
                                        <td class="text-right"><strong class="text-danger">$${(r.retained || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                                        <td>
                                            <button class="btn-icon btn-view-ret-islr" data-ret="${rData}" style="display:inline-flex; align-items:center; gap:0.25rem;">
                                                <i data-lucide="eye" style="width:14px; height:14px;"></i> Ver Comprobante
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                            ${records.length === 0 ? '<tr><td colspan="9" class="text-center">No hay retenciones de ISLR registradas este mes</td></tr>' : ''}
                        </tbody>
                    </table>
                `;
            }

            container.querySelector('.table-container').innerHTML = tableHTML;

            // Vincular eventos de exportación
            if (isIva) {
                const btnExport = container.querySelector('.btn-export-xml');
                if (btnExport) {
                    btnExport.onclick = () => exportarIVASENIAT(records);
                }
            } else {
                const btnExport = container.querySelector('.btn-export-txt');
                if (btnExport) {
                    btnExport.onclick = () => exportarISLRSENIAT(records);
                }
            }

            // Vincular eventos de clic usando los datos serializados en el botón
            container.querySelectorAll('.btn-view-ret-iva').forEach(btn => {
                btn.onclick = () => {
                    try {
                        const ret = JSON.parse(decodeURIComponent(btn.dataset.ret));
                        showRetencionModal(ret, 'iva');
                    } catch (err) {
                        console.error('Error al abrir comprobante de IVA:', err);
                        alert('Error al abrir comprobante de IVA: ' + err.message);
                    }
                };
            });

            container.querySelectorAll('.btn-view-ret-islr').forEach(btn => {
                btn.onclick = () => {
                    try {
                        const ret = JSON.parse(decodeURIComponent(btn.dataset.ret));
                        showRetencionModal(ret, 'islr');
                    } catch (err) {
                        console.error('Error al abrir comprobante de ISLR:', err);
                        alert('Error al abrir comprobante de ISLR: ' + err.message);
                    }
                };
            });

            lucide.createIcons();
        };

        container.innerHTML = `
            <div class="glass-card mb-2">
                <div class="card-header main-header" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); display:flex; justify-content:space-between; align-items:center; padding: 1.5rem 2rem;">
                    <div class="header-info" style="display:flex; align-items:center; gap:1rem; color:white;">
                        <i data-lucide="file-check" style="width: 32px; height: 32px; stroke-width: 2.5px; color:white;"></i>
                        <div>
                            <h3 style="margin:0; font-size:1.3rem; color:white;">Gestión y Emisión de Retenciones</h3>
                            <p style="margin:0; font-size:0.8rem; opacity:0.85; color:rgba(255,255,255,0.9);">Comprobantes oficiales exigidos por el SENIAT para IVA e ISLR</p>
                        </div>
                    </div>
                    <button class="btn-secondary no-print" onclick="window.print()" style="display:inline-flex; align-items:center; gap:0.5rem; background: rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); color:white; font-size:0.85rem; padding: 0.5rem 1rem; border-radius: 8px; cursor:pointer; transition: all 0.2s ease;">
                        <i data-lucide="printer" style="width:16px; height:16px;"></i> Imprimir Resumen PDF
                    </button>
                </div>
                
                <div class="report-tabs" style="display:flex; gap:0.5rem; padding: 1rem 1rem 0; border-bottom: 1px solid var(--border-color);">
                    <button class="tab-btn ${window.activeRetentionTab === 'iva' ? 'active' : ''}" data-ret-tab="iva" style="padding: 0.75rem 1.5rem; font-weight: 700; border-radius: 8px 8px 0 0; border: none; cursor:pointer;">
                        Retenciones de IVA (Providencia 0054)
                    </button>
                    <button class="tab-btn ${window.activeRetentionTab === 'islr' ? 'active' : ''}" data-ret-tab="islr" style="padding: 0.75rem 1.5rem; font-weight: 700; border-radius: 8px 8px 0 0; border: none; cursor:pointer;">
                        Retenciones de ISLR (Decreto 1.808)
                    </button>
                </div>

                <div class="table-container" style="padding: 1rem; overflow-x: auto;">
                    <!-- Se inyecta dinámicamente -->
                </div>
            </div>

            <div id="modal-retencion" class="modal">
                <div class="modal-content glass-card large" style="max-width: 1000px;">
                    <div class="modal-header no-print" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding: 1rem 1.5rem;">
                        <h3 id="modal-retencion-title" style="margin:0;">Comprobante de Retención</h3>
                        <div class="header-actions" style="display:flex; gap:0.5rem;">
                            <button class="btn-primary" onclick="window.print()" style="display:inline-flex; align-items:center; gap:0.5rem;">
                                <i data-lucide="printer" style="width:16px; height:16px;"></i> Imprimir / PDF
                            </button>
                            <button class="btn-close" style="background:none; border:none; font-size:1.8rem; cursor:pointer; line-height:1;">&times;</button>
                        </div>
                    </div>
                    <div id="retencion-print-area" class="retencion-paper"></div>
                </div>
            </div>
        `;

        container.querySelectorAll('[data-ret-tab]').forEach(tab => {
            tab.onclick = () => {
                container.querySelectorAll('[data-ret-tab]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                window.activeRetentionTab = tab.dataset.retTab;
                
                // Cerrar modal y limpiar clases de impresión al cambiar de pestaña
                const modal = document.getElementById('modal-retencion');
                if (modal) modal.classList.remove('show');
                document.body.classList.remove('retencion-modal-open');
                
                renderTabContent();
            };
        });

        container.querySelector('.btn-close').onclick = () => {
            document.getElementById('modal-retencion').classList.remove('show');
            document.body.classList.remove('retencion-modal-open');
        };

        renderTabContent();
    }

    function showRetencionModal(ret, type) {
        try {
            const area = document.getElementById('retencion-print-area');
            const modalTitle = document.getElementById('modal-retencion-title');
            const coData = window.companyData || { name: "Empresa Local", rif: "J-00000000-0", address: "Caracas, Venezuela" };

            if (!ret) {
                alert('No se encontraron datos para esta retención.');
                return;
            }

            if (type === 'iva') {
                modalTitle.textContent = "Comprobante de Retención de IVA";
                
                const dateObj = new Date(ret.date || '2026-05-17');
                const year = dateObj.getFullYear() || 2026;
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const seq = String(ret.entryId || '1').split('-')[0].slice(-8).padStart(8, '0');
                const compNum = `${year}${month}${seq}`;
                const ivaVal = ret.iva || 0;
                const retainedVal = ret.retained || 0;
                const baseVal = ret.base || 0;
                const percentRet = ivaVal > 0 ? ((retainedVal / ivaVal) * 100).toFixed(0) : "75";

                area.innerHTML = `
                    <div class="retencion-print-layout">
                        <div class="ret-header">
                            <div class="ret-company">
                                <h2>${coData.name}</h2>
                                <p><strong>RIF:</strong> ${coData.rif}</p>
                                <p><strong>Dirección Fiscal:</strong> ${coData.address || 'Caracas, Venezuela'}</p>
                            </div>
                            <div class="ret-title" style="text-align: right;">
                                <h3 style="margin:0; font-size:1.1rem; color: var(--primary);">COMPROBANTE DE RETENCIÓN DEL IMPUESTO AL VALOR AGREGADO</h3>
                                <p style="font-size:0.75rem; color:var(--text-muted); margin:0.25rem 0 0;">Providencia Administrativa SENIAT Nº SNAT/2015/0049 (Ley del IVA Art. 11)</p>
                            </div>
                        </div>

                        <div class="ret-info-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0;">
                            <div class="info-box">
                                <strong>NRO. COMPROBANTE (14 DÍGITOS):</strong>
                                <span class="text-mono" style="font-size:1.1rem; font-weight:700; color:var(--primary);">${compNum}</span>
                            </div>
                            <div class="info-box" style="text-align: right;">
                                <strong>FECHA DE EMISIÓN:</strong>
                                <span style="font-size:1.1rem; font-weight:700;">${ret.date || '2026-05-17'}</span>
                            </div>
                        </div>

                        <div class="ret-subject-card" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.01);">
                            <h4 style="margin:0 0 0.5rem; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; color:var(--secondary);">Datos del Agente de Retención (Comprador)</h4>
                            <div style="display:grid; grid-template-columns: 3fr 1fr; font-size:0.85rem; margin-bottom:1rem;">
                                <span><strong>Razón Social:</strong> ${coData.name}</span>
                                <span><strong>RIF:</strong> ${coData.rif}</span>
                            </div>
                            <hr style="border:0; border-top:1px solid var(--border-color); margin: 0.75rem 0;">
                            <h4 style="margin:0 0 0.5rem; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; color:var(--secondary);">Datos del Sujeto Retenido (Proveedor)</h4>
                            <div style="display:grid; grid-template-columns: 3fr 1fr; font-size:0.85rem;">
                                <span><strong>Nombre o Razón Social:</strong> ${ret.name || '-'}</span>
                                <span><strong>RIF:</strong> ${ret.rif || '-'}</span>
                            </div>
                        </div>

                        <div style="overflow-x:auto;">
                            <table class="ret-table-legal" style="width:100%; border-collapse:collapse; font-size:0.75rem; margin-top: 1rem;">
                                <thead>
                                    <tr>
                                        <th>Oper. Nro.</th>
                                        <th>Fecha Factura</th>
                                        <th>Nro. Factura</th>
                                        <th>Nro. Control</th>
                                        <th>Nota Déb./Créd.</th>
                                        <th>Tipo Trans.</th>
                                        <th>Fact. Afectada</th>
                                        <th>Total Compras IVA Incl.</th>
                                        <th>Compras Exentas</th>
                                        <th>Base Imponible</th>
                                        <th>% Alíc.</th>
                                        <th>Impuesto IVA Causado</th>
                                        <th>% Ret.</th>
                                        <th>IVA Retenido</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>01</td>
                                        <td>${ret.date || '2026-05-17'}</td>
                                        <td>${ret.invoice || '-'}</td>
                                        <td>${ret.control || '-'}</td>
                                        <td>-</td>
                                        <td>Regis.</td>
                                        <td>-</td>
                                        <td>$${(baseVal + ivaVal).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td>$0.00</td>
                                        <td>$${baseVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td>16%</td>
                                        <td>$${ivaVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td>${percentRet}%</td>
                                        <td><strong style="color:var(--primary);">$${retainedVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="ret-footer" style="display:flex; justify-content:space-around; margin-top: 4rem;">
                            <div class="signature-box" style="text-align:center; width:220px;">
                                <div style="border-top:1px solid #1e293b; margin-bottom:0.5rem;"></div>
                                <p style="font-size:0.7rem; color:var(--text-muted); margin:0;">Agente de Retención (Firma Digital)</p>
                                <p style="font-size:0.65rem; color:var(--text-muted); margin:0;">${coData.name}</p>
                            </div>
                            <div class="signature-box" style="text-align:center; width:220px;">
                                <div style="border-top:1px solid #1e293b; margin-bottom:0.5rem;"></div>
                                <p style="font-size:0.7rem; color:var(--text-muted); margin:0;">Sujeto Retenido (Proveedor)</p>
                                <p style="font-size:0.65rem; color:var(--text-muted); margin:0;">Firma y Sello del Recibido</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                modalTitle.textContent = "Comprobante de Retención de ISLR";

                const seq = String(ret.entryId || '1').split('-')[0].slice(-4).padStart(4, '0');
                const compNum = `ISLR-2026-${seq}`;
                const dateObj = new Date(ret.date || '2026-05-17');
                const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                const periodStr = `${meses[dateObj.getMonth() || 4]} ${dateObj.getFullYear() || 2026}`;
                const rateVal = ret.rate || 2;
                const baseVal = ret.base || 0;
                const retainedVal = ret.retained || 0;

                let conceptCode = "099";
                if (rateVal === 1) conceptCode = "018";
                else if (rateVal === 2) conceptCode = "019";
                else if (rateVal === 3 || rateVal === 5) conceptCode = "021";

                area.innerHTML = `
                    <div class="retencion-print-layout">
                        <div class="ret-header">
                            <div class="ret-company">
                                <h2>${coData.name}</h2>
                                <p><strong>RIF:</strong> ${coData.rif}</p>
                                <p><strong>Dirección Fiscal:</strong> ${coData.address || 'Caracas, Venezuela'}</p>
                            </div>
                            <div class="ret-title" style="text-align: right;">
                                <h3 style="margin:0; font-size:1.1rem; color: var(--secondary);">COMPROBANTE DE RETENCIÓN DE IMPUESTO SOBRE LA RENTA (ISLR)</h3>
                                <p style="font-size:0.75rem; color:var(--text-muted); margin:0.25rem 0 0;">Decreto Nº 1.808 (Reglamento Parcial en Materia de Retenciones de ISLR)</p>
                            </div>
                        </div>

                        <div class="ret-info-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0;">
                            <div class="info-box">
                                <strong>NRO. COMPROBANTE SECUENCIAL:</strong>
                                <span class="text-mono" style="font-size:1rem; font-weight:700; color:var(--secondary);">${compNum}</span>
                            </div>
                            <div class="info-box">
                                <strong>FECHA EMISIÓN:</strong>
                                <span style="font-size:1rem; font-weight:700;">${ret.date || '2026-05-17'}</span>
                            </div>
                            <div class="info-box" style="text-align: right;">
                                <strong>PERÍODO FISCAL:</strong>
                                <span style="font-size:1rem; font-weight:700; color: var(--secondary);">${periodStr}</span>
                            </div>
                        </div>

                        <div class="ret-subject-card" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.01);">
                            <h4 style="margin:0 0 0.5rem; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; color:var(--secondary);">Datos del Agente de Retención (Pagador)</h4>
                            <div style="display:grid; grid-template-columns: 3fr 1fr; font-size:0.85rem; margin-bottom:1rem;">
                                <span><strong>Razón Social:</strong> ${coData.name}</span>
                                <span><strong>RIF:</strong> ${coData.rif}</span>
                            </div>
                            <hr style="border:0; border-top:1px solid var(--border-color); margin: 0.75rem 0;">
                            <h4 style="margin:0 0 0.5rem; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; color:var(--secondary);">Datos del Beneficiario (Sujeto Retenido)</h4>
                            <div style="display:grid; grid-template-columns: 3fr 1fr; font-size:0.85rem;">
                                <span><strong>Nombre o Razón Social:</strong> ${ret.name || '-'}</span>
                                <span><strong>RIF:</strong> ${ret.rif || '-'}</span>
                            </div>
                        </div>

                        <div style="overflow-x:auto;">
                            <table class="ret-table-legal" style="width:100%; border-collapse:collapse; font-size:0.75rem; margin-top: 1rem;">
                                <thead>
                                    <tr>
                                        <th>Fecha Operación</th>
                                        <th>Nro. Factura / Control</th>
                                        <th>Concepto de la Retención (Decreto 1.808)</th>
                                        <th>Cód. Concepto</th>
                                        <th>Monto Total del Pago</th>
                                        <th>Base Imponible Afectada</th>
                                        <th>% Retención</th>
                                        <th>Sustraendo</th>
                                        <th>Impuesto Retenido</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${ret.date || '2026-05-17'}</td>
                                        <td>Fact. ${ret.invoice || '-'} / Cont. ${ret.control || '-'}</td>
                                        <td><span style="font-weight:600;">${ret.concept || 'Servicios Generales'}</span></td>
                                        <td><span class="text-mono" style="font-weight:700;">${conceptCode}</span></td>
                                        <td>$${baseVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td>$${baseVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td>${rateVal}%</td>
                                        <td>$0.00</td>
                                        <td><strong style="color:var(--danger);">$${retainedVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="ret-footer" style="display:flex; justify-content:space-around; margin-top: 4rem;">
                            <div class="signature-box" style="text-align:center; width:220px;">
                                <div style="border-top:1px solid #1e293b; margin-bottom:0.5rem;"></div>
                                <p style="font-size:0.7rem; color:var(--text-muted); margin:0;">Firma del Agente Pagador</p>
                                <p style="font-size:0.65rem; color:var(--text-muted); margin:0;">${coData.name}</p>
                            </div>
                            <div class="signature-box" style="text-align:center; width:220px;">
                                <div style="border-top:1px solid #1e293b; margin-bottom:0.5rem;"></div>
                                <p style="font-size:0.7rem; color:var(--text-muted); margin:0;">Firma del Beneficiario</p>
                                <p style="font-size:0.65rem; color:var(--text-muted); margin:0;">Proveedor / Tercero</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            document.getElementById('modal-retencion').classList.add('show');
            document.body.classList.add('retencion-modal-open');
            applyRetencionStyles();
        } catch (err) {
            console.error('Error al mostrar modal de retención:', err);
            alert('Error en showRetencionModal: ' + err.message);
        }
    }

    function applyRetencionStyles() {
        const style = document.createElement('style');
        style.id = 'retention-styles';
        style.textContent = `
            .retencion-paper { padding: 3rem; background: white; color: #1e293b; font-family: 'Inter', sans-serif; }
            .ret-header { display: flex; justify-content: space-between; border-bottom: 2px solid #1e293b; padding-bottom: 1rem; margin-bottom: 1.5rem; align-items: center; }
            .ret-company h2 { color: var(--primary); margin: 0; font-size: 1.5rem; }
            .ret-company p { margin: 0.25rem 0 0 0; font-size: 0.8rem; color: var(--text-muted); }
            .ret-title { text-align: right; max-width: 450px; }
            .ret-title h3 { font-size: 0.95rem; margin: 0; line-height: 1.4; font-weight: 800; }
            .info-box { border: 1px solid #cbd5e1; padding: 0.75rem; border-radius: 8px; background: #f8fafc; display: flex; flex-direction: column; gap: 0.25rem; }
            .info-box strong { font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.5px; }
            .ret-table-legal { width: 100%; border-collapse: collapse; font-size: 0.75rem; margin-bottom: 2.5rem; }
            .ret-table-legal th { border: 1px solid #1e293b; padding: 0.6rem; background: #f8fafc; font-weight: 700; color: #0f172a; text-transform: uppercase; font-size: 0.65rem; }
            .ret-table-legal td { border: 1px solid #1e293b; padding: 0.6rem; text-align: center; color: #334155; }
            @media print {
                body.retencion-modal-open * { visibility: hidden; }
                body.retencion-modal-open #modal-retencion, body.retencion-modal-open #modal-retencion * { visibility: visible; }
                body.retencion-modal-open #modal-retencion { position: absolute; left: 0; top: 0; width: 100%; }
                body.retencion-modal-open .modal-header, body.retencion-modal-open .no-print { display: none !important; }
                body.retencion-modal-open .retencion-paper { padding: 0; border: none; background: white; width: 100%; }
            }
        `;
        const oldStyle = document.getElementById('retention-styles');
        if (oldStyle) oldStyle.remove();
        document.head.appendChild(style);
    }

    function renderSettings(container) {
        const data = window.companyData;
        container.innerHTML = `
            <div class="settings-view">
                <div class="glass-card mb-2">
                    <div class="card-header main-header">
                        <div class="header-info">
                            <i data-lucide="settings"></i>
                            <div>
                                <h3>Gestión del Sistema</h3>
                                <p>Configuración global y estructura de datos</p>
                            </div>
                        </div>
                    </div>
                    <div class="settings-body p-2">
                        <div class="settings-feature-card">
                            <div class="feature-info">
                                <i data-lucide="list-tree"></i>
                                <div>
                                    <strong>Estructura del Catálogo</strong>
                                    <p class="text-muted small">Defina la jerarquía de cuentas, niveles y naturaleza contable.</p>
                                </div>
                            </div>
                            <button class="btn-secondary" onclick="document.querySelector('[data-module=\'chart\']').click()">
                                Editar Plan de Cuentas
                            </button>
                        </div>
                        
                        <div class="settings-feature-card mt-2" style="border-color: var(--danger); background: rgba(239, 68, 68, 0.05);">
                            <div class="feature-info">
                                <i data-lucide="trash-2" style="color: var(--danger);"></i>
                                <div>
                                    <strong style="color: var(--danger);">Borrar Todos los Registros</strong>
                                    <p class="text-muted small">Elimina los comprobantes, ventas, compras y conciliaciones para iniciar en cero. (El Plan de Cuentas no se borrará).</p>
                                </div>
                            </div>
                            <button class="btn-primary" style="background: var(--danger);" onclick="if(confirm('🚨 ¡ATENCIÓN! Esto borrará permanentemente todos los comprobantes y operaciones del sistema y empezará a cero. ¿Estás absolutamente seguro?')) { localStorage.removeItem('softwin_journal'); localStorage.removeItem('softwin_bank_recon'); alert('Sistema inicializado a CERO registros con éxito.'); window.location.reload(); }">
                                Iniciar a Cero Registros
                            </button>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <div class="card-header main-header accent-header">
                        <div class="header-info">
                            <i data-lucide="building-2"></i>
                            <div>
                                <h3>Datos de la Entidad</h3>
                                <p>Información fiscal y moneda de reporte</p>
                            </div>
                        </div>
                    </div>
                    <form id="form-settings" class="form-accounting p-2">
                        <div class="form-grid-modal">
                            <div class="form-group">
                                <label>Nombre Legal de la Empresa</label>
                                <input type="text" id="conf-name" value="${data.name}" required>
                            </div>
                            <div class="form-group">
                                <label>RIF / NIT</label>
                                <input type="text" id="conf-rif" value="${data.rif}" required>
                            </div>
                        </div>
                        <div class="form-group mt-1">
                            <label>Dirección Fiscal Completa</label>
                            <textarea id="conf-address" rows="3" required>${data.address}</textarea>
                        </div>
                        <div class="form-grid-modal mt-1" style="grid-template-columns: 1fr 1fr;">
                            <div class="form-group">
                                <label>Moneda de Presentación</label>
                                <select id="conf-currency">
                                    <option value="USD" ${data.currency === 'USD' ? 'selected' : ''}>Dólares (USD)</option>
                                    <option value="VES" ${data.currency === 'VES' ? 'selected' : ''}>Bolívares (VES)</option>
                                    <option value="EUR" ${data.currency === 'EUR' ? 'selected' : ''}>Euros (EUR)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Idioma del Sistema</label>
                                <select disabled>
                                    <option>Español (Venezuela)</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-actions mt-2" style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; display: flex; justify-content: flex-end;">
                            <button type="submit" class="btn-primary large">
                                <i data-lucide="save"></i> Guardar Cambios de Configuración
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('form-settings').onsubmit = (e) => {
            e.preventDefault();
            const updated = {
                name: document.getElementById('conf-name').value,
                rif: document.getElementById('conf-rif').value,
                address: document.getElementById('conf-address').value,
                currency: document.getElementById('conf-currency').value
            };
            window.saveConfig(updated);
        };

        applySettingsStyles();
        lucide.createIcons();
    }

    function applySettingsStyles() {
        const style = document.createElement('style');
        style.id = 'settings-styles';
        style.textContent = `
            .settings-feature-card { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: rgba(0,0,0,0.02); border-radius: 12px; border: 1px dashed var(--border-color); }
            .feature-info { display: flex; gap: 1rem; align-items: center; }
            .feature-info i { color: var(--primary); width: 24px; height: 24px; }
            .feature-info strong { display: block; font-size: 0.95rem; }
            .feature-info p { margin: 0; }
            .p-2 { padding: 1.5rem !important; }
            .mt-2 { margin-top: 1.5rem; }
        `;
        if(!document.getElementById('settings-styles')) document.head.appendChild(style);
    }

    function applyTableStyles() {
        const style = document.createElement('style');
        style.textContent = `.table-container { padding: 1rem; overflow-x: auto; } .data-table { width: 100%; border-collapse: collapse; margin-top: 1rem; } .data-table th { text-align: left; padding: 1rem; border-bottom: 2px solid var(--border-color); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; } .data-table td { padding: 1rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; } .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; } .badge.success { background: rgba(16, 185, 129, 0.1); color: var(--success); } .btn-primary { background: var(--primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; } .tax-summary { padding: 2rem; } .tax-row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px dashed var(--border-color); } .tax-row.total { border-bottom: none; margin-top: 1rem; font-size: 1.2rem; color: var(--primary); }`;
        document.head.appendChild(style);
    }

    // --- Helpers de Carga Masiva SENIAT (XML / TXT) ---
    function exportarIVASENIAT(records) {
        const coData = window.companyData || { rif: "G200000000" };
        const cleanAgenteRif = coData.rif.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        let periodo = "202605";
        if (records.length > 0 && records[0].date) {
            const parts = records[0].date.split('-');
            periodo = `${parts[0]}${parts[1]}`;
        }

        let xml = `<?xml version="1.0" encoding="ISO-8859-1"?>\n`;
        xml += `<ResultadoComprobante>\n`;
        xml += `  <RifAgenteRetencion>${cleanAgenteRif}</RifAgenteRetencion>\n`;
        xml += `  <Periodo>${periodo}</Periodo>\n`;

        records.forEach(r => {
            const cleanRetenidoRif = r.rif.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const parts = r.date.split('-');
            const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

            const dateObj = new Date(r.date || '2026-05-17');
            const year = dateObj.getFullYear() || 2026;
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const seq = String(r.entryId || '1').split('-')[0].slice(-8).padStart(8, '0');
            const compNum = `${year}${month}${seq}`;

            const baseVal = parseFloat(r.base || 0).toFixed(2);
            const ivaVal = parseFloat(r.iva || 0).toFixed(2);
            const retainedVal = parseFloat(r.retained || 0).toFixed(2);
            const compraVal = (parseFloat(r.base || 0) + parseFloat(r.iva || 0)).toFixed(2);

            xml += `  <DetalleRetencion>\n`;
            xml += `    <RifRetenido>${cleanRetenidoRif}</RifRetenido>\n`;
            xml += `    <NumeroFactura>${r.invoice.replace(/[^0-9]/g, '').slice(-8).padStart(8, '0')}</NumeroFactura>\n`;
            xml += `    <NumeroControl>${r.control || '00-000000'}</NumeroControl>\n`;
            xml += `    <FechaFactura>${formattedDate}</FechaFactura>\n`;
            xml += `    <TipoTransaccion>C</TipoTransaccion>\n`;
            xml += `    <NumeroNotaDebito>0</NumeroNotaDebito>\n`;
            xml += `    <NumeroNotaCredito>0</NumeroNotaCredito>\n`;
            xml += `    <NroFacturaAfectada>0</NroFacturaAfectada>\n`;
            xml += `    <MontoCompra>${compraVal}</MontoCompra>\n`;
            xml += `    <BaseImponible>${baseVal}</BaseImponible>\n`;
            xml += `    <MontoIvaRetenido>${retainedVal}</MontoIvaRetenido>\n`;
            xml += `    <NumeroComprobante>${compNum}</NumeroComprobante>\n`;
            xml += `    <MontoExento>0.00</MontoExento>\n`;
            xml += `    <Alicuota>16</Alicuota>\n`;
            xml += `    <TipoExpediente>0</TipoExpediente>\n`;
            xml += `  </DetalleRetencion>\n`;
        });

        xml += `</ResultadoComprobante>`;

        const blob = new Blob([xml], { type: 'application/xml;charset=iso-8859-1' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RETENCION_IVA_${periodo}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function exportarISLRSENIAT(records) {
        let txt = "";
        
        records.forEach(r => {
            const cleanRetenidoRif = r.rif.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const cleanInvoice = r.invoice.replace(/[^0-9]/g, '').slice(-8).padStart(8, '0');
            const controlNum = r.control || '00-000000';
            const baseVal = parseFloat(r.base || 0).toFixed(2);
            
            let concepto = "021"; 
            const rate = parseFloat(r.rate || 2);
            const desc = (r.concept || "").toLowerCase();

            if (rate === 5) {
                concepto = "018"; 
            } else if (rate === 3) {
                concepto = "019"; 
            } else if (rate === 2) {
                if (desc.includes("flete") || desc.includes("transporte")) {
                    concepto = "029"; 
                } else {
                    concepto = "021"; 
                }
            } else if (rate === 1) {
                concepto = "022"; 
            }

            const percent = rate.toFixed(2);

            txt += `${cleanRetenidoRif};${cleanInvoice};${controlNum};${baseVal};${concepto};${baseVal};${percent}\n`;
        });

        if (records.length > 0 && !txt.endsWith('\n')) {
            txt += '\n';
        }

        let periodo = "202605";
        if (records.length > 0 && records[0].date) {
            const parts = records[0].date.split('-');
            periodo = `${parts[0]}${parts[1]}`;
        }

        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RETENCION_ISLR_${periodo}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
