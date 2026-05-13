import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "shadowStepsProgress";

const DAILY_QUESTS = [
  {
    id: "steps-3000",
    title: "Take 3,000+ steps",
    category: "Movement",
    xp: 20,
    description: "Move with intent. A short walk still counts toward the system.",
    stats: { endurance: 1, discipline: 1 },
  },
  {
    id: "light-exercise",
    title: "Complete light exercise",
    category: "Exercise",
    xp: 30,
    description: "Push-ups, squats, stretching, a short circuit, or any deliberate training.",
    stats: { strength: 1, endurance: 1 },
  },
  {
    id: "water",
    title: "Drink enough water",
    category: "Hydration",
    xp: 15,
    description: "Hydration keeps the hunter operational.",
    stats: { recovery: 1, discipline: 1 },
  },
  {
    id: "protein-meal",
    title: "Eat one healthy/protein-based meal",
    category: "Nutrition",
    xp: 25,
    description: "Fuel the body. The system rewards consistency, not perfection.",
    stats: { nutrition: 1, discipline: 1 },
  },
  {
    id: "stretch",
    title: "Stretch for 5 minutes",
    category: "Recovery",
    xp: 20,
    description: "A small recovery quest prevents tomorrow's penalties.",
    stats: { recovery: 1 },
  },
  {
    id: "focus-task",
    title: "Complete one focus task",
    category: "Focus",
    xp: 30,
    description: "Record, write, edit, plan, clean, organise, or finish one meaningful task.",
    stats: { focus: 1, discipline: 1 },
  },
];

const WEEKLY_QUESTS = [
  "Complete 20 daily quests this week",
  "Exercise 4 times this week",
  "Hit movement target 5 days this week",
  "Complete 5 nutrition quests this week",
];

const BOSS_QUESTS = [
  "The First Gate: Complete every daily quest in one day",
  "Break the Plateau: Complete 5 consecutive days",
  "Shadow Trial: Complete 30 quests in one week",
  "Hunter's Oath: Complete a 14-day streak",
];

const RANKS = [
  { name: "Unawakened", level: 1, quests: 0, streak: 0, title: "Newly Awakened" },
  { name: "E-Rank", level: 2, quests: 3, streak: 0, title: "E-Rank Hunter" },
  { name: "D-Rank", level: 5, quests: 20, streak: 3, title: "Disciplined Hunter" },
  { name: "C-Rank", level: 12, quests: 50, streak: 5, title: "Gate Walker" },
  { name: "B-Rank", level: 25, quests: 120, streak: 10, title: "Shadow Candidate" },
  { name: "A-Rank", level: 40, quests: 250, streak: 14, title: "Elite Hunter" },
  { name: "S-Rank", level: 60, quests: 500, streak: 30, title: "National Level Hunter" },
  { name: "Shadow Rank", level: 80, quests: 800, streak: 30, title: "Shadow Commander" },
  { name: "Monarch Rank", level: 100, quests: 1200, streak: 30, title: "Monarch Vessel" },
  { name: "Abyss Rank", level: 150, quests: 2000, streak: 30, title: "Abyss Walker" },
];

const STAT_LABELS = [
  ["strength", "Strength"],
  ["endurance", "Endurance"],
  ["discipline", "Discipline"],
  ["focus", "Focus"],
  ["nutrition", "Nutrition"],
  ["recovery", "Recovery"],
];

const SYSTEM_MESSAGES = [
  "Daily Quest Protocol Active.",
  "Complete today’s objectives to maintain progression.",
  "Every completed quest strengthens the shadow.",
  "Rank progression requires consistency.",
  "The system rewards discipline, not perfection.",
];

const INITIAL_PROGRESS = {
  displayName: "Hunter",
  title: "Newly Awakened",
  level: 1,
  xp: 0,
  rank: "Unawakened",
  currentStreak: 0,
  bestStreak: 0,
  totalQuestsCompleted: 0,
  lastActiveDate: null,
  completedByDate: {},
  stats: {
    strength: 0,
    endurance: 0,
    discipline: 0,
    focus: 0,
    nutrition: 0,
    recovery: 0,
  },
};

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getDateKey(date);
}

