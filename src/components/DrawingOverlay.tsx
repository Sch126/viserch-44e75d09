import { Tldraw, Editor, TLShapeId, createShapeId } from 'tldraw';
import 'tldraw/tldraw.css';
import { useState, useCallback, useEffect } from 'react';
import { Pencil, Type, Eraser, Circle, Trash2 } from 'lucide-react';

interface DrawingOverlayProps {
  isActive: boolean;
  onCircleCapture?: (bounds: { x: number; y: number; width: number; height: number }) => void;
}

type DrawingMode = 'ink' | 'text' | 'select';

export function DrawingOverlay({ isActive, onCircleCapture }: DrawingOverlayProps) {
  const [mode, setMode] = useState<DrawingMode>('ink');
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    editor.updateInstanceState({ isDebugMode: false });
    
    // Listen for shape changes to detect circles
    editor.store.listen(({ changes }) => {
      Object.values(changes.added).forEach((record) => {
        if (record.typeName === 'shape' && record.type === 'geo') {
          const shape = record as any;
          if (shape.props?.geo === 'ellipse') {
            const bounds = editor.getShapePageBounds(shape.id);
            if (bounds && onCircleCapture) {
              onCircleCapture({
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
              });
            }
          }
        }
      });

      // Also detect closed freehand drawings (potential circles)
      Object.values(changes.updated).forEach(([, record]) => {
        if (record.typeName === 'shape' && record.type === 'draw') {
          const shape = record as any;
          if (shape.props?.isComplete) {
            const bounds = editor.getShapePageBounds(shape.id as TLShapeId);
            if (bounds && onCircleCapture) {
              // Check if it's roughly circular (aspect ratio close to 1)
              const aspectRatio = bounds.width / bounds.height;
              if (aspectRatio > 0.7 && aspectRatio < 1.4 && bounds.width > 50) {
                onCircleCapture({
                  x: bounds.x,
                  y: bounds.y,
                  width: bounds.width,
                  height: bounds.height,
                });
              }
            }
          }
        }
      });
    });
  }, [onCircleCapture]);

  useEffect(() => {
    if (!editor) return;
    
    switch (mode) {
      case 'ink':
        editor.setCurrentTool('draw');
        break;
      case 'text':
        editor.setCurrentTool('text');
        break;
      case 'select':
        editor.setCurrentTool('select');
        break;
    }
  }, [mode, editor]);

  const handleClear = useCallback(() => {
    if (editor) {
      editor.selectAll();
      editor.deleteShapes(editor.getSelectedShapeIds());
    }
  }, [editor]);

  const handleAddCircle = useCallback(() => {
    if (editor) {
      editor.setCurrentTool('geo');
      editor.updateInstanceState({
        stylesForNextShape: {
          ...editor.getInstanceState().stylesForNextShape,
        },
      });
      // Set to ellipse/circle mode
      const shapeId = createShapeId();
      editor.createShape({
        id: shapeId,
        type: 'geo',
        x: 100,
        y: 100,
        props: {
          geo: 'ellipse',
          w: 100,
          h: 100,
          color: 'light-blue',
          fill: 'none',
        },
      });
      editor.setCurrentTool('select');
      editor.select(shapeId);
    }
  }, [editor]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-10">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-2 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-xl">
        <button
          onClick={() => setMode('ink')}
          className={`group relative p-3 rounded-xl transition-all duration-300 ${
            mode === 'ink' 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
              : 'hover:bg-surface-hover text-muted-foreground hover:text-foreground'
          }`}
        >
          <Pencil className="w-5 h-5" />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground bg-card px-2 py-1 rounded-lg">
            Ink Mode
          </span>
        </button>

        <button
          onClick={() => setMode('text')}
          className={`group relative p-3 rounded-xl transition-all duration-300 ${
            mode === 'text' 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
              : 'hover:bg-surface-hover text-muted-foreground hover:text-foreground'
          }`}
        >
          <Type className="w-5 h-5" />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground bg-card px-2 py-1 rounded-lg">
            Text Mode
          </span>
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          onClick={handleAddCircle}
          className="group relative p-3 rounded-xl hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-all duration-300"
        >
          <Circle className="w-5 h-5" />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground bg-card px-2 py-1 rounded-lg">
            Add Circle
          </span>
        </button>

        <button
          onClick={() => editor?.setCurrentTool('eraser')}
          className="group relative p-3 rounded-xl hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-all duration-300"
        >
          <Eraser className="w-5 h-5" />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground bg-card px-2 py-1 rounded-lg">
            Eraser
          </span>
        </button>

        <button
          onClick={handleClear}
          className="group relative p-3 rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-300"
        >
          <Trash2 className="w-5 h-5" />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground bg-card px-2 py-1 rounded-lg">
            Clear All
          </span>
        </button>
      </div>

      {/* tldraw Canvas */}
      <div className="w-full h-full [&_.tl-background]:!bg-transparent [&_.tl-canvas]:!bg-transparent">
        <Tldraw
          onMount={handleMount}
          hideUi
          inferDarkMode
        />
      </div>
    </div>
  );
}
