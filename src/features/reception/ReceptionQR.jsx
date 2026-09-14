import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "../../components/ui/Card";

export const ReceptionQR = () => {
  const checkInUrl = `${window.location.origin}/checkin`;

  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-navy mb-2">Patient Check-In</h1>
        <p className="text-xl text-muted">Scan the QR code to check in for your appointment or join the walk-in queue</p>
      </div>

      <Card className="p-8 bg-white flex flex-col items-center">
        <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
          <QRCodeSVG 
            value={checkInUrl} 
            size={400} 
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="mt-8 text-2xl font-bold tracking-widest text-primary">
          MEDIQUEUE
        </p>
      </Card>
      
      <p className="mt-8 text-muted text-center max-w-md">
        In a real hospital setting, this QR code would rotate automatically for security, and scanning it would geofence the patient's location.
      </p>
    </div>
  );
};