function getXpNeeded(level) {
  return 100 + level * 35 + level * level * 5;
}

function calculateLevel(level, xp, gainedXp) {
  let nextLevel = level;
  let nextXp = xp + gainedXp;
  let levelsGained = 0;

  while (nextXp >= getXpNeeded(nextLevel)) {
    nextXp -= getXpNeeded(nextLevel);
    nextLevel += 1;
    levelsGained += 1;
  }

  return { level: nextLevel, xp: nextXp, levelsGained };
}

function getRankForProgress(progress) {
  let unlocked = RANKS[0];

  RANKS.forEach((rank) => {
    const hasLevel = progress.level >= rank.level;
    const hasQuests = progress.totalQuestsCompleted >= rank.quests;
    const hasStreak = progress.bestStreak >= rank.streak || progress.currentStreak >= rank.streak;

    if (hasLevel && hasQuests && hasStreak) {
      unlocked = rank;
    }
  });

  return unlocked;
}

function loadProgress() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_PROGRESS;

    const parsed = JSON.parse(saved);
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
      stats: { ...INITIAL_PROGRESS.stats, ...(parsed.stats || {}) },
      completedByDate: parsed.completedByDate || {},
    };
  } catch {
    return INITIAL_PROGRESS;
  }
}

function saveProgress(progress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function RequirementBar({ label, current, required }) {
  const safeRequired = Math.max(required, 1);
  const percent = Math.min(100, Math.round((current / safeRequired) * 100));
  const complete = current >= required;

  return (
    <div className="requirement">
      <div className="requirement-top">
        <span>{label}</span>
        <strong className={complete ? "good" : ""}>
          {Math.min(current, required)} / {required}
        </strong>
      </div>
      <div className="mini-track">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [progress, setProgress] = useState(loadProgress);
  const [draftName, setDraftName] = useState(progress.displayName || "Hunter");
  const [systemMessage, setSystemMessage] = useState(SYSTEM_MESSAGES[0]);
  const [levelNotice, setLevelNotice] = useState(null);

  const todayKey = getDateKey();
  const completedToday = progress.completedByDate[todayKey] || [];
  const completedCount = completedToday.length;
  const completionPercent = Math.round((completedCount / DAILY_QUESTS.length) * 100);
  const xpNeeded = getXpNeeded(progress.level);
  const xpPercent = Math.min(100, Math.round((progress.xp / xpNeeded) * 100));
  const currentRankIndex = RANKS.findIndex((rank) => rank.name === progress.rank);
  const currentRank = RANKS[Math.max(currentRankIndex, 0)] || RANKS[0];
  const nextRank = RANKS[currentRankIndex + 1] || null;
  const strongestStat = useMemo(() => {
    return STAT_LABELS.reduce(
      (best, [key, label]) =>
        progress.stats[key] > best.value ? { key, label, value: progress.stats[key] } : best,
      { key: "discipline", label: "Discipline", value: progress.stats.discipline },
    );
  }, [progress.stats]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    const rank = getRankForProgress(progress);
    if (rank.name !== progress.rank || rank.title !== progress.title) {
      setProgress((current) => ({ ...current, rank: rank.name, title: rank.title }));
    }
  }, [progress]);

  const completeQuest = (quest) => {
    if (completedToday.includes(quest.id)) return;

    setProgress((current) => {
      const currentCompletedToday = current.completedByDate[todayKey] || [];
      if (currentCompletedToday.includes(quest.id)) return current;

      const yesterdayKey = getYesterdayKey();
      const isFirstQuestToday = current.lastActiveDate !== todayKey;
      const continuedStreak = current.lastActiveDate === yesterdayKey;
      const nextStreak = isFirstQuestToday
        ? continuedStreak
          ? current.currentStreak + 1
          : 1
        : current.currentStreak;

      const levelResult = calculateLevel(current.level, current.xp, quest.xp);
      const nextStats = { ...current.stats };
      Object.entries(quest.stats).forEach(([key, value]) => {
        nextStats[key] = (nextStats[key] || 0) + value;
      });

      const nextProgress = {
        ...current,
        level: levelResult.level,
        xp: levelResult.xp,
        currentStreak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
        totalQuestsCompleted: current.totalQuestsCompleted + 1,
        lastActiveDate: todayKey,
        completedByDate: {
          ...current.completedByDate,
          [todayKey]: [...currentCompletedToday, quest.id],
        },
        stats: nextStats,
      };

      const nextRank = getRankForProgress(nextProgress);
      nextProgress.rank = nextRank.name;
      nextProgress.title = nextRank.title;

      if (levelResult.levelsGained > 0) {
        setLevelNotice(
          levelResult.levelsGained === 1
            ? `LEVEL UP — Level ${levelResult.level}`
            : `MULTI LEVEL UP — Level ${levelResult.level}`,
        );
        window.setTimeout(() => setLevelNotice(null), 2600);
      }

      setSystemMessage(SYSTEM_MESSAGES[Math.floor(Math.random() * SYSTEM_MESSAGES.length)]);
      return nextProgress;
    });
  };

  const saveName = () => {
    const cleanName = draftName.trim() || "Hunter";
    setProgress((current) => ({ ...current, displayName: cleanName }));
    setSystemMessage("Identity record updated.");
  };

  const resetProgress = () => {
    const confirmed = window.confirm("Reset all Shadow Steps progress on this device?");
    if (!confirmed) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setProgress(INITIAL_PROGRESS);
    setDraftName(INITIAL_PROGRESS.displayName);
    setSystemMessage("System reset complete. A new awakening begins.");
  };

  const renderQuestCard = (quest, compact = false) => {
    const complete = completedToday.includes(quest.id);
    return (
      <article className={complete ? "quest-card complete" : "quest-card"} key={quest.id}>
        <div className="quest-main">
          <span className="quest-category">{quest.category}</span>
          <h3>{quest.title}</h3>
          {!compact && <p>{quest.description}</p>}
          <div className="reward-row">
            <span>+{quest.xp} XP</span>
            {Object.entries(quest.stats).map(([stat, value]) => (
              <span key={stat}>+{value} {stat}</span>
            ))}
          </div>
        </div>
        <button
          className={complete ? "quest-button complete" : "quest-button"}
          type="button"
          onClick={() => completeQuest(quest)}
          disabled={complete}
        >
          {complete ? "Complete" : "Claim"}
        </button>
      </article>
    );
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      {levelNotice && <div className="level-toast">{levelNotice}</div>}

      <section className="phone-frame">
        <header className="top-panel">
          <div>
            <p className="eyebrow">Shadow System Online</p>
            <h1>Shadow Steps</h1>
          </div>
          <div className="rank-chip">{progress.rank}</div>
        </header>

        {activeTab === "dashboard" && (
          <section className="screen dashboard-screen">
            <article className="hero-card">
              <div className="hero-grid">
                <div>
                  <p className="label">Hunter</p>
                  <h2>{progress.displayName}</h2>
                  <p className="title-line">{progress.title}</p>
                </div>
                <div className="level-orb">
                  <span>LV</span>
                  <strong>{progress.level}</strong>
                </div>
              </div>

              <div className="xp-block">
                <div className="xp-top">
                  <span>Experience</span>
                  <strong>{progress.xp} / {xpNeeded} XP</strong>
                </div>
                <div className="xp-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={xpPercent}>
                  <span style={{ width: `${xpPercent}%` }} />
                </div>
              </div>

              <div className="system-message">
                <span>System Message</span>
                <p>{systemMessage}</p>
              </div>
            </article>

            <div className="stat-strip">
              <article>
                <span>Streak</span>
                <strong>{progress.currentStreak}</strong>
              </article>
              <article>
                <span>Best</span>
                <strong>{progress.bestStreak}</strong>
              </article>
              <article>
                <span>Today</span>
                <strong>{completionPercent}%</strong>
              </article>
              <article>
                <span>Core Stat</span>
                <strong>{strongestStat.label}</strong>
              </article>
            </div>

            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="label">Daily Objectives</p>
                  <h2>Today’s quests</h2>
                </div>
                <span>{completedCount}/{DAILY_QUESTS.length}</span>
              </div>
              <div className="quest-list compact-list">
                {DAILY_QUESTS.map((quest) => renderQuestCard(quest, true))}
              </div>
            </section>
          </section>
        )}

        {activeTab === "quests" && (
          <section className="screen">
            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="label">Quest Log</p>
                  <h2>Daily quests</h2>
                </div>
                <span>{completedCount}/{DAILY_QUESTS.length}</span>
              </div>
              <div className="quest-list">
                {DAILY_QUESTS.map((quest) => renderQuestCard(quest))}
              </div>
            </section>

            <section className="panel locked-panel">
              <div className="section-heading">
                <div>
                  <p className="label">Coming Soon</p>
                  <h2>Weekly quests</h2>
                </div>
                <span>Locked</span>
              </div>
              {WEEKLY_QUESTS.map((quest) => <div className="locked-row" key={quest}>{quest}</div>)}
            </section>

            <section className="panel locked-panel danger-panel">
              <div className="section-heading">
                <div>
                  <p className="label">Boss Gates</p>
                  <h2>Boss quests</h2>
                </div>
                <span>Locked</span>
              </div>
              {BOSS_QUESTS.map((quest) => <div className="locked-row" key={quest}>{quest}</div>)}
            </section>
          </section>
        )}

        {activeTab === "stats" && (
          <section className="screen">
            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="label">Character Data</p>
                  <h2>Stats</h2>
                </div>
                <span>{progress.totalQuestsCompleted} quests</span>
              </div>
              <div className="stats-grid">
                {STAT_LABELS.map(([key, label]) => {
                  const value = progress.stats[key];
                  const width = Math.min(100, value * 8);
                  return (
                    <article className="stat-card" key={key}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <div className="mini-track"><span style={{ width: `${width}%` }} /></div>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        )}

        {activeTab === "rank" && (
          <section className="screen">
            <section className="panel rank-panel">
              <div className="section-heading">
                <div>
                  <p className="label">Rank Evaluation</p>
                  <h2>{progress.rank}</h2>
                </div>
                <span>Level {progress.level}</span>
              </div>

              {nextRank ? (
                <div className="next-rank-card">
                  <p className="label">Next rank</p>
                  <h3>{nextRank.name}</h3>
                  <RequirementBar label="Level" current={progress.level} required={nextRank.level} />
                  <RequirementBar label="Completed quests" current={progress.totalQuestsCompleted} required={nextRank.quests} />
                  <RequirementBar label="Best/current streak" current={Math.max(progress.bestStreak, progress.currentStreak)} required={nextRank.streak} />
                  <div className="trial-box">Rank-Up Trial: Locked for future update</div>
                </div>
              ) : (
                <div className="next-rank-card">
                  <p className="label">Maximum rank detected</p>
                  <h3>Abyss protocol active</h3>
                </div>
              )}

              <div className="rank-ladder">
                {RANKS.map((rank, index) => {
                  const unlocked = index <= currentRankIndex;
                  return (
                    <div className={unlocked ? "rank-row unlocked" : "rank-row"} key={rank.name}>
                      <span>{rank.name}</span>
                      <small>{unlocked ? "Unlocked" : `Lv ${rank.level} · ${rank.quests} quests`}</small>
                    </div>
                  );
                })}
              </div>
            </section>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="screen">
            <section className="panel settings-panel">
              <div className="section-heading">
                <div>
                  <p className="label">System Settings</p>
                  <h2>Profile</h2>
                </div>
                <span>v0.1</span>
              </div>

              <label className="input-label" htmlFor="displayName">Display name</label>
              <div className="input-row">
                <input
                  id="displayName"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  maxLength={24}
                />
                <button type="button" onClick={saveName}>Save</button>
              </div>

              <div className="data-card">
                <strong>Progress saved locally on this device.</strong>
                <p>Clearing browser data may erase local progress. Cloud sync, accounts, photo proof, and notifications are future upgrades.</p>
              </div>

              <button className="reset-button" type="button" onClick={resetProgress}>Reset all progress</button>
            </section>
          </section>
        )}

        <nav className="bottom-nav" aria-label="Primary navigation">
          {[
            ["dashboard", "Home"],
            ["quests", "Quests"],
            ["stats", "Stats"],
            ["rank", "Rank"],
            ["settings", "Settings"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={activeTab === key ? "active" : ""}
              type="button"
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}

export default App;
