import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Eraser, Undo, Redo, Trash2, PenTool, Palette, Highlighter, Sparkles, MousePointer2 } from 'lucide-react';

interface DrawingBoardProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (dataUrl: string) => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
  '#000000', '#ffffff'
];

const BRUSH_SIZES = [
  { id: 'small', size: 4 },
  { id: 'medium', size: 8 },
  { id: 'large', size: 16 },
  { id: 'xlarge', size: 24 }
];

type Point = { x: number; y: number };
type ToolType = 'pen' | 'eraser' | 'marker' | 'neon' | 'object-eraser';

interface Stroke {
  id: string;
  tool: ToolType;
  color: string;
  size: number;
  points: Point[];
}

export default function DrawingBoard({ isOpen, onClose, onSend }: DrawingBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[6]); // default blue
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].size);
  const [tool, setTool] = useState<ToolType>('pen');
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Vector drawing state
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  // Undo/Redo history based on stroke arrays
  const [history, setHistory] = useState<Stroke[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  // Handle canvas resize
  useEffect(() => {
    if (!isOpen || !containerRef.current || !canvasRef.current) return;
    
    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    const handleResize = () => {
      // Save old content/strokes are already in state
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawAll();
    };

    const resizeObserver = new ResizeObserver(() => {
      // Need requestAnimationFrame to avoid "ResizeObserver loop limit exceeded" error in some browsers
      window.requestAnimationFrame(handleResize);
    });
    
    resizeObserver.observe(container);
    handleResize(); // Initial size

    return () => {
      resizeObserver.disconnect();
    };
  }, [isOpen, strokes, currentStroke]); // Re-bind observer if strokes change so handleResize closure has latest state? No, handleResize uses redrawAll which might need latest state. Wait, redrawAll is defined below, it captures state. Actually, it's safer to just let the strokes useEffect handle redrawing.

  // Redraw when strokes change
  useEffect(() => {
    redrawAll();
  }, [strokes, currentStroke]);

  const redrawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all completed strokes
    strokes.forEach(s => drawStroke(ctx, s));

    // Draw the active stroke being currently drawn
    if (currentStroke) {
      drawStroke(ctx, currentStroke);
    }
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length === 0) return;
    
    ctx.beginPath();
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    if (stroke.tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
    } else if (stroke.tool === 'marker') {
      ctx.strokeStyle = stroke.color;
      ctx.globalAlpha = 0.3;
      ctx.lineCap = 'square';
    } else if (stroke.tool === 'neon') {
      ctx.strokeStyle = stroke.color;
      ctx.shadowBlur = stroke.size * 1.5;
      ctx.shadowColor = stroke.color;
    } else {
      ctx.strokeStyle = stroke.color;
    }

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  };

  const saveToHistory = (newStrokes: Stroke[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([...newStrokes]);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setStrokes(newStrokes);
  };

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.touches.length > 1) return;
    if (e.cancelable) e.preventDefault(); 
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pt = getPointerPos(e, canvas);

    if (tool === 'object-eraser') {
      eraseObjectAtPoint(pt);
      setIsDrawing(true); // Keep erasing as they drag
      return;
    }

    setIsDrawing(true);
    setCurrentStroke({
      id: Math.random().toString(),
      tool,
      color,
      size: brushSize,
      points: [pt]
    });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (currentStroke && currentStroke.points.length > 0) {
        saveToHistory([...strokes, currentStroke]);
      }
      setCurrentStroke(null);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    if ('touches' in e && e.touches.length > 1) {
       stopDrawing();
       return;
    }
    if (e.cancelable) e.preventDefault();

    const pt = getPointerPos(e, canvasRef.current);

    if (tool === 'object-eraser') {
      eraseObjectAtPoint(pt);
      return;
    }

    if (currentStroke) {
      setCurrentStroke({
        ...currentStroke,
        points: [...currentStroke.points, pt]
      });
    }
  };

  const eraseObjectAtPoint = (pt: Point) => {
    // Find a stroke that intersects with the given point
    // We check points in reverse order to erase top strokes first
    const eraseRadius = 20; 
    let strokeToRemoveIndex = -1;
    
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      if (s.tool === 'eraser') continue; // Don't explicitly erase normal eraser marks
      
      const hit = s.points.some(p => {
        const dx = p.x - pt.x;
        const dy = p.y - pt.y;
        return Math.sqrt(dx*dx + dy*dy) < eraseRadius + (s.size / 2);
      });

      if (hit) {
        strokeToRemoveIndex = i;
        break;
      }
    }

    if (strokeToRemoveIndex !== -1) {
      const newStrokes = [...strokes];
      newStrokes.splice(strokeToRemoveIndex, 1);
      saveToHistory(newStrokes);
    }
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      setStrokes(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setStrokes(history[nextStep]);
    }
  };

  const handleClear = () => {
    saveToHistory([]);
  };

  const handleSend = () => {
    if (canvasRef.current) {
      // Get base64 string using JPEG to save massive amounts of payload space
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      onSend(dataUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm ${isMaximized ? 'p-0' : 'p-2 sm:p-4'}`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`bg-gray-50 dark:bg-slate-800 w-full flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
            isMaximized 
              ? 'h-full rounded-none border-0' 
              : 'max-w-4xl h-[90vh] rounded-[2rem] border-2 border-indigo-200 dark:border-indigo-900'
          }`}
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-slate-700 shadow-sm z-10">
            <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <Palette className="text-pink-500" /> مرسم العائلة
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-indigo-600 rounded-full transition-colors"
                title={isMaximized ? "تصغير" : "ملء الشاشة"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isMaximized ? (
                    <>
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                    </>
                  ) : (
                    <>
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </>
                  )}
                </svg>
              </button>
              <button 
                onClick={onClose}
                className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tools Area */}
          <div className="flex flex-col sm:flex-row bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 p-4 gap-4 z-10 overflow-x-auto">
            {/* Tool Selection */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-x-auto whitespace-nowrap">
              <button 
                onClick={() => setTool('pen')}
                className={`p-3 rounded-xl flex items-center gap-2 font-bold transition-all ${tool === 'pen' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                title="قلم عادي"
              >
                <PenTool size={20} /> <span className="hidden lg:inline">قلم</span>
              </button>
              <button 
                onClick={() => setTool('marker')}
                className={`p-3 rounded-xl flex items-center gap-2 font-bold transition-all ${tool === 'marker' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                title="قلم تحديد"
              >
                <Highlighter size={20} /> <span className="hidden lg:inline">تحديد</span>
              </button>
              <button 
                onClick={() => setTool('neon')}
                className={`p-3 rounded-xl flex items-center gap-2 font-bold transition-all ${tool === 'neon' ? 'bg-white dark:bg-slate-700 text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                title="قلم مضيء"
              >
                <Sparkles size={20} /> <span className="hidden lg:inline">نيون</span>
              </button>
              <button 
                onClick={() => setTool('eraser')}
                className={`p-3 rounded-xl flex items-center gap-2 font-bold transition-all ${tool === 'eraser' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                title="ممحاة عادية (مسح دقيق)"
              >
                <Eraser size={20} /> <span className="hidden lg:inline">ممحاة</span>
              </button>
              <button 
                onClick={() => setTool('object-eraser')}
                className={`p-3 rounded-xl flex items-center gap-2 font-bold transition-all ${tool === 'object-eraser' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                title="ممحاة الأجسام (مسح خط كامل)"
              >
                <MousePointer2 size={20} className="transform rotate-180" /> <span className="hidden lg:inline">إزالة</span>
              </button>
            </div>

            {/* Colors */}
            <div className="flex flex-wrap gap-2 items-center flex-1 justify-center sm:justify-start min-w-[200px]">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { 
                    setColor(c); 
                    if (tool === 'eraser' || tool === 'object-eraser') setTool('pen'); 
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${color === c && tool !== 'eraser' && tool !== 'object-eraser' ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-r border-gray-200 dark:border-slate-700 pr-4">
              <button onClick={handleUndo} disabled={historyStep <= 0} className="p-3 text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors bg-gray-100 dark:bg-slate-800 rounded-xl" title="تراجع">
                <Undo size={20} />
              </button>
              <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className="p-3 text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors bg-gray-100 dark:bg-slate-800 rounded-xl" title="إعادة">
                <Redo size={20} />
              </button>
              <button onClick={handleClear} className="p-3 text-gray-500 hover:text-red-500 transition-colors bg-gray-100 dark:bg-slate-800 rounded-xl" title="مسح الكل">
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div ref={containerRef} className="flex-1 bg-gray-200 dark:bg-slate-950 p-2 sm:p-4 overflow-auto relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
              onTouchMove={draw}
              className="bg-white rounded-2xl shadow-inner cursor-crosshair mx-auto border-2 border-transparent w-full h-full"
              style={{ touchAction: 'pinch-zoom' }}
            />
          </div>

          {/* Footer (Brush sizes & Send) */}
          <div className="bg-white dark:bg-slate-900 p-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center z-10">
            <div className="flex gap-3 items-center">
              <span className="text-gray-500 dark:text-gray-400 font-bold text-sm hidden sm:block">حجم الخط:</span>
              {BRUSH_SIZES.map(b => (
                <button
                  key={b.id}
                  onClick={() => setBrushSize(b.size)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${brushSize === b.size ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <div className="bg-current rounded-full" style={{ width: b.size, height: b.size, maxWidth: 24, maxHeight: 24 }} />
                </button>
              ))}
            </div>

            <button
              onClick={handleSend}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-lg shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all"
            >
              إرسال الرسمة <Send size={20} />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
