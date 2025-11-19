import React, { useState } from 'react';
import { useStore } from './store';
import { copyToClipboard } from './utils';
import { BugIcon, PlayIcon, XIcon } from './ui';

export const HelpBar = () => {
    const store = useStore();
    const [modalOpen, setModalOpen] = useState(false);
    const copyLog = () => {
        const log = store.getLog();
        copyToClipboard(JSON.stringify(log, null, 2));
        alert("Debug log copied to clipboard!");
    };
    return (
        <>
            <div className="h-11 bg-gray-50 flex items-center px-4 gap-4 border-b border-gray-200 shadow-sm">
                <button onClick={copyLog} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all text-xs font-medium text-gray-700">
                    <BugIcon /> Copy Debug Log
                </button>
                <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all text-xs font-medium text-gray-700">
                    <PlayIcon /> Paste & Replay Log
                </button>
                <span className="text-xs text-gray-400">Use these tools to report or reproduce issues.</span>
            </div>
            <PasteLogModal visible={modalOpen} onClose={() => setModalOpen(false)} />
        </>
    );
};

const PasteLogModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
    const store = useStore();
    const [val, setVal] = useState("");
    if (!visible) return null;
    const handleReplay = () => {
        try {
            const log = JSON.parse(val);
            if (Array.isArray(log)) {
                store.replayLog(log);
                onClose();
                setVal("");
            } else {
                alert("Invalid log format (must be array)");
            }
        } catch (e) {
            alert("Invalid JSON");
        }
    };
    return (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-3/4 max-w-lg flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2"><PlayIcon /> Replay Debug Log</h3>
                    <button onClick={onClose}><XIcon /></button>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                    <p className="text-xs text-gray-500">Paste the JSON log below. This will reset the current sheet state and replay all actions.</p>
                    <textarea 
                        className="w-full h-64 border border-gray-300 rounded p-2 font-mono text-xs" 
                        placeholder='[{"type": "SELECT", ...}]'
                        value={val}
                        onChange={e => setVal(e.target.value)}
                    />
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                     <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                     <button onClick={handleReplay} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Replay Log</button>
                </div>
            </div>
         </div>
    );
};
