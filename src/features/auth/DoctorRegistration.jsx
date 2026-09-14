import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Stepper } from "../../components/ui/Stepper";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { 
  validateName, validateMobile, validateEmail, validatePassword, 
  validatePasswordMatch, validateRequired 
} from "../../lib/validators";
import { departments } from "../../data/departments";
import { hospitals } from "../../data/hospitals";

export const DoctorRegistration = () => {
  const navigate = useNavigate();
  const { dispatch } = useQueue();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "", mobile: "", email: "",
    registrationNumber: "", specialization: "", experience: "",
    hospitalId: "", departmentId: "",
    password: "", confirmPassword: "", confirmAccuracy: false, agreeTerms: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const steps = ["Basic Info", "Professional", "Hospital", "Security"];

  const validateStep = (currentStep) => {
    let newErrors = {};
    if (currentStep === 0) {
      newErrors.name = validateName(formData.name);
      newErrors.mobile = validateMobile(formData.mobile);
      newErrors.email = validateEmail(formData.email);
    } else if (currentStep === 1) {
      newErrors.registrationNumber = validateRequired(formData.registrationNumber, "Registration number");
      newErrors.specialization = validateRequired(formData.specialization, "Specialization");
    } else if (currentStep === 2) {
      newErrors.hospitalId = validateRequired(formData.hospitalId, "Hospital");
      newErrors.departmentId = validateRequired(formData.departmentId, "Department");
    } else if (currentStep === 3) {
      newErrors.password = validatePassword(formData.password);
      newErrors.confirmPassword = validatePasswordMatch(formData.password, formData.confirmPassword);
      newErrors.confirmAccuracy = formData.confirmAccuracy ? null : "You must confirm accuracy.";
      newErrors.agreeTerms = formData.agreeTerms ? null : "You must agree to the terms.";
    }

    const cleanErrors = Object.fromEntries(Object.entries(newErrors).filter(([_, v]) => v !== null));
    setErrors(cleanErrors);
    return Object.keys(cleanErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      const newDoctor = {
        id: `D${Date.now()}`,
        name: formData.name.startsWith("Dr.") ? formData.name : `Dr. ${formData.name}`,
        specialization: formData.specialization,
        departmentId: formData.departmentId,
        hospitalId: formData.hospitalId,
        room: "TBD",
        avgConsultationMin: 10,
        status: "AVAILABLE",
        delayMinutes: 0,
        queuePaused: false,
        todayHours: { start: "09:00", end: "17:00" },
        photoInitials: formData.name.substring(0, 2).toUpperCase()
      };
      
      const newUser = {
        id: `U${Date.now()}`,
        name: newDoctor.name,
        email: formData.email,
        password: formData.password,
        role: "DOCTOR",
        verified: false,
        doctorId: newDoctor.id
      };

      dispatch({ type: ACTIONS.REGISTER_DOCTOR, payload: { user: newUser, doctor: newDoctor } });
      dispatch({ type: ACTIONS.LOGIN, payload: newUser });
      navigate("/doctor/verification");
    }
  };

  return (
    <div className="min-h-screen bg-section py-8 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy">Create Doctor Account</h1>
          <p className="text-muted">Register your professional profile to use CareQueue.</p>
        </div>

        <Stepper currentStep={step} steps={steps} />

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
          {step === 0 && (
            <div className="space-y-4 animate-in fade-in">
              <Input label="Full name*" placeholder="Dr. Full Name" value={formData.name} onChange={e => handleChange("name", e.target.value)} error={errors.name} />
              <Input label="Mobile*" type="tel" placeholder="+91" value={formData.mobile} onChange={e => handleChange("mobile", e.target.value)} error={errors.mobile} />
              <Input label="Professional email*" type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} error={errors.email} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <Input label="Medical registration number*" value={formData.registrationNumber} onChange={e => handleChange("registrationNumber", e.target.value)} error={errors.registrationNumber} />
              <p className="text-xs text-muted -mt-3 mb-2">This will be used for doctor verification.</p>
              
              <Select label="Specialization*" value={formData.specialization} onChange={e => handleChange("specialization", e.target.value)} error={errors.specialization} options={departments.map(d => ({ value: d.name, label: d.name }))} />
              <Input label="Years of experience" type="number" value={formData.experience} onChange={e => handleChange("experience", e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <Select label="Hospital / Clinic*" value={formData.hospitalId} onChange={e => handleChange("hospitalId", e.target.value)} error={errors.hospitalId} options={hospitals.map(h => ({ value: h.id, label: h.name }))} />
              <Select label="Department at hospital*" value={formData.departmentId} onChange={e => handleChange("departmentId", e.target.value)} error={errors.departmentId} options={departments.map(d => ({ value: d.id, label: d.name }))} />
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">Your hospital association will require approval before your doctor account becomes active.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <Input label="Password*" type="password" value={formData.password} onChange={e => handleChange("password", e.target.value)} error={errors.password} />
              <Input label="Confirm password*" type="password" value={formData.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)} error={errors.confirmPassword} />
              
              <label className="flex items-start gap-2 text-sm text-navy mt-4">
                <input type="checkbox" className="mt-1" checked={formData.confirmAccuracy} onChange={e => handleChange("confirmAccuracy", e.target.checked)} />
                <span>I confirm that the professional information provided is accurate.*</span>
              </label>
              {errors.confirmAccuracy && <p className="text-red-500 text-xs">{errors.confirmAccuracy}</p>}

              <label className="flex items-start gap-2 text-sm text-navy">
                <input type="checkbox" className="mt-1" checked={formData.agreeTerms} onChange={e => handleChange("agreeTerms", e.target.checked)} />
                <span>I agree to the Terms of Service and Privacy Policy.*</span>
              </label>
              {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}
            </div>
          )}

          <div className="pt-6 flex justify-between items-center border-t">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <Button type="submit" variant="primary">Next Step</Button>
            ) : (
              <Button type="submit" variant="primary">Submit for Verification</Button>
            )}
          </div>
          
          <div className="text-center pt-4">
            <Link to="/login" className="text-sm text-primary font-medium">Already registered? Log In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
