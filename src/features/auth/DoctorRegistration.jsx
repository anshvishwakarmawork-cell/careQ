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
    registrationNumber: "", registrationAuthority: "", primaryDegree: "", graduationInstitution: "", graduationYear: "",
    postgraduateQualification: "", specialization: "", experience: "",
    hospitalId: "", departmentId: "", designation: "", employeeId: "", workingSince: "", consultationType: "",
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
      newErrors.registrationAuthority = validateRequired(formData.registrationAuthority, "Registration authority");
      newErrors.primaryDegree = validateRequired(formData.primaryDegree, "Primary medical degree");
      newErrors.graduationInstitution = validateRequired(formData.graduationInstitution, "Graduation institution");
      newErrors.graduationYear = validateRequired(formData.graduationYear, "Graduation year");
      newErrors.specialization = validateRequired(formData.specialization, "Specialization");
    } else if (currentStep === 2) {
      newErrors.hospitalId = validateRequired(formData.hospitalId, "Hospital");
      newErrors.departmentId = validateRequired(formData.departmentId, "Department");
      newErrors.designation = validateRequired(formData.designation, "Designation");
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
        
        // Professional
        registrationNumber: formData.registrationNumber,
        registrationAuthority: formData.registrationAuthority,
        primaryDegree: formData.primaryDegree,
        graduationInstitution: formData.graduationInstitution,
        graduationYear: formData.graduationYear,
        postgraduateQualification: formData.postgraduateQualification,
        specialization: formData.specialization,
        experience: formData.experience,
        
        // Hospital
        hospitalId: formData.hospitalId,
        departmentId: formData.departmentId,
        designation: formData.designation,
        employeeId: formData.employeeId,
        workingSince: formData.workingSince,
        consultationType: formData.consultationType,

        room: "TBD",
        avgConsultationMin: 10,
        status: "PENDING_VERIFICATION",
        verificationStatus: "PENDING_VERIFICATION",
        delayMinutes: 0,
        queuePaused: false,
        todayHours: { start: "09:00", end: "17:00" },
        photoInitials: formData.name.substring(0, 2).toUpperCase(),
        submittedAt: new Date().toISOString()
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

      dispatch({ type: ACTIONS.REGISTER_DOCTOR_REQUEST, payload: { user: newUser, doctor: newDoctor } });
      dispatch({ type: ACTIONS.LOGIN, payload: newUser });
      navigate("/doctor/verification");
    }
  };

  const handleUploadClick = (e) => {
    e.preventDefault();
    alert("In this prototype, document upload is simulated.");
  };

  return (
    <div className="min-h-screen bg-section py-8 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy">Create Doctor Account</h1>
          <p className="text-muted">Register your professional profile to use CareQueue.</p>
        </div>

        <Stepper currentStep={step} steps={steps} />

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
          {step === 0 && (
            <div className="space-y-4 animate-in fade-in">
              <Input label="Full name*" placeholder="Dr. Full Name" value={formData.name} onChange={e => handleChange("name", e.target.value)} error={errors.name} />
              <Input label="Mobile*" type="tel" placeholder="+91" value={formData.mobile} onChange={e => handleChange("mobile", e.target.value)} error={errors.mobile} />
              <Input label="Professional email*" type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} error={errors.email} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Medical registration number*" placeholder="Enter registration number" value={formData.registrationNumber} onChange={e => handleChange("registrationNumber", e.target.value)} error={errors.registrationNumber} />
                <Select label="Registration Authority*" value={formData.registrationAuthority} onChange={e => handleChange("registrationAuthority", e.target.value)} error={errors.registrationAuthority} options={[
                  {value: "State Medical Council", label: "State Medical Council"},
                  {value: "National Medical Commission", label: "National Medical Commission"},
                  {value: "Other", label: "Other"}
                ]} />
              </div>
              <p className="text-xs text-muted -mt-3 mb-2">Used for professional verification.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Primary Medical Degree*" value={formData.primaryDegree} onChange={e => handleChange("primaryDegree", e.target.value)} error={errors.primaryDegree} options={[
                  {value: "MBBS", label: "MBBS"},
                  {value: "BDS", label: "BDS"},
                  {value: "BAMS", label: "BAMS"},
                  {value: "BHMS", label: "BHMS"},
                  {value: "Other", label: "Other"}
                ]} />
                <Input label="Graduation Institution*" placeholder="e.g. Medical College" value={formData.graduationInstitution} onChange={e => handleChange("graduationInstitution", e.target.value)} error={errors.graduationInstitution} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Graduation Year*" value={formData.graduationYear} onChange={e => handleChange("graduationYear", e.target.value)} error={errors.graduationYear} options={
                  Array.from({length: 50}, (_, i) => ({ value: `${new Date().getFullYear() - i}`, label: `${new Date().getFullYear() - i}` }))
                } />
                <Select label="Postgraduate Qualification (Optional)" value={formData.postgraduateQualification} onChange={e => handleChange("postgraduateQualification", e.target.value)} error={errors.postgraduateQualification} options={[
                  {value: "None", label: "None"},
                  {value: "MD", label: "MD"},
                  {value: "MS", label: "MS"},
                  {value: "DNB", label: "DNB"},
                  {value: "DM", label: "DM"},
                  {value: "MCh", label: "MCh"},
                  {value: "Diploma", label: "Diploma"},
                  {value: "Other", label: "Other"}
                ]} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Current Specialization*" value={formData.specialization} onChange={e => handleChange("specialization", e.target.value)} error={errors.specialization} options={departments.map(d => ({ value: d.name, label: d.name }))} />
                <Input label="Years of experience (Optional)" type="number" min="0" value={formData.experience} onChange={e => handleChange("experience", e.target.value)} />
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-medium text-navy mb-2">Document Upload (Optional for prototype)</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-sm" onClick={handleUploadClick}>Upload Registration Cert</Button>
                  <Button variant="outline" className="text-sm" onClick={handleUploadClick}>Upload Degree</Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-100">
                <h4 className="text-amber-800 font-medium text-sm">Important Hospital Verification Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Selecting a hospital does not automatically provide access.
                  Your registration request will be sent to the selected hospital's CareQueue Reception / Coordinator Portal for verification.
                  Your Doctor Portal will become active only after approval.
                </p>
              </div>

              <Select label="Hospital / Clinic*" value={formData.hospitalId} onChange={e => handleChange("hospitalId", e.target.value)} error={errors.hospitalId} options={hospitals.map(h => ({ value: h.id, label: h.name }))} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Department at hospital*" value={formData.departmentId} onChange={e => handleChange("departmentId", e.target.value)} error={errors.departmentId} options={departments.map(d => ({ value: d.id, label: d.name }))} />
                <Select label="Current Designation*" value={formData.designation} onChange={e => handleChange("designation", e.target.value)} error={errors.designation} options={[
                  {value: "Consultant", label: "Consultant"},
                  {value: "Senior Consultant", label: "Senior Consultant"},
                  {value: "Resident Doctor", label: "Resident Doctor"},
                  {value: "Medical Officer", label: "Medical Officer"},
                  {value: "Specialist", label: "Specialist"},
                  {value: "Visiting Consultant", label: "Visiting Consultant"},
                  {value: "Other", label: "Other"}
                ]} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Hospital Employee ID (Optional)" value={formData.employeeId} onChange={e => handleChange("employeeId", e.target.value)} />
                <Input label="Working Since (Year) (Optional)" type="number" min="1950" max={new Date().getFullYear()} value={formData.workingSince} onChange={e => handleChange("workingSince", e.target.value)} />
              </div>
              
              <Select label="Consultation Type (Optional)" value={formData.consultationType} onChange={e => handleChange("consultationType", e.target.value)} options={[
                {value: "OPD", label: "OPD"},
                {value: "Appointment", label: "Appointment"},
                {value: "Both", label: "Both"}
              ]} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 p-4 rounded-lg mb-6 text-sm border border-slate-200">
                <h3 className="font-semibold text-navy mb-2">Registration Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-slate-600 mb-4">
                  <div><span className="font-medium">Name:</span> {formData.name}</div>
                  <div><span className="font-medium">Mobile:</span> {formData.mobile}</div>
                  <div><span className="font-medium">Reg No:</span> {formData.registrationNumber}</div>
                  <div><span className="font-medium">Degree:</span> {formData.primaryDegree}</div>
                  <div><span className="font-medium">Specialization:</span> {formData.specialization}</div>
                  <div><span className="font-medium">Hospital:</span> {hospitals.find(h => h.id === formData.hospitalId)?.name || 'Not selected'}</div>
                </div>
              </div>

              <Input label="Password*" type="password" value={formData.password} onChange={e => handleChange("password", e.target.value)} error={errors.password} />
              <Input label="Confirm password*" type="password" value={formData.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)} error={errors.confirmPassword} />
              
              <label className="flex items-start gap-2 text-sm text-navy mt-4">
                <input type="checkbox" className="mt-1" checked={formData.confirmAccuracy} onChange={e => handleChange("confirmAccuracy", e.target.checked)} />
                <span className="flex-1">I confirm that the professional information I provided is accurate.*</span>
              </label>
              {errors.confirmAccuracy && <p className="text-red-500 text-xs">{errors.confirmAccuracy}</p>}

              <label className="flex items-start gap-2 text-sm text-navy">
                <input type="checkbox" className="mt-1" checked={formData.agreeTerms} onChange={e => handleChange("agreeTerms", e.target.checked)} />
                <span className="flex-1">I understand that my CareQueue doctor account requires approval from the selected hospital, and I agree to the Terms of Service and Privacy Policy.*</span>
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
              <Button type="button" variant="primary" onClick={handleNext}>Next Step</Button>
            ) : (
              <Button type="submit" variant="primary">Submit Registration</Button>
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
