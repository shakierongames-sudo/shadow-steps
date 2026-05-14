import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "shadowStepsProgress";
const ROMAN_TIERS = ["I", "II", "III", "IV"];

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

const RANKS = [
  { name: "Unawakened", level: 1, quests: 0, streak: 0, bossRequired: null, title: "Newly Awakened" },
  { name: "E-Rank", level: 2, quests: 3, streak: 0, bossRequired: null, title: "E-Rank Hunter" },
  { name: "D-Rank", level: 5, quests: 20, streak: 3, bossRequired: "first-gate", title: "Disciplined Hunter" },
  { name: "C-Rank", level: 12, quests: 50, streak: 5, bossRequired: "fenrir-echo", title: "Gate Walker" },
  { name: "B-Rank", level: 25, quests: 120, streak: 10, bossRequired: "minotaur-routine", title: "Shadow Candidate" },
  { name: "A-Rank", level: 40, quests: 250, streak: 14, bossRequired: "hydra-excuses", title: "Elite Hunter" },
  { name: "S-Rank", level: 60, quests: 500, streak: 30, bossRequired: "chimera-hunger", title: "National Level Hunter" },
  { name: "Shadow Rank", level: 80, quests: 800, streak: 30, bossRequired: "wraith-burnout", title: "Shadow Commander" },
  { name: "Monarch Rank", level: 100, quests: 1200, streak: 30, bossRequired: "cerberus-protocol", title: "Monarch Vessel" },
  { name: "Abyss Rank", level: 150, quests: 2000, streak: 30, bossRequired: "leviathan-gate", title: "Abyss Walker" },
];

const BOSSES = [
  {
    id: "first-gate",
    name: "The First Gate",
    gateFrom: "E-Rank",
    unlocksRank: "D-Rank",
    powerRequired: 180,
    rewardXp: 120,
    badge: "First Gate Cleared",
    title: "Awakened Hunter",
    focus: "Discipline",
    lore: "A shifting shadow beast guards the first true threshold. It tests whether the hunter can return after the first burst of motivation fades.",
    failure: "The gate rejects unstable discipline. Complete more daily quests before forcing entry again.",
  },
  {
    id: "fenrir-echo",
    name: "Fenrir’s Echo",
    gateFrom: "D-Rank",
    unlocksRank: "C-Rank",
    powerRequired: 420,
    rewardXp: 260,
    badge: "Echo Breaker",
    title: "Echo Breaker",
    focus: "Endurance",
    lore: "A chained wolf-shadow circles the gate. It hunts weakness in movement, stamina, and routine.",
    failure: "Fenrir’s Echo overpowers your current endurance. Walk, train, and build your streak before returning.",
  },
  {
    id: "minotaur-routine",
    name: "The Minotaur of Routine",
    gateFrom: "C-Rank",
    unlocksRank: "B-Rank",
    powerRequired: 900,
    rewardXp: 520,
    badge: "Maze Breaker",
    title: "Maze Breaker",
    focus: "Discipline",
    lore: "A horned guardian stalks an endless maze of excuses. Only repeated discipline reveals the exit.",
    failure: "The maze consumes unfocused hunters. Build more consistency before attempting the gate again.",
  },
  {
    id: "hydra-excuses",
    name: "The Hydra of Excuses",
    gateFrom: "B-Rank",
    unlocksRank: "A-Rank",
    powerRequired: 1800,
    rewardXp: 900,
    badge: "Hydra Severed",
    title: "Excuse Breaker",
    focus: "Consistency",
    lore: "Every missed day grows another head. The Hydra can only be beaten by a hunter who keeps showing up.",
    failure: "The Hydra multiplies faster than your current system power. Strengthen your streak before the next attempt.",
  },
  {
    id: "chimera-hunger",
    name: "The Chimera of Hunger",
    gateFrom: "A-Rank",
    unlocksRank: "S-Rank",
    powerRequired: 3200,
    rewardXp: 1400,
    badge: "Chimera Tamed",
    title: "Hunger Tamer",
    focus: "Nutrition",
    lore: "A three-headed beast built from cravings, shortcuts, and late-night weakness guards the higher ranks.",
    failure: "The Chimera senses unstable fuel. Improve nutrition and recovery before returning.",
  },
  {
    id: "wraith-burnout",
    name: "The Wraith of Burnout",
    gateFrom: "S-Rank",
    unlocksRank: "Shadow Rank",
    powerRequired: 5200,
    rewardXp: 2200,
    badge: "Burnout Banished",
    title: "Recovery Warden",
    focus: "Recovery",
    lore: "This wraith does not attack strength. It waits for exhaustion, overreach, and neglected recovery.",
    failure: "The Wraith feeds on your fatigue. Recovery is not optional at this gate.",
  },
  {
    id: "cerberus-protocol",
    name: "Cerberus Protocol",
    gateFrom: "Shadow Rank",
    unlocksRank: "Monarch Rank",
    powerRequired: 7600,
    rewardXp: 3200,
    badge: "Cerberus Protocol Cleared",
    title: "Gate Commander",
    focus: "All Stats",
    lore: "Three heads test body, discipline, and focus at the same time. A single weak area can break the run.",
    failure: "Cerberus detects imbalance. Raise your weaker stats before trying again.",
  },
  {
    id: "leviathan-gate",
    name: "Leviathan Gate",
    gateFrom: "Monarch Rank",
    unlocksRank: "Abyss Rank",
    powerRequired: 10800,
    rewardXp: 5000,
    badge: "Leviathan Gate Cleared",
    title: "Abyss Walker",
    focus: "Endurance",
    lore: "A colossal shadow moves beneath the final gate. Only long-term discipline survives the pressure below.",
    failure: "The Leviathan drags unprepared hunters into the deep. Your system power is not yet enough.",
  },
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
  clearedBosses: [],
  badges: [],
  unlockedTitles: ["Newly Awakened"],
  systemLog: [],
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

function createLog(text, type = "system") {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    text,
    type,
  };
}

