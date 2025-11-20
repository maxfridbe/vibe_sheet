import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActionType, SheetState, CellMap, CellPos } from './types';
import { reevaluate, parseCellId, getCellId, DEFAULT_COLS, DEFAULT_ROWS, updateFormulas } from './utils';

export class SpreadsheetStore {
  private state: SheetState;
  private listeners = new Set<(s: SheetState) => void>();
  private debugLog: { time: string, type: string, payload: any }[] = [];

  constructor(initialData: CellMap = {}) {
    this.state = {
      cells: reevaluate(initialData),
      selected: { start: null, end: null },
      activeCell: null,
      colWidths: {}, rowHeights: {},
      rowCount: DEFAULT_ROWS, colCount: DEFAULT_COLS,
      history: [], historyIndex: -1
    };
  }

  public getState = () => this.state;
  public getLog = () => this.debugLog;

  public subscribe = (listener: (s: SheetState) => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public replayLog = (log: any[]) => {
      const fresh = new SpreadsheetStore().state;
      this.state = { ...fresh }; 
      this.debugLog = []; 
      const originalListeners = new Set(this.listeners);
      this.listeners.clear();
      try {
        log.forEach(entry => {
            this.dispatch({ type: entry.type, payload: entry.payload });
        });
      } catch (e) {
          console.error(e);
          alert("Invalid log data or format.");
      } finally {
          this.listeners = originalListeners;
          this.notify();
      }
  };

  public dispatch = (action: { type: ActionType, payload?: any }) => {
    this.debugLog.push({ 
      time: new Date().toISOString().split('T')[1].split('.')[0], 
      type: action.type, 
      payload: action.payload 
    });

    if (action.type !== ActionType.UNDO && action.type !== ActionType.SELECT && action.type !== ActionType.NAVIGATE_TAB && action.type !== ActionType.NAVIGATE_ENTER) {
        const hist = this.state.history.slice(0, this.state.historyIndex + 1);
        hist.push({ cells: this.state.cells, rowCount: this.state.rowCount, colCount: this.state.colCount });
        this.state.history = hist;
        this.state.historyIndex = hist.length;
    }

    const s = this.state;
    const p = action.payload;

    switch (action.type) {
      case ActionType.SET_CELL:
        s.cells = reevaluate({ ...s.cells, [p.id]: { ...s.cells[p.id], value: p.value } });
        break;
      case ActionType.BULK_UPDATE:
        const nextCells = { ...s.cells };
        Object.keys(p.updates).forEach(k => { if(p.updates[k]===null) delete nextCells[k]; else nextCells[k] = { ...nextCells[k], ...p.updates[k] }; });
        s.cells = reevaluate(nextCells);
        break;
      case ActionType.LOAD_DATA:
        s.cells = reevaluate(p);
        break;
      case ActionType.SELECT:
        s.selected = { start: p.start, end: p.end || p.start };
        s.activeCell = getCellId(p.start.c, p.start.r);
        break;
      case ActionType.NAVIGATE_TAB:
        if (s.activeCell && s.selected.start && s.selected.end) {
            const current = parseCellId(s.activeCell);
            if (current) {
                const minC = Math.min(s.selected.start.c, s.selected.end.c);
                const maxC = Math.max(s.selected.start.c, s.selected.end.c);
                const minR = Math.min(s.selected.start.r, s.selected.end.r);
                const maxR = Math.max(s.selected.start.r, s.selected.end.r);
                if (minC === maxC && minR === maxR) {
                     const nextC = Math.max(0, current.c + (p.shift ? -1 : 1)); // REMOVED CLAMP TO s.colCount-1
                     
                     // Auto-expand columns
                     if (nextC >= s.colCount) {
                        s.colCount = nextC + 1;
                     }

                     s.activeCell = getCellId(nextC, current.r);
                     s.selected = { start: {c: nextC, r: current.r}, end: {c: nextC, r: current.r} };
                } else {
                    let nextC = current.c + (p.shift ? -1 : 1);
                    let nextR = current.r;
                    if (p.shift) {
                        if (nextC < minC) {
                            nextC = maxC;
                            nextR--;
                            if (nextR < minR) nextR = maxR;
                        }
                    } else {
                        if (nextC > maxC) {
                            nextC = minC;
                            nextR++;
                            if (nextR > maxR) nextR = minR;
                        }
                    }
                    s.activeCell = getCellId(nextC, nextR);
                }
            }
        }
        break;
      case ActionType.NAVIGATE_ENTER:
        if (s.activeCell && s.selected.start && s.selected.end) {
            const current = parseCellId(s.activeCell);
            if (current) {
                const minC = Math.min(s.selected.start.c, s.selected.end.c);
                const maxC = Math.max(s.selected.start.c, s.selected.end.c);
                const minR = Math.min(s.selected.start.r, s.selected.end.r);
                const maxR = Math.max(s.selected.start.r, s.selected.end.r);

                if (minC === maxC && minR === maxR) {
                     // Single cell selection logic with auto-expansion
                     let nextR = current.r + (p.shift ? -1 : 1);
                     
                     // Auto-expand rows if hitting bottom
                     if (nextR >= s.rowCount) {
                        s.rowCount = nextR + 3; // "add like 3 rows"
                     }
                     
                     nextR = Math.max(0, nextR);
                     s.activeCell = getCellId(current.c, nextR);
                     s.selected = { start: {c: current.c, r: nextR}, end: {c: current.c, r: nextR} };
                } else {
                    // Range selection: cycle vertically first, then columns
                    let nextR = current.r + (p.shift ? -1 : 1);
                    let nextC = current.c;

                    if (p.shift) { 
                        if (nextR < minR) {
                            nextR = maxR;
                            nextC--;
                            if (nextC < minC) nextC = maxC;
                        }
                    } else { 
                        if (nextR > maxR) {
                            nextR = minR;
                            nextC++;
                            if (nextC > maxC) nextC = minC;
                        }
                    }
                    s.activeCell = getCellId(nextC, nextR);
                }
            }
        }
        break;
      case ActionType.FORMAT:
        if (s.selected.start && s.selected.end) {
            const { start, end } = s.selected;
            const minC = Math.min(start.c, end.c), maxC = Math.max(start.c, end.c);
            const minR = Math.min(start.r, end.r), maxR = Math.max(start.r, end.r);
            const nextC = { ...s.cells };
            for(let r=minR; r<=maxR; r++) {
                for(let c=minC; c<=maxC; c++) {
                    const id = getCellId(c,r);
                    const style = { ...(nextC[id]?.style || {}) };
                    Object.entries(p.styles).forEach(([k,v]) => { if(v===undefined) delete (style as any)[k]; else (style as any)[k]=v; });
                    nextC[id] = { ...nextC[id], value: nextC[id]?.value||"", style };
                }
            }
            s.cells = nextC;
        }
        break;
      case ActionType.RESIZE_COL: s.colWidths = { ...s.colWidths, [p.index]: p.width }; break;
      case ActionType.RESIZE_ROW: s.rowHeights = { ...s.rowHeights, [p.index]: p.height }; break;
      case ActionType.INSERT_ROW:
        {
            const updatedFormulas = updateFormulas(s.cells, action.type, p.index);
            const nc: CellMap = {};
            Object.keys(updatedFormulas).forEach(k => {
                const pos = parseCellId(k); if(!pos) return;
                if(pos.r >= p.index) nc[getCellId(pos.c, pos.r + 1)] = updatedFormulas[k];
                else nc[k] = updatedFormulas[k];
            });
            s.cells = reevaluate(nc); s.rowCount++;
        }
        break;
      case ActionType.DELETE_ROW:
        {
            const updatedFormulas = updateFormulas(s.cells, action.type, p.index);
            const nc: CellMap = {};
            Object.keys(updatedFormulas).forEach(k => {
                const pos = parseCellId(k); if(!pos) return;
                if(pos.r === p.index) return;
                if(pos.r > p.index) nc[getCellId(pos.c, pos.r - 1)] = updatedFormulas[k];
                else nc[k] = updatedFormulas[k];
            });
            s.cells = reevaluate(nc); s.rowCount = Math.max(1, s.rowCount - 1);
        }
        break;
      case ActionType.INSERT_COL:
        {
            const updatedFormulas = updateFormulas(s.cells, action.type, p.index);
            const nc: CellMap = {};
            Object.keys(updatedFormulas).forEach(k => {
                const pos = parseCellId(k); if(!pos) return;
                if(pos.c >= p.index) nc[getCellId(pos.c + 1, pos.r)] = updatedFormulas[k];
                else nc[k] = updatedFormulas[k];
            });
            s.cells = reevaluate(nc); s.colCount++;
        }
        break;
      case ActionType.DELETE_COL:
        {
            const updatedFormulas = updateFormulas(s.cells, action.type, p.index);
            const nc: CellMap = {};
            Object.keys(updatedFormulas).forEach(k => {
                const pos = parseCellId(k); if(!pos) return;
                if(pos.c === p.index) return;
                if(pos.c > p.index) nc[getCellId(pos.c - 1, pos.r)] = updatedFormulas[k];
                else nc[k] = updatedFormulas[k];
            });
            s.cells = reevaluate(nc); s.colCount = Math.max(1, s.colCount - 1);
        }
        break;
      case ActionType.UNDO:
        if (s.historyIndex >= 0) {
            const prev = s.history[s.historyIndex];
            s.cells = prev.cells; s.rowCount = prev.rowCount; s.colCount = prev.colCount;
            s.historyIndex--;
        }
        break;
    }
    this.notify();
  };
  private notify() { this.listeners.forEach(l => l({ ...this.state })); }
}

export const StoreContext = createContext<SpreadsheetStore | null>(null);

export const useStore = () => {
    const store = useContext(StoreContext);
    if (!store) throw new Error("Missing StoreProvider");
    return store;
};

export function useStoreSelector<T>(selector: (s: SheetState) => T): T {
    const store = useStore();
    const [snap, setSnap] = useState(() => selector(store.getState()));
    useEffect(() => {
        return store.subscribe((newState) => {
            const newSnap = selector(newState);
            if (JSON.stringify(newSnap) !== JSON.stringify(snap)) setSnap(newSnap);
        });
    }, [store, selector, snap]);
    return snap;
}
