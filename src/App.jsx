import { useEffect, useMemo, useState } from "react";

const defaultSteps = [
  {
    id: "signal",
    title: "Trace the Signal",
    detail: "Mark the objective and the cleanest path toward it.",
    complete: true,
  },
  {
    id: "cover",
    title: "Read the Cover",
    detail: "Identify safe pauses, hazards, and blind corners.",
    complete: false,
  },
  {
    id: "move",
    title: "Move With Intent",
    detail: "Advance only when the next step has a purpose.",
    complete: false,
  },
];

const storageKey = "shadow-steps-progress";

function App() {
  const [steps, setSteps] = useState(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultSteps;
    } catch {
      return defaultSteps;
    }
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(steps));
  }, [steps]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  const completedCount = useMemo(
    () => steps.filter((step) => step.complete).length,
    [steps],
  );
  const progress = Math.round((completedCount / steps.length) * 100);

  const toggleStep = (id) => {
    setSteps((currentSteps) =>
      currentSteps.map((step) =>
        step.id === id ? { ...step, complete: !step.complete } : step,
      ),
    );
  };

  const resetRoute = () => {
    setSteps(defaultSteps);
  };

  const installApp = async () => {
    if (!installPrompt) {
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Installable PWA</p>
          <h1 id="page-title">Shadow Steps</h1>
          <p className="lede">
            Plan a careful route, track each move, and keep progress available
            even when the connection drops.
          </p>

          <div className="actions" aria-label="Primary actions">
            <button className="primary-action" type="button" onClick={resetRoute}>
              Reset Route
            </button>
            <button
              className="secondary-action"
              type="button"
              onClick={installApp}
              disabled={!installPrompt}
            >
              Install App
            </button>
          </div>
        </div>

        <div className="mission-panel" aria-label="Route progress">
          <div className="status-row">
            <span className={isOnline ? "status online" : "status offline"}>
              {isOnline ? "Online" : "Offline ready"}
            </span>
            <span>{progress}% clear</span>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Route completion"
          >
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="steps">
            {steps.map((step, index) => (
              <button
                className={step.complete ? "step complete" : "step"}
                type="button"
                key={step.id}
                onClick={() => toggleStep(step.id)}
                aria-pressed={step.complete}
              >
                <span className="step-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="step-copy">
                  <strong>{step.title}</strong>
                  <small>{step.detail}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
