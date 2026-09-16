import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Toast } from "../ui/Toast";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const QueueTable = ({ entries, showActions = false, className, ...props }) => {
  const { state, dispatch } = useQueue();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferEntry, setTransferEntry] = useState(null);
  const [targetDoctor, setTargetDoctor] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const activeDoctors = state.doctors.filter(d => d.status !== "UNAVAILABLE");

  const openTransfer = (entry) => {
    setTransferEntry(entry);
    setTargetDoctor("");
    setTransferError("");
    setTransferModalOpen(true);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!targetDoctor || !transferEntry) return;

    if (transferEntry.doctorId === targetDoctor) {
      setTransferError("Patient is already assigned to this doctor.");
      return;
    }
    
    if (transferEntry.status === "COMPLETED" || transferEntry.status === "CANCELLED") {
      setTransferError("Cannot transfer a completed or cancelled patient.");
      return;
    }

    if (transferEntry.status === "IN_CONSULTATION") {
      setTransferError("Cannot automatically transfer a patient currently in consultation.");
      return;
    }

    setIsTransferring(true);
    setTransferError("");

    // Use a small timeout to simulate async behavior and let the "Transferring..." UI show
    setTimeout(() => {
      dispatch({
        type: ACTIONS.TRANSFER,
        payload: { entryId: transferEntry.id, toDoctorId: targetDoctor }
      });
      
      const targetDoc = state.doctors.find(d => d.id === targetDoctor);
      setTransferSuccess(`${transferEntry.patientName} was transferred successfully to ${targetDoc.name}.`);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setTransferSuccess(""), 3000);

      setIsTransferring(false);
      setTransferModalOpen(false);
      setTransferEntry(null);
    }, 500);
  };

  return (
    <div className={cn("overflow-x-auto", className)} {...props}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-sm text-muted">
            <th className="py-3 px-4 font-medium">Token</th>
            <th className="py-3 px-4 font-medium">Patient</th>
            <th className="py-3 px-4 font-medium">Priority</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium">Wait Time</th>
            {showActions && <th className="py-3 px-4 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="text-sm">
          {entries.map(entry => {
            const waitMins = Math.floor((new Date() - new Date(entry.joinedAt)) / 60000);
            return (
              <tr key={entry.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-bold text-navy">{entry.tokenNumber}</td>
                <td className="py-3 px-4">{entry.patientName}</td>
                <td className="py-3 px-4">
                  <Badge variant={entry.priority === 'EMERGENCY' ? 'danger' : entry.priority === 'URGENT' ? 'warning' : 'primary'}>
                    {entry.priority}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  {entry.checkedIn ? <span className="text-status-success font-medium">Checked In</span> : <span className="text-muted">Waiting</span>}
                </td>
                <td className="py-3 px-4 text-muted">{waitMins}m</td>
                {showActions && (
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => openTransfer(entry)}>Transfer</Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {transferModalOpen && transferEntry && (
        <Modal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} title="Transfer Patient">
          <form onSubmit={handleTransfer} className="space-y-4 mt-2">
            <p className="text-sm text-navy mb-4">
              Transferring token <strong>{transferEntry.tokenNumber}</strong> ({transferEntry.patientName})
            </p>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Select Target Doctor</label>
              <Select required value={targetDoctor} onChange={(e) => {
                setTargetDoctor(e.target.value);
                setTransferError(""); // clear error on change
              }}>
                <option value="">Select Doctor...</option>
                {activeDoctors.filter(d => d.id !== transferEntry.doctorId).map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.specialization || d.department ? ` — ${d.specialization || d.department}` : ''}
                  </option>
                ))}
              </Select>
              {transferError && (
                <p className="text-status-error text-sm mt-2">{transferError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setTransferModalOpen(false)} disabled={isTransferring}>Cancel</Button>
              <Button type="submit" disabled={isTransferring}>
                {isTransferring ? 'Transferring...' : 'Transfer Patient'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {transferSuccess && (
        <Toast 
          message={transferSuccess} 
          type="success" 
          onClose={() => setTransferSuccess("")} 
        />
      )}
    </div>
  );
};
