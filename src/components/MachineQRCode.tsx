import { useRef } from "react";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import PixelButton from "@/components/PixelButton";
import { Download, Printer } from "lucide-react";

interface MachineQRCodeProps {
  machineId: string;
  machineName: string;
}

export const MachineQRCode = ({ machineId, machineName }: MachineQRCodeProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate the URL that the QR code will encode
  // This URL will be scanned by users to access the machine
  const qrValue = `${window.location.origin}/machine/${machineId}`;

  // Download QR code as PNG image
  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${machineName.replace(/\s+/g, "_")}_QR_${machineId}.png`;
    link.click();
  };

  // Print QR code
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=400,height=500");
    if (!printWindow) return;

    const canvas = qrRef.current?.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const qrImage = canvas.toDataURL("image/png");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${machineName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .container {
              text-align: center;
              border: 2px solid #000;
              padding: 30px;
              background: white;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 20px 0;
              font-weight: bold;
            }
            img {
              display: block;
              margin: 20px auto;
              max-width: 300px;
            }
            .machine-id {
              font-size: 14px;
              color: #666;
              margin-top: 20px;
            }
            @media print {
              body { padding: 0; }
              .container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${machineName}</h1>
            <img src="${qrImage}" alt="QR Code" />
            <p class="machine-id">Machine ID: ${machineId}</p>
            <p class="machine-id">Scan to view machine status and book</p>
          </div>
          <script>
            window.print();
            setTimeout(() => window.close(), 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card border-2 border-primary rounded-lg">
      {/* QR Code Display */}
      <div ref={qrRef} className="bg-white p-4 rounded-lg border border-gray-200">
        <QRCode
          value={qrValue}
          size={256}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#ffffff"
        />
      </div>

      {/* Machine Name */}
      <p className="font-pixel text-sm text-foreground">{machineName}</p>

      {/* Machine ID Info */}
      <p className="text-xs text-muted-foreground">ID: {machineId}</p>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full">
        <PixelButton
          size="sm"
          variant="secondary"
          className="flex-1 flex items-center justify-center gap-2"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </PixelButton>

        <PixelButton
          size="sm"
          variant="secondary"
          className="flex-1 flex items-center justify-center gap-2"
          onClick={handlePrint}
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print</span>
        </PixelButton>
      </div>

      {/* Info Text */}
      <p className="text-xs text-muted-foreground text-center">
        Users scan this QR code to access the machine status page
      </p>
    </div>
  );
};
