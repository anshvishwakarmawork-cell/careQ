import React, { useEffect, useRef } from "react";
import "./CareQueueLanding.css";

/**
 * CareQueue — patient welcome screen.
 *
 * Props:
 *   onGetStarted()  primary CTA
 *   onLogin()       "I already have an account"
 *   onStaff(role)   role is "doctor" | "reception"
 *
 * No dependencies. Motion is transform/opacity only and is skipped
 * entirely when the user prefers reduced motion.
 */
export default function CareQueueLanding({ onGetStarted, onLogin, onStaff }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.from(root.querySelectorAll("[data-p]")).map((el) => {
      const [dx, dy] = el.dataset.p.split(",").map(Number);
      return { el, dx, dy };
    });
    const trail = root.querySelector("[data-trail]");
    const magnet = root.querySelector("[data-magnet]");
    const ecg = root.querySelector("[data-ecg]");

    const s = {
      tx: 0, ty: 0, x: 0, y: 0,           // normalised pointer (-1..1) + eased value
      px: null, py: null, moved: 0,        // raw pointer inside the screen
      trx: 200, try_: 500, glow: 0,        // light trail
      ecgN: 0, mx: 0, my: 0,               // ecg nearness, magnet offset
    };

    const setPointer = (cx, cy) => {
      const r = root.getBoundingClientRect();
      s.tx = Math.max(-1, Math.min(1, ((cx - r.left) / r.width - 0.5) * 2));
      s.ty = Math.max(-1, Math.min(1, ((cy - r.top) / r.height - 0.5) * 2));
      s.px = cx - r.left;
      s.py = cy - r.top;
      s.moved = performance.now();
    };
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      if (p) setPointer(p.clientX, p.clientY);
    };
    const onRest = () => { s.tx = 0; s.ty = 0; s.px = null; s.py = null; };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("touchmove", onMove, { passive: true });
    root.addEventListener("pointerleave", onRest);
    root.addEventListener("touchend", onRest, { passive: true });

    let raf = 0;
    const loop = () => {
      // ambient parallax
      s.x += (s.tx - s.x) * 0.045;
      s.y += (s.ty - s.y) * 0.045;
      for (const l of layers) {
        l.el.style.transform =
          `translate3d(${(s.x * l.dx).toFixed(2)}px,${(s.y * l.dy).toFixed(2)}px,0)`;
      }

      // iridescent light trail — lags the pointer, fades out when still
      if (trail) {
        s.trx += ((s.px ?? s.trx) - s.trx) * 0.12;
        s.try_ += ((s.py ?? s.try_) - s.try_) * 0.12;
        const idle = performance.now() - s.moved;
        s.glow += ((idle < 90 ? 1 : 0) - s.glow) * (idle < 90 ? 0.14 : 0.055);
        trail.style.transform = `translate3d(${s.trx.toFixed(1)}px,${s.try_.toFixed(1)}px,0)`;
        trail.style.opacity = (s.glow * 0.85).toFixed(3);
      }

      // ECG responds slightly when the pointer is near its band
      if (ecg) {
        let near = 0;
        if (s.py != null) {
          const band = Math.abs(s.py - root.clientHeight * 0.538);
          near = Math.max(0, 1 - band / 150);
        }
        s.ecgN += (near - s.ecgN) * 0.06;
        ecg.style.opacity = (1 + s.ecgN * 0.5).toFixed(3);
        ecg.style.transform = `scaleY(${(1 + s.ecgN * 0.07).toFixed(4)})`;
      }

      // magnetic CTA — at most ~3px toward the pointer
      if (magnet) {
        let mx = 0, my = 0;
        if (s.px != null) {
          const r = magnet.getBoundingClientRect();
          const nr = root.getBoundingClientRect();
          const dx = s.px + nr.left - (r.left + r.width / 2);
          const dy = s.py + nr.top - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy);
          const reach = 170;
          if (d < reach) {
            const f = (1 - d / reach) * 3.2;
            mx = (dx / (d || 1)) * f;
            my = (dy / (d || 1)) * f;
          }
        }
        s.mx += (mx - s.mx) * 0.1;
        s.my += (my - s.my) * 0.1;
        magnet.style.translate = `${s.mx.toFixed(2)}px ${s.my.toFixed(2)}px`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("touchmove", onMove);
      root.removeEventListener("pointerleave", onRest);
      root.removeEventListener("touchend", onRest);
    };
  }, []);

  return (
    <div className="cq-welcome" ref={rootRef}>
      <div className="cq-bg" aria-hidden="true">
        <div className="cq-orb cq-orb--cyan" data-p="14,11" />
        <div className="cq-orb cq-orb--mint" data-p="-18,9" />
        <div className="cq-orb cq-orb--ice" data-p="11,-16" />
        <div className="cq-orb cq-orb--lav" data-p="-9,-12" />

        <div className="cq-sparks" data-p="-5,-4">
          <i style={{ top: "14%", left: "14%", width: 3, height: 3, animationDuration: "7s" }} />
          <i style={{ top: "22%", left: "78%", animationDuration: "9s", animationDelay: "1.4s" }} />
          <i className="cq-spark--cyan" style={{ top: "33%", left: "44%", animationDuration: "11s", animationDelay: ".6s" }} />
          <i style={{ top: "46%", left: "20%", width: 3, height: 3, animationDuration: "8.5s", animationDelay: "2.2s" }} />
          <i style={{ top: "57%", left: "84%", animationDuration: "12s", animationDelay: ".3s" }} />
          <i className="cq-spark--mint" style={{ top: "70%", left: "35%", animationDuration: "10s", animationDelay: "1.9s" }} />
        </div>
        <div className="cq-sparks cq-sparks--drift" data-p="-7,-6">
          <i style={{ top: "28%", left: "61%", animationDuration: "13s", animationDelay: "3s" }} />
          <i style={{ top: "61%", left: "52%", animationDuration: "14s", animationDelay: "1.1s" }} />
          <i className="cq-spark--ice" style={{ top: "78%", left: "73%", animationDuration: "12.5s", animationDelay: "4.2s" }} />
        </div>

        <div className="cq-ghost-token" data-p="4,-5">
          <span>A-24</span>
          <small>8 min</small>
        </div>

        <div className="cq-trail" data-trail="1" />

        <svg className="cq-ecg" data-p="-6,4" viewBox="0 0 402 874" preserveAspectRatio="none" fill="none">
          <g data-ecg="1">
            <path d="M-60 470h96l26-52 34 104 30-78 26 26h250" stroke="oklch(60% 0.09 215)" strokeOpacity="0.15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path className="cq-ecg-pulse" d="M-60 470h96l26-52 34 104 30-78 26 26h250" stroke="oklch(62% 0.12 205)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="52 470" />
          </g>
        </svg>

        <svg className="cq-grain">
          <filter id="cqGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" />
          </filter>
          <rect width="100%" height="100%" filter="url(#cqGrain)" />
        </svg>
      </div>

      <div className="cq-content">
        <div className="cq-staff cq-staff--top">
          <span>Staff sign-in</span>
          <button type="button" onClick={() => onStaff?.("doctor")}>Doctor</button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => onStaff?.("reception")}>Reception</button>
        </div>

        <div className="cq-col">
        <div className="cq-logo">
          <span className="cq-halo" />
          <span className="cq-mark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.8a4.4 4.4 0 0 1 7.5 3.1c0 5-7.5 9.6-7.5 9.6Z" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M5.2 13.4h3.1l1.6-3.1 2.1 5.2 1.6-3.1h5.2" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <h1 className="cq-h1">Wait less.<br />Care sooner.</h1>
        <p className="cq-sub">
          Book a doctor, join a virtual queue and track your live token from anywhere.
        </p>

        <div className="cq-bottom">
          <div className="cq-chips" data-p="-2,-1.5">
            <span className="cq-chip"><i className="cq-dot cq-dot--cyan" />Live queue</span>
            <span className="cq-chip"><i className="cq-dot cq-dot--mint" />Smart reminders</span>
            <span className="cq-chip"><i className="cq-dot cq-dot--ice" />QR check-in</span>
          </div>

          <button className="cq-cta" data-magnet="1" type="button" onClick={onGetStarted}>
            Get started <span aria-hidden="true">→</span>
          </button>

          <button className="cq-secondary" type="button" onClick={onLogin}>
            I already have an account
          </button>

          <div className="cq-staff">
            <span>Staff sign-in</span>
            <button type="button" onClick={() => onStaff?.("doctor")}>Doctor</button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={() => onStaff?.("reception")}>Reception</button>
          </div>

          <div className="cq-trust">
            <span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
              Private
            </span>
            <span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M12 3l7 3v6c0 5-3.2 8-7 9-3.8-1-7-4-7-9V6l7-3z" /></svg>
              Secure
            </span>
            <span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.6 2.5L16 9.5" /></svg>
              Hospital verified
            </span>
          </div>

          <div className="cq-hint">Explore CareQueue <span aria-hidden="true">↓</span></div>
        </div>
        </div>

        {/* Illustrative product preview — desktop/tablet only. Not live data. */}
        <aside className="cq-preview" data-p="-5,4" aria-label="Illustrative preview of the CareQueue live queue">
          <div className="cq-preview-card">
            <div className="cq-preview-head">
              <span className="cq-preview-eyebrow">Live queue preview</span>
              <span className="cq-preview-tag">Illustration</span>
            </div>

            <div className="cq-preview-doc">
              <span className="cq-preview-avatar" aria-hidden="true">AS</span>
              <div>
                <strong>Dr. Ankit Sharma</strong>
                <small>Cardiology · City Care Hospital</small>
              </div>
            </div>

            <div className="cq-preview-token">
              <span className="cq-preview-label">Your token</span>
              <span className="cq-preview-value">A-24</span>
            </div>

            <div className="cq-preview-track" aria-hidden="true">
              <div className="cq-preview-fill" />
              <span className="cq-preview-marker" />
            </div>
            <div className="cq-preview-scale" aria-hidden="true">
              <span>A-20</span>
              <span>A-24</span>
            </div>

            <dl className="cq-preview-rows">
              <div><dt>Current token</dt><dd>A-20</dd></div>
              <div><dt>Estimated wait</dt><dd>~8 min</dd></div>
            </dl>

            <div className="cq-preview-status">
              <i className="cq-dot cq-dot--mint" />Queue moving normally
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
