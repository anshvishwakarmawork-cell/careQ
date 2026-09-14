import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { 
  validateName, 
  validateMobile, 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch,
  validateRequired 
} from "../../lib/validators";

export const PatientRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", mobile: "", email: "", dob: "", gender: "", city: "", language: "English",
    password: "", confirmPassword: "", emergencyName: "", emergencyNumber: "",
    agreeTerms: false, optInNotifications: true
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    const newErrors = {
      name: validateName(formData.name),
      mobile: validateMobile(formData.mobile),
      email: validateEmail(formData.email),
      dob: validateRequired(formData.dob, "Date of birth"),
      gender: validateRequired(formData.gender, "Gender"),
      city: validateRequired(formData.city, "City"),
      password: validatePassword(formData.password),
      confirmPassword: validatePasswordMatch(formData.password, formData.confirmPassword),
      agreeTerms: formData.agreeTerms ? null : "You must agree to the terms."
    };

    const cleanErrors = Object.fromEntries(Object.entries(newErrors).filter(([_, v]) => v !== null));
    setErrors(cleanErrors);
    return Object.keys(cleanErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Pass data to verify step
      navigate("/verify", { state: { user: formData, role: "PATIENT" } });
    }
  };

  return (
    <div className="min-h-screen bg-section py-8 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy">Create Patient Account</h1>
          <p className="text-muted">Create your account to join queues and manage your appointments.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Full name*" value={formData.name} onChange={e => handleChange("name", e.target.value)} error={errors.name} />
              <Input label="Mobile*" type="tel" placeholder="+91" value={formData.mobile} onChange={e => handleChange("mobile", e.target.value)} error={errors.mobile} />
              <Input label="Email*" type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} error={errors.email} />
              <Input label="Date of birth*" type="date" value={formData.dob} onChange={e => handleChange("dob", e.target.value)} error={errors.dob} />
              <Select label="Gender*" value={formData.gender} onChange={e => handleChange("gender", e.target.value)} error={errors.gender} options={[
                { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Prefer not to say" }
              ]} />
              <Input label="City*" value={formData.city} onChange={e => handleChange("city", e.target.value)} error={errors.city} />
              <Select label="Preferred language" value={formData.language} onChange={e => handleChange("language", e.target.value)} options={[
                { value: "English", label: "English" }, { value: "Hindi", label: "Hindi" }
              ]} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Security</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Password*" type="password" value={formData.password} onChange={e => handleChange("password", e.target.value)} error={errors.password} />
              <Input label="Confirm password*" type="password" value={formData.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)} error={errors.confirmPassword} />
            </div>
          </div>

          <div className="space-y-4">
            <details className="group">
              <summary className="font-medium cursor-pointer text-primary">Additional information (Optional)</summary>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Input label="Emergency contact name" value={formData.emergencyName} onChange={e => handleChange("emergencyName", e.target.value)} />
                <Input label="Emergency contact number" value={formData.emergencyNumber} onChange={e => handleChange("emergencyNumber", e.target.value)} />
              </div>
            </details>
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm text-navy">
              <input type="checkbox" className="mt-1" checked={formData.agreeTerms} onChange={e => handleChange("agreeTerms", e.target.checked)} />
              <span>I agree to the Terms of Service and Privacy Policy.*</span>
            </label>
            {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}
            <label className="flex items-start gap-2 text-sm text-navy">
              <input type="checkbox" className="mt-1" checked={formData.optInNotifications} onChange={e => handleChange("optInNotifications", e.target.checked)} />
              <span>I would like to receive queue and appointment notifications.</span>
            </label>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <Button type="submit" variant="primary" className="w-full md:w-auto px-12">Create Patient Account</Button>
            <Link to="/login" className="text-sm text-primary font-medium">Already have an account? Log In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
