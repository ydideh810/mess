import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (data: { id: string; name: string; publicKey: string }) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            const data = JSON.parse(result.data);
            if (data.id && data.name && data.publicKey) {
              onScan(data);
              onClose();
            } else {
              setError('Invalid QR code format');
            }
          } catch (err) {
            setError('Failed to parse QR code');
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scannerRef.current.start().catch((err) => {
        setError('Failed to access camera');
        console.error(err);
      });
    }

    return () => {
      scannerRef.current?.destroy();
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-[#00ff9d] rounded-lg p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="terminal-text text-xs">SCAN QR CODE</h3>
          <button
            onClick={onClose}
            className="terminal-button p-1"
            aria-label="Close scanner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative aspect-square border border-[#00ff9d] rounded overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <p className="terminal-text text-[10px] text-red-500">{error}</p>
            </div>
          )}
        </div>

        <p className="terminal-text text-[8px] text-[#00ff9d]/70 mt-2">
          Position the QR code within the frame to scan
        </p>
      </div>
    </div>
  );
}