function appendLog(log, text, type = "system") {
  return [createLog(text, type), ...(log || [])].slice(0, 10);
}

function getTotalStats(stats) {
  return Object.values(stats || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function getPlayerPower(progress) {
  return (
    progress.level * 10 +
    getTotalStats(progress.stats) * 4 +
    progress.currentStreak * 6 +
    progress.totalQuestsCompleted
  );
}

function getRankForProgress(progress) {
  let unlocked = RANKS[0];
  const clearedBosses = progress.clearedBosses || [];

  RANKS.forEach((rank) => {
    const hasLevel = progress.level >= rank.level;
    const hasQuests = progress.totalQuestsCompleted >= rank.quests;
    const hasStreak = progress.bestStreak >= rank.streak || progress.currentStreak >= rank.streak;
    const hasBoss = !rank.bossRequired || clearedBosses.includes(rank.bossRequired);

    if (hasLevel && hasQuests && hasStreak && hasBoss) {
      unlocked = rank;
    }
  });

  return unlocked;
}

function getRankStage(progress, currentRank, nextRank) {
  if (!nextRank) {
    return { displayName: currentRank.name, tier: 4, tierLabel: "MAX", progress: 100, gateReady: false };
  }

  if (currentRank.name === "Unawakened") {
    const levelPercent = Math.min(1, progress.level / Math.max(nextRank.level, 1));
    const questPercent = Math.min(1, progress.totalQuestsCompleted / Math.max(nextRank.quests, 1));
    const overall = Math.round(((levelPercent + questPercent) / 2) * 100);
    return { displayName: "Unawakened", tier: 0, tierLabel: "Awakening", progress: overall, gateReady: false };
  }

  const levelSpan = Math.max(1, nextRank.level - currentRank.level);
  const questSpan = Math.max(1, nextRank.quests - currentRank.quests);
  const streakSpan = Math.max(1, nextRank.streak - currentRank.streak);
  const levelProgress = Math.min(1, Math.max(0, (progress.level - currentRank.level) / levelSpan));
  const questProgress = Math.min(1, Math.max(0, (progress.totalQuestsCompleted - currentRank.quests) / questSpan));
  const streakProgress = nextRank.streak === currentRank.streak
    ? 1
    : Math.min(1, Math.max(0, (Math.max(progress.bestStreak, progress.currentStreak) - currentRank.streak) / streakSpan));
  const overall = (levelProgress + questProgress + streakProgress) / 3;
  const hasNumericRequirements =
    progress.level >= nextRank.level &&
    progress.totalQuestsCompleted >= nextRank.quests &&
    Math.max(progress.bestStreak, progress.currentStreak) >= nextRank.streak;
  const tier = hasNumericRequirements ? 4 : Math.min(4, Math.max(1, Math.floor(overall * 4) + 1));
  const tierLabel = ROMAN_TIERS[tier - 1];
  const gateReady = hasNumericRequirements && Boolean(nextRank.bossRequired) && !(progress.clearedBosses || []).includes(nextRank.bossRequired);

  return {
    displayName: `${currentRank.name} ${tierLabel}`,
    tier,
    tierLabel,
    progress: Math.round(overall * 100),
    gateReady,
  };
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
      clearedBosses: parsed.clearedBosses || [],
      badges: parsed.badges || [],
      unlockedTitles: parsed.unlockedTitles || [parsed.title || INITIAL_PROGRESS.title],
      systemLog: parsed.systemLog || [],
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
  const [battleResult, setBattleResult] = useState(null);

  const todayKey = getDateKey();
  const completedToday = progress.completedByDate[todayKey] || [];
  const completedCount = completedToday.length;
  const completionPercent = Math.round((completedCount / DAILY_QUESTS.length) * 100);
  const xpNeeded = getXpNeeded(progress.level);
  const xpPercent = Math.min(100, Math.round((progress.xp / xpNeeded) * 100));
  const currentRankIndex = Math.max(0, RANKS.findIndex((rank) => rank.name === progress.rank));
  const currentRank = RANKS[currentRankIndex] || RANKS[0];
  const nextRank = RANKS[currentRankIndex + 1] || null;
  const rankStage = getRankStage(progress, currentRank, nextRank);
  const playerPower = getPlayerPower(progress);
  const activeBoss = BOSSES.find((boss) => boss.gateFrom === currentRank.name && !(progress.clearedBosses || []).includes(boss.id));
  const canChallengeBoss = Boolean(activeBoss && rankStage.tier >= 3);
  const bossPowerPercent = activeBoss ? Math.min(100, Math.round((playerPower / activeBoss.powerRequired) * 100)) : 100;

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
    if (rank.name !== progress.rank) {
      setProgress((current) => ({
        ...current,
        rank: rank.name,
        title: rank.title,
        unlockedTitles: Array.from(new Set([...(current.unlockedTitles || []), rank.title])),
        systemLog: appendLog(current.systemLog, `Rank authorised: ${rank.name}.`, "rank"),
      }));
      setLevelNotice(`RANK UP — ${rank.name}`);
      window.setTimeout(() => setLevelNotice(null), 3000);
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

      let nextLog = appendLog(current.systemLog, `${quest.title} complete. +${quest.xp} XP.`, "quest");
      if (levelResult.levelsGained > 0) {
        nextLog = appendLog(nextLog, `Level increased to ${levelResult.level}.`, "level");
        setLevelNotice(
          levelResult.levelsGained === 1
            ? `LEVEL UP — Level ${levelResult.level}`
            : `MULTI LEVEL UP — Level ${levelResult.level}`,
        );
        window.setTimeout(() => setLevelNotice(null), 2600);
      }

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
        systemLog: nextLog,
      };

      const nextMajorRank = getRankForProgress(nextProgress);
      nextProgress.rank = nextMajorRank.name;
      nextProgress.title = nextMajorRank.title;
      nextProgress.unlockedTitles = Array.from(new Set([...(nextProgress.unlockedTitles || []), nextMajorRank.title]));

      setSystemMessage(SYSTEM_MESSAGES[Math.floor(Math.random() * SYSTEM_MESSAGES.length)]);
      return nextProgress;
    });
  };

  const challengeBoss = () => {
    if (!activeBoss || !canChallengeBoss) return;

    setProgress((current) => {
      const currentPower = getPlayerPower(current);
      const victory = currentPower >= activeBoss.powerRequired;
      const ratio = currentPower / activeBoss.powerRequired;

      if (!victory) {
        const message = ratio >= 0.7 ? "RETREAT FORCED" : ratio >= 0.5 ? "GATE FAILED" : "OVERWHELMED";
        setBattleResult({ victory: false, title: message, boss: activeBoss.name, detail: activeBoss.failure });
        setSystemMessage(`${message}: ${activeBoss.name} remains undefeated.`);
        window.setTimeout(() => setBattleResult(null), 5200);
        return {
          ...current,
          systemLog: appendLog(current.systemLog, `${activeBoss.name} challenged. ${message.toLowerCase()}.`, "boss-fail"),
        };
      }

      const levelResult = calculateLevel(current.level, current.xp, activeBoss.rewardXp);
      const clearedBosses = Array.from(new Set([...(current.clearedBosses || []), activeBoss.id]));
      const badges = Array.from(new Set([...(current.badges || []), activeBoss.badge]));
      const unlockedTitles = Array.from(new Set([...(current.unlockedTitles || []), activeBoss.title]));

      let nextProgress = {
        ...current,
        level: levelResult.level,
        xp: levelResult.xp,
        clearedBosses,
        badges,
        unlockedTitles,
        title: activeBoss.title,
        systemLog: appendLog(current.systemLog, `${activeBoss.name} defeated. Badge unlocked: ${activeBoss.badge}.`, "boss-win"),
      };

      const newRank = getRankForProgress(nextProgress);
      if (newRank.name !== current.rank) {
        nextProgress = {
          ...nextProgress,
          rank: newRank.name,
          title: newRank.title,
          unlockedTitles: Array.from(new Set([...(nextProgress.unlockedTitles || []), newRank.title])),
          systemLog: appendLog(nextProgress.systemLog, `SYSTEM EVALUATION COMPLETE. You are now ${newRank.name}.`, "rank"),
        };
        setLevelNotice(`RANK UP — ${newRank.name}`);
      } else if (levelResult.levelsGained > 0) {
        setLevelNotice(`LEVEL UP — Level ${levelResult.level}`);
      } else {
        setLevelNotice("GATE CLEARED");
      }

      setBattleResult({ victory: true, title: "GATE CLEARED", boss: activeBoss.name, detail: `Reward: +${activeBoss.rewardXp} XP · ${activeBoss.badge}` });
      setSystemMessage(`Gate cleared. ${activeBoss.name} has fallen.`);
      window.setTimeout(() => setBattleResult(null), 5600);
      window.setTimeout(() => setLevelNotice(null), 3200);
      return nextProgress;
    });
  };

  const saveName = () => {
    const cleanName = draftName.trim() || "Hunter";
    setProgress((current) => ({
      ...current,
      displayName: cleanName,
      systemLog: appendLog(current.systemLog, "Identity record updated.", "system"),
    }));
    setSystemMessage("Identity record updated.");
  };

  const resetProgress = () => {
    const confirmed = window.confirm("Reset all Shadow Steps progress on this device?");
    if (!confirmed) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setProgress(INITIAL_PROGRESS);
    setDraftName(INITIAL_PROGRESS.displayName);
    setBattleResult(null);
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
      {battleResult && (
        <div className={battleResult.victory ? "battle-result victory" : "battle-result defeat"}>
          <strong>{battleResult.title}</strong>
          <span>{battleResult.boss}</span>
          <p>{battleResult.detail}</p>
        </div>
      )}

      <section className="phone-frame">
        <header className="top-panel">
          <div className="brand-row">
            <div className="brand-sigil" aria-hidden="true">SS</div>
            <div>
              <p className="eyebrow">Shadow System Online</p>
              <h1>Shadow Steps</h1>
            </div>
          </div>
          <div className="rank-chip">{rankStage.displayName}</div>
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

              <div className="rank-tier-box">
                <div>
                  <span>Rank Tier</span>
                  <strong>{rankStage.displayName}</strong>
                </div>
                <div className="mini-track"><span style={{ width: `${rankStage.progress}%` }} /></div>
              </div>

              <div className="system-message">
                <span>System Message</span>
                <p>{systemMessage}</p>
              </div>
            </article>

            <div className="stat-strip">
              <article><span>Power</span><strong>{playerPower}</strong></article>
              <article><span>Streak</span><strong>{progress.currentStreak}</strong></article>
              <article><span>Today</span><strong>{completionPercent}%</strong></article>
              <article><span>Core Stat</span><strong>{strongestStat.label}</strong></article>
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

            <section className="panel log-panel">
              <div className="section-heading">
                <div>
                  <p className="label">System Log</p>
                  <h2>Recent events</h2>
                </div>
              </div>
              {(progress.systemLog || []).length ? (
                progress.systemLog.slice(0, 4).map((entry) => (
                  <div className={`log-row ${entry.type}`} key={entry.id}>
                    <span>{entry.date}</span>
                    <p>{entry.text}</p>
                  </div>
                ))
              ) : (
                <div className="locked-row">No events logged yet. Complete a quest to begin recording progress.</div>
              )}
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
          </section>
        )}

        {activeTab === "gates" && (
          <section className="screen">
            <section className="panel boss-panel">
              <div className="section-heading">
                <div>
                  <p className="label">Boss Gate</p>
                  <h2>{activeBoss ? activeBoss.name : "No active gate"}</h2>
                </div>
                <span>{activeBoss ? `${bossPowerPercent}%` : "Clear"}</span>
              </div>

              {activeBoss ? (
                <>
                  <div className={battleResult ? "battle-stage active" : "battle-stage"}>
                    <div className="hunter-sprite"><span /></div>
                    <div className="slash-effect" />
                    <div className="boss-sprite"><span>{activeBoss.name.split(" ")[0]}</span></div>
                  </div>

                  <div className="boss-lore">
                    <p className="label">Gate Lore</p>
                    <p>{activeBoss.lore}</p>
                  </div>

                  <div className="boss-power-grid">
                    <RequirementBar label="Your power" current={playerPower} required={activeBoss.powerRequired} />
                    <RequirementBar label="Rank tier access" current={rankStage.tier} required={3} />
                  </div>

                  <div className="boss-info-grid">
                    <article><span>Focus</span><strong>{activeBoss.focus}</strong></article>
                    <article><span>Reward</span><strong>+{activeBoss.rewardXp} XP</strong></article>
                    <article><span>Badge</span><strong>{activeBoss.badge}</strong></article>
                    <article><span>Unlocks</span><strong>{activeBoss.unlocksRank}</strong></article>
                  </div>

                  <button className="boss-button" type="button" onClick={challengeBoss} disabled={!canChallengeBoss}>
                    {canChallengeBoss ? "Challenge Gate" : "Reach Rank Tier III to challenge"}
                  </button>
                  <p className="boss-note">Boss attempts are honesty-based and do not delete progress. Failure means retreat, grind, and return stronger.</p>
                </>
              ) : (
                <div className="locked-row">All currently available gates for this rank are cleared. Continue daily quests to reveal the next gate.</div>
              )}
            </section>

            <section className="panel">
              <div className="section-heading">
                <div>
                  <p className="label">Gate Archive</p>
                  <h2>Bosses</h2>
                </div>
              </div>
              <div className="boss-list">
                {BOSSES.map((boss) => {
                  const cleared = (progress.clearedBosses || []).includes(boss.id);
                  return (
                    <div className={cleared ? "boss-row cleared" : "boss-row"} key={boss.id}>
                      <span>{boss.name}</span>
                      <small>{cleared ? "Cleared" : `${boss.gateFrom} → ${boss.unlocksRank}`}</small>
                    </div>
                  );
                })}
              </div>
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
                  <h2>{rankStage.displayName}</h2>
                </div>
                <span>Level {progress.level}</span>
              </div>

              {nextRank ? (
                <div className="next-rank-card">
                  <p className="label">Next major rank</p>
                  <h3>{nextRank.name}</h3>
                  <RequirementBar label="Level" current={progress.level} required={nextRank.level} />
                  <RequirementBar label="Completed quests" current={progress.totalQuestsCompleted} required={nextRank.quests} />
                  <RequirementBar label="Best/current streak" current={Math.max(progress.bestStreak, progress.currentStreak)} required={nextRank.streak} />
                  {nextRank.bossRequired && <RequirementBar label="Gate cleared" current={(progress.clearedBosses || []).includes(nextRank.bossRequired) ? 1 : 0} required={1} />}
                  <div className={rankStage.gateReady ? "trial-box ready" : "trial-box"}>
                    {rankStage.gateReady ? "Rank-Up Gate ready. Challenge the boss gate." : "Build tier progress to unlock the next gate."}
                  </div>
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
                <span>v0.2</span>
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

              <div className="badge-grid">
                {(progress.badges || []).length ? progress.badges.map((badge) => <div className="badge-card" key={badge}>{badge}</div>) : <div className="locked-row">No badges unlocked yet. Clear a boss gate to earn one.</div>}
              </div>

              <div className="data-card">
                <strong>Progress saved locally on this device.</strong>
                <p>Step and habit tracking is honesty-based for now. Supabase leaderboards, accounts, and verification can be added later.</p>
              </div>

              <button className="reset-button" type="button" onClick={resetProgress}>Reset all progress</button>
            </section>
          </section>
        )}

        <nav className="bottom-nav" aria-label="Primary navigation">
          {[
            ["dashboard", "Home"],
            ["quests", "Quests"],
            ["gates", "Gates"],
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
