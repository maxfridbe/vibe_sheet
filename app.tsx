import React, { useState, useRef } from 'react';
import { Spreadsheet } from './vibesheet/sheet';
import { SpreadsheetRef, CellMap } from './vibesheet/types';
import { getCellId } from './vibesheet/utils';
import { FileSpreadsheetIcon, Icon, XIcon } from './vibesheet/ui';

const CodeBlock = () => (
  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs mt-6 shadow-lg overflow-x-auto">
    <div className="flex justify-between mb-2 text-gray-400"><span>Example Usage</span><span>tsx</span></div>
    <pre>{`import { useRef } from 'react';
import { Spreadsheet, SpreadsheetRef } from './excel_editor';

const Dashboard = () => {
  const sheetRef = useRef<SpreadsheetRef>(null);

  const handleExport = () => {
    if (sheetRef.current) {
      const csv = sheetRef.current.ToCSV();
      console.log("CSV Export:", csv);
    }
  };

  const updateSheet = () => {
    if (sheetRef.current) {
      // Set value
      sheetRef.current.SetCell("A1", "500");
      // Set formula
      sheetRef.current.SetCell("B1", "=A1*10%");
    }
  };

  const handleImport = () => {
    if (sheetRef.current) {
      // Example CSV import
      sheetRef.current.LoadCSV("Col1,Col2\nVal1,Val2");
    }
  };

  return (
    <div>
      <button onClick={handleExport}>Log CSV</button>
      <button onClick={updateSheet}>Set A1=500</button>
      <button onClick={handleImport}>Load Data</button>
      <div className="h-96 border">
        <Spreadsheet ref={sheetRef} />
      </div>
    </div>
  );
};
`}</pre>
  </div>
);

const generateDefaultData = (): CellMap => {
  const data: CellMap = {};
  const headers = ["Step (x)", "Rad (x/2)", "Sin(Rad)", "Cos(Rad)", "Tan(Rad)", "Abs(Sin)"];
  headers.forEach((h, c) => {
    const id = getCellId(c, 0);
    data[id] = { value: h, style: { bold: true, align: 'center', backgroundColor: '#f3f4f6', borderBottom: true } };
  });
  for (let i = 1; i <= 15; i++) {
    const row = i + 1;
    const step = i - 1;
    data[`A${row}`] = { value: step.toString(), style: { align: 'center', backgroundColor: '#f9fafb', borderRight: true } };
    data[`B${row}`] = { value: `=A${row}*0.5`, style: { format: 'number' } };
    data[`C${row}`] = { value: `=SIN(B${row})`, style: { format: 'number' } };
    data[`D${row}`] = { value: `=COS(B${row})`, style: { format: 'number' } };
    data[`E${row}`] = { value: `=TAN(B${row})`, style: { format: 'number' } };
    data[`F${row}`] = { value: `=ABS(C${row})`, style: { format: 'percent', bold: step % 5 === 0, color: step % 5 === 0 ? '#dc2626' : undefined } };
  }
  return data;
};

interface SheetInstance { id: number; }

const App = () => {
  const [extraSheets, setExtraSheets] = useState<SheetInstance[]>([]);
  const addSheet = () => setExtraSheets([...extraSheets, { id: Date.now() }]);
  const removeSheet = (id: number) => setExtraSheets(extraSheets.filter(s => s.id !== id));

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-slate-800 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800"><FileSpreadsheetIcon className="text-green-600" /> React Spreadsheet</h1><p className="text-gray-600">Full TypeScript Implementation.</p></div>
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2"><span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Main Editor</span><span className="text-xs text-gray-400">Resize using bottom-right corner</span></div>
          <div className="resize-y overflow-hidden rounded-lg shadow-xl border border-gray-300 bg-white" style={{ height: '500px', minHeight: '300px' }}>
            <Spreadsheet initialData={generateDefaultData()} />
          </div>
        </div>
        <CodeBlock />
        <div className="mt-12 pt-8 border-t border-gray-300">
          <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-800">Playground</h2><button onClick={addSheet} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors"><Icon size={18}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon> Add Sheet</button></div>
          <div className="flex flex-wrap gap-6">
            {extraSheets.map((sheet, idx) => (
              <div key={sheet.id} className="flex flex-col relative group animate-in fade-in zoom-in duration-300 resize overflow-hidden border border-gray-300 rounded-lg shadow-md bg-white" style={{ width: '500px', height: '400px', minWidth: '300px', minHeight: '200px' }}>
                <div className="absolute -top-3 -right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => removeSheet(sheet.id)} className="bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"><XIcon size={16} /></button></div>
                <div className="bg-gray-50 p-1 border-b border-gray-300 text-xs font-mono text-gray-500 flex justify-between px-3 select-none cursor-move"><span>Sheet #{idx + 1}</span><span>ID: {sheet.id}</span></div>
                <div className="flex-1 overflow-hidden"><Spreadsheet /></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-transparent pointer-events-none"><svg viewBox="0 0 10 10" className="w-full h-full text-gray-400 fill-current"><path d="M 6 10 L 10 10 L 10 6 Z M 2 10 L 4 10 L 10 4 L 10 2 Z" /></svg></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;