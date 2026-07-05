'use client';

// Custom video player for lesson playback.
//
// For YouTube sources we use the YouTube IFrame Player API with `controls: 0`,
// so YouTube's own chrome (control bar, logo, context menu, "watch on YouTube")
// is hidden and we render our OWN control bar on top. The video still streams
// from YouTube, but the learner never sees a YouTube-branded player.
//
// Direct files fall back to a styled native <video> with the same control bar
// look via the browser's default controls.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolume1,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiRotateCcw,
  FiRotateCw,
  FiLoader,
} from 'react-icons/fi';

/* ---- Lazy-load the YouTube IFrame API once for the whole app ---- */

let ytApiPromise = null;
function loadYouTubeApi() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

const fmtTime = (s) => {
  if (!s || Number.isNaN(s)) return '0:00';
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return h > 0
    ? `${h}:${mm}:${String(sec).padStart(2, '0')}`
    : `${mm}:${String(sec).padStart(2, '0')}`;
};

/* ================================================================== */
/*  Shared control bar                                                 */
/* ================================================================== */

function ControlBar({
  playing,
  current,
  duration,
  muted,
  volume,
  isFullscreen,
  buffering,
  onToggle,
  onSeek,
  onSkip,
  onToggleMute,
  onVolume,
  onFullscreen,
}) {
  const pct = duration ? (current / duration) * 100 : 0;
  // When muted, the slider should read empty even if the stored volume is > 0.
  const volPct = muted ? 0 : volume;

  function handleScrub(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  }

  const VolIcon = muted || volume === 0 ? FiVolumeX : volume < 50 ? FiVolume1 : FiVolume2;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/90 via-black/40 to-transparent px-4 pb-3 pt-10">
      {/* Progress / scrubber */}
      <div
        onClick={handleScrub}
        className="group/scrub relative h-1.5 w-full cursor-pointer rounded-full bg-white/20"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-primary to-accent"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/scrub:opacity-100"
          style={{ left: `${pct}%` }}
        />
      </div>

      {/* Buttons */}
      <div className="mt-2 flex items-center gap-4 text-white">
        <button onClick={onToggle} aria-label={playing ? 'Pause' : 'Play'} className="cursor-pointer transition hover:text-primary">
          {buffering ? (
            <FiLoader className="h-5 w-5 animate-spin" />
          ) : playing ? (
            <FiPause className="h-5 w-5" />
          ) : (
            <FiPlay className="h-5 w-5" />
          )}
        </button>

        <button onClick={() => onSkip(-10)} aria-label="Back 10 seconds" className="cursor-pointer transition hover:text-primary">
          <FiRotateCcw className="h-4.5 w-4.5" />
        </button>
        <button onClick={() => onSkip(10)} aria-label="Forward 10 seconds" className="cursor-pointer transition hover:text-primary">
          <FiRotateCw className="h-4.5 w-4.5" />
        </button>

        {/* Volume — mute toggle + draggable level bar. The group reveals the
            slider on hover so it doesn't crowd the bar at rest. */}
        <div className="group/vol flex items-center gap-2">
          <button onClick={onToggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className="cursor-pointer transition hover:text-primary">
            <VolIcon className="h-5 w-5" />
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volPct}
            onChange={(e) => onVolume(Number(e.target.value))}
            aria-label="Volume"
            className="volume-range h-1 w-0 cursor-pointer opacity-0 transition-all duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100"
            style={{
              background: `linear-gradient(to right, #fff ${volPct}%, rgba(255,255,255,0.25) ${volPct}%)`,
            }}
          />
        </div>

        <span className="text-xs font-medium tabular-nums text-text">
          {fmtTime(current)} / {fmtTime(duration)}
        </span>

        <button
          onClick={onFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className="ml-auto cursor-pointer transition hover:text-primary"
        >
          {isFullscreen ? <FiMinimize className="h-5 w-5" /> : <FiMaximize className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  YouTube player (IFrame API, custom controls)                       */
/* ================================================================== */

function YouTubePlayer({ videoId }) {
  const wrapRef = useRef(null);
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const pollRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  // True once the first real frame has played — until then we keep a black
  // cover over the iframe so YouTube's thumbnail/poster frame is never seen,
  // including during the initial buffering after the first click.
  const [hasPlayed, setHasPlayed] = useState(false);

  // (Re)create the player whenever the video changes.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setPlaying(false);
    setHasPlayed(false);
    setCurrent(0);
    setDuration(0);

    loadYouTubeApi().then((YT) => {
      if (cancelled || !YT || !mountRef.current) return;

      playerRef.current = new YT.Player(mountRef.current, {
        videoId,
        playerVars: {
          controls: 0, // hide YouTube's control bar — we draw our own
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          playsinline: 1,
          fs: 0,
          // host left default; nocookie isn't required once chrome is hidden
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            setDuration(e.target.getDuration());
            setMuted(e.target.isMuted());
            setVolume(e.target.getVolume());
            setReady(true);
          },
          onStateChange: (e) => {
            const S = window.YT.PlayerState;
            setPlaying(e.data === S.PLAYING);
            setBuffering(e.data === S.BUFFERING);
            if (e.data === S.PLAYING) {
              setHasPlayed(true); // first real frame is now on screen
              if (!duration) setDuration(e.target.getDuration());
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
      try {
        playerRef.current?.destroy();
      } catch {}
      playerRef.current = null;
    };
  }, [videoId]);

  // Poll current time while playing (the API has no time event).
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!playing) return;
    pollRef.current = setInterval(() => {
      const p = playerRef.current;
      if (p?.getCurrentTime) {
        setCurrent(p.getCurrentTime());
        if (!duration && p.getDuration) setDuration(p.getDuration());
      }
    }, 250);
    return () => clearInterval(pollRef.current);
  }, [playing, duration]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing]);

  const seek = useCallback((time) => {
    playerRef.current?.seekTo(time, true);
    setCurrent(time);
  }, []);

  const skip = useCallback((delta) => {
    const p = playerRef.current;
    if (!p) return;
    seek(Math.min(duration, Math.max(0, p.getCurrentTime() + delta)));
  }, [duration, seek]);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  }, []);

  const changeVolume = useCallback((value) => {
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(value);
    setVolume(value);
    // Dragging the slider above zero implicitly unmutes; dragging to zero mutes.
    if (value === 0) {
      p.mute();
      setMuted(true);
    } else if (p.isMuted()) {
      p.unMute();
      setMuted(false);
    }
  }, []);

  // Toggle: enter fullscreen if we're not in it, otherwise exit.
  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      wrapRef.current?.requestFullscreen?.();
    }
  }, []);

  // Keep the fullscreen icon in sync however fullscreen is left (button or Esc).
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="group relative aspect-video w-full overflow-hidden rounded-3xl border border-border bg-black shadow-2xl shadow-black/50"
    >
      {/* The YouTube iframe. pointer-events-none so YouTube can't be clicked
          directly — all interaction goes through our overlay + control bar. */}
      <div className="pointer-events-none absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full">
        <div ref={mountRef} className="h-full w-full" />
      </div>

      {/* Click anywhere on the video to play/pause. The surface stays solid
          black until the first real frame plays (hasPlayed) — covering both the
          pre-play state and the initial buffering — so the YouTube thumbnail /
          poster frame is never visible. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
        className={`absolute inset-0 z-10 flex cursor-pointer items-center justify-center transition-colors ${
          hasPlayed ? '' : 'bg-black'
        }`}
      >
        {(!hasPlayed || (!playing && !buffering)) && (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted ring-1 ring-white/25 backdrop-blur transition group-hover:scale-105 group-hover:bg-white/20">
            {buffering ? (
              <FiLoader className="h-8 w-8 animate-spin text-white" />
            ) : (
              <FiPlay className="ml-1 h-8 w-8 text-white" />
            )}
          </span>
        )}
      </button>

      {/* Loading shimmer before the API is ready */}
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <FiLoader className="h-6 w-6 animate-spin text-text-subtle" />
        </div>
      )}

      {ready && (
        <ControlBar
          playing={playing}
          current={current}
          duration={duration}
          muted={muted}
          volume={volume}
          isFullscreen={isFullscreen}
          buffering={buffering}
          onToggle={toggle}
          onSeek={seek}
          onSkip={skip}
          onToggleMute={toggleMute}
          onVolume={changeVolume}
          onFullscreen={fullscreen}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  Public component                                                   */
/* ================================================================== */

/**
 * @param {{ video: { kind: string, videoId?: string, embedUrl?: string, src?: string }, poster?: string, title?: string }} props
 */
export default function CoursePlayer({ video, poster, title }) {
  if (!video || video.kind === 'none') return null;

  if (video.kind === 'youtube') {
    return <YouTubePlayer key={video.videoId} videoId={video.videoId} />;
  }

  if (video.kind === 'vimeo') {
    // Vimeo: hide its UI chrome as much as the embed allows.
    return (
      <div className="aspect-video w-full overflow-hidden rounded-3xl border border-border bg-black shadow-2xl shadow-black/50">
        <iframe
          src={`${video.embedUrl}?title=0&byline=0&portrait=0&badge=0`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  // Direct file — native controls, locked down a little.
  return (
    <video
      src={video.src}
      poster={poster}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      onContextMenu={(e) => e.preventDefault()}
      className="aspect-video w-full rounded-3xl border border-border bg-black shadow-2xl shadow-black/50"
    />
  );
}
