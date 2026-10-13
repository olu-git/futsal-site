# FIS TV

`/fis-tv/` uses the existing static export, header, footer and local fonts. The hero texture and court markings are CSS and SVG; no hero image asset is needed.

## Updating content

Edit `src/data/fis-tv.ts`. Entries use stable IDs and are sorted by `order`.

- Videos require `id`, `title`, `youtubeId`, `competition` and `order`; `description` is optional. Check that the uploader allows embedding. A thumbnail loads the privacy-enhanced YouTube player on selection, without autoplay. Each replay also has a direct YouTube link.
- Collections require `id`, `title` and `order`. Empty collections are hidden. The collection title names the photo viewer; the visible gallery introduction sits below `THE GALLERY`.
- Photos require `id`, `src`, `width`, `height`, meaningful `alt`, `collectionId` and `order`. Basil's finals selection is curated in landscape pairs and portrait trios in `src/data/fis-tv.ts` so the grid has no incomplete desktop rows. The gallery introduction in `src/app/fis-tv/page.tsx` links to the complete online photobook.

Store one JPG or PNG per photograph under `public/media/<collection>/`. Use the same `src` for the gallery, viewer and download; do not create duplicate WebP or thumbnail versions. Preserve the actual dimensions and aspect ratio. Downloads must use the corresponding JPG/PNG filename and format. The 72 Basil Finals Week gallery JPGs are optimized copies from the original `FIS-Finals-###.jpg` files; the originals are not part of the site. The older `finals-mon-04.jpg` remains for the About Us page, not the gallery. Images below the viewport load lazily and display without cropping. If the social preview photo changes, update the page's Open Graph and Twitter image paths too.

## Review checks

Run the code/UI checks in `AGENTS.md`, including the production build. `npm.cmd start` previews the last build; rebuild after edits and open `/fis-tv/`.

- Review desktop and mobile: hero text, replay cards, landscape/portrait gallery rows, homepage entry, navigation and footer. Check for horizontal overflow.
- Confirm no replay iframe loads before selection, selecting one leaves the other unloaded, and playback does not start automatically.
- Check expand/download controls and actual JPG/PNG responses. The viewer supports Previous/Next, arrow keys, Home/End and Escape, traps Tab focus and restores focus on close. No captions or numbering are displayed.
- Confirm swipe and pinch behaviour on a physical touch device before release; responsive browser sizing does not verify touch gestures.

Keep this feature local until the user authorises committing or publishing.
