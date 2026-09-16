import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Edit2, Save, X, Lock, LogOut } from "lucide-react";

export const PatientProfile = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const { currentUser, patients } = state;

  const currentPatient = patients.find(p => p.id === currentUser?.patientId);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...currentPatient });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  if (!currentUser || !currentPatient) return null;

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate('/login');
  };

  const handleEdit = () => {
    setFormData({ ...currentPatient });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...currentPatient });
    setIsEditing(false);
  };

  const handleSave = () => {
    dispatch({
      type: ACTIONS.UPDATE_PATIENT_PROFILE,
      payload: { patientId: currentPatient.id, updates: formData }
    });
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    setPasswordError("");
    if (passwordForm.currentPassword !== currentUser.password) {
      setPasswordError("Incorrect current password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    dispatch({
      type: ACTIONS.CHANGE_PASSWORD,
      payload: { userId: currentUser.id, newPassword: passwordForm.newPassword }
    });
    
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    alert("Password updated successfully!");
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "P";
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">My Profile</h1>
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2">
            <Edit2 size={16} /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline">Cancel</Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save size={16} /> Save
            </Button>
          </div>
        )}
      </div>
      
      <Card className="p-6 bg-white flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-md">
          {getInitials(currentPatient.name)}
        </div>
        <h2 className="text-xl font-bold text-navy">{currentPatient.name}</h2>
        <p className="text-muted">{currentPatient.email}</p>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input 
            label="Full Name" 
            value={formData.name || ""} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            disabled={!isEditing} 
          />
          <Input 
            label="Date of Birth" 
            type="date" 
            value={formData.dob || ""} 
            onChange={(e) => setFormData({...formData, dob: e.target.value})}
            disabled={!isEditing} 
          />
          <Select 
            label="Gender" 
            value={formData.gender || ""} 
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
            disabled={!isEditing}
            options={[
              { value: "Male", label: "Male" }, 
              { value: "Female", label: "Female" }, 
              { value: "Other", label: "Prefer not to say" }
            ]} 
          />
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Contact Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input 
            label="Mobile Number" 
            type="tel" 
            value={formData.mobile || ""} 
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            disabled={!isEditing} 
          />
          <Input 
            label="Email Address" 
            type="email" 
            value={formData.email || ""} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            disabled={!isEditing} 
          />
          <Input 
            label="City" 
            value={formData.city || ""} 
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            disabled={!isEditing} 
          />
          <Input 
            label="Address" 
            value={formData.address || ""} 
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            disabled={!isEditing} 
          />
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Additional Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Select 
            label="Preferred Language" 
            value={formData.preferredLanguage || "English"} 
            onChange={(e) => setFormData({...formData, preferredLanguage: e.target.value})}
            disabled={!isEditing}
            options={[
              { value: "English", label: "English" }, 
              { value: "Hindi", label: "Hindi" }
            ]} 
          />
          <Input 
            label="Emergency Contact Name" 
            value={formData.emergencyContact?.name || ""} 
            onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, name: e.target.value}})}
            disabled={!isEditing} 
          />
          <Input 
            label="Emergency Contact Number" 
            type="tel"
            value={formData.emergencyContact?.mobile || ""} 
            onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, mobile: e.target.value}})}
            disabled={!isEditing} 
          />
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Account Security</h3>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="font-medium text-navy">Password</p>
            <p className="text-sm text-muted">Update your password to keep your account secure.</p>
          </div>
          <Button onClick={() => setShowPasswordModal(true)} variant="outline" className="flex items-center gap-2">
            <Lock size={16} /> Change Password
          </Button>
        </div>
      </Card>

      <Button onClick={handleLogout} className="w-full bg-white border border-gray-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
        <LogOut size={18} /> Log Out
      </Button>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-navy">
                <X size={20} />
              </button>
            </div>
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <Input 
                label="Current Password" 
                type="password" 
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              />
              <Input 
                label="New Password" 
                type="password" 
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              />
              <Input 
                label="Confirm New Password" 
                type="password" 
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              />
              <Button onClick={handlePasswordChange} className="w-full mt-4">
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
