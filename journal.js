/**
 * Gestión del Libro Diario (Journal Entries)
 */
const defaultEntries = [];

const savedEntries = localStorage.getItem('softwin_journal');
window.journalEntries = savedEntries ? JSON.parse(savedEntries) : defaultEntries;

window.saveEntries = () => {
    localStorage.setItem('softwin_journal', JSON.stringify(window.journalEntries));
};

window.addEntry = (entry) => {
    window.journalEntries.push(entry);
    window.saveEntries();
};

window.generateEntryId = (dateStr) => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    const monthlyEntries = window.journalEntries.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() + 1 === parseInt(month) && eDate.getFullYear() === year;
    });

    const nextNum = monthlyEntries.length + 1;
    return `${String(nextNum).padStart(5, '0')}-${month}`;
};

window.commonConcepts = [
    "Venta de Mercancía según Factura",
    "Compra de Mercancía según Factura",
    "Pago de Nómina quincenal",
    "Pago de Servicios Públicos (Electricidad/Agua)",
    "Cobro a Cliente según Recibo",
    "Depósito Bancario de Efectivo en Caja",
    "Apertura de Caja Chica",
    "Pago de Alquiler de Local",
    "Provisión de Impuestos Mensual",
    "Asiento de Apertura - Capital Inicial"
];

