"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  FiImage, FiCrop, FiRotateCw, FiRotateCcw, 
  FiMaximize, FiSliders, FiCheck, FiX 
} from 'react-icons/fi';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './media.css';

interface ImageEditorProps {
  imageUrl: string;
  imageName: string;
  onSave?: (editedImageData: EditedImageData) => void;
  onCancel?: () => void;
}

export interface EditedImageData {
  name: string;
  dataUrl: string;
  originalUrl: string;
  edits: {
    crop?: PixelCrop;
    rotation: number;
    brightness: number;
    contrast: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
  };
}

const ImageEditor: React.FC<ImageEditorProps> = ({ 
  imageUrl, 
  imageName, 
  onSave, 
  onCancel 
}) => {
  // Image reference
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Editor state
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [flipVertical, setFlipVertical] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust'>('crop');
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImageLoaded(true);
    };
  }, [imageUrl]);
  
  // Apply edits to canvas when they change
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const image = imageRef.current;
    
    // Set canvas dimensions
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Set the origin to the center of the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply flips
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    
    // Draw the image centered
    ctx.drawImage(
      image,
      -image.naturalWidth / 2,
      -image.naturalHeight / 2,
      image.naturalWidth,
      image.naturalHeight
    );
    
    // Restore context state
    ctx.restore();
    
    // Apply brightness and contrast
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const brightnessValue = (brightness - 100) / 100 * 255;
    const contrastFactor = (contrast / 100) ** 2;
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness
      data[i] = Math.min(255, Math.max(0, data[i] + brightnessValue));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightnessValue));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightnessValue));
      
      // Apply contrast
      data[i] = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * contrastFactor + 0.5) * 255));
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] / 255 - 0.5) * contrastFactor + 0.5) * 255));
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] / 255 - 0.5) * contrastFactor + 0.5) * 255));
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [imageLoaded, rotation, brightness, contrast, flipHorizontal, flipVertical]);
  
  // Handle save
  const handleSave = () => {
    if (!canvasRef.current || !onSave) return;
    
    const canvas = canvasRef.current;
    
    // If crop is active, apply the crop
    if (completedCrop && isCropping) {
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      
      if (!croppedCtx) return;
      
      // Set cropped canvas dimensions
      croppedCanvas.width = completedCrop.width;
      croppedCanvas.height = completedCrop.height;
      
      // Draw the cropped image
      croppedCtx.drawImage(
        canvas,
        completedCrop.x,
        completedCrop.y,
        completedCrop.width,
        completedCrop.height,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      
      // Get data URL
      const dataUrl = croppedCanvas.toDataURL('image/jpeg', 0.95);
      
      // Create edited image data
      const editedImageData: EditedImageData = {
        name: `edited-${imageName}`,
        dataUrl,
        originalUrl: imageUrl,
        edits: {
          crop: completedCrop,
          rotation,
          brightness,
          contrast,
          flipHorizontal,
          flipVertical,
        },
      };
      
      onSave(editedImageData);
    } else {
      // Get data URL without cropping
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      // Create edited image data
      const editedImageData: EditedImageData = {
        name: `edited-${imageName}`,
        dataUrl,
        originalUrl: imageUrl,
        edits: {
          rotation,
          brightness,
          contrast,
          flipHorizontal,
          flipVertical,
        },
      };
      
      onSave(editedImageData);
    }
  };
  
  // Reset edits
  const resetEdits = () => {
    setCrop({
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0
    });
    setCompletedCrop(null);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setIsCropping(false);
  };
  
  return (
    <div className="media-editor">
      <div className="media-editor-container">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FiImage className="mr-2 text-white/80" size={20} />
            <h3 className="media-editor-title">Edit Image</h3>
          </div>
          <div className="text-sm text-white/60">
            {imageName}
          </div>
        </div>
        
        {/* Editor tabs */}
        <div className="flex border-b border-white/10 mb-4">
          <button
            onClick={() => setActiveTab('crop')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'crop' ? 'text-white border-b-2 border-gray-500' : 'text-white/60 hover:text-white/80'
            }`}
          >
            <FiCrop className="inline mr-1" />
            Crop & Transform
          </button>
          <button
            onClick={() => setActiveTab('adjust')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'adjust' ? 'text-white border-b-2 border-gray-500' : 'text-white/60 hover:text-white/80'
            }`}
          >
            <FiSliders className="inline mr-1" />
            Adjust
          </button>
        </div>
        
        {/* Editor content */}
        <div className="media-editor-content">
          {/* Hidden image for reference */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Original"
            className="hidden"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Canvas for displaying edited image */}
          <div className="relative">
            {isCropping ? (
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={undefined}
              >
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto mx-auto"
                  style={{
                    maxHeight: '60vh',
                    display: imageLoaded ? 'block' : 'none',
                  }}
                />
              </ReactCrop>
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto mx-auto"
                style={{
                  maxHeight: '60vh',
                  display: imageLoaded ? 'block' : 'none',
                }}
              />
            )}
            
            {!imageLoaded && (
              <div className="flex items-center justify-center h-60">
                <p className="text-white/60">Loading image...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Editor controls */}
        <div className="mt-4 border-t border-white/10 pt-4">
          {activeTab === 'crop' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">Crop</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsCropping(!isCropping)}
                    className={`media-control-button ${isCropping ? 'bg-white/20' : ''}`}
                  >
                    {isCropping ? <FiCheck className="mr-1" /> : <FiCrop className="mr-1" />}
                    {isCropping ? 'Finish Crop' : 'Start Crop'}
                  </button>
                  {isCropping && (
                    <button
                      onClick={() => {
                        setCrop({
                          unit: '%',
                          width: 100,
                          height: 100,
                          x: 0,
                          y: 0
                        });
                        setCompletedCrop(null);
                      }}
                      className="media-control-button"
                    >
                      <FiMaximize className="mr-1" />
                      Reset Crop
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/80 mb-1">Rotation</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setRotation(prev => prev - 90)}
                    className="media-control-button"
                  >
                    <FiRotateCcw className="mr-1" />
                    -90°
                  </button>
                  <button
                    onClick={() => setRotation(prev => prev + 90)}
                    className="media-control-button"
                  >
                    <FiRotateCw className="mr-1" />
                    +90°
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/80 mb-1">Flip</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFlipHorizontal(!flipHorizontal)}
                    className={`media-control-button ${flipHorizontal ? 'bg-white/20' : ''}`}
                  >
                    Horizontal
                  </button>
                  <button
                    onClick={() => setFlipVertical(!flipVertical)}
                    className={`media-control-button ${flipVertical ? 'bg-white/20' : ''}`}
                  >
                    Vertical
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/80 mb-1">Reset</label>
                <button
                  onClick={resetEdits}
                  className="media-control-button"
                >
                  Reset All
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'adjust' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-white/80">Brightness</label>
                  <span className="text-sm text-white/60">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-white/80">Contrast</label>
                  <span className="text-sm text-white/60">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <button
                  onClick={() => {
                    setBrightness(100);
                    setContrast(100);
                  }}
                  className="media-control-button"
                >
                  Reset Adjustments
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Editor actions */}
        <div className="media-editor-actions mt-4">
          <button
            onClick={onCancel}
            className="media-editor-button-cancel"
          >
            <FiX className="mr-1" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="media-editor-button-apply"
          >
            <FiCheck className="mr-1" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
