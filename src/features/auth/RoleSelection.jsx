import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Stethoscope } from "lucide-react";
import { RoleSelectionCard } from "../../components/ui/RoleSelectionCard";
import { CareQueueBackground } from "../../components/logo/CareQueueBackground";
import { SiteHeader } from "../../components/ui/SiteHeader";

export const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <CareQueueBackground>
      <SiteHeader />
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center py-12 px-4 relative z-10">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-navy mb-4">Create your CareQueue account</h1>
            <p className="text-muted text-lg">Choose how you want to use CareQueue</p>
          </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <RoleSelectionCard 
            icon={User}
            title="I'm a Patient"
            description="Find doctors, join virtual queues, track your turn and manage appointments."
            buttonText="Register as Patient"
            onClick={() => navigate("/register/patient")}
          />
          <RoleSelectionCard 
            icon={Stethoscope}
            title="I'm a Doctor"
            description="Manage your patient queue, view today's patients and coordinate consultations."
            buttonText="Register as Doctor"
            onClick={() => navigate("/register/doctor")}
          />
        </div>

          <div className="text-center text-muted bg-white/70 backdrop-blur rounded-xl p-4 shadow-sm inline-block mx-auto">
            <p className="mb-2 text-sm">Reception staff accounts are issued by your hospital.</p>
            <p>
              Already have an account? <Link to="/login" className="text-primary font-medium hover:text-[#00c2e6]">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </CareQueueBackground>
  );
};
