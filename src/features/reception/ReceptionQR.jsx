import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useQueue } from "../../store/QueueStore";
import { QrCode, MapPin } from "lucide-react";

export const ReceptionQR = () => {
  const { state } = useQueue();
  const hospitalId = state.currentUser?.hospitalId;
  const activeHospital = state.hospitals?.find(h => h.id === hospitalId);
  const hospitalName = activeHospital?.name || "Hospital";

  // Filter QR points strictly to this hospital
  const hospitalQRs = state.qrPoints?.filter(qr => qr.hospitalId === hospitalId) || [];

  const [selectedQR, setSelectedQR] = useState(null);

  const getQRUrl = (qr) => {
    const baseUrl = `${window.location.origin}/checkin`;
    const params = new URLSearchParams();
    params.set('hospitalId', qr.hospitalId);
    if (qr.departmentId) {
      params.set('departmentId', qr.departmentId);
    }
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">{hospitalName} QR Check-In Points</h1>
        <p className="text-muted">Manage and print QR codes for main entrances and specific departments.</p>
      </div>

      {hospitalQRs.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          No QR Check-In points configured for this hospital.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitalQRs.map(qr => (
            <Card key={qr.id} className="p-6 flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4">
                {qr.type === 'HOSPITAL' ? <MapPin size={32} /> : <QrCode size={32} />}
              </div>
              <h3 className="text-lg font-bold text-navy text-center mb-1">{qr.label}</h3>
              <p className="text-sm text-muted mb-6">
                {qr.type === 'HOSPITAL' ? 'Main Entrance Check-In' : 'Department Check-In'}
              </p>
              
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-6">
                <QRCodeSVG 
                  value={getQRUrl(qr)} 
                  size={120} 
                  level="M"
                  includeMargin={true}
                />
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-auto"
                onClick={() => setSelectedQR(qr)}
              >
                View & Print QR
              </Button>
            </Card>
          ))}
        </div>
      )}

      {selectedQR && (
        <Modal 
          isOpen={!!selectedQR} 
          onClose={() => setSelectedQR(null)} 
          title="Print QR Code"
          size="lg"
        >
          <div className="flex flex-col items-center justify-center p-8 bg-white" id="qr-print-area">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary text-white rounded flex items-center justify-center font-bold text-xl">
                  +
                </div>
                <span className="text-2xl font-bold text-navy">CareQueue</span>
              </div>
              <h2 className="text-3xl font-bold text-navy mb-2">{hospitalName}</h2>
              <h3 className="text-xl text-muted">{selectedQR.label} Check-In</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 mb-8">
              <QRCodeSVG 
                value={getQRUrl(selectedQR)} 
                size={300} 
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-center space-y-2 text-navy">
              <p className="text-xl font-medium">Scan this QR code with your phone camera</p>
              <p className="text-muted">You must have an active appointment or queue token to check in.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t mt-4">
            <Button variant="outline" onClick={() => setSelectedQR(null)}>Close</Button>
            <Button onClick={() => window.print()}>Print QR Poster</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
