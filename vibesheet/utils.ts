import { ActionType, CellData, CellMap, CellPos } from './types';

export const DEFAULT_COLS = 26;
export const DEFAULT_ROWS = 50;

export const getColLabel = (index: number): string => { let l = ''; let i = index; while (i >= 0) { l = String.fromCharCode(65 + (i % 26)) + l; i = Math.floor(i / 26) - 1; } return l; };
export const parseCellId = (id: string): CellPos | null => { const m = id.match(/([A-Z]+)([0-9]+)/); if (!m) return null; let c = 0; for (let i = 0; i < m[1].length; i++) c = c * 26 + (m[1].charCodeAt(i) - 64); return { c: c - 1, r: parseInt(m[2]) - 1 }; };
export const getCellId = (c: number, r: number): string => `${getColLabel(c)}${r + 1}`;

export const evaluateFormula = (formula: string, cells: CellMap): string | number => {
  if (!formula.startsWith('=')) return isNaN(Number(formula)) ? formula : Number(formula);
  try {
    const getVal = (id: string) => { const v = cells[id]?.computed ?? cells[id]?.value ?? 0; return isNaN(Number(v)) ? 0 : Number(v); };
    const expr = formula.substring(1).toUpperCase()
      .replace(/\^/g, '**')
      .replace(/(\$?[A-Z]+\$?[0-9]+):(\$?[A-Z]+\$?[0-9]+)/g, (_, s, e) => {
        const p1 = parseCellId(s.replace(/\$/g, '')), p2 = parseCellId(e.replace(/\$/g, ''));
        if (!p1 || !p2) return "[]";
        const vals = [];
        for (let r = Math.min(p1.r, p2.r); r <= Math.max(p1.r, p2.r); r++) {
          for (let c = Math.min(p1.c, p2.c); c <= Math.max(p1.c, p2.c); c++) vals.push(getVal(getCellId(c, r)));
        }
        return `[${vals.join(',')}]`;
      })
      .replace(/(\$?[A-Z]+\$?[0-9]+)/g, m => String(getVal(m.replace(/\$/g, ''))));
    const fn = new Function('arr', `const SUM=a=>a.flat().reduce((x,y)=>x+y,0);const AVERAGE=a=>{const f=a.flat();return f.length?SUM(f)/f.length:0};const MAX=a=>Math.max(...a.flat());const MIN=a=>Math.min(...a.flat());const SIN=Math.sin;const COS=Math.cos;const TAN=Math.tan;const ABS=Math.abs;const SQRT=Math.sqrt;const PI=()=>Math.PI;return ${expr}`);
    return fn([]);
  } catch { return "#ERROR"; }
};

export const reevaluate = (cells: CellMap): CellMap => {
  const next: CellMap = {};
  Object.keys(cells).forEach(k => {
      next[k] = { ...cells[k] };
  });

  for (let i = 0; i < 5; i++) {
    Object.keys(next).forEach(k => {
      const c = next[k];
      if (c.value === "" || c.value === null) c.computed = "";
      else if (typeof c.value === 'string' && c.value.startsWith('=')) c.computed = evaluateFormula(c.value, next);
      else c.computed = isNaN(Number(c.value)) ? c.value : Number(c.value);
    });
  }
  return next;
};

export const updateFormulas = (cells: CellMap, action: ActionType, index: number, count: number = 1): CellMap => {
    const newCells: CellMap = {};

    Object.keys(cells).forEach(cellId => {
        const cell = cells[cellId];
        if (typeof cell.value === 'string' && cell.value.startsWith('=')) {
            const newFormula = cell.value.replace(/(\$?)([A-Z]+)(\$?)([0-9]+)/g, (match, colAbs, col, rowAbs, rowStr) => {
                const row = parseInt(rowStr, 10) - 1;
                const pos = parseCellId(col + rowStr);
                if (!pos) return match;
                let { c } = pos;

                let newRow = row;
                let newCol = c;

                if (action === ActionType.INSERT_ROW && !rowAbs && row >= index) {
                    newRow += count;
                } else if (action === ActionType.DELETE_ROW && !rowAbs && row > index) {
                    newRow -= count;
                } else if (action === ActionType.INSERT_COL && !colAbs && c >= index) {
                    newCol += count;
                } else if (action === ActionType.DELETE_COL && !colAbs && c > index) {
                    newCol -= count;
                }
                
                if (action === ActionType.DELETE_ROW && row === index) return '#REF!';
                if (action === ActionType.DELETE_COL && c === index) return '#REF!';

                return `${colAbs}${getColLabel(newCol)}${rowAbs}${newRow + 1}`;
            });
            newCells[cellId] = { ...cell, value: newFormula };
        } else {
            newCells[cellId] = cell;
        }
    });

    return newCells;
};

export const copyToClipboard = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed"; 
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
};

export const getEffectiveGridSize = (cells: CellMap) => {
  let maxC = 0;
  let maxR = 0;
  Object.keys(cells).forEach(key => {
    const pos = parseCellId(key);
    if (pos) {
      maxC = Math.max(maxC, pos.c);
      maxR = Math.max(maxR, pos.r);
    }
  });
  return { maxC, maxR };
};

export const formatCellValue = (cell?: CellData): string => {
  if (!cell) return "";
  const val = cell.computed;
  if (val === undefined || val === null) return "";
  const { format } = cell.style || {};
  if (typeof val === 'number') {
    if (format === 'currency') return `$${val.toFixed(2)}`;
    if (format === 'percent') return `${(val * 100).toFixed(1)}%`;
    return val.toString();
  }
  return val.toString();
};

