import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";

export const EmergencyRequestForm = ({ hospital, department, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patientName: "",
    dob: "",
    mobile: "",
    emergencyType: "",
    description: "",
    timeStarted: "",
    conscious: "",
    breathing: "",
    bleeding: "",
    mobility: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    allergy: "",
    criticalCondition: "",
    acknowledged: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-red-50 border-red-200 p-4 flex gap-3 items-start text-left">
        <AlertCircle className="text-red-600 shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-bold text-red-900 text-lg mb-1">Emergency Notice</h3>
          <p className="text-red-800 text-sm mb-2 font-medium">CareQueue is not a substitute for emergency medical services.</p>
          <p className="text-red-700 text-xs mb-2">If the patient may be experiencing a life-threatening emergency, do not wait for confirmation through CareQueue. Contact local emergency services or proceed directly to the nearest emergency department.</p>
          <p className="text-red-700 text-xs font-semibold">Submitting this form only sends an emergency coordination request to the selected hospital.</p>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8 text-left">
        <section>
          <h2 className="text-xl font-bold text-navy mb-4 border-b pb-2">Patient Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Patient Name <span className="text-red-500">*</span></label>
              <Input required name="patientName" value={formData.patientName} onChange={handleChange} placeholder="Enter patient's full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Date of Birth <span className="text-red-500">*</span></label>
              <Input type="date" required name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Mobile Number <span className="text-red-500">*</span></label>
              <Input type="tel" required name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter contact number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Selected Hospital</label>
                <div className="p-3 bg-gray-50 border rounded-lg text-gray-700 font-medium">{hospital?.name || "Unknown"}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Selected Department</label>
                <div className="p-3 bg-gray-50 border rounded-lg text-gray-700 font-medium">{department?.name || "Unknown"}</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-4 border-b pb-2">Emergency Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Emergency Type <span className="text-red-500">*</span></label>
              <Select required name="emergencyType" value={formData.emergencyType} onChange={handleChange}>
                <option value="">Select emergency type...</option>
                <option value="Chest Pain">Chest Pain</option>
                <option value="Breathing Difficulty">Breathing Difficulty</option>
                <option value="Severe Bleeding">Severe Bleeding</option>
                <option value="Accident / Injury">Accident / Injury</option>
                <option value="Unconscious / Fainting">Unconscious / Fainting</option>
                <option value="Severe Allergic Reaction">Severe Allergic Reaction</option>
                <option value="High Fever / Seizure">High Fever / Seizure</option>
                <option value="Pregnancy-Related Emergency">Pregnancy-Related Emergency</option>
                <option value="Severe Pain">Severe Pain</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            
            {formData.emergencyType === "Other" && (
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Please briefly describe the emergency <span className="text-red-500">*</span></label>
                <Input required name="description" value={formData.description} onChange={handleChange} placeholder="Briefly describe what is happening" />
              </div>
            )}
            
            {formData.emergencyType !== "Other" && (
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Short Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Briefly describe what is happening"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[80px]"
                />
                <p className="text-xs text-muted mt-1">Keep this short. Detailed medical history is not required here.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-navy mb-1">When did it start?</label>
              <Select name="timeStarted" value={formData.timeStarted} onChange={handleChange}>
                <option value="">Select time...</option>
                <option value="Just now">Just now</option>
                <option value="Less than 30 minutes ago">Less than 30 minutes ago</option>
                <option value="30–60 minutes ago">30–60 minutes ago</option>
                <option value="More than 1 hour ago">More than 1 hour ago</option>
                <option value="Not sure">Not sure</option>
              </Select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-4 border-b pb-2">Quick Safety Questions</h2>
          <div className="space-y-4">
            {['conscious', 'breathing', 'bleeding', 'mobility'].map(field => {
              const labels = {
                conscious: "Is the patient conscious?",
                breathing: "Is the patient breathing normally?",
                bleeding: "Is there severe bleeding?",
                mobility: "Can the patient walk or move without assistance?"
              };
              return (
                <div key={field}>
                  <label className="block text-sm font-semibold text-navy mb-2">{labels[field]}</label>
                  <div className="flex gap-4">
                    {['Yes', 'No', 'Not sure'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name={field} 
                          value={opt} 
                          checked={formData[field] === opt} 
                          onChange={handleChange}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <details className="group border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
          <summary className="font-bold text-navy p-4 cursor-pointer select-none">Additional Information (Optional)</summary>
          <div className="p-4 pt-0 space-y-4 bg-white border-t border-gray-100">
            <p className="text-xs text-muted mb-2">Only include information that may be immediately relevant.</p>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Emergency Contact Name</label>
              <Input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Emergency Contact Number</label>
              <Input name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Known Major Allergy</label>
              <Input name="allergy" value={formData.allergy} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Known Critical Medical Condition</label>
              <Input name="criticalCondition" value={formData.criticalCondition} onChange={handleChange} />
            </div>
          </div>
        </details>

        <section className="pt-4 border-t">
          <label className="flex items-start gap-3 cursor-pointer p-4 bg-red-50 rounded-xl border border-red-100 mb-6">
            <input 
              type="checkbox" 
              name="acknowledged"
              required
              checked={formData.acknowledged}
              onChange={handleChange}
              className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-red-900">
              I understand that CareQueue does not replace emergency medical services and that this request must be reviewed by the hospital.
            </span>
          </label>
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1 py-4 text-lg" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={!formData.acknowledged} className="flex-2 w-2/3 bg-red-600 hover:bg-red-700 text-white py-4 font-bold text-lg">
              Submit Emergency Request
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
};
