import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { CareQueueLogo } from '../logo/CareQueueLogo';

export const SiteHeader = () => {
  return (
    <header className="w-full px-6 lg:px-12 py-4 flex items-center justify-between z-50 relative bg-transparent">
      {/* Logo Container */}
      <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
        <div className="flex items-center" style={{ transform: 'scale(0.7)', transformOrigin: 'left center' }}>
           <CareQueueLogo variant="horizontal" animated={true} />
        </div>
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#0a2a35]">
        <Link to="/" className="hover:text-[#00D9FF] transition-colors text-[#00D9FF] border-b-2 border-[#00D9FF] pb-1">Home</Link>
        <Link to="#" className="hover:text-[#00D9FF] transition-colors">About</Link>
        <Link to="#" className="hover:text-[#00D9FF] transition-colors">Services</Link>
        <Link to="#" className="hover:text-[#00D9FF] transition-colors">Blog</Link>
        <Link to="#" className="hover:text-[#00D9FF] transition-colors">Contact</Link>
      </nav>

      {/* CTA Button */}
      <div className="flex items-center gap-4">
        <Link to="/login">
          <Button className="rounded-full px-6 py-2 shadow-md hover:shadow-lg bg-[#00D9FF] hover:bg-[#00c2e6] text-[#041217] font-bold border-none transition-all">
            Book Appointment
          </Button>
        </Link>
      </div>
    </header>
  );
};
