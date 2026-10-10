'use client';

import React, { useState, useRef, MouseEvent } from 'react';

export interface ROI {
  id?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  price?: number;
  isSold?: boolean;
}

interface ImageRegionSelectorProps {
  imageUrl: string;
  rois: ROI[];
  onChange?: (rois: ROI[]) => void;
  readOnly?: boolean;
  selectedRoiId?: string;
  onSelectRoi?: (roi: ROI) => void;
}

export const ImageRegionSelector: React.FC<ImageRegionSelectorProps> = ({
  imageUrl,
  rois,
  onChange,
  readOnly = false,
  selectedRoiId,
  onSelectRoi,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (readOnly || !onChange || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setStartPos({ x, y });
    setIsDrawing(true);
    onChange([...rois, { id: `spot-${Date.now()}`, x, y, w: 0, h: 0 }]); // Add new active ROI
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (readOnly || !onChange || !isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let currentX = ((e.clientX - rect.left) / rect.width) * 100;
    let currentY = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values between 0 and 100
    currentX = Math.max(0, Math.min(100, currentX));
    currentY = Math.max(0, Math.min(100, currentY));

    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const w = Math.abs(currentX - startPos.x);
    const h = Math.abs(currentY - startPos.y);

    const newRois = [...rois];
    newRois[newRois.length - 1] = { ...newRois[newRois.length - 1], x, y, w, h };
    onChange(newRois);
  };

  const handleMouseUp = () => {
    if (readOnly || !onChange) return;
    setIsDrawing(false);
    // Remove any accidental clicks (width or height = 0)
    const validRois = rois.filter(r => r.w > 0 && r.h > 0);
    if (validRois.length !== rois.length) {
      onChange(validRois);
    }
  };

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="text-xs text-zinc-400 flex items-center justify-between">
          <span>Click and drag to draw spots ({rois.length} selected):</span>
          {rois.length > 0 && onChange && (
            <button 
              type="button" 
              onClick={() => onChange([])} 
              className="text-red-400 hover:text-red-300 font-bold transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      )}
      <div
        ref={containerRef}
        className={`relative w-full bg-zinc-900 rounded-xl overflow-hidden border border-white/10 select-none touch-none ${readOnly ? '' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt="Upload preview"
          className="w-full h-auto block opacity-80 pointer-events-none"
        />
        {rois.map((roi, index) => (
          roi.w > 0 && roi.h > 0 && (
            <div
              key={roi.id || index}
              onClick={() => readOnly && onSelectRoi && onSelectRoi(roi)}
              className={`absolute border-2 border-dashed z-10 transition-colors ${
                readOnly ? 'cursor-pointer' : 'pointer-events-none'
              } ${
                roi.isSold ? 'border-red-500 bg-red-500/30 cursor-not-allowed' :
                roi.id === selectedRoiId ? 'border-green-400 bg-green-400/30' : 'border-white bg-white/30 hover:bg-white/50'
              }`}
              style={{
                left: `${roi.x}%`,
                top: `${roi.y}%`,
                width: `${roi.w}%`,
                height: `${roi.h}%`,
              }}
            >
              {/* Show index badge on each spot */}
              <div className={`absolute -top-2.5 -left-2.5 font-bold text-[8px] w-5 h-5 flex items-center justify-center rounded-full ${
                roi.id === selectedRoiId ? 'bg-green-400 text-black' : 'bg-white text-black'
              }`}>
                {index + 1}
              </div>
              {readOnly && roi.price !== undefined && !roi.isSold && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                  ${roi.price}
                </div>
              )}
              {readOnly && roi.isSold && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap rotate-[-15deg]">
                  SOLD
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
};
