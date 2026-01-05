
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Không thể truy cập camera. Vui lòng cấp quyền.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-500/30">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
            <div>
              <p className="mb-4">{error}</p>
              <button onClick={onClose} className="bg-indigo-600 px-6 py-2 rounded-full">Quay lại</button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Overlay indicators */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="w-full h-full border-2 border-dashed border-white/50 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center space-x-6">
        <button
          onClick={onClose}
          className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        
        <button
          disabled={!isCameraReady}
          onClick={capture}
          className={`p-6 bg-white text-indigo-600 rounded-full shadow-lg transition-transform active:scale-95 disabled:opacity-50`}
        >
          <Camera className="w-8 h-8" />
        </button>

        <button
          onClick={() => {
             // Basic refresh simulation
             if (videoRef.current && videoRef.current.srcObject) {
               const stream = videoRef.current.srcObject as MediaStream;
               stream.getTracks().forEach(track => track.stop());
             }
             startCamera();
          }}
          className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <p className="mt-6 text-white/70 text-sm font-medium">Căn chỉnh phiếu vào khung hình và bấm nút chụp</p>
    </div>
  );
};

export default CameraScanner;
