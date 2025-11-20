export declare const HelpBar: () => import("react/jsx-runtime").JSX.Element;
import { CellMap } from './types';
export declare const getGridData: (cells: CellMap) => string[][];
export declare const generateCSV: (data: string[][]) => string;
export declare const parseCSVToCells: (csvString: string) => CellMap;
export declare const generateMarkdown: (data: string[][]) => string;
export declare const generateODS: (cells: CellMap) => string;
export declare const DataToolbar: ({ onExport }: {
    onExport: (type: string) => void;
}) => import("react/jsx-runtime").JSX.Element;
export declare const ExportModal: ({ visible, type, content, data, onClose }: {
    visible: boolean;
    type: string;
    content: string;
    data: string[][];
    onClose: () => void;
}) => import("react/jsx-runtime").JSX.Element | null;
export { Spreadsheet } from './sheet';
export * from './types';
import React from 'react';
import '../index.css';
import { SpreadsheetRef, SpreadsheetProps } from './types';
export declare const Spreadsheet: React.ForwardRefExoticComponent<SpreadsheetProps & React.RefAttributes<SpreadsheetRef>>;
import React from 'react';
import { ActionType, SheetState, CellMap } from './types';
export declare class SpreadsheetStore {
    private state;
    private listeners;
    private debugLog;
    constructor(initialData?: CellMap);
    getState: () => SheetState;
    getLog: () => {
        time: string;
        type: string;
        payload: any;
    }[];
    subscribe: (listener: (s: SheetState) => void) => () => void;
    replayLog: (log: any[]) => void;
    dispatch: (action: {
        type: ActionType;
        payload?: any;
    }) => void;
    private notify;
}
export declare const StoreContext: React.Context<SpreadsheetStore | null>;
export declare const useStore: () => SpreadsheetStore;
export declare function useStoreSelector<T>(selector: (s: SheetState) => T): T;
export declare enum ActionType {
    SET_CELL = "SET_CELL",
    BULK_UPDATE = "BULK_UPDATE",
    LOAD_DATA = "LOAD_DATA",
    SELECT = "SELECT",
    FORMAT = "FORMAT",
    RESIZE_COL = "RESIZE_COL",
    RESIZE_ROW = "RESIZE_ROW",
    INSERT_ROW = "INSERT_ROW",
    DELETE_ROW = "DELETE_ROW",
    INSERT_COL = "INSERT_COL",
    DELETE_COL = "DELETE_COL",
    UNDO = "UNDO",
    NAVIGATE_TAB = "NAVIGATE_TAB",
    NAVIGATE_ENTER = "NAVIGATE_ENTER"
}
export type CellStyle = {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right';
    format?: 'currency' | 'percent' | 'number';
    backgroundColor?: string;
    color?: string;
    borderTop?: boolean;
    borderBottom?: boolean;
    borderLeft?: boolean;
    borderRight?: boolean;
};
export interface CellData {
    value: string;
    computed?: string | number;
    style?: CellStyle;
}
export type CellMap = Record<string, CellData>;
export interface CellPos {
    c: number;
    r: number;
}
export interface SheetState {
    cells: CellMap;
    selected: {
        start: CellPos | null;
        end: CellPos | null;
    };
    activeCell: string | null;
    colWidths: Record<number, number>;
    rowHeights: Record<number, number>;
    rowCount: number;
    colCount: number;
    history: any[];
    historyIndex: number;
}
export interface SpreadsheetRef {
    ToCSV: () => string;
    LoadCSV: (csv: string) => void;
    SetCell: (id: string, value: string) => void;
}
export interface SpreadsheetProps {
    id?: string | number;
    initialData?: CellMap;
}
import React from 'react';
export declare const Icon: ({ size, className, children }: {
    size?: number;
    className?: string;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const ToolbarButton: React.FC<{
    icon?: React.ElementType;
    active?: boolean;
    onClick: () => void;
    label: string;
    children?: React.ReactNode;
}>;
export declare const ColorButton: React.FC<{
    icon: React.ElementType;
    color?: string;
    onChange: (val: string) => void;
    label: string;
}>;
export declare const BoldIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const ItalicIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const UnderlineIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const AlignLeftIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const AlignCenterIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const AlignRightIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const UndoIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const ClipboardIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const CopyIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const ScissorsIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const DollarSignIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const PercentIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const XIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const DownloadIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const EyeIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const ArrowUpIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const ArrowDownIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const ArrowLeftIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const ArrowRightIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const TrashIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const AllBordersIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const BanIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const PaintBucketIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const PaletteIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const EraserIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const TableIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const FileTextIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const FileSpreadsheetIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const BugIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const PlayIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const PlusIcon: (p: any) => import("react/jsx-runtime").JSX.Element;
export declare const BorderIcon: ({ type }: {
    type: "left" | "right" | "top" | "bottom";
}) => import("react/jsx-runtime").JSX.Element;
import { ActionType, CellData, CellMap, CellPos } from './types';
export declare const DEFAULT_COLS = 26;
export declare const DEFAULT_ROWS = 50;
export declare const getColLabel: (index: number) => string;
export declare const parseCellId: (id: string) => CellPos | null;
export declare const getCellId: (c: number, r: number) => string;
export declare const evaluateFormula: (formula: string, cells: CellMap) => string | number;
export declare const reevaluate: (cells: CellMap) => CellMap;
export declare const updateFormulas: (cells: CellMap, action: ActionType, index: number, count?: number) => CellMap;
export declare const copyToClipboard: (text: string) => void;
export declare const getEffectiveGridSize: (cells: CellMap) => {
    maxC: number;
    maxR: number;
};
export declare const formatCellValue: (cell?: CellData) => string;
