// Resolve a lesson's stored `videoUrl` into something the player can render.
//
// Admins paste arbitrary URLs into a lesson (see CourseContentModal → LessonForm),
// so a single field may hold a YouTube link, a Vimeo link, or a direct video file.
// `resolveVideo` normalises any of those into a small descriptor the learning
// page switches on:
//   { kind: "youtube" | "vimeo", embedUrl }  → render in an <iframe>
//   { kind: "file", src }                     → render in a native <video>
//   { kind: "none" }                          → nothing playable (empty/blank url)

function youtubeId(url) {
  // Matches the common YouTube shapes: watch?v=, youtu.be/, /embed/, /shorts/.
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function vimeoId(url) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

/**
 * @param {string} [videoUrl] raw url stored on the lesson
 * @returns {{ kind: "youtube"|"vimeo"|"file"|"none", embedUrl?: string, src?: string }}
 */
export function resolveVideo(videoUrl) {
  const url = (videoUrl || "").trim();
  if (!url) return { kind: "none" };

  const yt = youtubeId(url);
  if (yt) {
    // Return the bare video id. YouTube is played through the IFrame Player API
    // with controls disabled (see CoursePlayer), so the learner sees our own
    // control bar instead of YouTube's chrome — the link/source stays hidden.
    return { kind: "youtube", videoId: yt };
  }

  const vm = vimeoId(url);
  if (vm) {
    return { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${vm}` };
  }

  // Fall back to treating it as a directly playable file (mp4/webm/etc.).
  return { kind: "file", src: url };
}

/** True when a lesson has a url we can actually play. */
export function hasPlayableVideo(videoUrl) {
  return resolveVideo(videoUrl).kind !== "none";
}
