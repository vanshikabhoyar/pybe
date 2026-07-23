import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  ChartNoAxesCombined,
  CheckCircle2,
  Code2,
  Compass,
  Key,
  Layers,
  Lightbulb,
  Map,
  MessageSquareText,
  Package,
  Play,
  Plus,
  RotateCcw,
  Route,
  Search,
  Send,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Volume2,
  Zap
} from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function api(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function App() {
  const [scenarios, setScenarios] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [filters, setFilters] = useState({ q: '', difficulty: '', concept: '' });
  const [form, setForm] = useState({ learnerName: 'Guest learner', reasoning: '', promptText: '', reflection: '' });
  const [activeResult, setActiveResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Navigation State: 'dashboard' or 'storyQuest'
  const [viewMode, setViewMode] = useState('dashboard');

  const concepts = useMemo(() => [...new Set(scenarios.flatMap((scenario) => scenario.concepts || []))].sort(), [scenarios]);

  async function refresh() {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    const [scenarioData, sessionData, analyticsData, roadmapData] = await Promise.all([
      api(`/scenarios?${params}`),
      api('/sessions'),
      api('/analytics'),
      api('/roadmap')
    ]);
    setScenarios(scenarioData);
    setSessions(sessionData);
    setAnalytics(analyticsData);
    setRoadmap(roadmapData);
    setSelected((current) => current || scenarioData[0] || null);
    setLoading(false);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, [filters.q, filters.difficulty, filters.concept]);

  async function submitSession(event) {
    event.preventDefault();
    if (!selected || !form.reasoning.trim()) return;
    setSubmitting(true);
    try {
      const result = await api('/sessions', {
        method: 'POST',
        body: JSON.stringify({ ...form, scenarioId: selected._id })
      });
      setActiveResult(result);
      setForm({ ...form, reasoning: '', promptText: '', reflection: '' });
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="loading">Loading PyBe...</main>;

  // Render Dora's Interactive Story Quest Page
  if (viewMode === 'storyQuest') {
    return <DoraStoryQuestPage onBack={() => setViewMode('dashboard')} scenarios={scenarios} />;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Brain size={30} />
          <div>
            <strong>PyBe</strong>
            <span>Story-driven Python Learning</span>
          </div>
        </div>

        <button 
          type="button" 
          className="story-quest-trigger-btn"
          onClick={() => setViewMode('storyQuest')}
        >
          <Sparkles size={18} />
          <span>Dora Story Quest Page</span>
          <small className="badge-new">SIMULATION ✨</small>
        </button>

        <label className="search">
          <Search size={18} />
          <input
            value={filters.q}
            onChange={(event) => setFilters({ ...filters, q: event.target.value })}
            placeholder="Search story scenarios"
          />
        </label>

        <select value={filters.difficulty} onChange={(event) => setFilters({ ...filters, difficulty: event.target.value })}>
          <option value="">All levels</option>
          <option>Beginner</option>
          <option>Explorer</option>
          <option>Builder</option>
        </select>

        <select value={filters.concept} onChange={(event) => setFilters({ ...filters, concept: event.target.value })}>
          <option value="">All Data Structures</option>
          {concepts.map((concept) => <option key={concept}>{concept}</option>)}
        </select>

        <div className="scenario-list">
          {scenarios.map((scenario) => (
            <button
              key={scenario._id}
              className={selected?._id === scenario._id ? 'scenario active' : 'scenario'}
              onClick={() => {
                setSelected(scenario);
                setActiveResult(null);
              }}
            >
              <span>{scenario.difficulty}</span>
              <strong>{scenario.title}</strong>
              <small>{scenario.concepts.join(' / ')}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="workspace">
        <header className="hero">
          <div>
            <p>Story-Based Python Mastery (Lists & Dictionaries)</p>
            <h1>Learn Python Data Structures through Classic Folk Stories & Legends.</h1>
          </div>
          <div className="hero-stats">
            <span>{analytics?.scenarioCount || 0}<small>Stories</small></span>
            <span>{analytics?.sessionCount || 0}<small>Sessions</small></span>
            <span>{analytics?.averagePromptScore || 0}<small>Prompt score</small></span>
          </div>
        </header>

        <div className="main-grid">
          <section className="panel learning-panel">
            <div className="section-title">
              <Compass size={20} />
              <h2>{selected?.title}</h2>
            </div>
            <p className="context">{selected?.context}</p>
            <div className="objective-row">
              {selected?.objectives.map((item) => <span key={item}>{item}</span>)}
            </div>
            <form onSubmit={submitSession} className="learning-form">
              <label>
                Your reasoning
                <textarea
                  required
                  value={form.reasoning}
                  onChange={(event) => setForm({ ...form, reasoning: event.target.value })}
                  placeholder={selected?.prompt}
                />
              </label>
              <label>
                Prompt you would give an AI mentor
                <textarea
                  value={form.promptText}
                  onChange={(event) => setForm({ ...form, promptText: event.target.value })}
                  placeholder="Explain how Python Lists or Dictionaries solve this story scenario..."
                />
              </label>
              <label>
                Reflection
                <textarea
                  value={form.reflection}
                  onChange={(event) => setForm({ ...form, reflection: event.target.value })}
                  placeholder="What did you notice about mapping story elements to Python Data Structures?"
                />
              </label>
              <button className="primary" disabled={submitting}>
                <Send size={18} />{submitting ? 'Mapping...' : 'Map My Reasoning'}
              </button>
            </form>
          </section>

          <section className="panel result-panel">
            <div className="section-title">
              <Sparkles size={20} />
              <h2>AI Mentor Output</h2>
            </div>
            {!activeResult ? <EmptyResult /> : <Result result={activeResult} />}
          </section>
        </div>

        <section className="dashboard">
          <div className="panel">
            <div className="section-title"><ChartNoAxesCombined size={20} /><h2>Data Structure Mastery</h2></div>
            <Analytics analytics={analytics} />
          </div>
          <div className="panel">
            <div className="section-title"><Route size={20} /><h2>Learning Path Roadmap</h2></div>
            <Roadmap roadmap={roadmap} />
          </div>
          <div className="panel">
            <div className="section-title"><MessageSquareText size={20} /><h2>Recent Sessions</h2></div>
            <SessionList sessions={sessions} />
          </div>
        </section>
      </section>
    </main>
  );
}

/**
 * 🎒 True Interactive Dora the Explorer Story Walkthrough Simulation
 */
function DoraStoryQuestPage({ onBack }) {
  // Quest Scenes Configuration
  const questScenes = [
    {
      step: 1,
      title: 'Scene 1: The Adventure Begins with Dora & Boots!',
      character: 'Dora & Boots',
      avatar: '/images/dora_backpack.jpg',
      dialogue: '¡Hola! I am Dora, and this is Boots! We are starting our journey to Star Mountain. First, we need to create our empty Backpack list in Python!',
      conceptTitle: 'Create Backpack List',
      conceptCode: 'backpack = []',
      actionText: '🎒 Create Empty Backpack',
      actionType: 'create'
    },
    {
      step: 2,
      title: 'Scene 2: Saying MAP! Adding Map to Backpack',
      character: 'Boots the Monkey',
      avatar: '/images/boots.jpg',
      dialogue: 'Say MAP! Map tells us we need to cross Crocodile Lake. Let\'s put Map inside Backpack so we don\'t get lost!',
      conceptTitle: 'Append Item to List',
      conceptCode: 'backpack.append("Map")',
      actionText: '🗺️ Put Map in Backpack',
      actionType: 'addMap'
    },
    {
      step: 3,
      title: 'Scene 3: Finding the Golden Key on the Trail',
      character: 'Dora the Explorer',
      avatar: '/images/dora_backpack.jpg',
      dialogue: 'Look! A Golden Key on the jungle trail! We\'ll need this key to unlock the Star Gate. Let\'s append it to our Backpack list!',
      conceptTitle: 'Append Second Item',
      conceptCode: 'backpack.append("Golden Key")',
      actionText: '🔑 Put Golden Key in Backpack',
      actionType: 'addKey'
    },
    {
      step: 4,
      title: 'Scene 4: Swiper Snuck a Broken Torch Inside!',
      character: 'Swiper the Fox',
      avatar: '/images/swiper.jpg',
      dialogue: 'Oh no! Swiper sneaked a Broken Torch into our backpack! Quick, let's use .remove("Broken Torch") to clean up our list!',
      conceptTitle: 'Remove Item from List',
      conceptCode: 'backpack.remove("Broken Torch")',
      actionText: '🧹 Remove Broken Torch',
      actionType: 'removeTorch'
    },
    {
      step: 5,
      title: 'Scene 5: Checking the First Item to Find Our Way',
      character: 'Dora the Explorer',
      avatar: '/images/dora_backpack.jpg',
      dialogue: 'We reached Crocodile Lake! Which item is FIRST in our backpack list? In Python, indexing starts at 0! Index [0] gives us Map!',
      conceptTitle: 'Access Index [0]',
      conceptCode: 'first_item = backpack[0]',
      actionText: '🔍 Inspect backpack[0]',
      actionType: 'inspectFirst'
    },
    {
      step: 6,
      title: 'Scene 6: Reaching Star Mountain & Counting Items!',
      character: 'Dora, Boots & Backpack',
      avatar: '/images/dora_backpack.jpg',
      dialogue: '¡Lo hicimos! We did it! We reached Star Mountain! Let\'s use len(backpack) to count how many items helped us on our quest!',
      conceptTitle: 'Count Total Items with len()',
      conceptCode: 'total = len(backpack)',
      actionText: '🏆 Count Items len(backpack)',
      actionType: 'finish'
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [backpack, setBackpack] = useState([]);
  const [highlightFirst, setHighlightFirst] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);

  const activeScene = questScenes[currentStep];

  // Execute Step Action
  function handleStepAction() {
    const type = activeScene.actionType;

    if (type === 'create') {
      setBackpack([]);
    } else if (type === 'addMap') {
      if (!backpack.includes('Map')) setBackpack([...backpack, 'Map']);
    } else if (type === 'addKey') {
      if (!backpack.includes('Golden Key')) setBackpack([...backpack, 'Golden Key']);
    } else if (type === 'removeTorch') {
      setBackpack(backpack.filter((item) => item !== 'Broken Torch'));
    } else if (type === 'inspectFirst') {
      setHighlightFirst(true);
      setTimeout(() => setHighlightFirst(false), 3000);
    } else if (type === 'finish') {
      setQuestCompleted(true);
    }

    if (currentStep < questScenes.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  // Helper to add Broken Torch in scene 4 for illustration
  useEffect(() => {
    if (activeScene.actionType === 'removeTorch' && !backpack.includes('Broken Torch')) {
      setBackpack((prev) => [...prev, 'Broken Torch']);
    }
  }, [currentStep]);

  function restartQuest() {
    setCurrentStep(0);
    setBackpack([]);
    setQuestCompleted(false);
    setHighlightFirst(false);
  }

  return (
    <div className="story-page-wrapper dora-theme-page">
      {/* Top Cute Navbar */}
      <header className="story-nav dora-nav">
        <button type="button" className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Main Dashboard</span>
        </button>
        <div className="story-nav-title">
          <span className="backpack-emoji">🎒</span>
          <h2>Dora's Backpack Python List Simulation</h2>
        </div>
        <button type="button" className="reset-quest-btn" onClick={restartQuest}>
          <RotateCcw size={16} /> Restart Adventure
        </button>
      </header>

      {/* Quest Trail Progress Bar */}
      <div className="quest-trail-bar">
        {questScenes.map((scene, idx) => (
          <div
            key={scene.step}
            className={`trail-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            onClick={() => setCurrentStep(idx)}
          >
            <span className="step-num">{idx < currentStep ? '✓' : scene.step}</span>
            <span className="step-label">Step {scene.step}</span>
          </div>
        ))}
      </div>

      {/* Interactive Story Simulation Grid */}
      <div className="dora-simulation-main">
        {/* Left Side: Interactive Character Dialogue & Story Scene */}
        <section className="dora-story-stage">
          <div className="stage-scene-card">
            <div className="character-avatar-wrap">
              <img src={activeScene.avatar} alt={activeScene.character} className="character-avatar-img" />
              <span className="char-name-tag">{activeScene.character}</span>
            </div>

            <div className="dialogue-speech-bubble">
              <div className="bubble-header">
                <Volume2 size={18} color="#ffd166" />
                <strong>{activeScene.title}</strong>
              </div>
              <p className="dialogue-text">"{activeScene.dialogue}"</p>
            </div>
          </div>

          {/* Interactive Quest Action Button */}
          <div className="quest-action-box">
            <button type="button" className="hero-action-btn" onClick={handleStepAction}>
              <Zap size={20} /> {activeScene.actionText}
            </button>
            <p className="action-hint">Click button above to advance the story and run the Python code!</p>
          </div>

          {/* Python Concept Card for Current Scene */}
          <div className="scene-concept-banner">
            <div className="concept-title">
              <Code2 size={20} color="#06d6a0" />
              <h3>{activeScene.conceptTitle}</h3>
            </div>
            <code className="highlight-code">{activeScene.conceptCode}</code>
          </div>
        </section>

        {/* Right Side: Animated Backpack Visualizer & Code Terminal */}
        <section className="dora-backpack-visualizer">
          {/* Animated Backpack Container */}
          <div className="backpack-container-card">
            <div className="backpack-card-header">
              <div className="backpack-title">
                <span className="big-backpack-icon">🎒</span>
                <div>
                  <h3>Dora's Backpack Contents</h3>
                  <small>Python List Representation: <code>backpack</code></small>
                </div>
              </div>
              <div className="len-badge">
                <strong>len(backpack) = {backpack.length}</strong>
              </div>
            </div>

            <div className="backpack-list-display">
              <div className="code-syntax-bracket">backpack = [</div>
              <div className="items-chip-grid">
                {backpack.length === 0 ? (
                  <div className="empty-backpack-notice">
                    🎒 Backpack is empty! <code>backpack = []</code>
                  </div>
                ) : (
                  backpack.map((item, idx) => (
                    <div
                      key={idx}
                      className={`backpack-chip ${idx === 0 && highlightFirst ? 'highlight-first' : ''}`}
                    >
                      <span className="idx-tag">Index [{idx}]</span>
                      <strong className="item-name">"{item}"</strong>
                    </div>
                  ))
                )}
              </div>
              <div className="code-syntax-bracket">]</div>
            </div>
          </div>

          {/* Real-time Python Code Execution Terminal */}
          <div className="python-execution-terminal">
            <div className="terminal-bar">
              <TerminalIcon size={16} color="#a3e635" />
              <span>Python Execution Terminal</span>
            </div>
            <pre className="terminal-code">
{`# Python List Execution Trace
backpack = [${backpack.map((i) => `"${i}"`).join(', ')}]

# Current Operations:
# Total items: len(backpack) -> ${backpack.length}
# First item: backpack[0] -> "${backpack[0] || 'None'}"

print("Dora's Backpack Contents:", backpack)`}
            </pre>
          </div>

          {/* Victory Card */}
          {questCompleted && (
            <div className="victory-celebration-card">
              <Trophy size={36} color="#ffd166" />
              <div>
                <h3>¡Lo Hicimos! We Did It!</h3>
                <p>You mastered Python Lists with Dora's Backpack! 🎒⭐</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TerminalIcon({ size, color }) {
  return <Code2 size={size} color={color} />;
}

function EmptyResult() {
  return (
    <div className="empty">
      <Lightbulb size={38} />
      <p>Submit reasoning to see abstraction mapping, Python code, prompt feedback, and misconception signals.</p>
    </div>
  );
}

function Result({ result }) {
  return (
    <div className="result-stack">
      <div className="score"><span>{result.promptScore}</span><small>Prompt maturity</small></div>
      <div>
        {result.abstractionMap.map((item) => (
          <article className="mapping" key={item.pattern}>
            <strong>{item.pattern}</strong>
            <span>{item.pythonConcept}</span>
            <p>{item.explanation}</p>
          </article>
        ))}
      </div>
      <div className="code-block">
        <div><Code2 size={18} /> Generated Python</div>
        <pre>{result.generatedCode}</pre>
        <p>{result.codeExplanation}</p>
      </div>
      <ul className="feedback">
        {result.promptFeedback.map((item) => <li key={item}>{item}</li>)}
      </ul>
      {result.misconceptions.length > 0 && (
        <div className="note">
          <strong>Misconception watch</strong>
          {result.misconceptions.map((item) => <p key={item}>{item}</p>)}
        </div>
      )}
    </div>
  );
}

function Analytics({ analytics }) {
  const concepts = Object.entries(analytics?.conceptCounts || {});
  return (
    <div className="analytics-list">
      {concepts.length ? concepts.map(([name, count]) => (
        <div key={name}>
          <span>{name}</span>
          <meter min="0" max="10" value={count}></meter>
          <strong>{count}</strong>
        </div>
      )) : <p>No learning sessions yet.</p>}
    </div>
  );
}

function Roadmap({ roadmap }) {
  return (
    <div className="roadmap">
      {roadmap.map((phase) => (
        <article key={phase.phase}>
          <strong>{phase.phase}</strong>
          <div>
            <h3>{phase.title}</h3>
            <p>{phase.summary}</p>
            <small>{phase.items.join(' / ')}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

function SessionList({ sessions }) {
  return (
    <div className="sessions">
      {sessions.length ? sessions.slice(0, 6).map((session) => (
        <article key={session._id}>
          <Play size={16} />
          <div>
            <strong>{session.scenario?.title}</strong>
            <span>{session.masterySignals.join(' / ')}</span>
          </div>
        </article>
      )) : <p>No sessions yet.</p>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
