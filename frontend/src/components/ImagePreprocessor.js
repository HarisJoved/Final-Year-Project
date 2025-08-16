import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, RotateCw, Crop, Image as ImageIcon, Eye, EyeOff, Zap } from 'lucide-react';

const ImagePreprocessor = ({ image, onPreprocessingChange, onProcess }) => {
  const [rotation, setRotation] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [enhanceContrast, setEnhanceContrast] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropData, setCropData] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (image) {
      drawImage();
    }
  }, [image, rotation, grayscale, enhanceContrast, cropData]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply transformations
      ctx.save();
      
      // Move to center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Apply filters
      if (grayscale) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;     // red
          data[i + 1] = gray; // green
          data[i + 2] = gray; // blue
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      if (enhanceContrast) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const factor = 1.5;
        
        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * (data[i] - 128) + 128;     // red
          data[i + 1] = factor * (data[i + 1] - 128) + 128; // green
          data[i + 2] = factor * (data[i + 2] - 128) + 128; // blue
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      ctx.restore();
      
      // Draw crop overlay if in crop mode
      if (cropMode && cropStart && cropEnd) {
        drawCropOverlay(ctx);
      }
    };
    
    img.src = image;
  };

  const drawCropOverlay = (ctx) => {
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Clear crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(x, y, width, height);
    ctx.globalCompositeOperation = 'source-over';
    
    // Crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Corner handles
    const handleSize = 8;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
  };

  const handleMouseDown = (e) => {
    if (!cropMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsCropping(true);
  };

  const handleMouseMove = (e) => {
    if (!cropMode || !isCropping) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (!cropMode) return;
    
    setIsCropping(false);
    
    if (cropStart && cropEnd) {
      const x = Math.min(cropStart.x, cropEnd.x);
      const y = Math.min(cropStart.y, cropEnd.y);
      const width = Math.abs(cropEnd.x - cropStart.x);
      const height = Math.abs(cropEnd.y - cropStart.y);
      
      if (width > 10 && height > 10) {
        setCropData({ x, y, width, height });
      }
    }
  };

  const applyCrop = () => {
    if (!cropData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(cropData.x, cropData.y, cropData.width, cropData.height);
    
    // Create new canvas with cropped size
    const newCanvas = document.createElement('canvas');
    newCanvas.width = cropData.width;
    newCanvas.height = cropData.height;
    const newCtx = newCanvas.getContext('2d');
    newCtx.putImageData(imageData, 0, 0);
    
    // Convert to data URL
    const croppedImage = newCanvas.toDataURL('image/png');
    
    // Update the image source
    imageRef.current.src = croppedImage;
    
    // Reset crop mode
    setCropMode(false);
    setCropData(null);
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 0, y: 0 });
  };

  const cancelCrop = () => {
    setCropMode(false);
    setCropData(null);
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 0, y: 0 });
  };

  const resetPreprocessing = () => {
    setRotation(0);
    setGrayscale(false);
    setEnhanceContrast(false);
    setCropMode(false);
    setCropData(null);
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 0, y: 0 });
  };

  const getPreprocessingOptions = () => {
    const options = {
      rotation,
      grayscale,
      enhance_contrast: enhanceContrast
    };
    
    if (cropData) {
      options.crop = cropData;
    }
    
    return options;
  };

  useEffect(() => {
    onPreprocessingChange(getPreprocessingOptions());
  }, [rotation, grayscale, enhanceContrast, cropData]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        {/* Rotation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRotation((prev) => (prev - 90) % 360)}
            className="btn-secondary flex items-center space-x-2"
            title="Rotate Left"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rotate Left</span>
          </button>
          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="btn-secondary flex items-center space-x-2"
            title="Rotate Right"
          >
            <RotateCw className="w-4 h-4" />
            <span>Rotate Right</span>
          </button>
        </div>

        {/* Crop Control */}
        <button
          onClick={() => setCropMode(!cropMode)}
          className={`flex items-center space-x-2 ${
            cropMode ? 'btn-primary' : 'btn-secondary'
          }`}
          title="Crop Image"
        >
          <Crop className="w-4 h-4" />
          <span>Crop</span>
        </button>

        {/* Grayscale Toggle */}
        <button
          onClick={() => setGrayscale(!grayscale)}
          className={`flex items-center space-x-2 ${
            grayscale ? 'btn-primary' : 'btn-secondary'
          }`}
          title="Convert to Grayscale"
        >
          {grayscale ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>Grayscale</span>
        </button>

        {/* Contrast Enhancement */}
        <button
          onClick={() => setEnhanceContrast(!enhanceContrast)}
          className={`flex items-center space-x-2 ${
            enhanceContrast ? 'btn-primary' : 'btn-secondary'
          }`}
          title="Enhance Contrast"
        >
          <Zap className="w-4 h-4" />
          <span>Enhance Contrast</span>
        </button>

        {/* Reset */}
        <button
          onClick={resetPreprocessing}
          className="btn-secondary"
          title="Reset All Changes"
        >
          Reset
        </button>
      </div>

      {/* Image Display */}
      <div className="flex justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`border border-gray-300 dark:border-gray-600 rounded-lg ${
              cropMode ? 'cursor-crosshair' : 'cursor-default'
            }`}
            style={{ maxWidth: '100%', maxHeight: '500px' }}
          />
          
          {/* Hidden image for reference */}
          <img
            ref={imageRef}
            src={image}
            alt="Original"
            className="hidden"
          />
        </div>
      </div>

      {/* Crop Actions */}
      {cropMode && cropData && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={applyCrop}
            className="btn-primary"
          >
            Apply Crop
          </button>
          <button
            onClick={cancelCrop}
            className="btn-secondary"
          >
            Cancel Crop
          </button>
        </div>
      )}

      {/* Instructions */}
      {cropMode && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Click and drag to select the area you want to crop
        </div>
      )}
    </div>
  );
};

export default ImagePreprocessor;
