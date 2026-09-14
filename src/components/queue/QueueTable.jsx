import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const QueueTable = ({ entries, showActions = false, className, ...props }) => {
  const { state, dispatch } = useQueue();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferEntry, setTransferEntry] = useState(null);
  const [targetDoctor, setTargetDoctor] = useState("");

  const activeDoctors = state.doctors.filter(d => d.status !== "UNAVAILABLE");

  const openTransfer = (entry) => {
    setTransferEntry(entry);
    setTargetDoctor("");
    setTransferModalOpen(true);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!targetDoctor || !transferEntry) return;

    dispatch({
      type: ACTIONS.TRANSFER,
      payload: { entryId: transferEntry.id, toDoctorId: targetDoctor }
    });
    setTransferModalOpen(false);
    setTransferEntry(null);
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
              <Select required value={targetDoctor} onChange={(e) => setTargetDoctor(e.target.value)}>
                <option value="">Select Doctor...</option>
                {activeDoctors.filter(d => d.id !== transferEntry.doctorId).map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setTransferModalOpen(false)}>Cancel</Button>
              <Button type="submit">Transfer Patient</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
