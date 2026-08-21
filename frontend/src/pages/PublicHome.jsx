import { useState } from "react";
import api from "../api/client";

const contact = {
  address: "Rao Sabir Ali Near Ayoub Colony, Ahmed Pur Lamma",
  phone: "0321-0456777",
  email: "mrssolangi052@gmail.com",
};

export default function PublicHome() {
  const [showApply, setShowApply] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    applicantName: "",
    appliedForClass: "",
    guardianName: "",
    guardianPhone: "",
    notes: "",
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitApplication(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admissions/public", form);
      setSubmitted(true);
      setForm({ applicantName: "", appliedForClass: "", guardianName: "", guardianPhone: "", notes: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit the application. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-line)] bg-white/95 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xl font-bold text-[var(--color-brand)]">Markaz Rasool Pur Schools</div>
            <div className="text-xs text-[var(--color-slate)]">School Management & Admissions</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowApply(true)} className="rounded-lg bg-[var(--color-brand)] text-white px-4 py-2 text-sm font-semibold hover:bg-[var(--color-brand-dark)]">Online Apply</button>
            <a href="/login" className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold hover:bg-[var(--color-brand-light)]">Admin Login</a>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-[var(--color-brand-dark)] text-white">
          <div className="max-w-6xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="uppercase tracking-[0.2em] text-sm text-emerald-100 mb-3">Admissions Open</p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">Welcome to Markaz Rasool Pur Schools</h1>
              <p className="mt-5 text-emerald-50 max-w-xl leading-7">Apply online for admission and contact the school directly for admission guidance and general enquiries.</p>
              <button onClick={() => setShowApply(true)} className="mt-7 rounded-xl bg-white text-[var(--color-brand-dark)] px-6 py-3 font-bold hover:bg-emerald-50">Apply Online Now</button>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-7">
              <h2 className="text-xl font-semibold mb-5">School Hours</h2>
              <div className="space-y-3 text-sm text-emerald-50">
                <div className="flex justify-between gap-5"><span>Monday - Friday</span><strong>8:00 AM - 2:00 PM</strong></div>
                <div className="flex justify-between gap-5"><span>Saturday</span><strong>8:00 AM - 12:00 PM</strong></div>
                <div className="flex justify-between gap-5"><span>Sunday</span><strong>Closed</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 py-14">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand)]">Get In Touch</p>
            <h2 className="text-3xl font-bold mt-2">We'd love to hear from you</h2>
            <p className="text-[var(--color-slate)] mt-2">Reach out to us through any of the following ways.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <InfoCard title="Address" text={contact.address} />
            <InfoCard title="Phone" text={contact.phone} href={`tel:${contact.phone.replace(/-/g, "")}`} />
            <InfoCard title="Email" text={contact.email} href={`mailto:${contact.email}`} />
            <InfoCard title="School Hours" text="Monday - Friday: 8:00 AM - 2:00 PM\nSaturday: 8:00 AM - 12:00 PM\nSunday: Closed" />
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <a href={`tel:${contact.phone.replace(/-/g, "")}`} className="rounded-lg bg-[var(--color-brand)] text-white px-5 py-3 font-semibold">Call Now</a>
            <a href={`mailto:${contact.email}`} className="rounded-lg border border-[var(--color-line)] px-5 py-3 font-semibold">Send Email</a>
            <button onClick={() => setShowApply(true)} className="rounded-lg bg-[var(--color-accent)] text-white px-5 py-3 font-semibold">Online Apply</button>
          </div>
        </section>
      </main>

      {showApply && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 md:p-8">
              <div className="flex justify-between items-start gap-4 mb-5">
                <div><h2 className="text-2xl font-bold">Online Admission Application</h2><p className="text-sm text-[var(--color-slate)] mt-1">Submit your application for review by the school.</p></div>
                <button onClick={() => { setShowApply(false); setSubmitted(false); setError(""); }} className="text-xl">×</button>
              </div>
              {submitted ? (
                <div className="rounded-xl bg-[var(--color-brand-light)] p-5 text-[var(--color-brand-dark)]">
                  <h3 className="font-bold text-lg">Application submitted successfully.</h3>
                  <p className="text-sm mt-1">The school administration will review your application.</p>
                  <button onClick={() => { setSubmitted(false); setShowApply(false); }} className="mt-4 rounded-lg bg-[var(--color-brand)] text-white px-4 py-2">Close</button>
                </div>
              ) : (
                <form onSubmit={submitApplication} className="space-y-4">
                  {error && <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
                  <Field label="Applicant Name"><input className="w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-brand)]" required value={form.applicantName} onChange={(e) => update("applicantName", e.target.value)} /></Field>
                  <Field label="Applied For Class"><input className="w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-brand)]" required value={form.appliedForClass} onChange={(e) => update("appliedForClass", e.target.value)} /></Field>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Guardian Name"><input className="w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-brand)]" value={form.guardianName} onChange={(e) => update("guardianName", e.target.value)} /></Field>
                    <Field label="Guardian Phone"><input className="w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-brand)]" value={form.guardianPhone} onChange={(e) => update("guardianPhone", e.target.value)} /></Field>
                  </div>
                  <Field label="Additional Notes"><textarea className="w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--color-brand)]" rows="3" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></Field>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowApply(false)} className="rounded-lg border border-[var(--color-line)] px-5 py-2.5">Cancel</button>
                    <button type="submit" className="rounded-lg bg-[var(--color-brand)] text-white px-5 py-2.5 font-semibold">Submit Application</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, text, href }) {
  const content = <div className="rounded-xl border border-[var(--color-line)] bg-white p-5 h-full"><h3 className="font-semibold text-[var(--color-brand)] mb-2">{title}</h3><p className="text-sm text-[var(--color-slate)] whitespace-pre-line leading-6">{text}</p></div>;
  return href ? <a href={href}>{content}</a> : content;
}

function Field({ label, children }) {
  return <label className="block"><span className="block text-xs font-semibold text-[var(--color-slate)] mb-1.5">{label}</span>{children}</label>;
}
