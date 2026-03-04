import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

interface UploadAreaProps {
  onImageSelected: (file: File) => void;
  isAnalyzing: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, isAnalyzing }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Unable to access camera. Please allow camera permissions or use the upload option.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onImageSelected(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageSelected(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="plant-upload"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Container */}
      <div
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden bg-slate-50
          ${preview ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'} 
          ${isAnalyzing ? 'opacity-75 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ minHeight: '320px' }}
      >
        
        {isCameraOpen ? (
          <div className="absolute inset-0 z-20 bg-black flex flex-col animate-fadeIn">
            {cameraError ? (
               <div className="flex-1 flex flex-col items-center justify-center text-white p-6 text-center">
                 <div className="bg-red-500/20 p-4 rounded-full mb-4">
                    <Camera size={32} className="text-red-500" />
                 </div>
                 <p className="mb-6">{cameraError}</p>
                 <button 
                   onClick={stopCamera}
                   className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-slate-200 transition-colors"
                 >
                   Close
                 </button>
               </div>
            ) : (
              <>
                <div className="relative flex-1 bg-black overflow-hidden">
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     muted
                     className="absolute inset-0 w-full h-full object-cover"
                     onLoadedMetadata={() => videoRef.current?.play()}
                   />
                </div>
                <div className="h-24 bg-black/80 flex items-center justify-around px-8 shrink-0 backdrop-blur-sm">
                  <button 
                    onClick={stopCamera}
                    className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <button 
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 active:scale-95 transition-all"
                  >
                    <div className="w-12 h-12 bg-white rounded-full shadow-lg"></div>
                  </button>
                  <div className="w-12"></div> {/* Spacer for alignment */}
                </div>
              </>
            )}
          </div>
        ) : preview ? (
          <div className="relative w-full h-full min-h-[320px] bg-black/5 flex items-center justify-center">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-[400px] w-full object-contain"
            />
            {!isAnalyzing && (
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur text-slate-600 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                <p className="font-semibold text-lg tracking-wide">Analyzing Crop Health...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] p-8">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4">
              <Camera size={32} />
            </div>
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-xl font-semibold text-slate-800">
                Upload or Take a Photo
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Drag and drop an image here, or use the buttons below.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
               <button 
                 onClick={triggerFileInput}
                 className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium shadow-sm hover:border-emerald-400 hover:text-emerald-600 transition-all flex items-center gap-2 group"
               >
                 <ImageIcon size={20} className="group-hover:scale-110 transition-transform" /> 
                 Upload from Gallery
               </button>
               <button 
                 onClick={startCamera}
                 className="px-6 py-3 bg-emerald-600 text-white border border-transparent rounded-xl font-medium shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2 hover:shadow-lg group"
               >
                 <Camera size={20} className="group-hover:scale-110 transition-transform" /> 
                 Take Photo
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadArea;