import { DetailIcon, type DetailIconName } from "@/components/detail-icons";

// A single labelled spec on a detail page ("Length: 12.5 m"), with a small
// icon so it reads at a glance even for someone who doesn't know the word.
export function SpecDetail({
  icon,
  label,
  value,
}: {
  icon?: DetailIconName;
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-400">
        {icon ? <DetailIcon name={icon} /> : null}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value}</dd>
    </div>
  );
}
