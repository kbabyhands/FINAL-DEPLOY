
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode, Share } from 'lucide-react';

interface QRCodeGeneratorProps {
  restaurantId: string;
  restaurantName: string;
}

const QRCodeGenerator = ({ restaurantId, restaurantName }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [restaurantId]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      // Generate QR code that points to the main menu page
      const menuUrl = `${window.location.origin}/`;
      const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `${restaurantName.replace(/\s+/g, '_')}_menu_qr_code.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareViaText = () => {
    const menuUrl = `${window.location.origin}/`;
    const message = `Check out ${restaurantName}'s digital menu! Scan the QR code or visit: ${menuUrl}`;
    
    // Try to use Web Share API first (mobile-friendly)
    if (navigator.share) {
      navigator.share({
        title: `${restaurantName} Menu`,
        text: message,
        url: menuUrl
      }).catch(err => {
        console.log('Share failed:', err);
        // Fallback to SMS
        fallbackToSMS(message);
      });
    } else {
      // Fallback to SMS
      fallbackToSMS(message);
    }
  };

  const fallbackToSMS = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const smsUrl = `sms:?body=${encodedMessage}`;
    window.open(smsUrl, '_self');
  };

  const printQRCode = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${restaurantName} - Menu QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                border: 1px solid #ccc;
                padding: 20px;
                border-radius: 8px;
              }
              h1 {
                margin-bottom: 10px;
                color: #1f2937;
              }
              p {
                margin-bottom: 20px;
                color: #6b7280;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>${restaurantName}</h1>
              <p>Scan to view our digital menu</p>
              <img src="${qrCodeUrl}" alt="Menu QR Code" />
              <p style="margin-top: 20px; font-size: 12px;">Point your camera at this QR code to access our menu</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Menu QR Code
          </CardTitle>
          <CardDescription>Generate QR code for easy menu access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Menu QR Code
        </CardTitle>
        <CardDescription>
          Let customers scan this QR code to access your digital menu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border">
            <img 
              src={qrCodeUrl} 
              alt="Menu QR Code" 
              className="w-64 h-64"
            />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Customers can scan this code with their phone camera to view your menu
          </p>
          <p className="text-xs text-gray-500">
            Menu URL: {window.location.origin}/
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={downloadQRCode} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={shareViaText} variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share via Text
          </Button>
          <Button onClick={printQRCode} variant="outline">
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
