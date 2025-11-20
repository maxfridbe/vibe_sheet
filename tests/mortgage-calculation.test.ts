import { SpreadsheetStore } from './vibesheet/store';
import { CellMap } from './vibesheet/types';

const getCellId = (c: number, r: number): string => {
    let l = '';
    let i = c;
    while (i >= 0) {
        l = String.fromCharCode(65 + (i % 26)) + l;
        i = Math.floor(i / 26) - 1;
    }
    return `${l}${r + 1}`;
};

const generateMortgageData = (): CellMap => {
    const data: CellMap = {};
    
    // Headers
    const headers = ["Month", "Beginning Balance", "Monthly Payment", "Principal Paid", "Interest Paid", "Ending Balance"];
    headers.forEach((h, c) => {
        const id = getCellId(c, 0);
        data[id] = { value: h, style: { bold: true, align: 'center', backgroundColor: '#f3f4f6', borderBottom: true } };
    });

    // Inputs
    data[getCellId(0, 1)] = { value: "Loan Amount" };
    data[getCellId(1, 1)] = { value: "400000", style: { format: 'currency' } };
    data[getCellId(0, 2)] = { value: "Annual Interest Rate" };
    data[getCellId(1, 2)] = { value: "0.04", style: { format: 'percent' } };
    data[getCellId(0, 3)] = { value: "Loan Term (years)" };
    data[getCellId(1, 3)] = { value: "30" };
    data[getCellId(0, 4)] = { value: "Monthly Payment" };
    data[getCellId(1, 4)] = { value: "=B2*(B3/12*(1+B3/12)^(B4*12))/((1+B3/12)^(B4*12)-1)", style: { format: 'currency' } };

    // Table
    for (let i = 0; i < 360; i++) {
        const row = i + 6;
        // Month
        data[getCellId(0, row)] = { value: (i + 1).toString() };
        // Beginning Balance
        if (i === 0) {
            data[getCellId(1, row)] = { value: "=B2", style: { format: 'currency' } };
        } else {
            data[getCellId(1, row)] = { value: `=F${row}`, style: { format: 'currency' } };
        }
        // Monthly Payment
        data[getCellId(2, row)] = { value: "=$B$5", style: { format: 'currency' } };
        // Interest Paid
        data[getCellId(4, row)] = { value: `=B${row+1}*($B$3/12)`, style: { format: 'currency' } };
        // Principal Paid
        data[getCellId(3, row)] = { value: `=C${row+1}-E${row+1}`, style: { format: 'currency' } };
        // Ending Balance
        data[getCellId(5, row)] = { value: `=B${row+1}-D${row+1}`, style: { format: 'currency' } };
    }

    return data;
};

const test = () => {
    const initialData = generateMortgageData();
    const store = new SpreadsheetStore(initialData);
    const state = store.getState();
    
    console.log("Monthly Payment (B5):", state.cells['B5']?.computed);
    
    console.log("\n--- Row 7 (Month 1) ---");
    console.log("Beginning Balance (B7):", state.cells['B7']?.computed);
    console.log("Monthly Payment (C7):", state.cells['C7']?.computed);
    console.log("Interest Paid (E7):", state.cells['E7']?.computed);
    console.log("Principal Paid (D7):", state.cells['D7']?.computed);
    console.log("Ending Balance (F7):", state.cells['F7']?.computed);

    console.log("\n--- Row 8 (Month 2) ---");
    console.log("Beginning Balance (B8):", state.cells['B8']?.computed);
    console.log("Monthly Payment (C8):", state.cells['C8']?.computed);
    console.log("Interest Paid (E8):", state.cells['E8']?.computed);
    console.log("Principal Paid (D8):", state.cells['D8']?.computed);
    console.log("Ending Balance (F8):", state.cells['F8']?.computed);
};

test();
