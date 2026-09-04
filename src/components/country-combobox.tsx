"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { COUNTRIES, countryName } from "@/lib/boats/constants";

// A searchable stand-in for a plain <select> of 195 countries — type a few
// letters and the list filters as you go, or open it empty and scroll.
// Works two ways: controlled (pass value/onChange, e.g. from react-hook-form's
// Controller) or uncontrolled with a `name` prop, which renders a hidden input
// so it still submits inside a plain server-rendered <form> (catalog filters).
export function CountryCombobox({
  id,
  name,
  locale,
  value,
  defaultValue,
  onChange,
  placeholder = "—",
  className,
}: {
  id?: string;
  name?: string;
  locale: string;
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const listId = useId();
  const options = useMemo(
    () =>
      [...COUNTRIES]
        .map((code) => ({ code, name: countryName(code, locale) }))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [locale],
  );

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const code = isControlled ? value : internal;
  const selectedName = options.find((o) => o.code === code)?.name ?? "";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // While closed, the field just shows the selected country's name — no
  // effect needed to keep it in sync, it's derived fresh on every render.
  const displayValue = open ? query : selectedName;

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [query, options]);

  function selectCode(newCode: string) {
    if (!isControlled) setInternal(newCode);
    onChange?.(newCode);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open) {
        e.preventDefault();
        const opt = filtered[activeIndex];
        if (opt) selectCode(opt.code);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {name ? <input type="hidden" name={name} value={code} /> : null}
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={displayValue}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setActiveIndex(0);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-300 bg-white py-1 shadow-lg"
        >
          {code ? (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                selectCode("");
              }}
              className="cursor-pointer px-3 py-1.5 text-sm text-slate-400"
            >
              {placeholder}
            </li>
          ) : null}
          {filtered.map((o, i) => (
            <li
              key={o.code}
              role="option"
              aria-selected={o.code === code}
              onMouseDown={(e) => {
                e.preventDefault();
                selectCode(o.code);
              }}
              className={`cursor-pointer px-3 py-1.5 text-sm ${
                i === activeIndex ? "bg-sky-100" : ""
              } ${o.code === code ? "font-medium text-sky-800" : "text-slate-700"}`}
            >
              {o.name}
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-3 py-1.5 text-sm text-slate-400">—</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
