import React from 'react';

export const Icon = ({ size = 16, className = "", children }: { size?: number, className?: string, children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

export const ToolbarButton: React.FC<{ icon?: React.ElementType; active?: boolean; onClick: () => void; label: string; children?: React.ReactNode }> = ({ icon: Icon, active, onClick, label, children }) => (
  <button onClick={onClick} title={label} className={`p-1.5 rounded flex items-center gap-1 hover:bg-gray-200 relative ${active ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}>
    {Icon && <Icon />}{children}
  </button>
);

export const ColorButton: React.FC<{ icon: React.ElementType; color?: string; onChange: (val: string) => void; label: string }> = ({ icon: Icon, color, onChange, label }) => (
  <div className="relative p-1.5 rounded hover:bg-gray-200 cursor-pointer text-gray-700 group" title={label}>
      <Icon /><div className="h-1 w-full mt-0.5 rounded-sm" style={{ backgroundColor: color || '#000' }}></div>
      <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => onChange(e.target.value)} value={color || '#000000'} />
  </div>
);

export const BoldIcon = (p:any) => <Icon {...p}><path d="M14 12a4 4 0 0 0 0-8H6v8" /><path d="M15 20a4 4 0 0 0 0-8H6v8Z" /></Icon>;
export const ItalicIcon = (p:any) => <Icon {...p}><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></Icon>;
export const UnderlineIcon = (p:any) => <Icon {...p}><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></Icon>;
export const AlignLeftIcon = (p:any) => <Icon {...p}><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></Icon>;
export const AlignCenterIcon = (p:any) => <Icon {...p}><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></Icon>;
export const AlignRightIcon = (p:any) => <Icon {...p}><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></Icon>;
export const UndoIcon = (p:any) => <Icon {...p}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></Icon>;
export const ClipboardIcon = (p:any) => <Icon {...p}><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></Icon>;
export const CopyIcon = (p:any) => <Icon {...p}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></Icon>;
export const ScissorsIcon = (p:any) => <Icon {...p}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></Icon>;
export const DollarSignIcon = (p:any) => <Icon {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Icon>;
export const PercentIcon = (p:any) => <Icon {...p}><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></Icon>;
export const XIcon = (p:any) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;
export const DownloadIcon = (p:any) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>;
export const EyeIcon = (p:any) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>;
export const ArrowUpIcon = (p:any) => <Icon {...p}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></Icon>;
export const ArrowDownIcon = (p:any) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></Icon>;
export const ArrowLeftIcon = (p:any) => <Icon {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>;
export const ArrowRightIcon = (p:any) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>;
export const TrashIcon = (p:any) => <Icon {...p}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></Icon>;
export const AllBordersIcon = (p:any) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></Icon>;
export const BanIcon = (p:any) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" /></Icon>;
export const PaintBucketIcon = (p:any) => <Icon {...p}><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" /><path d="m5 2 5 5" /><path d="M2 13h15" /><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z" /></Icon>;
export const PaletteIcon = (p:any) => <Icon {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></Icon>;
export const EraserIcon = (p:any) => <Icon {...p}><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="M22 21H7" /><path d="m5 11 9 9" /></Icon>;
export const TableIcon = (p:any) => <Icon {...p}><path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></Icon>;
export const FileTextIcon = (p:any) => <Icon {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></Icon>;
export const FileSpreadsheetIcon = (p:any) => <Icon {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M8 13h2" /><path d="M8 17h2" /><path d="M14 13h2" /><path d="M14 17h2" /></Icon>;
export const BugIcon = (p:any) => <Icon {...p}><path d="m8 2 1.88 1.88" /><path d="M14.12 3.88 16 2" /><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" /><path d="M12 20c-3.3 0-6-2.6-6-5.87V10h12v4.13c0 3.26-2.7 5.87-6 5.87Z" /><path d="M19 19h2" /><path d="M3 19h2" /><path d="M19 13h2" /><path d="M3 13h2" /></Icon>;
export const PlayIcon = (p:any) => <Icon {...p}><polygon points="5 3 19 12 5 21 5 3" /></Icon>;
export const PlusIcon = (p:any) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;

export const BorderIcon = ({ type }: { type: 'left' | 'right' | 'top' | 'bottom' }) => {
  let content;
  switch(type) {
    case 'left': content = <><rect x="4" y="4" width="16" height="16" className="stroke-gray-300" /><line x1="4" y1="4" x2="4" y2="20" className="stroke-black stroke-2" /></>; break;
    case 'right': content = <><rect x="4" y="4" width="16" height="16" className="stroke-gray-300" /><line x1="20" y1="4" x2="20" y2="20" className="stroke-black stroke-2" /></>; break;
    case 'top': content = <><rect x="4" y="4" width="16" height="16" className="stroke-gray-300" /><line x1="4" y1="4" x2="20" y2="4" className="stroke-black stroke-2" /></>; break;
    case 'bottom': content = <><rect x="4" y="4" width="16" height="16" className="stroke-gray-300" /><line x1="4" y1="20" x2="20" y2="20" className="stroke-black stroke-2" /></>; break;
  }
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 stroke-current stroke-[1.5px] fill-none">{content}</svg>;
};


