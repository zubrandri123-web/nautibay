"use client";

import { useState } from "react";

type StrengthLabels = { weak: string; medium: string; strong: string };

type Props = {
  name: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  showLabel: string;
  hideLabel: string;
  hint?: string;
  strengthLabels?: StrengthLabels;
};

function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/\d/.test(pw) && /\p{L}/u.test(pw)) score += 1;
  if (/[^\p{L}\d]/u.test(pw)) score += 1;
  return score; // 0..4
}

export function PasswordField({
  name,
  required,
  minLength,
  autoComplete,
  showLabel,
  hideLabel,
  hint,
  strengthLabels,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");

  const score = scorePassword(value);
  const level = score <= 1 ? 0 : score <= 3 ? 1 : 2;
  const meta = strengthLabels
    ? [
        { label: strengthLabels.weak, color: "bg-red-500", text: "text-red-600" },
        { label: strengthLabels.medium, color: "bg-amber-500", text: "text-amber-600" },
        { label: strengthLabels.strong, color: "bg-green-600", text: "text-green-700" },
      ][level]
    : null;

  return (
    <div className="mt-1">
      <div className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 focus:border-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {meta && value.length > 0 ? (
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex h-1.5 flex-1 gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex-1 rounded-full ${i <= level ? meta.color : "bg-slate-200"}`}
              />
            ))}
          </div>
          <span className={`text-xs font-medium ${meta.text}`}>{meta.label}</span>
        </div>
      ) : null}

      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
