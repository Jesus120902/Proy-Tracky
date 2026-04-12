import React, { useRef, useEffect, useState } from 'react';

const SignaturePad = ({ onSave, onClear }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // Slate 900
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    
    // Notificar al padre cada vez que se deja de dibujar
    onSave(canvas.toDataURL('image/png'));
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 overflow-hidden touch-none relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-[200px] cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
        />
        <button 
          type="button"
          onClick={clear}
          className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm hover:text-red-500 transition-colors"
        >
          Limpiar
        </button>
      </div>
      <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Firma del receptor dentro del recuadro</p>
    </div>
  );
};

export default SignaturePad;
