import React from 'react';
import { QrCode, Copy, Download } from 'lucide-react';

interface ProfileQRCodeProps {
  qrCode: string;
  publicKey: string;
}

export function ProfileQRCode({ qrCode, publicKey }: ProfileQRCodeProps) {
  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
    } catch (error) {
      console.error('Failed to copy public key:', error);
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'saxiib-contact.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 border border-[#00ff9d] rounded-lg bg-black/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="terminal-text text-xs">YOUR CONTACT QR CODE</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopyKey}
            className="terminal-button p-1"
            aria-label="Copy public key"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownloadQR}
            className="terminal-button p-1"
            aria-label="Download QR code"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <img
          src={qrCode}
          alt="Contact QR Code"
          className="w-48 h-48"
        />
      </div>

      <div className="space-y-1">
        <p className="terminal-text text-[8px] text-[#00ff9d]/70">
          PUBLIC KEY:
        </p>
        <p className="terminal-text text-[10px] break-all">
          {publicKey}
        </p>
      </div>
    </div>
  );
}