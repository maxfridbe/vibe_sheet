import React, { useState } from 'react';
import { CellMap, CellStyle, CellData } from './types';
import { getEffectiveGridSize, formatCellValue, getCellId, copyToClipboard } from './utils';
import { Icon, TableIcon, FileTextIcon, FileSpreadsheetIcon, DownloadIcon, CopyIcon, XIcon, EyeIcon } from './ui';

export const getGridData = (cells: CellMap): string[][] => {
  const { maxC, maxR } = getEffectiveGridSize(cells);
  const data: string[][] = [];
  for (let r = 0; r <= maxR; r++) {
    const row: string[] = [];
    for (let c = 0; c <= maxC; c++) {
      const cell = cells[getCellId(c, r)];
      row.push(formatCellValue(cell));
    }
    data.push(row);
  }
  return data;
};

export const generateCSV = (data: string[][]): string => {
  return data.map(row => 
    row.map(val => {
      if (val.includes('"') || val.includes(',')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(",")
  ).join("\n");
};

export const parseCSVToCells = (csvString: string): CellMap => {
  const cells: CellMap = {};
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    const nextChar = csvString[i + 1];
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; 
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
      rows.push(currentRow);
      currentRow = [];
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) currentRow.push(currentVal);
  if (currentRow.length > 0) rows.push(currentRow);

  rows.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val !== undefined && val !== "") {
        cells[getCellId(c, r)] = { value: val };
      }
    });
  });
  return cells;
};

export const generateMarkdown = (data: string[][]): string => {
  if (data.length === 0) return "";
  const headers = data[0];
  let output = "| " + headers.map(h => h || " ").join(" | ") + " |\n";
  output += "| " + headers.map(() => "---").join(" | ") + " |\n";
  for (let i = 1; i < data.length; i++) {
    output += "| " + data[i].map(v => v || " ").join(" | ") + " |\n";
  }
  return output;
};

