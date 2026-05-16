import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "shadowStepsProgress";

const ASSETS = {
  logo: "/assets/brand/shadow-steps-logo.png",
  hunter: "/assets/characters/hunter-omen.png",
};

const EMPTY_PROGRESS = {
  displayName: "Hunter",
  title: "Newly Awakened",
  rank: "Unawakened",
  level: 1,
  totalQuestsCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  stats: {},
  badges: [],
  unlockedTitles: ["Newly Awakened"],
};

function readProgress() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...EMPTY_PROGRESS, ...JSON.parse(saved) } : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

function getPower(progress) {
  const stats = Object.values(progress.stats || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  return progress.level * 10 + stats * 4 + progress.currentStreak * 6 + progress.totalQuestsCompleted;
}

function useProgressSnapshot() {
  const [progress, setProgress] = useState(readProgress);

  useEffect(() => {
    const update = () => setProgress(readProgress());
    const timer = window.setInterval(update, 700);
    window.addEventListener("storage", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", update);
    };
  }, []);

  return progress;
}

function usePortalTarget(selector) {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const findTarget = () => setTarget(document.querySelector(selector));
    findTarget();
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [selector]);

  return target;
}

function BrandImage({ alt, className, src }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={`${className} v03-image-fallback`} aria-hidden="true">SS</div>;
  return <img alt={alt} className={className} src={src} onError={() => setFailed(true)} />;
}

function ProfileAugment({ progress }) {
  const titles = progress.unlockedTitles?.length ? progress.unlockedTitles : [progress.title || "Newly Awakened"];
  const badges = progress.badges || [];

  return (
    <section className="v03-profile-panel" aria-label="Hunter identity">
      <BrandImage alt="" className="v03-profile-hunter" src={ASSETS.hunter} />
      <div className="v03-profile-copy">
        <span>Hunter Profile</span>
        <h3>{progress.displayName || "Hunter"}</h3>
        <p>{progress.title || "Newly Awakened"}</p>
        <div className="v03-profile-metrics">
          <small>{progress.rank || "Unawakened"}</small>
          <small>Level {progress.level || 1}</small>
          <small>{getPower(progress)} power</small>
        </div>
      </div>
      <div className="v03-unlock-section">
        <strong>Badges unlocked</strong>
        <div className="v03-badge-row">
          {badges.length ? (
            badges.map((badge) => <small key={badge}>{badge}</small>)
          ) : (
            <p>No badges unlocked yet. Clear a boss gate to earn one.</p>
          )}
        </div>
      </div>
      <div className="v03-unlock-section">
        <strong>Titles unlocked</strong>
        <div className="v03-title-row">
          {titles.map((title) => (
            <small className={title === progress.title ? "active" : ""} key={title}>{title}</small>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VisualIdentityLayer() {
  const [showSplash, setShowSplash] = useState(true);
  const progress = useProgressSnapshot();
  const settingsPanel = usePortalTarget(".settings-panel");

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const rewriteDefeat = () => {
      document.querySelectorAll(".battle-result.defeat strong, .boss-result.defeat strong").forEach((node) => {
        node.textContent = "RETREAT FORCED";
      });
    };
    rewriteDefeat();
    const observer = new MutationObserver(rewriteDefeat);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {showSplash && (
        <div className="v03-splash" aria-hidden="true">
          <BrandImage alt="" className="v03-splash-logo" src={ASSETS.logo} />
          <p>Shadow System Initialising</p>
        </div>
      )}
      {settingsPanel && createPortal(<ProfileAugment progress={progress} />, settingsPanel)}
    </>
  );
}
