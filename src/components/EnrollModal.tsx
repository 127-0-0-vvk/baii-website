"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Course = {
  code: string;
  title: string;
  prerequisite_code: string | null;
};

type Step = "prereq-check" | "form" | "success";

export default function EnrollModal({
  course,
  onClose,
}: {
  course: Course | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>(
    course?.prerequisite_code ? "prereq-check" : "form"
  );
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    school: "",
    city: "",
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("enrollment_requests").insert({
      ...form,
      course_code: course!.code,
      finished_foundation: course?.prerequisite_code ? true : null,
    });
    setLoading(false);
    setStep("success");
  };

  if (!course) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl p-8 z-10"
          style={{
            background: "rgba(13, 31, 60, 0.98)",
            border: "1px solid rgba(196,125,42,0.3)",
          }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Prereq check */}
          {step === "prereq-check" && (
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(196,125,42,0.15)" }}
              >
                <AlertCircle size={24} style={{ color: "#c47d2a" }} />
              </div>
              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Prerequisite Check
              </h3>
              <p className="text-white/60 text-sm mb-6">
                <span style={{ color: "#c47d2a" }}>{course.title}</span>{" "}
                requires completing{" "}
                <span className="text-white font-semibold">
                  {course.prerequisite_code === "ETF"
                    ? "Energy Foundation (ETF)"
                    : "Semiconductor Foundation (SCF)"}
                </span>{" "}
                first.
                <br />
                <br />
                Have you completed the foundation course?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #c47d2a, #d4913a)",
                  }}
                >
                  Yes, I have ✓
                </button>
                <button
                  onClick={() => {
                    onClose();
                    document
                      .getElementById("courses")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  No, show me ETF
                </button>
              </div>
            </div>
          )}

          {/* Enrollment form */}
          {step === "form" && (
            <>
              <h3
                className="text-xl font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Enroll Interest
              </h3>
              <p className="text-white/40 text-xs mb-6">
                {course.code} · {course.title}
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                {(
                  [
                    { key: "full_name", label: "Full Name", placeholder: "Your name" },
                    { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
                    { key: "school", label: "School / Institution", placeholder: "School name" },
                    { key: "city", label: "City", placeholder: "City" },
                  ] as const
                ).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-white/50 text-xs mb-1 block">
                      {label} *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      className="w-full rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #c47d2a, #d4913a)",
                  }}
                >
                  {loading ? "Submitting…" : "Submit Interest →"}
                </button>
              </form>
              <p className="text-white/30 text-xs text-center mt-3">
                Our team will contact you within 48 hours to confirm your cohort slot.
              </p>
            </>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(196,125,42,0.15)" }}
              >
                <CheckCircle2 size={28} style={{ color: "#c47d2a" }} />
              </div>
              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Interest Received!
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">
                We&apos;ll reach out within 48 hours to confirm your slot in{" "}
                <span style={{ color: "#c47d2a" }}>{course.title}</span>.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
