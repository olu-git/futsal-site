"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GalleryPhoto, PhotoCollection } from "@/data/fis-tv";
import styles from "./FisTv.module.css";

export default function PhotoGallery({ collection, photos }: { collection: PhotoCollection; photos: GalleryPhoto[] }) {
  const [active, setActive] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  return <article className={styles.collection} aria-labelledby={`collection-${collection.id}`}>
    <h3 id={`collection-${collection.id}`} className={styles.collectionHeading}>{collection.title}</h3>
    <div className={styles.gallery}>
      {photos.map((photo, index) => <figure key={photo.id}>
        <button type="button" className={styles.photoButton} aria-label={`Enlarge photograph: ${photo.alt}`} aria-haspopup="dialog" onClick={(event) => { trigger.current = event.currentTarget; setActive(index); }}>
          <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" />
          <span className={styles.expandIcon}><Expand size={18} aria-hidden="true" /></span>
        </button>
        <a className={styles.downloadIcon} href={photo.src} download aria-label={`Download photograph: ${photo.alt}`}><Download size={18} aria-hidden="true" /></a>
      </figure>)}
    </div>
    {active !== null && <PhotoViewer collection={collection} photos={photos} initialIndex={active} onDismiss={() => setActive(null)} returnFocus={() => trigger.current?.focus({ preventScroll: true })} />}
  </article>;
}

function PhotoViewer({ collection, photos, initialIndex, onDismiss, returnFocus }: {
  collection: PhotoCollection; photos: GalleryPhoto[]; initialIndex: number; onDismiss: () => void; returnFocus: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(returnFocus);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const photo = photos[index];
  const move = (direction: number) => setIndex((current) => (current + direction + photos.length) % photos.length);

  useEffect(() => {
    const element = dialog.current!;
    const restore = restoreFocus.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    closeButton.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = previousOverflow; restore(); };
  }, []);

  return <dialog ref={dialog} className={styles.lightbox} aria-label={`${collection.title} photo viewer`}
    onCancel={(event) => { event.preventDefault(); onDismiss(); }}
    onKeyDown={(event) => {
      if (event.key === "Tab") {
        const controls = dialog.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]");
        const first = controls?.[0];
        const last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "Home") { event.preventDefault(); setIndex(0); }
      if (event.key === "End") { event.preventDefault(); setIndex(photos.length - 1); }
    }}>
    <div className={styles.viewerHeader}><span className="type-label">{collection.title}</span><button ref={closeButton} type="button" onClick={onDismiss} aria-label="Close photo viewer"><X aria-hidden="true" /></button></div>
    <div className={styles.viewerImage}
      onTouchStart={(event) => { touch.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={(event) => {
        if (touch.current && event.changedTouches.length === 1) {
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
        }
        touch.current = null;
      }}>
      <Image key={photo.id} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="eager" />
    </div>
    <div className={styles.viewerControls}>
      <button type="button" onClick={() => move(-1)} disabled={photos.length < 2} aria-label="Previous photograph"><ChevronLeft aria-hidden="true" /></button>
      <a className={styles.downloadLink} href={photo.src} download><Download size={18} aria-hidden="true" />Download photo</a>
      <span className={styles.viewerStatus} role="status" aria-live="polite" aria-atomic="true">{photo.alt}</span>
      <button type="button" onClick={() => move(1)} disabled={photos.length < 2} aria-label="Next photograph"><ChevronRight aria-hidden="true" /></button>
    </div>
  </dialog>;
}