export const generateODS = (cells: CellMap): string => {
  const { maxC, maxR } = getEffectiveGridSize(cells);
  const stylesMap = new Map<string, string>(); 
  let styleCounter = 1;
  let stylesXML = '';

  const getStyleName = (style: CellStyle): string | null => {
    if (!style || Object.keys(style).length === 0) return null;
    const key = JSON.stringify(style, Object.keys(style).sort());
    if (stylesMap.has(key)) return stylesMap.get(key)!;
    const name = `ce${styleCounter++}`;
    stylesMap.set(key, name);
    let textProps = '';
    if (style.bold) textProps += ' fo:font-weight="bold"';
    if (style.italic) textProps += ' fo:font-style="italic"';
    if (style.underline) textProps += ' style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"';
    if (style.color) textProps += ` fo:color="${style.color}"`;
    let cellProps = '';
    if (style.backgroundColor) cellProps += ` fo:background-color="${style.backgroundColor}"`;
    const solidBlack = "0.06pt solid #000000";
    if (style.borderTop) cellProps += ` fo:border-top="${solidBlack}"`;
    if (style.borderBottom) cellProps += ` fo:border-bottom="${solidBlack}"`;
    if (style.borderLeft) cellProps += ` fo:border-left="${solidBlack}"`;
    if (style.borderRight) cellProps += ` fo:border-right="${solidBlack}"`;
    let paraProps = '';
    if (style.align) {
      const alignMap: Record<string, string> = { 'left': 'start', 'center': 'center', 'right': 'end' };
      paraProps += ` fo:text-align="${alignMap[style.align] || 'start'}"`;
    }
    stylesXML += `
    <style:style style:name="${name}" style:family="table-cell" style:parent-style-name="Default">
      <style:table-cell-properties${cellProps}/>
      <style:text-properties${textProps}/>
      <style:paragraph-properties${paraProps}/>
    </style:style>`;
    return name;
  };

  let bodyXML = '';
  for (let r = 0; r <= maxR; r++) {
    bodyXML += `\n    <table:table-row>`;
    for (let c = 0; c <= maxC; c++) {
      const id = getCellId(c, r);
      const cell = cells[id];
      const value = cell?.computed;
      const rawValue = cell?.value;
      const style = cell?.style;
      let attributes = '';
      if (style) {
        const styleName = getStyleName(style);
        if (styleName) attributes += ` table:style-name="${styleName}"`;
      }
      if (typeof rawValue === 'string' && rawValue.startsWith('=')) {
         let odsFormula = rawValue.replace(/(\S?[A-Z]+\S?[0-9]+)/g, (match) => {
             if (match.includes('$')) return `[${match}]`;
             return `[.${match}]`;
         });
         odsFormula = odsFormula.replace(/,/g, ';');
         attributes += ` table:formula="of:${odsFormula}"`;
      }
      let cellContent = '';
      if (value === undefined || value === null || value === "") {
      } else if (typeof value === 'number') {
         attributes += ` office:value-type="float" office:value="${value}"`;
         cellContent = `<text:p>${value}</text:p>`;
      } else {
         attributes += ` office:value-type="string"`;
         const escaped = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
         cellContent = `<text:p>${escaped}</text:p>`;
      }
      bodyXML += `\n     <table:table-cell${attributes}>${cellContent}</table:table-cell>`;
    }
    bodyXML += `\n    </table:table-row>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0"
  xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2"
  office:version="1.3"
  office:mimetype="application/vnd.oasis.opendocument.spreadsheet">
 <office:automatic-styles>
  ${stylesXML}
 </office:automatic-styles>
 <office:body>
  <office:spreadsheet>
   <table:table table:name="Sheet1">
    ${bodyXML}
   </table:table>
  </office:spreadsheet>
 </office:body>
</office:document>`;
};


export const DataToolbar = ({ onExport }: { onExport: (type: string) => void }) => (
  <div className="h-11 bg-gray-50 flex items-center px-4 gap-4 border-b border-gray-200 shadow-sm">
    <div className="flex items-center gap-2 text-gray-700 text-xs font-medium">
      <span className="uppercase text-gray-400 tracking-wider mr-2">Export Data</span>
      <button onClick={() => onExport('csv')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all">
        <TableIcon size={16} className="text-green-600"/> View as CSV
      </button>
      <button onClick={() => onExport('markdown')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all">
        <FileTextIcon size={16} className="text-blue-600"/> View as Markdown
      </button>
      <button onClick={() => onExport('ods')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all">
        <FileSpreadsheetIcon className="text-orange-600" size={16} /> View as ODS (XML)
      </button>
    </div>
  </div>
);

export const ExportModal = ({ visible, type, content, data, onClose }: { visible: boolean, type: string, content: string, data: string[][], onClose: () => void }) => {
  if (!visible) return null;

  const handleDownload = () => {
    let mimeType = 'text/plain';
    let extension = 'txt';
    if (type === 'csv') { mimeType = 'text/csv'; extension = 'csv'; }
    else if (type === 'markdown') { mimeType = 'text/markdown'; extension = 'md'; }
    else if (type === 'ods') { mimeType = 'application/xml'; extension = 'fods'; }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spreadsheet.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
      copyToClipboard(content);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-3/4 max-w-2xl flex flex-col max-h-[90%] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {type === 'csv' ? <TableIcon size={20} className="text-green-600"/> : type === 'ods' ? <FileSpreadsheetIcon className="text-orange-600" size={20}/> : <FileTextIcon size={20} className="text-blue-600"/>}
            Export to {type.toUpperCase()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon size={20}/></button>
        </div>
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
          <div className="flex-1 min-h-[150px] flex flex-col">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Raw Output</p>
            <textarea 
              className="flex-1 w-full border border-gray-300 rounded-md p-3 font-mono text-xs resize-none bg-gray-50 focus:outline-blue-500"
              readOnly
              value={content}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
          <div className="flex-1 min-h-[150px] flex flex-col">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
              <EyeIcon size={12}/> Live Preview
            </p>
            <div className="border border-gray-300 rounded-md overflow-auto bg-white p-1">
               <table className="w-full text-left border-collapse text-xs">
                 <thead>
                   <tr className="bg-gray-100 border-b border-gray-300">
                     {data[0]?.map((h, i) => (
                       <th key={i} className="p-2 font-semibold text-gray-700 border-r last:border-r-0 border-gray-200 whitespace-nowrap">{h}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                   {data.slice(1).map((row, r) => (
                     <tr key={r} className="border-b last:border-b-0 border-gray-100 hover:bg-gray-50">
                       {row.map((c, i) => (
                         <td key={i} className="p-2 border-r last:border-r-0 border-gray-200 whitespace-nowrap text-gray-600">{c}</td>
                       ))}
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end gap-2">
           <button onClick={handleDownload} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 shadow-sm text-sm font-medium flex items-center gap-2">
            <DownloadIcon size={16} /> Download File
          </button>
          <button onClick={handleCopy} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm text-sm font-medium flex items-center gap-2">
            <CopyIcon size={16} /> Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};
