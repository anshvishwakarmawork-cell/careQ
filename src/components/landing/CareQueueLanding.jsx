import React, { useEffect, useRef, useState } from "react";
import "./CareQueueLanding.css";

export default function CareQueueLanding({ onGetStarted, onLogin, onStaff }) {
  const rootRef = useRef(null);
  const [dockVisible, setDockVisible] = useState(false);

  // IntersectionObserver for scroll reveals
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Use sensible hysteresis: reveal after 20% visible, don't unobserve to allow replay
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          } else {
            // Only remove if we scroll substantially away to allow replay
            entry.target.classList.remove("is-revealed");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );

    const revealElements = root.querySelectorAll(".cql-reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  // IntersectionObserver for floating dock visibility
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Hide dock when in the hero section, show when scrolled down
    const heroSection = root.querySelector(".cql-hero");
    if (!heroSection) return;

    const dockObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // If hero is NOT intersecting (user scrolled past it), show dock
        setDockVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    dockObserver.observe(heroSection);
    return () => dockObserver.disconnect();
  }, []);

  // Ambient Cursor Parallax
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.from(root.querySelectorAll("[data-parallax]")).map((el) => {
      const depth = Number(el.dataset.parallax) || 10;
      return { el, depth };
    });

    const s = {
      tx: 0, ty: 0, // Target normalised pointer
      x: 0, y: 0    // Current eased position
    };

    const setPointer = (cx, cy) => {
      const r = root.getBoundingClientRect();
      // Only care about the visible viewport bounds roughly
      s.tx = Math.max(-1, Math.min(1, ((cx - r.left) / window.innerWidth - 0.5) * 2));
      s.ty = Math.max(-1, Math.min(1, ((cy - r.top) / window.innerHeight - 0.5) * 2));
    };

    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      if (p) setPointer(p.clientX, p.clientY);
    };
    const onRest = () => { s.tx = 0; s.ty = 0; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("pointerleave", onRest);
    window.addEventListener("touchend", onRest, { passive: true });

    let raf;
    const loop = () => {
      s.x += (s.tx - s.x) * 0.05;
      s.y += (s.ty - s.y) * 0.05;

      for (const l of layers) {
        l.el.style.transform = `translate3d(${(s.x * l.depth).toFixed(2)}px, ${(s.y * l.depth).toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("pointerleave", onRest);
      window.removeEventListener("touchend", onRest);
    };
  }, []);

  return (
    <div className="cql-root" ref={rootRef}>
      
      {/* ----------------- NAVBAR ----------------- */}
      <nav className="cql-nav">
        <div className="cql-nav-container">
          <a href="#" className="cql-logo">
            <div className="cql-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.8a4.4 4.4 0 0 1 7.5 3.1c0 5-7.5 9.6-7.5 9.6Z" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M5.2 13.4h3.1l1.6-3.1 2.1 5.2 1.6-3.1h5.2" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            CareQueue
          </a>
          
          <div className="cql-nav-links">
            <a href="#product" className="cql-nav-link">Product</a>
            <a href="#how-it-works" className="cql-nav-link">How it works</a>
            <a href="#hospitals" className="cql-nav-link">For Hospitals</a>
            <a href="#patients" className="cql-nav-link">For Patients</a>
            <a href="#about" className="cql-nav-link">About</a>
          </div>

          <div className="cql-nav-actions">
            <button onClick={() => onStaff?.('doctor')} className="cql-btn-secondary">Doctor Portal</button>
            <button onClick={() => onStaff?.('reception')} className="cql-btn-secondary">Reception Portal</button>
            <button onClick={onGetStarted} className="cql-btn-primary">Get CareQueue</button>
          </div>
        </div>
      </nav>

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="cql-hero" id="product">
        {/* Ambient background layers */}
        <div className="cql-parallax-wrapper">
          <div className="cql-ambient cql-ambient-cyan cql-parallax-layer" data-parallax="15"></div>
          <div className="cql-ambient cql-ambient-mint cql-parallax-layer" data-parallax="-20"></div>
          <div className="cql-ambient cql-ambient-lav cql-parallax-layer" data-parallax="10"></div>
        </div>

        <div className="cql-container cql-hero-content">
          <h1 className="cql-h1 cql-reveal">Healthcare shouldn't make you wait blindly.</h1>
          <p className="cql-text-sub cql-reveal cql-delay-100">
            CareQueue gives patients and hospital teams a shared, real-time view of the care journey. Turn uncertain waiting into a connected, predictable flow.
          </p>
          <div className="cql-hero-ctas cql-reveal cql-delay-200">
            <button onClick={onGetStarted} className="cql-btn-primary">Get CareQueue</button>
            <a href="#how-it-works" className="cql-btn-secondary">See how it works</a>
          </div>
        </div>

        {/* Visual Fragments */}
        <div className="cql-container cql-hero-visual cql-reveal cql-delay-300">
          <div className="cql-parallax-wrapper">
            <div className="cql-fragment cql-fragment-patient cql-parallax-layer" data-parallax="12">
              <div className="cql-frag-title">Patient</div>
              <div className="cql-frag-value">Token A-24</div>
              <div className="cql-frag-status"><i className="cql-dot cql-dot-cyan"></i> Live queue position</div>
            </div>
          </div>
          <div className="cql-parallax-wrapper">
            <div className="cql-fragment cql-fragment-reception cql-parallax-layer" data-parallax="-8">
              <div className="cql-frag-title">Reception</div>
              <div className="cql-frag-value">Verified</div>
              <div className="cql-frag-status"><i className="cql-dot cql-dot-mint"></i> Queue coordination</div>
            </div>
          </div>
          <div className="cql-parallax-wrapper">
            <div className="cql-fragment cql-fragment-doctor cql-parallax-layer" data-parallax="6">
              <div className="cql-frag-title">Doctor</div>
              <div className="cql-frag-value">Now serving A-20</div>
              <div className="cql-frag-status"><i className="cql-dot cql-dot-cyan"></i> Shared record</div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- PROBLEM / ANSWER SECTION ----------------- */}
      <section className="cql-section cql-problem" id="about">
        <div className="cql-container">
          <h2 className="cql-h2 cql-reveal">Waiting is part of healthcare.<br />Uncertainty shouldn’t be.</h2>
          <p className="cql-text-sub cql-reveal cql-delay-100" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <strong>One queue, kept honest on every screen.</strong><br />
            Patients, reception staff, and doctors work from synchronized records instead of disconnected updates.
          </p>
        </div>
      </section>

      {/* ----------------- CONNECTED JOURNEY ----------------- */}
      <section className="cql-section cql-journey" id="how-it-works">
        <div className="cql-container">
          <div className="cql-journey-header">
            <h2 className="cql-h2 cql-reveal">Three experiences. One shared flow.</h2>
            <p className="cql-text-sub cql-reveal cql-delay-100">See how everyone stays on the same page.</p>
          </div>
          <div className="cql-grid cql-grid-3">
            <div className="cql-card cql-reveal">
              <div className="cql-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h3 className="cql-card-title">Patient Experience</h3>
              <p className="cql-card-desc">Patient requests queue access remotely. Once active, they see live updates instead of waiting blindly.</p>
            </div>
            <div className="cql-card cql-reveal cql-delay-100">
              <div className="cql-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              </div>
              <h3 className="cql-card-title">Reception Coordination</h3>
              <p className="cql-card-desc">Reception verifies requests and controls the physical flow. The digital queue matches the physical waiting room.</p>
            </div>
            <div className="cql-card cql-reveal cql-delay-200">
              <div className="cql-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <h3 className="cql-card-title">Doctor Workflow</h3>
              <p className="cql-card-desc">Doctors see the verified queue and progress through the shared record, calling the next patient seamlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- PRODUCT IN MOTION ----------------- */}
      <section className="cql-section cql-motion">
        <div className="cql-container">
          <div className="cql-motion-header">
            <h2 className="cql-h2 cql-reveal">One approval moves the whole queue.</h2>
            <p className="cql-text-sub cql-reveal cql-delay-100">Updates sync instantly across all devices.</p>
          </div>
          
          <div className="cql-flow-diagram cql-reveal cql-delay-200">
            <div className="cql-flow-node">
              <div className="cql-flow-node-title">Patient</div>
              <div className="cql-flow-node-state">Sends Request</div>
            </div>
            <div className="cql-flow-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
            <div className="cql-flow-node" style={{ borderColor: 'rgba(255,255,255,0.3)'}}>
              <div className="cql-flow-node-title">Reception</div>
              <div className="cql-flow-node-state">Approves Token</div>
            </div>
            <div className="cql-flow-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
            <div className="cql-flow-node">
              <div className="cql-flow-node-title">Doctor &amp; Patient</div>
              <div className="cql-flow-node-state" style={{ color: 'oklch(68% 0.07 200)'}}>Synchronized</div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- CAPABILITIES & QR ----------------- */}
      <section className="cql-section cql-capabilities">
        <div className="cql-container">
          <div className="cql-cap-header">
            <h2 className="cql-h2 cql-reveal">A clearer view of patient flow.</h2>
          </div>
          
          <div className="cql-grid cql-grid-2">
            <div className="cql-card cql-reveal">
              <h3 className="cql-card-title">Virtual Queue</h3>
              <p className="cql-card-desc">Patients can request and join supported hospital queues remotely.</p>
            </div>
            <div className="cql-card cql-reveal cql-delay-100">
              <h3 className="cql-card-title">Smart Notifications</h3>
              <p className="cql-card-desc">Patients receive meaningful queue and care-flow updates.</p>
            </div>
            
            {/* QR Check-In Card */}
            <div className="cql-card cql-card-qr cql-reveal">
              <div>
                <h3 className="cql-card-title">QR Check-In</h3>
                <p className="cql-card-desc">Verify arrival securely at the correct care location.</p>
                <div className="cql-frag-status" style={{ marginTop: '16px', background: '#fff' }}>
                  <i className="cql-dot cql-dot-mint"></i> Ready to check in
                </div>
              </div>
              <div className="cql-qr-visual">
                <div className="cql-qr-pattern"></div>
                <div className="cql-qr-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.8a4.4 4.4 0 0 1 7.5 3.1c0 5-7.5 9.6-7.5 9.6Z" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
                    <path d="M5.2 13.4h3.1l1.6-3.1 2.1 5.2 1.6-3.1h5.2" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="cql-qr-scanline"></div>
              </div>
            </div>

            <div className="cql-card cql-reveal cql-delay-100">
              <h3 className="cql-card-title">Live Token Tracking</h3>
              <p className="cql-card-desc">Patients can follow their token and queue progress in real-time.</p>
            </div>
            <div className="cql-card cql-reveal cql-delay-200">
              <h3 className="cql-card-title">Appointment Coordination</h3>
              <p className="cql-card-desc">Appointments coexist with queue workflows without being treated as the same thing.</p>
            </div>
            <div className="cql-card cql-reveal cql-delay-300">
              <h3 className="cql-card-title">Hospital Coordination</h3>
              <p className="cql-card-desc">Reception coordinates patient movement smoothly between shared operational workflows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- FOR PATIENTS ----------------- */}
      <section className="cql-section" id="patients">
        <div className="cql-container cql-reveal">
          <h2 className="cql-h2">For Patients</h2>
          <p className="cql-text-sub">
            Request access without waiting blindly. Understand your queue position, receive real-time updates, check in with QR securely, and view your appointments and care progress in one place.
          </p>
        </div>
      </section>

      {/* ----------------- FOR HOSPITALS ----------------- */}
      <section className="cql-section" id="hospitals" style={{ background: '#fbfcfd' }}>
        <div className="cql-container cql-reveal">
          <h2 className="cql-h2">For Hospitals</h2>
          <p className="cql-text-sub">
            Enable verified queue entry and shared status across departments. Streamline staff coordination, manage cleaner patient flows, and reduce disconnected updates.
          </p>
          <a href="#contact" className="cql-btn-primary">Explore hospital workflows</a>
        </div>
      </section>

      {/* ----------------- ABOUT & CONTACT ----------------- */}
      <section className="cql-section cql-about-contact" id="contact">
        <div className="cql-container">
          <div className="cql-ac-grid">
            <div className="cql-reveal">
              <h2 className="cql-h3">About CareQueue</h2>
              <p className="cql-text-sub">
                CareQueue was built to bring transparency and predictability to healthcare waiting rooms. We believe that a shared system between patients, reception, and doctors creates a calmer, more efficient care environment.
              </p>
            </div>
            <div className="cql-reveal cql-delay-100">
              <h2 className="cql-h3">Talk to CareQueue</h2>
              <p className="cql-text-sub">
                Interested in implementing CareQueue at your clinic or hospital?
              </p>
              <button className="cql-btn-primary">Talk to CareQueue</button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- FINAL CTA ----------------- */}
      <section className="cql-final">
        <div className="cql-container cql-reveal">
          <h2 className="cql-h1">Wait less. Care sooner.</h2>
          <button onClick={onGetStarted} className="cql-btn-primary" style={{ marginTop: '24px' }}>Get CareQueue</button>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="cql-footer">
        <div className="cql-footer-grid">
          <div className="cql-footer-col">
            <div className="cql-logo">
              <div className="cql-logo-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.8a4.4 4.4 0 0 1 7.5 3.1c0 5-7.5 9.6-7.5 9.6Z" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M5.2 13.4h3.1l1.6-3.1 2.1 5.2 1.6-3.1h5.2" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              CareQueue
            </div>
            <p className="cql-text-sub" style={{ fontSize: '14px', maxWidth: '250px' }}>
              Healthcare shouldn't make you wait blindly.
            </p>
          </div>
          <div className="cql-footer-col">
            <div className="cql-footer-title">Product</div>
            <a href="#how-it-works" className="cql-footer-link">How it works</a>
            <a href="#hospitals" className="cql-footer-link">For Hospitals</a>
            <a href="#patients" className="cql-footer-link">For Patients</a>
          </div>
          <div className="cql-footer-col">
            <div className="cql-footer-title">Company &amp; Portals</div>
            <a href="#about" className="cql-footer-link">About</a>
            <a href="#contact" className="cql-footer-link">Contact</a>
            <button onClick={() => onStaff?.('doctor')} className="cql-footer-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>Doctor Portal</button>
            <button onClick={() => onStaff?.('reception')} className="cql-footer-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>Reception Portal</button>
          </div>
        </div>
        <div className="cql-footer-bottom">
          <span>&copy; {new Date().getFullYear()} CareQueue. All rights reserved.</span>
        </div>
      </footer>

      {/* ----------------- FLOATING ACTION DOCK ----------------- */}
      <div className={`cql-dock ${dockVisible ? 'is-visible' : ''}`}>
        <button onClick={onGetStarted} className="cql-dock-btn cql-dock-primary">Get CareQueue</button>
        <button onClick={() => onStaff?.('doctor')} className="cql-dock-btn cql-dock-secondary cql-dock-staff">Doctor Portal</button>
        <button onClick={() => onStaff?.('reception')} className="cql-dock-btn cql-dock-secondary cql-dock-staff">Reception Portal</button>
      </div>
    </div>
  );
}
