
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X, Zap } from 'lucide-react';

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
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Không thể truy cập camera. Hãy đảm bảo bạn đã cấp quyền và sử dụng HTTPS.");
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
        const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      {/* HUD Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center space-x-2 text-white">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-widest">Live Scanner AI</span>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="relative w-full h-full max-w-4xl flex items-center justify-center">
        {error ? (
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 text-center max-w-sm mx-4">
             <Zap className="w-12 h-12 text-amber-400 mx-auto mb-4" />
             <p className="text-white font-medium mb-6">{error}</p>
             <button onClick={onClose} className="w-full bg-white text-black py-3 rounded-full font-bold">Thoát</button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-20">
              <div className="w-full h-full max-w-lg aspect-[3/4.5] border-2 border-white/30 rounded-3xl relative overflow-hidden">
                {/* Laser Scanline Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/80 shadow-[0_0_15px_rgba(79,70,229,1)] animate-[scan_3s_linear_infinite]"></div>
                
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl"></div>
                
                {/* Instruction Text */}
                <div className="absolute bottom-8 left-0 w-full text-center px-4">
                  <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 px-4 rounded-full border border-white/10">
                    Căn chỉnh phiếu vào khung
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center space-x-12">
        <button
          onClick={() => {
             if (videoRef.current && videoRef.current.srcObject) {
               const stream = videoRef.current.srcObject as MediaStream;
               stream.getTracks().forEach(track => track.stop());
             }
             startCamera();
          }}
          className="p-5 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
        >
          <RefreshCw className="w-6 h-6" />
        </button>

        <button
          disabled={!isCameraReady}
          onClick={capture}
          className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-90 transition-all disabled:opacity-50"
        >
          <div className="w-20 h-20 rounded-full border-4 border-black/5 flex items-center justify-center">
             <Camera className="w-10 h-10 text-indigo-600" />
          </div>
        </button>

        <div className="w-16 h-16"></div> {/* Spacer for balance */}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

export default CameraScanner;
