"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { createBerthAction } from "@/app/[locale]/berths/new/actions";
import { updateBerthAction } from "@/app/[locale]/berths/[id]/edit/actions";
import {
  berthListingSchema,
  type BerthListingFormValues,
  type BerthListingInput,
} from "@/lib/berths/schema";
import {
  DEALS,
  PLACE_TYPES,
  RENT_PERIODS,
} from "@/lib/berths/constants";
import { COUNTRIES, countryName, CURRENCIES } from "@/lib/boats/constants";
import { compressImage } from "@/lib/boats/compress-image";

type Photo = { path: string; previewUrl: string; uploading: boolean; error?: string };
type EditInitial = Partial<BerthListingFormValues> & { photoPaths?: string[] };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicPhotoUrl = (p: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p}`;

export function BerthForm({
  locale,
  userId,
  sellerEmail,
  listingId,
  initial,
}: {
  locale: string;
  userId: string;
  sellerEmail: string;
  listingId?: string;
  initial?: EditInitial;
}) {
  const t = useTranslations("BerthForm");
  const tPlace = useTranslations("PlaceType");
  const tDeal = useTranslations("Deal");
  const tPeriod = useTranslations("RentPeriod");
  const tCommon = useTranslations("Common");
  const tForm = useTranslations("BoatForm");

  const [photos, setPhotos] = useState<Photo[]>(
    (initial?.photoPaths ?? []).map((path) => ({
      path,
      previewUrl: publicPhotoUrl(path),
      uploading: false,
    })),
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BerthListingFormValues, unknown, BerthListingInput>({
    resolver: zodResolver(berthListingSchema),
    defaultValues: {
      currency: "EUR",
      dimUnit: "m",
      deal: "rent",
      photoPaths: initial?.photoPaths ?? [],
      contactEmail: sellerEmail,
      ...initial,
    },
  });

  const deal = watch("deal");
  const placeType = watch("placeType");
  // Draft (how deep a hull sits) only means something for a berth actually
  // in the water — a dry-storage spot or a locker has no water under it.
  const showDraft = placeType !== "dry_storage" && placeType !== "locker";

  useEffect(() => {
    if (!showDraft) setValue("draftM", "");
  }, [showDraft, setValue]);

  const countryOptions = [...COUNTRIES]
    .map((code) => ({ code, name: countryName(code, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const supabase = createClient();
    const started = photos.length;
    setPhotos((prev) => [
      ...prev,
      ...Array.from(files).map((f) => ({
        path: "",
        previewUrl: URL.createObjectURL(f),
        uploading: true,
      })),
    ]);
    await Promise.all(
      Array.from(files).map(async (file, i) => {
        const compressed = await compressImage(file);
        const path = `${userId}/${crypto.randomUUID()}-${compressed.name}`;
        const { error } = await supabase.storage
          .from("boat-photos")
          .upload(path, compressed);
        setPhotos((prev) => {
          const next = [...prev];
          const idx = started + i;
          next[idx] = error
            ? { ...next[idx], uploading: false, error: error.message }
            : { ...next[idx], uploading: false, path };
          setValue(
            "photoPaths",
            next.filter((p) => p.path).map((p) => p.path),
            { shouldValidate: true },
          );
          return next;
        });
      }),
    );
  }

  function removePhoto(i: number) {
    setPhotos((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      setValue(
        "photoPaths",
        next.filter((p) => p.path).map((p) => p.path),
        { shouldValidate: true },
      );
      return next;
    });
  }

  async function onSubmit(values: BerthListingInput) {
    setServerError(null);
    setSubmitting(true);
    const toM = (v: number | undefined) =>
      v == null
        ? v
        : values.dimUnit === "ft"
          ? Math.round((v / 3.28084) * 100) / 100
          : v;
    const payload = {
      ...values,
      lengthM: toM(values.lengthM),
      beamM: toM(values.beamM),
      draftM: toM(values.draftM),
    };
    const result = listingId
      ? await updateBerthAction(listingId, locale, payload)
      : await createBerthAction(locale, payload);
    setSubmitting(false);
    if (result?.error) setServerError(result.error);
  }

  const input =
    "w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none";
  const check = "flex items-center gap-2 text-sm text-slate-700";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
      {serverError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionMain")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("placeType")} error={errors.placeType?.message}>
            <select {...register("placeType")} className={input}>
              <option value="">—</option>
              {PLACE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {tPlace(v)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("deal")} error={errors.deal?.message}>
            <select {...register("deal")} className={input}>
              {DEALS.map((v) => (
                <option key={v} value={v}>
                  {tDeal(v)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("price")} error={errors.price?.message}>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                inputMode="decimal"
                {...register("price")}
                className={input}
              />
              <select
                aria-label={tForm("currency")}
                {...register("currency")}
                className="rounded-md border border-slate-300 px-2 py-2"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </Field>
          {deal === "rent" ? (
            <Field label={t("rentPeriod")} error={errors.rentPeriod?.message}>
              <select {...register("rentPeriod")} className={input}>
                <option value="">—</option>
                {RENT_PERIODS.map((v) => (
                  <option key={v} value={v}>
                    {tPeriod(v)}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionLocation")}
        </h2>
        <Field label={t("marina")} optional>
          <input {...register("marina")} className={input} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={tForm("country")} error={errors.country?.message}>
            <select {...register("country")} className={input}>
              <option value="">—</option>
              {countryOptions.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tForm("region")} optional>
            <input {...register("region")} className={input} />
          </Field>
          <Field label={tForm("city")} error={errors.city?.message}>
            <input {...register("city")} className={input} />
          </Field>
          <Field label={tForm("postalCode")} error={errors.postalCode?.message}>
            <input {...register("postalCode")} className={input} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("sectionSize")}
          </h2>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            {tForm("dimUnits")}
            <select
              {...register("dimUnit")}
              className="rounded-md border border-slate-300 px-2 py-1"
            >
              <option value="m">{tForm("unitMeters")}</option>
              <option value="ft">{tForm("unitFeet")}</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-slate-400">{t("sizeHint")}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={t("lengthM")} optional error={errors.lengthM?.message}>
            <input type="number" step="any" inputMode="decimal" {...register("lengthM")} className={input} />
          </Field>
          <Field label={t("beamM")} optional error={errors.beamM?.message}>
            <input type="number" step="any" inputMode="decimal" {...register("beamM")} className={input} />
          </Field>
          {showDraft ? (
            <Field label={t("draftM")} optional error={errors.draftM?.message}>
              <input type="number" step="any" inputMode="decimal" {...register("draftM")} className={input} />
            </Field>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionAmenities")}
        </h2>
        <label className={check}>
          <input type="checkbox" {...register("water")} /> {t("water")}
        </label>
        <label className={check}>
          <input type="checkbox" {...register("electricity")} /> {t("electricity")}
        </label>
        <label className={check}>
          <input type="checkbox" {...register("security")} /> {t("security")}
        </label>
        <label className={check}>
          <input type="checkbox" {...register("liveaboard")} /> {t("liveaboard")}
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {tForm("description")}
        </h2>
        <textarea rows={4} {...register("description")} className={input} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {tForm("sectionContact")}
        </h2>
        <Field label={tForm("contactPhone")} error={errors.contactPhone?.message}>
          <input type="tel" {...register("contactPhone")} className={input} />
        </Field>
        <label className={check}>
          <input type="checkbox" {...register("contactPhoneWhatsapp")} />
          {tForm("contactWhatsapp")}
        </label>
        <label className={check}>
          <input type="checkbox" {...register("contactPhoneTelegram")} />
          {tForm("contactTelegram")}
        </label>
        <Field label={tForm("contactEmail")} error={errors.contactEmail?.message}>
          <input type="email" {...register("contactEmail")} className={input} />
        </Field>
        <Field label={tForm("contactNote")} hint={tForm("contactNoteHint")} optional>
          <textarea rows={2} {...register("contactNote")} className={input} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionPhotos")}{" "}
          <span className="lowercase text-slate-400">
            ({tCommon("optional")})
          </span>
        </h2>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
                {photo.uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs">
                    {tCommon("loading")}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={tCommon("close")}
                    className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/60 text-sm text-white"
                  >
                    ×
                  </button>
                )}
                {photo.error ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 p-1 text-center text-[10px] text-red-700">
                    {photo.error}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="rounded-md border border-slate-300 bg-slate-50 p-4">
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register("promoteSocial")} className="mt-0.5" />
          <span>{tForm("promoteSocial")}</span>
        </label>
        <p className="mt-1 pl-6 text-xs text-slate-500">
          {tForm("promoteSocialHint")}
        </p>
      </div>

      {Object.keys(errors).length > 0 ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {tForm("hasErrors")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn-3d btn-3d-green w-full px-4 py-3 disabled:opacity-50"
      >
        {submitting
          ? tCommon("loading")
          : listingId
            ? tForm("saveChanges")
            : t("submit")}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const tCommon = useTranslations("Common");
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">
        {label}{" "}
        {optional ? (
          <span className="text-slate-400">({tCommon("optional")})</span>
        ) : null}
      </span>
      {hint ? <span className="block text-xs text-slate-400">{hint}</span> : null}
      <div className="mt-1">{children}</div>
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : null}
    </label>
  );
}
