import React, { useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ACTIONS } from "../../store/actions";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { CareQueueBackground } from "../../components/logo/CareQueueBackground";
import { SiteHeader } from "../../components/ui/SiteHeader";
import { CareQueueLogo } from "../../components/logo/CareQueueLogo";

export const Login = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (user) => {
    if (user.role === "DOCTOR" && user.verified === false) {
      // Mock login for unverified doctors lands on verification page
      dispatch({ type: ACTIONS.LOGIN, payload: user });
      navigate("/doctor/verification");
      return;
    }
    dispatch({ type: ACTIONS.LOGIN, payload: user });
    
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    
    if (redirect && user.role === "PATIENT") {
      navigate(redirect);
    } else {
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      handleLogin(user);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <CareQueueBackground>
      <SiteHeader />
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-xl border border-[#E2E8F0] relative z-10">
          <div className="flex justify-center mb-8">
            <CareQueueLogo variant="horizontal" animated={false} />
          </div>
        
        <form onSubmit={onSubmit} className="space-y-4 mb-8">
          <Input 
            label="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="patient@demo.com"
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="demo"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" className="w-full">Log In</Button>
        </form>

        <div className="space-y-4">
          <p className="text-sm text-muted mb-2">Demo Accounts:</p>
          {state.users.map(u => (
            <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-xs text-muted">{u.role}</p>
              </div>
              <button 
                onClick={() => handleLogin(u)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
              >
                Use
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/register" className="text-primary text-sm font-medium hover:text-[#00c2e6]">Don't have an account? Register</Link>
        </div>
      </div>
      </div>
    </CareQueueBackground>
  );
};

