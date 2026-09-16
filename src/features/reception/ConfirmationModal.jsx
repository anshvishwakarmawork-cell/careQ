import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, modalData }) => {
  const [shiftPatients, setShiftPatients] = useState(false);
  const [newDate, setNewDate] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShiftPatients(false);
      setNewDate("");
    }
  }, [isOpen]);

  if (!isOpen || !modalData) return null;

  const { type, recipientCount, doctor } = modalData;

  const isCancel = type === "CANCEL";
  const isReschedule = type === "RESCHEDULE";
  const effectiveType = isCancel && shiftPatients ? "RESCHEDULE" : type;

  const handleConfirm = () => {
    if (effectiveType === "RESCHEDULE") {
      const targetDate = isReschedule ? modalData.newDate : newDate;
      if (!targetDate) {
        alert("Please select a new date.");
        return;
      }
      onConfirm({ effectiveType, newDate: targetDate });
    } else {
      onConfirm({ effectiveType });
    }
  };

  const getTitle = () => {
    if (effectiveType === "CANCEL") return "Confirm Cancellation";
    if (effectiveType === "RESCHEDULE") return "Confirm Reschedule";
    return "Confirm Alert";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-navy mb-4">{getTitle()}</h2>
          
          <div className="space-y-3 text-gray-700">
            <p>
              <span className="font-bold text-lg text-primary">{recipientCount}</span> 
              {effectiveType === "CANCEL" 
                ? " appointments will be cancelled." 
                : (effectiveType === "RESCHEDULE" || effectiveType === "TIME_CHANGE") 
                  ? " appointments will be rescheduled." 
                  : " patient(s) will receive this alert."}
            </p>
            <p>
              The affected {recipientCount === 1 ? 'patient' : 'patients'} will be notified via their portal.
            </p>
          </div>

          {isCancel && (
            <div className="mt-6 border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input 
                  type="checkbox" 
                  checked={shiftPatients} 
                  onChange={(e) => setShiftPatients(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="font-medium text-navy">Shift these patients to another date instead</span>
              </label>

              {shiftPatients && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 animate-in slide-in-from-top-2">
                  <p className="text-xs text-gray-500">
                    Dr. {doctor?.name} is typically available between {doctor?.todayHours?.start} and {doctor?.todayHours?.end}.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Select New Date</label>
                    <Input 
                      type="date" 
                      value={newDate} 
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setNewDate(e.target.value)} 
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {isReschedule && (
             <div className="mt-6 border-t pt-4">
                 <p className="text-sm text-gray-600">Appointments will be moved to <strong>{modalData.newDate}</strong>.</p>
             </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Go Back
          </Button>
          <Button onClick={handleConfirm}>
            Confirm & Notify
          </Button>
        </div>
      </div>
    </div>
  );
};
