"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { createListingAction } from "@/app/[locale]/boats/new/actions";
import {
  boatListingSchema,
  type BoatListingFormValues,
  type BoatListingInput,
} from "@/lib/boats/schema";
import {
  BOAT_TYPES,
  CONDITIONS,
  COUNTRIES,
  CURRENCIES,
  FUEL_TYPES,
  HULL_MATERIALS,
} from "@/lib/boats/constants";
import { compressImage } from "@/lib/boats/compress-image";

type Photo = { path: string; previewUrl: string; uploading: boolean; error?: string };

export function BoatForm({ locale, userId }: { locale: string; userId: string }) {
  const t = useTranslations("BoatForm");
  const tType = useTranslations("BoatType");
  const tHull = useTranslations("HullMaterial");
  const tFuel = useTranslations("FuelType");
  const tCondition = useTranslations("Condition");
  const tCommon = useTranslations("Common");

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BoatListingFormValues, unknown, BoatListingInput>({
    resolver: zodResolver(boatListingSchema),
    defaultValues: { currency: "EUR", photoPaths: [] },
  });

  const boatType = watch("boatType");
  const isBroker = watch("isBroker");

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const supabase = createClient();

    const newPhotos: Photo[] = Array.from(files).map((file) => ({
      path: "",
      previewUrl: URL.createObjectURL(file),
      uploading: true,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);

    const startIndex = photos.length;

    await Promise.all(
      Array.from(files).map(async (file, i) => {
        const compressed = await compressImage(file);
        const path = `${userId}/${crypto.randomUUID()}-${compressed.name}`;
        const { error } = await supabase.storage
          .from("boat-photos")
          .upload(path, compressed);

        setPhotos((prev) => {
          const next = [...prev];
          const idx = startIndex + i;
          next[idx] = error
            ? { ...next[idx], uploading: false, error: error.message }
            : { ...next[idx], uploading: false, path };
          const paths = next.filter((p) => p.path).map((p) => p.path);
          setValue("photoPaths", paths, { shouldValidate: true });
          return next;
        });
      }),
    );
  }

  async function onSubmit(values: BoatListingInput) {
    setServerError(null);
    setSubmitting(true);
    const result = await createListingAction(locale, values);
    setSubmitting(false);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
      {serverError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionBasic")}
        </h2>

        <Field label={t("boatType")} error={errors.boatType?.message}>
          <select
            {...register("boatType")}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">—</option>
            {BOAT_TYPES.map((type) => (
              <option key={type} value={type}>
                {tType(type)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("condition")} optional>
          <select
            {...register("condition")}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">—</option>
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {tCondition(condition)}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("brand")} optional>
            <input
              {...register("brand")}
              placeholder={t("brandPlaceholder")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label={t("model")} optional>
            <input
              {...register("model")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("price")} error={errors.price?.message}>
            <div className="flex gap-2">
              <input
                type="number"
                step="1"
                {...register("price")}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
              <select
                aria-label={t("currency")}
                {...register("currency")}
                className="rounded-md border border-slate-300 px-2 py-2"
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </Field>
          <Field label={t("yearBuilt")} error={errors.yearBuilt?.message}>
            <input
              type="number"
              {...register("yearBuilt")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
        </div>

        <Field
          label={t("refitYear")}
          optional
          error={errors.refitYear?.message}
        >
          <input
            type="number"
            {...register("refitYear")}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={t("country")} error={errors.country?.message}>
            <select
              {...register("country")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">—</option>
              {COUNTRIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("region")} optional>
            <input
              {...register("region")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label={t("city")} optional>
            <input
              {...register("city")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionDimensions")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={t("lengthFt")} error={errors.lengthFt?.message}>
            <input
              type="number"
              {...register("lengthFt")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label={t("beamFt")} optional error={errors.beamFt?.message}>
            <input
              type="number"
              {...register("beamFt")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label={t("draftFt")} optional error={errors.draftFt?.message}>
            <input
              type="number"
              {...register("draftFt")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
        </div>

        {boatType === "sailboat" ? (
          <Field
            label={t("sailAreaM2")}
            hint={t("sailAreaHint")}
            optional
            error={errors.sailAreaM2?.message}
          >
            <input
              type="number"
              {...register("sailAreaM2")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionEngine")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("fuelType")} optional>
            <select
              {...register("fuelType")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">—</option>
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {tFuel(fuel)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={t("enginePowerHp")}
            optional
            error={errors.enginePowerHp?.message}
          >
            <input
              type="number"
              {...register("enginePowerHp")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionDetails")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={t("hullMaterial")} optional>
            <select
              {...register("hullMaterial")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">—</option>
              {HULL_MATERIALS.map((material) => (
                <option key={material} value={material}>
                  {tHull(material)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("cabins")} optional error={errors.cabins?.message}>
            <input
              type="number"
              {...register("cabins")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label={t("berths")} optional error={errors.berths?.message}>
            <input
              type="number"
              {...register("berths")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </Field>
        </div>
        <Field label={t("description")} hint={t("descriptionHint")} optional>
          <textarea
            {...register("description")}
            rows={5}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </Field>
        <Field label={t("videoUrl")} optional error={errors.videoUrl?.message}>
          <input
            type="url"
            {...register("videoUrl")}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </Field>
      </section>

      <details className="rounded-md border border-slate-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionAdvanced")}
        </summary>
        <p className="mt-2 text-xs text-slate-400">{t("sectionAdvancedHint")}</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("flagCountry")} optional>
            <select
              {...register("flagCountry")}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">—</option>
              {COUNTRIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register("isBroker")} />
          {t("isBroker")}
        </label>
        {isBroker ? (
          <div className="mt-2">
            <Field label={t("brokerCompanyName")} optional>
              <input
                {...register("brokerCompanyName")}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </Field>
          </div>
        ) : null}
      </details>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("sectionPhotos")}
        </h2>
        <Field
          label={t("photos")}
          hint={t("photosHint")}
          error={errors.photoPaths?.message}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
        </Field>

        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {photo.uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs">
                    {tCommon("loading")}
                  </div>
                ) : null}
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
          <input
            type="checkbox"
            {...register("promoteSocial")}
            className="mt-0.5"
          />
          <span>{t("promoteSocial")}</span>
        </label>
        <p className="mt-1 pl-6 text-xs text-slate-500">
          {t("promoteSocialHint")}
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-3d btn-3d-green w-full px-4 py-3 disabled:opacity-50"
      >
        {submitting ? tCommon("loading") : t("submit")}
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
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">
        {label}
        {optional ? (
          <span className="ml-1 text-xs font-normal text-slate-400">
            (opt.)
          </span>
        ) : null}
      </span>
      {hint ? <span className="block text-xs text-slate-400">{hint}</span> : null}
      <div className="mt-1">{children}</div>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
