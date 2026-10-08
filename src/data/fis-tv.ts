export interface ReplayVideo {
  id: string;
  title: string;
  youtubeId: string;
  competition: string;
  order: number;
  description?: string;
}

export interface GalleryPhoto {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  collectionId: string;
  order: number;
}

export interface PhotoCollection {
  id: string;
  title: string;
  order: number;
}

export const replayVideos: ReplayVideo[] = [
  { id: "semi-finals", title: "Semi Finals", description: "Ghazni United vs Goldlink Up", youtubeId: "3Bxik7Ll9mM", competition: "FIS knockout stages", order: 1 },
  { id: "grand-final", title: "Grand Final", description: "AFG vs Goldlink Up", youtubeId: "KAVssKxlDCs", competition: "FIS knockout stages", order: 2 },
];

export const photoCollections: PhotoCollection[] = [
  { id: "finals-2026", title: "Finals Week", order: 1 },
];

export const galleryPhotos: GalleryPhoto[] = [
  { id: "finals-mon-01", alt: "Six medal-winning players pose in front of the goal with the FIS champions board." },
  { id: "finals-mon-02", alt: "The team raises the trophy and celebrates with their medals in front of the goal." },
  { id: "finals-mon-03", alt: "Players laugh behind the champions board as a teammate sprays a bottle in celebration." },
  { id: "finals-mon-04", alt: "Medal-winning teammates celebrate on court as spray fills the air around the champions board." },
  { id: "finals-mon-05", alt: "A smiling player wearing a medal raises both fists on the indoor court." },
].map((photo, index) => ({
  ...photo,
  src: `/media/finals-2026/${photo.id}.jpg`,
  width: 1365,
  height: 2048,
  collectionId: "finals-2026",
  order: index + 1,
}));
