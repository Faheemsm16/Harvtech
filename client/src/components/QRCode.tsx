import { useEffect, useRef } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 200 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR code placeholder - in production, use a proper QR code library
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    
    // Create a simple pattern that looks like a QR code
    const blockSize = size / 20;
    
    // Generate a pseudo-random pattern based on the value
    const pattern = [];
    for (let i = 0; i < 400; i++) {
      pattern.push(value.charCodeAt(i % value.length) % 2 === 0);
    }
    
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        if (pattern[y * 20 + x]) {
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }
    
    // Add corner markers
    const markerSize = blockSize * 3;
    ctx.fillRect(0, 0, markerSize, markerSize);
    ctx.fillRect(size - markerSize, 0, markerSize, markerSize);
    ctx.fillRect(0, size - markerSize, markerSize, markerSize);
    
    // Clear center of markers
    ctx.fillStyle = '#ffffff';
    const innerMarkerSize = blockSize;
    ctx.fillRect(blockSize, blockSize, innerMarkerSize, innerMarkerSize);
    ctx.fillRect(size - 2 * blockSize, blockSize, innerMarkerSize, innerMarkerSize);
    ctx.fillRect(blockSize, size - 2 * blockSize, innerMarkerSize, innerMarkerSize);
    
  }, [value, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className="border border-gray-300 rounded-lg"
    />
  );
}
