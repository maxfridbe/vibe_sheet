import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import '../index.css';
import { ActionType, CellData, CellStyle, SpreadsheetRef, SpreadsheetProps, CellMap } from './types';
import { useStore, useStoreSelector, StoreContext, SpreadsheetStore } from './store';
import { getCellId, parseCellId, formatCellValue } from './utils';
import { 
    Icon, ToolbarButton, ColorButton, BoldIcon, ItalicIcon, UnderlineIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, 
    UndoIcon, ClipboardIcon, CopyIcon, ScissorsIcon, DollarSignIcon, PercentIcon, XIcon, ArrowUpIcon, ArrowDownIcon, 
    ArrowLeftIcon, ArrowRightIcon, TrashIcon, AllBordersIcon, BanIcon, PaintBucketIcon, PaletteIcon, EraserIcon, BorderIcon 
} from './ui';
import { DataToolbar, ExportModal, generateCSV, parseCSVToCells, generateMarkdown, generateODS, getGridData } from './export';
import { HelpBar } from './debug';

const ContextMenu: React.FC<{
  x: number;
  y: number;
  visible: boolean;
  type: 'cell' | 'row' | 'col';
  index: number;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onAction: (type: ActionType, index: number) => void;
  onClose: () => void;
}> = ({ x, y, visible, type, index, onCopy, onCut, onPaste, onAction, onClose }) => {
  if (!visible) return null;
  const menuClass = "fixed z-50 bg-white shadow-xl border border-gray-200 rounded-md py-1 min-w-[180px] text-sm animate-in fade-in zoom-in-95 duration-100";
  
  if (type === 'row') {
    return (
      <div className={menuClass} style={{ top: y, left: x }} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => { onAction(ActionType.INSERT_ROW, index); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
          <ArrowUpIcon size={14} /> Insert Row Above
        </button>
        <button onClick={() => { onAction(ActionType.INSERT_ROW, index + 1); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
          <ArrowDownIcon size={14} /> Insert Row Below
        </button>
        <div className="h-px bg-gray-100 my-1"></div>
        <button onClick={() => { onAction(ActionType.DELETE_ROW, index); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-red-600 hover:text-red-700">
          <TrashIcon size={14} /> Delete Row
        </button>
      </div>
    );
  }

  if (type === 'col') {
    return (
      <div className={menuClass} style={{ top: y, left: x }} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => { onAction(ActionType.INSERT_COL, index); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
          <ArrowLeftIcon size={14} /> Insert Column Left
        </button>
        <button onClick={() => { onAction(ActionType.INSERT_COL, index + 1); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
          <ArrowRightIcon size={14} /> Insert Column Right
        </button>
        <div className="h-px bg-gray-100 my-1"></div>
        <button onClick={() => { onAction(ActionType.DELETE_COL, index); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-red-600 hover:text-red-700">
          <TrashIcon size={14} /> Delete Column
        </button>
      </div>
    );
  }

  return (
    <div className={menuClass} style={{ top: y, left: x }} onClick={(e) => e.stopPropagation()}>
      <button onClick={() => { onCopy(); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
        <CopyIcon size={14} /> Copy
      </button>
      <button onClick={() => { onCut(); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
        <ScissorsIcon size={14} /> Cut
      </button>
      <div className="h-px bg-gray-100 my-1"></div>
      <button onClick={() => { onPaste(); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
        <ClipboardIcon size={14} /> Paste
      </button>
    </div>
  );
};

const Toolbar = () => {
    const store = useStore();
    const activeStyle = useStoreSelector(s => s.activeCell ? s.cells[s.activeCell]?.style || {} : {});
    const toggle = (styles: Partial<CellStyle>) => store.dispatch({ type: ActionType.FORMAT, payload: { styles } });
    const doAction = (type: ActionType) => store.dispatch({ type });

    return (
        <div className="h-11 bg-gray-50 flex items-center px-4 gap-4 border-b border-gray-200 shadow-sm overflow-x-auto">
            <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                <ToolbarButton icon={UndoIcon} label="Undo" onClick={() => doAction(ActionType.UNDO)} />
            </div>
            <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                <ToolbarButton icon={BoldIcon} active={activeStyle.bold} onClick={() => toggle({ bold: !activeStyle.bold })} label="Bold" />
                <ToolbarButton icon={ItalicIcon} active={activeStyle.italic} onClick={() => toggle({ italic: !activeStyle.italic })} label="Italic" />
                <ToolbarButton icon={UnderlineIcon} active={activeStyle.underline} onClick={() => toggle({ underline: !activeStyle.underline })} label="Underline" />
            </div>
            <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                <ToolbarButton icon={AlignLeftIcon} active={activeStyle.align === 'left'} onClick={() => toggle({ align: 'left' })} label="Left" />
                <ToolbarButton icon={AlignCenterIcon} active={activeStyle.align === 'center'} onClick={() => toggle({ align: 'center' })} label="Center" />
                <ToolbarButton icon={AlignRightIcon} active={activeStyle.align === 'right'} onClick={() => toggle({ align: 'right' })} label="Right" />
            </div>
            <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                <ToolbarButton icon={DollarSignIcon} active={activeStyle.format === 'currency'} onClick={() => toggle({ format: activeStyle.format === 'currency' ? undefined : 'currency' })} label="Currency" />
                <ToolbarButton icon={PercentIcon} active={activeStyle.format === 'percent'} onClick={() => toggle({ format: activeStyle.format === 'percent' ? undefined : 'percent' })} label="Percent" />
            </div>
            <div className="flex items-center gap-1">
                <ToolbarButton onClick={() => toggle({ borderTop: true, borderBottom: true, borderLeft: true, borderRight: true })} label="All Borders"><AllBordersIcon /></ToolbarButton>
                <ToolbarButton onClick={() => toggle({ borderLeft: !activeStyle.borderLeft })} active={activeStyle.borderLeft} label="Left Border"><BorderIcon type="left" /></ToolbarButton>
                <ToolbarButton onClick={() => toggle({ borderTop: !activeStyle.borderTop })} active={activeStyle.borderTop} label="Top Border"><BorderIcon type="top" /></ToolbarButton>
                <ToolbarButton onClick={() => toggle({ borderBottom: !activeStyle.borderBottom })} active={activeStyle.borderBottom} label="Bottom Border"><BorderIcon type="bottom" /></ToolbarButton>
                <ToolbarButton onClick={() => toggle({ borderRight: !activeStyle.borderRight })} active={activeStyle.borderRight} label="Right Border"><BorderIcon type="right" /></ToolbarButton>
                <ToolbarButton onClick={() => toggle({ borderTop: undefined, borderBottom: undefined, borderLeft: undefined, borderRight: undefined })} label="No Borders"><BanIcon /></ToolbarButton>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <ColorButton icon={PaintBucketIcon} color={activeStyle.backgroundColor} onChange={(val) => toggle({ backgroundColor: val })} label="Fill Color" />
                <ColorButton icon={PaletteIcon} color={activeStyle.color} onChange={(val) => toggle({ color: val })} label="Text Color" />
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <ToolbarButton icon={EraserIcon} onClick={() => toggle({ borderTop: undefined, borderBottom: undefined, borderLeft: undefined, borderRight: undefined, backgroundColor: undefined, color: undefined })} label="Reset Styles" />
            </div>
        </div>
    );
};

const FormulaBar = () => {
    const store = useStore();
    const activeCell = useStoreSelector(s => s.activeCell);
    const cellValue = useStoreSelector(s => s.activeCell ? s.cells[s.activeCell]?.value || "" : "");
    const [localValue, setLocalValue] = useState(cellValue);
    const editingCellRef = useRef<string | null>(null);
    
    useEffect(() => setLocalValue(cellValue), [cellValue]);

    const onFocus = () => { editingCellRef.current = activeCell; };
    const commit = () => {
        const target = editingCellRef.current || activeCell;
        if (target) store.dispatch({ type: ActionType.SET_CELL, payload: { id: target, value: localValue } });
        editingCellRef.current = null;
    };

    return (
        <div className="flex items-center p-1 border-b border-gray-200 bg-white">
            <div className="w-10 text-center text-gray-500 font-bold border-r border-gray-200 mr-2 text-xs">{activeCell || ""}</div>
            <div className="text-gray-400 px-2 font-serif italic text-sm">fx</div>
            <input 
                className="flex-1 outline-none text-gray-800 text-sm py-0.5"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onFocus={onFocus}
                onBlur={commit}
                onKeyDown={(e) => { if(e.key==='Enter') { commit(); } }}
                placeholder="Enter value or formula"
            />
        </div>
    );
};

const Grid = () => {
    const store = useStore();
    const { cells, colCount, rowCount, colWidths, rowHeights, selected, activeCell } = useStoreSelector(s => ({
        cells: s.cells, colCount: s.colCount, rowCount: s.rowCount, 
        colWidths: s.colWidths, rowHeights: s.rowHeights, selected: s.selected, activeCell: s.activeCell 
    }));

    const [editMode, setEditMode] = useState(false);
    const [editValue, setEditValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const editingCellRef = useRef<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, type: 'cell'|'row'|'col', index: number }>({ visible: false, x: 0, y: 0, type: 'cell', index: -1 });
    const [internalClipboard, setInternalClipboard] = useState<{width: number, height: number, data: Record<string, CellData> } | null>(null);

    useEffect(() => {
        if (activeCell && gridRef.current) {
            const activeEl = gridRef.current.querySelector(`[data-cell-id="${activeCell}"]`) as HTMLElement;
            if (activeEl) {
                const container = gridRef.current;
                const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = activeEl;
                const { scrollTop, scrollLeft, clientHeight, clientWidth } = container;
                const HEADER_OFFSET_LEFT = 40; 
                const HEADER_OFFSET_TOP = 24;  
                if (offsetLeft < scrollLeft + HEADER_OFFSET_LEFT) container.scrollLeft = offsetLeft - HEADER_OFFSET_LEFT;
                else if (offsetLeft + offsetWidth > scrollLeft + clientWidth) container.scrollLeft = offsetLeft + offsetWidth - clientWidth;
                if (offsetTop < scrollTop + HEADER_OFFSET_TOP) container.scrollTop = offsetTop - HEADER_OFFSET_TOP;
                else if (offsetTop + offsetHeight > scrollTop + clientHeight) container.scrollTop = offsetTop + offsetHeight - clientHeight;
            }
        }
    }, [activeCell]);

    // Close context menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
        window.addEventListener('click', handleClick);
        return () => {
          window.removeEventListener('click', handleClick);
        };
    }, []);

    const handleCopy = () => {
        if (!selected.start || !selected.end) return;
        const { start, end } = selected;
        const minC = Math.min(start.c, end.c), maxC = Math.max(start.c, end.c);
        const minR = Math.min(start.r, end.r), maxR = Math.max(start.r, end.r);
        const data: Record<string, CellData> = {};
        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                const cellId = getCellId(c, r);
                const cell = cells[cellId];
                if (cell) data[`${c - minC}:${r - minR}`] = { value: cell.value, style: cell.style };
            }
        }
        setInternalClipboard({ width: maxC - minC + 1, height: maxR - minR + 1, data });
    };

    const handleCut = () => {
        handleCopy();
        if (!selected.start || !selected.end) return;
        const { start, end } = selected;
        const minC = Math.min(start.c, end.c), maxC = Math.max(start.c, end.c);
        const minR = Math.min(start.r, end.r), maxR = Math.max(start.r, end.r);
        const updates: Record<string, CellData | null> = {};
        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                updates[getCellId(c, r)] = null; 
            }
        }
        store.dispatch({ type: ActionType.BULK_UPDATE, payload: { updates } });
    };

    const handlePaste = () => {
        if (!internalClipboard || !activeCell) return;
        const { c: startC, r: startR } = parseCellId(activeCell) || {c:0,r:0};
        const updates: Record<string, CellData | null> = {};
        Object.keys(internalClipboard.data).forEach(key => {
            const [relC, relR] = key.split(':').map(Number);
            const targetC = startC + relC;
            const targetR = startR + relR;
            if (targetC < colCount && targetR < rowCount) {
                updates[getCellId(targetC, targetR)] = internalClipboard.data[key];
            }
        });
        store.dispatch({ type: ActionType.BULK_UPDATE, payload: { updates } });
    };

    const handleHeaderContextMenu = (e: React.MouseEvent, type: 'col' | 'row', index: number) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type, index });
    };

    const handleCellContextMenu = (e: React.MouseEvent, c: number, r: number) => {
        e.preventDefault();
        if (!selected.start || !(c >= Math.min(selected.start.c, selected.end?.c ?? -1) && c <= Math.max(selected.start.c, selected.end?.c ?? -1) && r >= Math.min(selected.start.r, selected.end?.r ?? -1) && r <= Math.max(selected.start.r, selected.end?.r ?? -1))) {
            store.dispatch({ type: ActionType.SELECT, payload: { start: { c, r } } });
        }
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type: 'cell', index: -1 });
    };

    const handleStructuralAction = (type: ActionType, index: number) => {
        store.dispatch({ type, payload: { index } });
    };

    const format = (c: CellData | undefined) => {
        if (!c) return "";
        const v = c.computed;
        if (v === undefined || v === null) return "";
        const f = c.style?.format;
        if (typeof v === 'number') {
            if (f === 'currency') return `$${v.toFixed(2)}`;
            if (f === 'percent') return `${(v * 100).toFixed(1)}%`;
            return v.toString();
        }
        return v.toString();
    };
    
    const commit = () => {
        const target = editingCellRef.current || activeCell;
        if (target) store.dispatch({ type: ActionType.SET_CELL, payload: { id: target, value: editValue } });
        setEditMode(false);
        editingCellRef.current = null;
    };

    const onMouseDown = (c: number, r: number, e: React.MouseEvent) => {
        if (e.button === 2) return; 
        if (editMode && editValue.trim().startsWith('=')) return; 
        if (editMode) commit();
        setIsDragging(true);
        const p = { c, r };
        if (e.shiftKey && selected.start) {
            store.dispatch({ type: ActionType.SELECT, payload: { start: selected.start, end: p } });
        } else {
            store.dispatch({ type: ActionType.SELECT, payload: { start: p } });
        }
    };

    const onMouseEnter = (c: number, r: number) => {
        if (isDragging && selected.start) {
             store.dispatch({ type: ActionType.SELECT, payload: { start: selected.start, end: { c, r } } });
        }
    };

    const onMouseUp = () => setIsDragging(false);
    useEffect(() => { window.addEventListener('mouseup', onMouseUp); return () => window.removeEventListener('mouseup', onMouseUp); }, []);

    const onDoubleClick = (c: number, r: number) => {
        const id = getCellId(c, r);
        editingCellRef.current = id;
        setEditValue(cells[id]?.value || "");
        setEditMode(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const onClick = (c: number, r: number) => {
        if (editMode && editValue.trim().startsWith('=')) {
            setEditValue(prev => prev + getCellId(c,r));
            inputRef.current?.focus();
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (editMode) { commit(); gridRef.current?.focus(); }
            store.dispatch({ type: ActionType.NAVIGATE_TAB, payload: { shift: e.shiftKey } });
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (editMode) {
                commit();
            }
            store.dispatch({ type: ActionType.NAVIGATE_ENTER, payload: { shift: e.shiftKey } });
            gridRef.current?.focus();
            return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            editingCellRef.current = activeCell;
            setEditMode(true);
            setEditValue(e.key);
            setTimeout(() => inputRef.current?.focus(), 0);
            return;
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
            if (activeCell) store.dispatch({ type: ActionType.SET_CELL, payload: { id: activeCell, value: "" } });
        }
        if (selected.start) {
            const cursor = (e.shiftKey && selected.end) ? selected.end : selected.start;
            let { c, r } = cursor;
            if (!e.shiftKey && activeCell) {
                const ac = parseCellId(activeCell);
                if (ac) { c = ac.c; r = ac.r; }
            }
            if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
            if (e.key === 'ArrowDown') r = Math.min(rowCount - 1, r + 1);
            if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
            if (e.key === 'ArrowRight') c = Math.min(colCount - 1, c + 1);
            if (c !== cursor.c || r !== cursor.r) {
                e.preventDefault();
                if (e.shiftKey) store.dispatch({ type: ActionType.SELECT, payload: { start: selected.start, end: {c,r} } });
                else store.dispatch({ type: ActionType.SELECT, payload: { start: {c,r} } });
            }
        }
        if ((e.ctrlKey || e.metaKey)) {
            if(e.key === 'z') { e.preventDefault(); store.dispatch({ type: ActionType.UNDO }); }
             if (e.key === 'c') { e.preventDefault(); handleCopy(); }
             if (e.key === 'x') { e.preventDefault(); handleCut(); }
             if (e.key === 'v') { e.preventDefault(); handlePaste(); }
        }
    };

    let selBounds = null;
    if (selected.start && selected.end) {
        selBounds = {
            minC: Math.min(selected.start.c, selected.end.c), maxC: Math.max(selected.start.c, selected.end.c),
            minR: Math.min(selected.start.r, selected.end.r), maxR: Math.max(selected.start.r, selected.end.r)
        };
    }

    return (
        <div ref={gridRef} className="flex-1 overflow-auto relative focus:outline-none" tabIndex={0} onKeyDown={onKeyDown}>
             <ContextMenu 
                {...contextMenu} 
                onCopy={handleCopy} 
                onCut={handleCut} 
                onPaste={handlePaste} 
                onAction={handleStructuralAction}
                onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))} 
             />
             <div className="inline-block min-w-full">
                <table className="border-collapse w-full table-fixed">
                    <thead>
                        <tr>
                            <th className="w-10 bg-gray-100 border border-gray-300 sticky top-0 left-0 z-30"></th>
                            {Array.from({ length: colCount }).map((_, i) => (
                                <th key={i} className={`border border-gray-300 text-gray-600 font-medium h-6 min-w-[80px] sticky top-0 z-20 resize-x overflow-hidden text-xs hover:bg-gray-200 cursor-pointer
                                    ${selBounds && i >= selBounds.minC && i <= selBounds.maxC ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                                    style={{ width: colWidths[i] || 80 }}
                                    onContextMenu={(e) => handleHeaderContextMenu(e, 'col', i)}
                                >
                                    <div className="flex justify-center items-center w-full h-full relative group">
                                      {getCellId(i,0).replace(/[0-9]/g, '')}
                                      <div 
                                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          const startX = e.pageX;
                                          const startWidth = colWidths[i] || 80;
                                          const handleMouseMove = (moveEvent: MouseEvent) => {
                                            const newWidth = Math.max(40, startWidth + (moveEvent.pageX - startX));
                                            store.dispatch({ type: ActionType.RESIZE_COL, payload: { index: i, width: newWidth } });
                                          };
                                          const handleMouseUp = () => {
                                            document.removeEventListener('mousemove', handleMouseMove);
                                            document.removeEventListener('mouseup', handleMouseUp);
                                          };
                                          document.addEventListener('mousemove', handleMouseMove);
                                          document.addEventListener('mouseup', handleMouseUp);
                                        }}
                                      />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rowCount }).map((_, r) => (
                            <tr key={r} style={{ height: rowHeights[r] || 24 }}>
                                <td className={`border border-gray-300 text-center text-gray-500 font-medium sticky left-0 z-20 text-xs relative group hover:bg-gray-200 cursor-pointer
                                    ${selBounds && r >= selBounds.minR && r <= selBounds.maxR ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                                    onContextMenu={(e) => handleHeaderContextMenu(e, 'row', r)}
                                >
                                    <div className="flex justify-center items-center h-full pointer-events-none">
                                        {r + 1}
                                    </div>
                                    <div 
                                      className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-400 z-30"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const startY = e.pageY;
                                        const startHeight = rowHeights[r] || 24;
                                        const handleMouseMove = (moveEvent: MouseEvent) => {
                                          const newHeight = Math.max(24, startHeight + (moveEvent.pageY - startY));
                                          store.dispatch({ type: ActionType.RESIZE_ROW, payload: { index: r, height: newHeight } });
                                        };
                                        const handleMouseUp = () => {
                                          document.removeEventListener('mousemove', handleMouseMove);
                                          document.removeEventListener('mouseup', handleMouseUp);
                                        };
                                        document.addEventListener('mousemove', handleMouseMove);
                                        document.addEventListener('mouseup', handleMouseUp);
                                      }}
                                    />
                                </td>
                                {Array.from({ length: colCount }).map((_, c) => {
                                    const id = getCellId(c, r);
                                    const cell = cells[id];
                                    const isActive = activeCell === id;
                                    const isSel = selBounds && c >= selBounds.minC && c <= selBounds.maxC && r >= selBounds.minR && r <= selBounds.maxR;
                                    const s = cell?.style || {};
                                    return (
                                        <td key={c} data-cell-id={id}
                                            className={`border border-gray-200 px-1 overflow-hidden whitespace-nowrap text-ellipsis cursor-cell relative bg-white
                                                ${isActive ? 'outline outline-2 outline-blue-500 z-10' : ''}`}
                                            style={{
                                                fontWeight: s.bold ? 'bold' : 'normal',
                                                fontStyle: s.italic ? 'italic' : 'normal',
                                                textDecoration: s.underline ? 'underline' : 'none',
                                                textAlign: s.align || 'left',
                                                backgroundColor: s.backgroundColor,
                                                color: s.color,
                                                borderTop: s.borderTop ? '1px solid #000' : undefined,
                                                borderBottom: s.borderBottom ? '1px solid #000' : undefined,
                                                borderLeft: s.borderLeft ? '1px solid #000' : undefined,
                                                borderRight: s.borderRight ? '1px solid #000' : undefined
                                            }}
                                            onMouseDown={(e) => onMouseDown(c, r, e)}
                                            onMouseEnter={() => onMouseEnter(c, r)}
                                            onContextMenu={(e) => handleCellContextMenu(e, c, r)}
                                            onClick={() => onClick(c,r)}
                                            onDoubleClick={() => onDoubleClick(c, r)}
                                        >
                                            {isSel && !isActive && <div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />}
                                            {isActive && editMode ? (
                                                <input 
                                                    ref={inputRef}
                                                    className="w-full h-full outline-none bg-transparent relative z-20"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    style={{ color: s.color }}
                                                />
                                            ) : (
                                                <span className="pointer-events-none block w-full overflow-hidden text-ellipsis relative z-10">
                                                    {format(cell)}
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

export const Spreadsheet = forwardRef<SpreadsheetRef, SpreadsheetProps>(({ id, initialData = {} }, ref) => {
    const store = useMemo(() => new SpreadsheetStore(initialData), []);
    const [activeTab, setActiveTab] = useState<'Home' | 'Data' | 'Help'>('Home');
    const [exportModal, setExportModal] = useState({ visible: false, type: 'csv', content: '', data: [] as string[][] });

    useImperativeHandle(ref, () => ({
        ToCSV: () => {
            const data = getGridData(store.getState().cells);
            return generateCSV(data);
        },
        LoadCSV: (csvString) => {
            const newCells = parseCSVToCells(csvString);
            store.dispatch({ type: ActionType.LOAD_DATA, payload: newCells });
        },
        SetCell: (id: string, value: string) => {
            store.dispatch({ type: ActionType.SET_CELL, payload: { id, value } });
        }
    }));

    const openExport = (type: string) => {
        const cells = store.getState().cells;
        const data = getGridData(cells);
        let content = "";
        if (type === 'csv') content = generateCSV(data);
        else if (type === 'markdown') content = generateMarkdown(data);
        else if (type === 'ods') content = generateODS(cells);
        setExportModal({ visible: true, type, content, data });
    };

    return (
        <StoreContext.Provider value={store}>
            <div className="flex flex-col h-full bg-white overflow-hidden text-sm font-sans select-none relative">
                <div className="bg-gray-100 border-b border-gray-300 px-2 pt-2 gap-1 flex">
                    <button onClick={() => setActiveTab('Home')} className={`px-4 py-1.5 text-sm font-medium rounded-t-lg border-t border-x border-transparent relative top-[1px] z-10 ${activeTab === 'Home' ? 'bg-gray-50 text-blue-700 border-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}>Home</button>
                    <button onClick={() => setActiveTab('Data')} className={`px-4 py-1.5 text-sm font-medium rounded-t-lg border-t border-x border-transparent relative top-[1px] z-10 ${activeTab === 'Data' ? 'bg-gray-50 text-blue-700 border-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}>Data</button>
                    <button onClick={() => setActiveTab('Help')} className={`px-4 py-1.5 text-sm font-medium rounded-t-lg border-t border-x border-transparent relative top-[1px] z-10 ${activeTab === 'Help' ? 'bg-gray-50 text-blue-700 border-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}>Help</button>
                </div>
                {activeTab === 'Home' && <Toolbar />}
                {activeTab === 'Data' && <DataToolbar onExport={openExport} />}
                {activeTab === 'Help' && <HelpBar />}
                <FormulaBar />
                <Grid />
                <ExportModal {...exportModal} onClose={() => setExportModal(prev => ({ ...prev, visible: false }))} />
            </div>
        </StoreContext.Provider>
    );
});
