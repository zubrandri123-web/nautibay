"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { createCharterAction } from "@/app/[locale]/charter/new/actions";
import { updateCharterAction } from "@/app/[locale]/charter/[id]/edit/actions";
import {
  charterListingSchema,
  type CharterListingFormValues,
  type CharterListingInput,
} from "@/lib/charter/schema";
import {
  CHARTER_BOAT_TYPES,
  CHARTER_TYPES,
  RATE_PERIODS,
} from "@/lib/charter/constants";
import {
  COUNTRIES,
  countryName,
  CURRENCIES,
  STOVE_TYPES,
  TOILET_TYPES,
} from "@/lib/boats/constants";
import { compressImage } from "@/lib/boats/compress-image";

type Photo = { path: string; previewUrl: string; uploading: boolean; error?: string };
type EditInitial = Partial<CharterListingFormValues> & { photoPaths?: string[] };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicPhotoUrl = (p: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p}`;

export function CharterForm({
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
  const t = useTranslations("CharterForm");
  const tType = useTranslations("CharterType");
  const tRate = useTranslations("RatePeriod");
  const tBoat = useTranslations("BoatType");
  const tCommon = useTranslations("Common");
  const tForm = useTranslations("BoatForm");
  const tToilet = useTranslations("ToiletType");
  const tStove = useTranslations("StoveType");

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
    setValue,
    formState: { errors },
  } = useForm<CharterListingFormValues, unknown, CharterListingInput>({
    resolver: zodResolver(charterListingSchema),
    defaultValues: {
      currency: "EUR",
      dimUnit: "m",
      charterType: "skippered",
      photoPaths: initial?.photoPaths ?? [],
      contactEmail: sellerEmail,
      ...initial,
    },
  });

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

  async function onSubmit(values: CharterListingInput) {
    setServerError(null);
    setSubmitting(true);
    const toM = (v: number | undefined) =>
      v == null
        ? v
        : values.dimUnit === "ft"
          ? Math.round((v / 3.28084) * 100) / 100
          : v;
    const payload = { ...values, lengthM: toM(values.lengthM) };
    const result = listingId
      ? await updateCharterAction(listingId, locale, payload)
      : await createCharterAction(locale, payload);
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
        <Field label={t("charterType")} error={errors.charterType?.message}>
          <select {...register("charterType")} className={input}>
            {CHARTER_TYPES.map((v) => (
              <option key={v} value={v}>
                {tType(v)}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("price")} hint={t("priceHint")} optional error={errors.price?.message}>
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
          <Field
            label={t("ratePeriod")}
            hint={t("ratePeriodHint")}
            optional
            error={errors.ratePeriod?.message}
          >
            <select {...register("ratePeriod")} className={input}>
              <option value="">—</option>
              {RATE_PERIODS.map((v) => (
                <option key={v} value={v}>
                  {tRate(v)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={t("minDays")} hint={t("minDaysHint")} optional error={errors.minDays?.message}>
          <input type="number" inputMode="numeric" {...register("minDays")} className={input} />
        </Field>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("sectionBoat")}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("boatType")} optional error={errors.boatType?.message}>
            <select {...register("boatType")} className={input}>
              <option value="">—</option>
              {CHARTER_BOAT_TYPES.map((v) => (
                <option key={v} value={v}>
                  {tBoat(v)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("boatName")} optional>
            <input {...register("boatName")} className={input} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label={tForm("lengthM")} optional error={errors.lengthM?.message}>
            <input type="number" step="any" inputMode="decimal" {...register("lengthM")} className={input} />
          </Field>
          <Field label={t("yearBuilt")} optional error={errors.yearBuilt?.message}>
            <input type="number" inputMode="numeric" {...register("yearBuilt")} className={input} />
          </Field>
          <Field label={t("cabins")} optional error={errors.cabins?.message}>
            <input type="number" inputMode="numeric" {...register("cabins")} className={input} />
          </Field>
          <Field label={t("berthsCount")} optional error={errors.berthsCount?.message}>
            <input type="number" inputMode="numeric" {...register("berthsCount")} className={input} />
          </Field>
        </div>
        <Field label={t("maxPeople")} optional error={errors.maxPeople?.message}>
          <input type="number" inputMode="numeric" {...register("maxPeople")} className={input} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionLocation")}
        </h2>
        <Field label={t("marina")} optional>
          <input {...register("marina")} className={input} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={tForm("country")} optional error={errors.country?.message}>
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
          <Field label={tForm("city")} optional>
            <input {...register("city")} className={input} />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionIncluded")}
        </h2>
        <label className={check}>
          <input type="checkbox" {...register("skipperIncluded")} /> {t("skipperIncluded")}
        </label>
        <label className={check}>
          <input type="checkbox" {...register("fuelIncluded")} /> {t("fuelIncluded")}
        </label>
        <label className={check}>
          <input type="checkbox" {...register("cleaningIncluded")} /> {t("cleaningIncluded")}
        </label>
        <label className={check}>
          <input type="checkbox" {...register("beddingIncluded")} /> {t("beddingIncluded")}
        </label>
        <label className={check}>
          <input type="checkbox" {...register("licenseRequired")} /> {t("licenseRequired")}
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("toiletType")} optional error={errors.toiletType?.message}>
            <select {...register("toiletType")} className={input}>
              <option value="">—</option>
              {TOILET_TYPES.map((v) => (
                <option key={v} value={v}>
                  {tToilet(v)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("toiletCount")} optional error={errors.toiletCount?.message}>
            <input
              type="number"
              inputMode="numeric"
              {...register("toiletCount")}
              className={input}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={check}>
            <input type="checkbox" {...register("shower")} /> {t("shower")}
          </label>
          <Field label={t("showerCount")} optional error={errors.showerCount?.message}>
            <input
              type="number"
              inputMode="numeric"
              {...register("showerCount")}
              className={input}
            />
          </Field>
        </div>
        <label className={check}>
          <input type="checkbox" {...register("grill")} /> {t("grill")}
        </label>
        <Field label={t("stoveType")} optional error={errors.stoveType?.message}>
          <select {...register("stoveType")} className={input}>
            <option value="">—</option>
            {STOVE_TYPES.map((v) => (
              <option key={v} value={v}>
                {tStove(v)}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionAvailability")}
        </h2>
        <Field label={t("season")} hint={t("seasonHint")} optional>
          <input {...register("season")} className={input} />
        </Field>
        <div>
          <h3 className="text-sm font-medium text-slate-700">{tForm("description")}</h3>
          <textarea rows={4} {...register("description")} className={`${input} mt-1`} />
        </div>
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
          {t("sectionPhotos")}
        </h2>
        <p className="text-xs text-slate-400">{t("photosHint")}</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        {errors.photoPaths ? (
          <p className="text-xs text-red-600">{errors.photoPaths.message}</p>
        ) : null}
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
