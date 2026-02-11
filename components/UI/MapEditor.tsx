
import React, { useState } from 'react';
import { MapObject, ShapeType, Team } from '../../types';
import { WORLD_SIZE, COLORS } from '../../constants';

interface MapEditorProps {
  onSave: (map: MapObject[]) => void;
  onCancel: () => void;
}

const MapEditor: React.FC<MapEditorProps> = ({ onSave, onCancel }) => {
  const [mapObjects, setMapObjects] = useState<MapObject[]>([]);
  const [activeTool, setActiveTool] = useState<ShapeType>(ShapeType.OBSTACLE);

  const tools = [
    { type: ShapeType.OBSTACLE, label: 'Barrier', color: COLORS.WALL },
    { type: ShapeType.SPAWN_BLUE, label: 'Blue Spawn', color: COLORS.TEAM_BLUE },
    { type: ShapeType.SPAWN_RED, label: 'Red Spawn', color: COLORS.TEAM_RED }
  ];

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WORLD_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * WORLD_SIZE;
    
    const size = activeTool === ShapeType.OBSTACLE ? { x: 300, y: 150 } : { x: 500, y: 500 };

    const newObj: MapObject = {
      type: activeTool,
      pos: { x, y },
      size
    };
    setMapObjects([...mapObjects, newObj]);
  };

  const clear = () => setMapObjects([]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col p-8 z-[1000] animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">ARENA DESIGNER v2</h2>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Construct Tactical Layouts</p>
        </div>
        
        <div className="flex gap-4">
          {tools.map(t => (
            <button
              key={t.type}
              onClick={() => setActiveTool(t.type)}
              className={`px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs uppercase flex items-center gap-2 ${
                activeTool === t.type ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-slate-700 bg-slate-800 text-slate-500'
              }`}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={clear} className="px-6 py-2 rounded-xl text-slate-400 font-bold hover:text-white transition-colors">Wipe</button>
          <button onClick={onCancel} className="px-6 py-2 rounded-xl bg-slate-800 text-white font-bold">Discard</button>
          <button onClick={() => onSave(mapObjects)} className="px-8 py-2 rounded-xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20">DEPLOY</button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center overflow-hidden">
        <div 
          className="relative bg-slate-900 border-8 border-slate-800 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] cursor-crosshair overflow-hidden"
          style={{ width: 'min(85vw, 1000px)', aspectRatio: '1/1' }}
          onClick={handleCanvasClick}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
            backgroundImage: `linear-gradient(${COLORS.GRID} 2px, transparent 2px), linear-gradient(90deg, ${COLORS.GRID} 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }} />

          {mapObjects.map((obj, i) => (
            <div 
              key={i} 
              className="absolute flex items-center justify-center text-[8px] font-black text-white/20 uppercase"
              style={{
                left: (obj.pos.x / WORLD_SIZE) * 100 + '%',
                top: (obj.pos.y / WORLD_SIZE) * 100 + '%',
                width: (obj.size.x / WORLD_SIZE) * 100 + '%',
                height: (obj.size.y / WORLD_SIZE) * 100 + '%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: obj.type === ShapeType.OBSTACLE ? COLORS.WALL : 
                                 obj.type === ShapeType.SPAWN_BLUE ? COLORS.TEAM_BLUE + '44' : COLORS.TEAM_RED + '44',
                border: `2px solid ${obj.type === ShapeType.OBSTACLE ? '#334155' : 'white'}`
              }}
            >
              {obj.type.replace('SPAWN_', '')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapEditor;
