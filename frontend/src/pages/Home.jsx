import { Link } from "react-router-dom";
import { Sparkles, CalendarCheck, ShieldCheck, ArrowRight, Droplets, Baby, Leaf, Zap, Search, Clock } from "lucide-react";
import Butterfly from "../components/Butterfly.jsx";

const treatments = [
  { icon: Droplets, title: "Acne and skin care", lines: ["Acne and scars", "Daily skin routines", "Oily and dry skin"] },
  { icon: Sparkles, title: "Cosmetic dermatology", lines: ["Chemical peels", "Skin glow treatments", "Anti-aging care"] },
  { icon: Baby, title: "Pediatric skin", lines: ["Baby rashes", "Childhood eczema", "Gentle care for kids"] },
  { icon: Leaf, title: "Hair and scalp", lines: ["Hair fall", "Dandruff", "Scalp conditions"] },
  { icon: Zap, title: "Laser and rejuvenation", lines: ["Laser hair removal", "Pigmentation", "Skin rejuvenation"] },
  { icon: ShieldCheck, title: "Allergy and eczema", lines: ["Allergic rashes", "Eczema and itching", "Long term relief"] }
];

const steps = [
  { icon: Search, title: "Choose your doctor", text: "Browse our skin specialists and see their working days." },
  { icon: Clock, title: "Pick a free slot", text: "Availability is live. A booked slot is never shown as free." },
  { icon: CalendarCheck, title: "Get instant confirmation", text: "Your booking gets a reference code right away." }
];

const stats = [
  { value: "6", label: "Skin specialists" },
  { value: "Mon-Sat", label: "Clinic days" },
  { value: "2 hrs", label: "Free cancellation window" },
  { value: "100%", label: "Online booking" }
];

export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="petals" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <div className="hero-text">
          <span className="eyebrow rise d1"><i className="dot"></i> 01 &nbsp; Skin, care, prevention</span>
          <h1 className="rise d2">Healthy skin, <em>beautifully</em> cared for.</h1>
          <p className="rise d3">Meet our skin specialists, pick a time that suits you and get an instant confirmation. Booking takes less than a minute.</p>
          <div className="hero-actions rise d4">
            <Link to="/doctors" className="pill-btn">Book appointment <span className="arrow"><ArrowRight size={16} /></span></Link>
            <Link to="/doctors" className="btn btn-ghost">Meet our doctors</Link>
          </div>
        </div>
        <div className="hero-art rise d3">
          <div className="orbit"></div>
          <div className="orbit orbit2"></div>
          <Butterfly />
        </div>
      </section>

      <section className="sec container reveal">
        <div className="sec-label"><span>02</span> Treatments made for you</div>
        <h2 className="sec-title">Care for every <em>skin concern.</em></h2>
        <div className="cards">
          {treatments.map(function (t) {
            const Icon = t.icon;
            return (
              <Link to="/doctors" className="glass tcard" key={t.title}>
                <span className="ticon"><Icon size={22} /></span>
                <h3>{t.title}</h3>
                <ul>
                  {t.lines.map(function (l) { return <li key={l}>{l}</li>; })}
                </ul>
                <span className="arrow arrow-sm"><ArrowRight size={15} /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="sec container reveal">
        <div className="visit glass">
          <div>
            <div className="sec-label"><span>03</span> Your visit</div>
            <h2 className="sec-title">Booking, made <em>effortless.</em></h2>
            <p className="muted visit-text">No phone calls and no waiting in line. Everything happens in three simple steps.</p>
            <Link to="/doctors" className="pill-btn">Start booking <span className="arrow"><ArrowRight size={16} /></span></Link>
          </div>
          <ul className="steps">
            {steps.map(function (s, i) {
              const Icon = s.icon;
              return (
                <li key={s.title}>
                  <span className="ticon"><Icon size={20} /></span>
                  <div>
                    <h3>{i + 1}. {s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="container reveal">
        <div className="stats glass">
          {stats.map(function (s) {
            return (
              <div key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
