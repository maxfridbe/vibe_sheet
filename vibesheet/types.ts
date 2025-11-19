export enum ActionType {
  SET_CELL = 'SET_CELL', BULK_UPDATE = 'BULK_UPDATE', LOAD_DATA = 'LOAD_DATA', SELECT = 'SELECT',
  FORMAT = 'FORMAT', RESIZE_COL = 'RESIZE_COL', RESIZE_ROW = 'RESIZE_ROW',
  INSERT_ROW = 'INSERT_ROW', DELETE_ROW = 'DELETE_ROW', INSERT_COL = 'INSERT_COL', DELETE_COL = 'DELETE_COL', UNDO = 'UNDO',
  NAVIGATE_TAB = 'NAVIGATE_TAB', NAVIGATE_ENTER = 'NAVIGATE_ENTER'
}

export type CellStyle = { bold?: boolean; italic?: boolean; underline?: boolean; align?: 'left' | 'center' | 'right'; format?: 'currency' | 'percent' | 'number'; backgroundColor?: string; color?: string; borderTop?: boolean; borderBottom?: boolean; borderLeft?: boolean; borderRight?: boolean; };
export interface CellData { value: string; computed?: string | number; style?: CellStyle; }
export type CellMap = Record<string, CellData>;
export interface CellPos { c: number; r: number; }
export interface SheetState { cells: CellMap; selected: { start: CellPos | null; end: CellPos | null }; activeCell: string | null; colWidths: Record<number, number>; rowHeights: Record<number, number>; rowCount: number; colCount: number; history: any[]; historyIndex: number; }

export interface SpreadsheetRef {
    ToCSV: () => string;
    LoadCSV: (csv: string) => void;
    SetCell: (id: string, value: string) => void;
}

export interface SpreadsheetProps {
    id?: string | number;
    initialData?: CellMap;
}
