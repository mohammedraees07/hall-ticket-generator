"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2, Check, Upload, PenTool } from "lucide-react";

interface SignatureCanvasProps {
  initialSignature?: string;
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}

export function SignatureCanvas({
  initialSignature = "",
  onSave,
  onCancel,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokes, setStrokes] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high resolution for crisp drawing
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // If initial signature exists, draw it
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const saveCurrentState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokes((prev) => [...prev, imageData]);
  };

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ("clientX" in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    saveCurrentState();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.closePath();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setStrokes([]);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousState = strokes[strokes.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setStrokes((prev) => prev.slice(0, -1));
    if (strokes.length <= 1) setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const rect = canvas.getBoundingClientRect();
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            setHasDrawn(true);
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
            <PenTool size={13} /> Digital Scribble Signature Pad
          </h4>
          <p className="text-[11px] text-[#8d929d]">
            Sign directly on the box using your mouse, trackpad, or touch stylus.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#2b2f3a] bg-[#171920] text-xs font-medium text-white hover:bg-[#20232c] transition-colors">
            <Upload size={12} />
            <span>Upload Scanned Sign</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Signature White Drawing Canvas */}
      <div className="relative rounded-[4px] border-2 border-dashed border-[#343844] bg-[#ffffff] p-1 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-36 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {/* Subtle Sign Line */}
        <div className="absolute bottom-6 left-6 right-6 border-b border-neutral-300 pointer-events-none flex justify-between text-[10px] text-neutral-400 font-sans">
          <span>X Sign above this line</span>
          <span>Official Signature</span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={strokes.length === 0}
          >
            <RotateCcw size={12} /> Undo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!hasDrawn}
            className="text-[#f87171] hover:bg-[#2a1313]"
          >
            <Trash2 size={12} /> Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!hasDrawn}
          >
            <Check size={13} /> Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
}
