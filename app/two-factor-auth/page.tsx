"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

export default function TwoFactorAuthPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function handleChange(index: number, raw: string) {
    const val = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = val;
    setDigits(next);
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault();
    router.push("/class");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 py-12">
      {/* Decorative Geometric Orange SVG Background (matches TwoFactorAuth.vue / vue_2fa.png) */}
      <svg
        className="pointer-events-none fixed inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="tfa-dots-orange" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.4" fill="#ea580c" opacity="0.22" />
          </pattern>
          <pattern id="tfa-waves" width="16" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 5 Q4 0 8 5 T16 5" fill="none" stroke="#9a3412" strokeWidth="1.5" opacity="0.45" />
          </pattern>
        </defs>
        <circle cx="310" cy="40" r="95" fill="url(#tfa-dots-orange)" />
        <circle cx="110" cy="435" r="130" fill="url(#tfa-waves)" />
        <circle cx="480" cy="870" r="180" fill="#fb923c" opacity="0.55" />
        <circle cx="670" cy="950" r="105" fill="#fdba74" opacity="0.55" />
        <polygon points="1845,215 1900,190 1895,295" fill="#fed7aa" opacity="0.5" />
      </svg>

      <div className="relative z-10 flex w-full max-w-[380px] flex-col items-center">
        <div className="mb-4 select-none text-[2.25rem] font-black tracking-tight text-gray-900">
          Silid<span className="text-[#F97316]">LMS</span>
        </div>

        <p className="text-sm font-medium text-gray-600">Two-Factor Authentication</p>
        <p className="mt-1 text-xs text-gray-400">Enter the code from your OTP App</p>

        <form onSubmit={handleVerify} className="mt-7 w-full space-y-6">
          <div className="flex justify-center gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                aria-label={`Verification digit ${idx + 1}`}
                className="h-14 w-12 rounded-lg border border-gray-300 bg-white text-center text-xl font-bold text-gray-900 transition-colors focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
            ))}
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-full bg-[#F97316] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#ea580c]"
          >
            Verify
          </button>
        </form>

        <div className="my-6 h-px w-full bg-gray-200" />

        <Link
          href="/login"
          className="text-xs font-semibold text-[#F97316] transition-colors hover:text-[#ea580c]"
        >
          Back to Login
        </Link>
      </div>

      <p className="relative z-10 mt-12 text-xs text-gray-400">
        © 2026 SilidLMS. All rights reserved.
      </p>
    </div>
  );
}
