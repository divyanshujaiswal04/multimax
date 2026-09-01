import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, Image, AlertCircle, RefreshCw } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const extractCode = (decodedText: string): string => {
    try {
      if (decodedText.includes("code=")) {
        const url = new URL(decodedText);
        const code = url.searchParams.get("code");
        if (code) return code.toUpperCase();
      }
      const match = decodedText.match(/MAX-[0-9A-Z]{4,6}/i);
      if (match) {
        return match[0].toUpperCase();
      }
      return decodedText.trim().toUpperCase();
    } catch {
      return decodedText.trim().toUpperCase();
    }
  };

  const startScanner = async () => {
    setErrorMsg(null);
    setIsScanning(true);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader-container");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          const code = extractCode(decodedText);
          stopScanner();
          onScanSuccess(code);
        },
        (errorMessage) => {
          // ignore scan frame errors
        }
      );
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      setErrorMsg(
        err?.message || "Camera access was denied or not available. You can upload a QR image or enter code manually."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        // ignore cleanup error
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader-container");
      const decodedText = await html5QrCode.scanFile(file, true);
      const code = extractCode(decodedText);
      onScanSuccess(code);
    } catch (err) {
      setErrorMsg("Could not detect a valid MultiMax QR code in this image. Please try another.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0e101a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Camera className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Scan MultiMax QR</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Point camera at the room host's screen
        </p>

        {/* Video stream container */}
        <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-dashed border-indigo-500/40 flex items-center justify-center">
          <div id="qr-reader-container" className="w-full h-full" />

          {/* Scanner aiming crosshair */}
          <div className="absolute inset-4 pointer-events-none border-2 border-indigo-400/50 rounded-xl flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Alternative: Image File Upload */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-3">
          <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-all">
            <Image className="w-4 h-4 text-purple-400" />
            <span>Scan from Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {errorMsg && (
            <button
              onClick={startScanner}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-500/30 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Camera</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
