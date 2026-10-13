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
  { id: "semi-finals", title: "Semi Finals", description: "Ghazni United vs Goldlink Up", youtubeId: "McvwLjDWQ8Q", competition: "FIS knockout stages", order: 1 },
  { id: "grand-final", title: "Grand Final", description: "AFG vs Goldlink Up", youtubeId: "bLeCWJJgF0M", competition: "FIS knockout stages", order: 2 },
];

export const photoCollections: PhotoCollection[] = [
  { id: "finals-2026", title: "Basil's Finals Photos", order: 1 },
];

// Pairs of landscape photos and trios of portraits form complete gallery rows.
const basilPhotoRows = [
  [["041", "A player in black battles two yellow-shirted defenders for the ball."], ["066", "A player in a blue bib shields the ball from an opponent."]],
  [["031", "A red-shirted player carries the ball down the court."], ["017", "Black-and-white action as a player strikes the ball."], ["045", "Black-and-white portrait of a player controlling the ball."]],
  [["013", "A FIS official in red speaks with players at the sideline."], ["038", "Yellow-shirted teammates watch a match from the bench."]],
  [["011", "A player tightens the laces on a white futsal shoe."], ["035", "Yellow-shirted teammates sit together on the sideline."], ["043", "A yellow-shirted player looks back across the court."]],
  [["048", "Two teams pose together in front of the futsal goal."], ["054", "Players in red and black pose together in front of the goal."]],
  [["050", "A player in a red bib gestures toward a teammate."], ["060", "Two red-shirted players greet each other on court."], ["061", "Two players contest the ball in front of the blue curtain."]],
  [["056", "A team dressed in black poses in front of the goal."], ["083", "Black-and-white match action across the indoor court."]],
  [["064", "A goalkeeper in red braces in front of the goal."], ["069", "A black-shirted player walks across the court."], ["074", "Black-and-white portrait of a player waiting on court."]],
  [["076", "Black-and-white view of a player standing over the ball."], ["086", "The indoor futsal court seen from above during a match."]],
  [["015", "Black-and-white frame of a player leaping during play."], ["025", "A number ten shirt seen from behind near the goal."], ["028", "Black-and-white view of players moving up the court."]],
  [["072", "Players watch the match from the sideline in black and white."], ["092", "Players exchange a greeting after the match."]],
  [["058", "A black-shirted player moves with the ball."], ["093", "A futsal ball rests in the foreground of the court."], ["156", "A white-shirted player approaches the ball."]],
  [["126", "A FIS official in a red jacket watches the game."], ["130", "Close view of a FIS official blowing a whistle."]],
  [["131", "A FIS official raises a yellow card during play."], ["136", "A player in grey dribbles across the court."], ["142", "Black-and-white action as a player in white dribbles the ball."]],
  [["148", "Teammates lean into a huddle before play."], ["174", "A spectator follows the futsal match on a phone."]],
  [["145", "A yellow-shirted goalkeeper stands in front of the goal."], ["147", "Players gather shoulder to shoulder in a team huddle."], ["150", "Teammates stack their hands together before a match."]],
  [["181", "Supporters sit together watching from the sideline."], ["208", "A player in white guides the ball across the marked floor."]],
  [["157", "Players check on a teammate seated beside the goal."], ["160", "A wide view of play across the indoor court."], ["162", "Black-and-white sideline portrait during the match."]],
  [["209", "A smiling player gives two thumbs up on court."], ["123", "The FIS trophy and medals arranged in front of the champions board."]],
  [["166", "Black-and-white scene of players celebrating together."], ["179", "Supporters smile while watching from the sideline."], ["185", "A player pauses beside the ball on court."]],
  [["096", "Players hold the FIS champions board after the match."], ["214", "Medal-winning teammates pose behind two champions boards."]],
  [["190", "Black-and-white portrait of a supporter at the venue."], ["194", "Spectators watch together from the sideline."], ["201", "A player in white waits for play to restart."]],
  [["218", "The winning team cheers as the trophy is raised."], ["227", "A medal winner holds the trophy in front of the goal."]],
  [["205", "A player takes the ball forward across the court."], ["223", "A goalkeeper in blue holds the trophy and wears a medal."], ["229", "A medal winner raises the trophy above his head."]],
  [["103", "The champions gather behind their FIS board."], ["105", "Teammates lift the trophy together in celebration."], ["108", "Champions celebrate as a bottle sprays beside them."]],
  [["111", "A smiling player stands behind the champions board."], ["112", "A medal winner smiles for a portrait on court."], ["114", "A player looks down at the trophy in his hands."]],
  [["115", "Champions gather with medals and their FIS board."], ["124", "Black-and-white close-up of the FIS trophy."], ["125", "Black-and-white close-up of the winners' medals."]],
  [["098", "The champions pose together in front of the futsal goal."], ["232", "A medal winner holds the trophy for a portrait."], ["007", "Gold medals and coloured ribbons arranged for the finals."]],
] as const;

export const galleryPhotos: GalleryPhoto[] = basilPhotoRows.flatMap((row) => row.map(([number, alt]) => ({
  id: `basil-${number}`,
  src: `/media/basil-finals-2026/FIS-Finals-${number}.jpg`,
  width: row.length === 2 ? 1800 : 1200,
  height: row.length === 2 ? 1200 : 1800,
  alt,
  collectionId: "finals-2026",
  order: 0,
}))).map((photo, index) => ({ ...photo, order: index + 1 }));
