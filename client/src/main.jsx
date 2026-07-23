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
  Eye,
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
 * 🎒 Complete 9-Chapter Interactive Dora's Backpack Adventure Simulation
 */
function DoraStoryQuestPage({ onBack }) {
  const chapters = [
    {
      step: 1,
      chapterTitle: '🌟 Chapter 1 – An Empty Backpack',
      character: 'Dora the Explorer',
      avatar: '/images/dora_backpack.jpg',
      dialogue: 'One sunny morning, Dora wakes up excited for an adventure! "Oh no! My backpack is empty! I need your help to collect everything I\'ll need for this adventure." In Python, Dora\'s backpack is a List.',
      conceptTitle: 'Creating a List',
      conceptCode: 'backpack = []',
      actionText: '🎒 Create Empty Backpack',
      actionType: 'create'
    },
    {
      step: 2,
      chapterTitle: '🗺️ Chapter 2 – The Magical Map',
      character: 'Dora the Explorer',
      avatar: '/images/dora_backpack.jpg',
      dialogue: 'Dora finds a magical map. She says: "The map will help us find the correct path!" Let\'s put it inside the backpack using append().',
      conceptTitle: 'append() Method',
      conceptCode: 'backpack.append("Map")',
      actionText: '🗺️ Add Map (.append("Map"))',
      actionType: 'addMap'
    },
    {
      step: 3,
      chapterTitle: '🔑 Chapter 3 – The Golden Key',
      character: 'Boots the Monkey',
      avatar: '/images/boots.jpg',
      dialogue: 'A locked gate appears. Boots shouts: "We need a key!" Dora finds a Golden Key. Add it to the backpack!',
      conceptTitle: 'append() Second Item',
      conceptCode: 'backpack.append("Golden Key")',
      actionText: '🔑 Add Golden Key (.append("Golden Key"))',
      actionType: 'addKey'
    },
    {
      step: 4,
      chapterTitle: '🔦 Chapter 4 – The Broken Torch',
      character: 'Dora & Swiper',
      avatar: '/images/swiper.jpg',
      dialogue: 'The cave is dark. Dora picks up a torch (backpack.append("Torch")). Unfortunately... the torch breaks! Dora says: "We don\'t need broken things." Remove it!',
      conceptTitle: 'remove() Method',
      conceptCode: 'backpack.remove("Torch")',
      actionText: '🔦 Add & Remove Broken Torch',
      actionType: 'handleTorch'
    },
    {
      step: 5,
      chapterTitle: '🧭 Chapter 5 – The Magic Compass',
      character: 'Dora the Explorer',
      avatar: '/images/dora_backpack.jpg',
      dialogue: 'Inside the forest, Dora discovers a Magic Compass. She says: "The compass should always stay at the front so we can find our way." Insert it at index 0!',
      conceptTitle: 'insert() Method',
      conceptCode: 'backpack.insert(0, "Magic Compass")',
      actionText: '🧭 Insert Compass at Index 0 (.insert(0, ...))',
      actionType: 'insertCompass'
    },
    {
      step: 6,
      chapterTitle: '🎁 Chapter 6 – What\'s the First Item?',
      character: 'Boots the Monkey',
      avatar: '/images/boots.jpg',
      dialogue: 'The journey becomes confusing. Boots asks: "What\'s the first thing inside our backpack?" Let\'s check using indexing backpack[0]!',
      conceptTitle: 'List Indexing [0]',
      conceptCode: 'first_item = backpack[0]',
      actionText: '🔍 Check First Item (backpack[0])',
      actionType: 'inspectFirst'
    },
    {
      step: 7,
      chapterTitle: '🎒 Chapter 7 – How Many Items Do We Have?',
      character: 'Dora the Explorer',
      avatar: '/images/dora_backpack.jpg',
      dialogue: 'Before crossing the river, Dora checks whether she has enough supplies. Count everything using len(backpack)!',
      conceptTitle: 'len() Function',
      conceptCode: 'item_count = len(backpack)',
      actionText: '🔢 Count Total Items (len(backpack))',
      actionType: 'countItems'
    },
    {
      step: 8,
      chapterTitle: '👀 Chapter 8 – Check Every Item',
      character: 'Swiper & Dora',
      avatar: '/images/swiper.jpg',
      dialogue: 'Swiper is nearby! Dora wants to make sure nothing is missing. Let\'s inspect every item one by one using a for loop!',
      conceptTitle: 'Looping through a List',
      conceptCode: 'for item in backpack:\n    print(item)',
      actionText: '👀 Loop Through List (for item in backpack)',
      actionType: 'loopItems'
    },
    {
      step: 9,
      chapterTitle: '⭐ Chapter 9 – Use the Last Item',
      character: 'Boots the Monkey',
      avatar: '/images/boots.jpg',
      dialogue: 'The final door needs the last collected item! Take it out using pop()!',
      conceptTitle: 'pop() Method',
      conceptCode: 'last_item = backpack.pop()',
      actionText: '⭐ Take Out Last Item (.pop())',
      actionType: 'popItem'
    },
    {
      step: 10,
      chapterTitle: '🏆 Final Chapter – The Golden Star',
      character: 'Dora, Boots & Backpack',
      avatar: '/images/dora_backpack.jpg',
      dialogue: 'Dora and Boots reach the hidden Golden Star! Dora smiles and says: "We couldn\'t have finished this adventure without organizing everything in our backpack. Just like my backpack helped us store and manage important items, Python Lists help programmers store and manage multiple pieces of data."',
      conceptTitle: 'Mastery Achieved!',
      conceptCode: 'print("¡Lo hicimos! We did it!")',
      actionText: '🏆 Complete Quest!',
      actionType: 'complete'
    }
  ];

  const [currentChapter, setCurrentChapter] = useState(0);
  const [backpack, setBackpack] = useState([]);
  const [highlightFirst, setHighlightFirst] = useState(false);
  const [poppedItem, setPoppedItem] = useState(null);
  const [loopOutput, setLoopOutput] = useState([]);
  const [isLooping, setIsLooping] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);

  const activeChapter = chapters[currentChapter];

  function runChapterAction() {
    const type = activeChapter.actionType;

    if (type === 'create') {
      setBackpack([]);
      setPoppedItem(null);
      setLoopOutput([]);
    } else if (type === 'addMap') {
      if (!backpack.includes('Map')) setBackpack((prev) => [...prev, 'Map']);
    } else if (type === 'addKey') {
      if (!backpack.includes('Golden Key')) setBackpack((prev) => [...prev, 'Golden Key']);
    } else if (type === 'handleTorch') {
      // Simulate torch addition and immediate removal as per story
      setBackpack((prev) => [...prev.filter((i) => i !== 'Torch')]);
    } else if (type === 'insertCompass') {
      if (!backpack.includes('Magic Compass')) {
        setBackpack((prev) => ['Magic Compass', ...prev.filter((i) => i !== 'Magic Compass')]);
      }
    } else if (type === 'inspectFirst') {
      setHighlightFirst(true);
      setTimeout(() => setHighlightFirst(false), 3000);
    } else if (type === 'countItems') {
      // Show length highlight
    } else if (type === 'loopItems') {
      setIsLooping(true);
      setLoopOutput(backpack);
      setTimeout(() => setIsLooping(false), 2000);
    } else if (type === 'popItem') {
      if (backpack.length > 0) {
        const last = backpack[backpack.length - 1];
        setPoppedItem(last);
        setBackpack((prev) => prev.slice(0, -1));
      }
    } else if (type === 'complete') {
      setQuestCompleted(true);
    }

    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  }

  function resetAdventure() {
    setCurrentChapter(0);
    setBackpack([]);
    setHighlightFirst(false);
    setPoppedItem(null);
    setLoopOutput([]);
    setQuestCompleted(false);
  }

  return (
    <div className="story-page-wrapper dora-theme-page">
      {/* Top Header Navbar */}
      <header className="story-nav dora-nav">
        <button type="button" className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Main Dashboard</span>
        </button>
        <div className="story-nav-title">
          <span className="backpack-emoji">🎒</span>
          <h2>Dora's Backpack: Learn Python Lists Through a Story</h2>
        </div>
        <button type="button" className="reset-quest-btn" onClick={resetAdventure}>
          <RotateCcw size={16} /> Reset Story
        </button>
      </header>

      {/* Chapters Horizontal Progress Bar */}
      <div className="quest-trail-bar">
        {chapters.map((ch, idx) => (
          <div
            key={ch.step}
            className={`trail-step ${idx === currentChapter ? 'active' : ''} ${idx < currentChapter ? 'completed' : ''}`}
            onClick={() => setCurrentChapter(idx)}
          >
            <span className="step-num">{idx < currentChapter ? '✓' : ch.step}</span>
            <span className="step-label">Ch {ch.step}</span>
          </div>
        ))}
      </div>

      {/* Main Chapter Simulation Stage */}
      <div className="dora-simulation-main">
        {/* Left Side: Chapter Dialogue & Story Action */}
        <section className="dora-story-stage">
          <div className="stage-scene-card">
            <div className="character-avatar-wrap">
              <img src={activeChapter.avatar} alt={activeChapter.character} className="character-avatar-img" />
              <span className="char-name-tag">{activeChapter.character}</span>
            </div>

            <div className="dialogue-speech-bubble">
              <div className="bubble-header">
                <Volume2 size={18} color="#ffd166" />
                <strong>{activeChapter.chapterTitle}</strong>
              </div>
              <p className="dialogue-text">"{activeChapter.dialogue}"</p>
            </div>
          </div>

          {/* Action Execution Button */}
          <div className="quest-action-box">
            <button type="button" className="hero-action-btn" onClick={runChapterAction}>
              <Zap size={20} /> {activeChapter.actionText}
            </button>
            <p className="action-hint">Click button to execute the Python list command for this chapter!</p>
          </div>

          {/* Concept Code Box */}
          <div className="scene-concept-banner">
            <div className="concept-title">
              <Code2 size={20} color="#06d6a0" />
              <h3>Concept Learned: {activeChapter.conceptTitle}</h3>
            </div>
            <pre className="highlight-code-block">{activeChapter.conceptCode}</pre>
          </div>

          {/* Popped Item / Loop Output Notice */}
          {poppedItem && (
            <div className="output-notice-box">
              <Sparkles size={18} color="#ffd166" />
              <span><strong>.pop() Output:</strong> "{poppedItem}" (removed from last position)</span>
            </div>
          )}

          {loopOutput.length > 0 && (
            <div className="output-notice-box">
              <Eye size={18} color="#06d6a0" />
              <div>
                <strong>For Loop Print Output:</strong>
                <div className="loop-printed-list">
                  {loopOutput.map((item, i) => (
                    <span key={i} className="print-line">> print("{item}")</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Visual Backpack & Live Python Code Trace */}
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
              <Code2 size={16} color="#a3e635" />
              <span>Live Python Execution Terminal</span>
            </div>
            <pre className="terminal-code">
{`# Python List Execution Trace - ${activeChapter.chapterTitle}
backpack = [${backpack.map((i) => `"${i}"`).join(', ')}]

# Current Operations:
# 1. Total items count: len(backpack) -> ${backpack.length}
# 2. First item: backpack[0] -> "${backpack[0] || 'None'}"
# 3. Last item: backpack[-1] -> "${backpack[backpack.length - 1] || 'None'}"

print("Dora's Backpack:", backpack)`}
            </pre>
          </div>

          {/* Victory Card */}
          {questCompleted && (
            <div className="victory-celebration-card">
              <Trophy size={36} color="#ffd166" />
              <div>
                <h3>¡Lo Hicimos! We Did It! ⭐</h3>
                <p>"Python Lists help programmers store and manage multiple pieces of data seamlessly!"</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
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
