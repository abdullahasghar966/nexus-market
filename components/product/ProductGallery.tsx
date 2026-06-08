"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  alt: string;
  /** Discount percentage to show as a corner badge (0 = none). */
  discount?: number;
}

/**
 * Product image gallery: a large active image plus a selectable thumbnail strip.
 * Clicking the main image opens a full-screen lightbox with click-to-zoom (1×↔2×
 * pan) and prev/next navigation. When fewer than four images are available the
 * strip is padded with neutral placeholder tiles to keep the kit's 4-up rhythm.
 */
export function ProductGallery({ images, alt, discount = 0 }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const placeholders = Math.max(0, 4 - images.length);

  const next = () => {
    setZoomed(false);
    setActive((i) => (i + 1) % images.length);
  };
  const prev = () => {
    setZoomed(false);
    setActive((i) => (i - 1 + images.length) % images.length);
  };

  // Keyboard controls + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, images.length]);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => {
          setZoomed(false);
          setLightbox(true);
        }}
        aria-label="Open image viewer"
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-line bg-surface-container-low"
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <div className="absolute left-4 top-4">
            <Badge variant="accentSolid">-{discount}%</Badge>
          </div>
        )}
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-on-surface/70 px-2.5 py-1 text-label-sm font-medium text-surface opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Icon name="zoom_in" size={16} /> Zoom
        </span>
      </button>

      <div className="grid grid-cols-4 gap-4">
        {images.map((img, i) => (
          <button
            key={img + i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={i === active}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border bg-surface-container-low transition-all",
              i === active
                ? "border-primary ring-2 ring-primary"
                : "border-outline-variant hover:border-primary/50",
            )}
          >
            <Image
              src={img}
              alt={`${alt} thumbnail ${i + 1}`}
              fill
              sizes="120px"
              className="object-cover"
            />
          </button>
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            aria-hidden
            className="aspect-square rounded-lg border border-outline-variant bg-surface-container"
          />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightbox(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="fixed inset-0 z-[70] flex flex-col bg-black/90"
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-4 py-3 text-surface"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-label-md text-surface/80">
                {active + 1} / {images.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomed((z) => !z)}
                  aria-label={zoomed ? "Zoom out" : "Zoom in"}
                  className="rounded-full p-2 text-surface/90 transition-colors hover:bg-white/10"
                >
                  <Icon name={zoomed ? "zoom_out" : "zoom_in"} size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setLightbox(false)}
                  aria-label="Close viewer"
                  className="rounded-full p-2 text-surface/90 transition-colors hover:bg-white/10"
                >
                  <Icon name="close" size={24} />
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="relative flex flex-1 items-center justify-center overflow-auto px-4">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Previous image"
                  className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-surface backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Icon name="chevron_left" size={26} />
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[active]}
                alt={alt}
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed((z) => !z);
                }}
                className={cn(
                  "select-none transition-transform duration-300",
                  zoomed
                    ? "max-w-none w-[160%] cursor-zoom-out md:w-[120%]"
                    : "max-h-[78vh] max-w-[92vw] cursor-zoom-in object-contain",
                )}
              />

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next image"
                  className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-surface backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Icon name="chevron_right" size={26} />
                </button>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div
                className="flex justify-center gap-2 px-4 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => {
                      setZoomed(false);
                      setActive(i);
                    }}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      "relative h-14 w-14 overflow-hidden rounded-lg border-2 transition-colors",
                      i === active ? "border-white" : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
