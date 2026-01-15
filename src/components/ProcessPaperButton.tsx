import { useState, useCallback } from 'react';
import { FileUp, X, FileText, Loader2 } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessPaperButtonProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

export function ProcessPaperButton({ onUpload, isProcessing }: ProcessPaperButtonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
    }
  }, []);

  const handleProcess = useCallback(() => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  }, [selectedFile, onUpload]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.label
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer
              transition-smooth
              ${isDragging 
                ? 'border-slate-blue bg-slate-blue/10' 
                : 'border-gold hover:border-slate-blue hover:bg-parchment-light'
              }
            `}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <motion.div
              animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              className="w-12 h-12 rounded-2xl bg-slate-blue/10 flex items-center justify-center mb-3"
            >
              <FileUp className="w-6 h-6 text-slate-blue" />
            </motion.div>
            <span className="text-sm font-medium text-charcoal mb-1 tracking-wide">
              Upload Research Paper
            </span>
            <span className="text-xs text-charcoal/50 tracking-wide">
              Drag & drop or click to browse
            </span>
          </motion.label>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-2xl bg-parchment-light border border-gold"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-blue/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-slate-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate tracking-wide">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-charcoal/50 tracking-wide">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!isProcessing && (
                <button
                  onClick={handleClear}
                  className="w-8 h-8 rounded-xl hover:bg-parchment flex items-center justify-center transition-smooth"
                >
                  <X className="w-4 h-4 text-charcoal/50" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MagneticButton
            onClick={handleProcess}
            disabled={isProcessing}
            strength={0.4}
            radius={120}
            className={`
              w-full py-3 rounded-2xl font-medium text-sm transition-smooth tracking-wide
              flex items-center justify-center gap-2
              ${isProcessing 
                ? 'bg-slate-blue/50 text-white cursor-wait' 
                : 'bg-slate-blue text-white hover:bg-slate-blue-dark'
              }
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4" />
                Process Paper
              </>
            )}
          </MagneticButton>
        </motion.div>
      )}
    </div>
  );
}
