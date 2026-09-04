import { Link } from "@/i18n/navigation";

// A visible way back to the catalog from a listing page — plain text links
// were too easy to miss, so this is a proper green button like the rest of
// the "go forward" actions on the site.
export function BackToSearch({ href, label }: { href: string; label: string }) {
  return (
    <p className="mt-8">
      <Link href={href} className="btn-3d btn-3d-green inline-block px-4 py-2 text-sm">
        ← {label}
      </Link>
    </p>
  );
}
