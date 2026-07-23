import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
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
  Trophy
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
  
  // View mode: 'dashboard' or 'storyQuest'
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
    return <StoryQuestPage onBack={() => setViewMode('dashboard')} scenarios={scenarios} />;
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
          <span>Interactive Story Quest</span>
          <small className="badge-new">Dora Page ✨</small>
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
 * 🎒 Brand New Cute Interactive Story Quest Page featuring Dora's Backpack
 */
function StoryQuestPage({ onBack }) {
  const storyList = [
    {
      id: 'dora_backpack',
      title: "🎒 Dora the Explorer's Backpack Adventure",
      category: 'Python List (Mastery)',
      icon: '🎒',
      image: '/images/dora_backpack.jpg',
      moral: 'Dora puts items into her Backpack! A Python List stores items in order, allows appending, removing, indexing [0], and len() counting.',
      dsType: 'dora'
    },
    {
      id: 'alibaba_treasure',
      title: 'Ali Baba & 40 Thieves: Secret Cave List',
      category: 'Python List (Arrays)',
      icon: '🗝️',
      image: '/images/ali_baba.jpg',
      moral: 'Order matters! Just like storing treasures sequentially inside a cave, a Python List keeps items in exact order.',
      dsType: 'list',
      initialItems: ['Gold Coins', 'Ruby Necklace', 'Diamond Crown']
    },
    {
      id: 'alibaba_passwords',
      title: 'Ali Baba & The Secret Passwords',
      category: 'Python Dictionary (Hash Maps)',
      icon: '✨',
      image: '/images/ali_baba.jpg',
      moral: 'Instant lookup! Just like matching a secret door key to its password, a Dictionary maps Key ➔ Value.',
      dsType: 'dict',
      initialPairs: [
        { key: 'Cave Door', value: 'Open Sesame' },
        { key: 'Secret Vault', value: 'Khul Ja Sim Sim' }
      ]
    },
    {
      id: 'thirsty_crow',
      title: 'Panchatantra: The Thirsty Crow',
      category: 'Python List (.append)',
      icon: '🐦',
      image: '/images/thirsty_crow.jpg',
      moral: 'One by one! The crow adds pebbles using .append() to raise the water level dynamically.',
      dsType: 'list',
      initialItems: ['Red Pebble', 'Blue Pebble', 'Shiny Pebble']
    },
    {
      id: 'tortoise_hare',
      title: 'Panchatantra: Tortoise & Hare Checkpoints',
      category: 'Python List (Indexing)',
      icon: '🐢',
      image: '/images/tortoise_hare.jpg',
      moral: 'Index 0 to Finish! Access any checkpoint instantly using Python list indexing [0] or [-1].',
      dsType: 'list',
      initialItems: ['Start Line', 'Big Banyan Tree', 'River Bridge', 'Finish Line']
    }
  ];

  const [activeStory, setActiveStory] = useState(storyList[0]);

  // Dora Backpack State
  const [backpack, setBackpack] = useState(['Map', 'Golden Key', 'Broken Torch', 'Compass']);
  const [highlightFirst, setHighlightFirst] = useState(false);
  const [customItem, setCustomItem] = useState('');

  // Other List/Dict States
  const [listItems, setListItems] = useState(activeStory.initialItems || []);
  const [dictPairs, setDictPairs] = useState(activeStory.initialPairs || []);
  const [newItemText, setNewItemText] = useState('');
  const [newKeyText, setNewKeyText] = useState('');
  const [newValueText, setNewValueText] = useState('');

  function selectStory(story) {
    setActiveStory(story);
    if (story.dsType === 'list') {
      setListItems(story.initialItems || []);
    } else if (story.dsType === 'dict') {
      setDictPairs(story.initialPairs || []);
    }
  }

  // Dora Backpack Handlers
  function createBackpack() {
    setBackpack([]);
    setHighlightFirst(false);
  }

  function addMap() {
    setBackpack([...backpack, 'Map']);
  }

  function addKey() {
    setBackpack([...backpack, 'Golden Key']);
  }

  function addBrokenTorch() {
    setBackpack([...backpack, 'Broken Torch']);
  }

  function addCustomItem() {
    if (!customItem.trim()) return;
    setBackpack([...backpack, customItem.trim()]);
    setCustomItem('');
  }

  function removeBrokenTorch() {
    setBackpack(backpack.filter((item) => item !== 'Broken Torch'));
  }

  function removeSpecificItem(idx) {
    setBackpack(backpack.filter((_, i) => i !== idx));
  }

  function checkFirstItem() {
    setHighlightFirst(true);
    setTimeout(() => setHighlightFirst(false), 3000);
  }

  return (
    <div className="story-page-wrapper">
      <header className="story-nav">
        <button type="button" className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Main Dashboard</span>
        </button>
        <div className="story-nav-title">
          <BookOpen size={24} color="#ffd166" />
          <h2>Story Quest: Dora's Backpack & Python Lists ✨</h2>
        </div>
        <div className="cute-badge">
          <Star size={16} fill="#ffd166" color="#ffd166" />
          <span>Dora's Adventure Page</span>
        </div>
      </header>

      <div className="story-content-grid">
        {/* Story Selector Sidebar */}
        <aside className="story-selector-sidebar">
          <h3>🎒 Story Quest Collection</h3>
          <div className="story-cards-stack">
            {storyList.map((story) => (
              <div
                key={story.id}
                className={activeStory.id === story.id ? 'story-card active' : 'story-card'}
                onClick={() => selectStory(story)}
              >
                <img src={story.image} alt={story.title} className="story-thumbnail" />
                <div className="story-card-info">
                  <span className="story-cat-pill">{story.icon} {story.category}</span>
                  <h4>{story.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Interactive Viewer */}
        <section className="story-interactive-viewer">
          <div className="story-hero-banner">
            <img src={activeStory.image} alt={activeStory.title} className="story-hero-img" />
            <div className="story-banner-overlay">
              <span className="cute-hero-pill">{activeStory.category}</span>
              <h1>{activeStory.title}</h1>
              <p className="moral-quote">💡 <strong>Learning Focus:</strong> {activeStory.moral}</p>
            </div>
          </div>

          {/* DORA'S BACKPACK SPECIAL SIMULATOR */}
          {activeStory.dsType === 'dora' ? (
            <div className="dora-simulator-panel">
              <div className="simulator-header">
                <Package size={24} color="#ffd166" />
                <h3>🎒 Dora's Backpack Interactive Python List Simulator</h3>
              </div>

              {/* Action Buttons Bar */}
              <div className="dora-actions-grid">
                <button type="button" className="dora-btn reset-btn" onClick={createBackpack}>
                  <RotateCcw size={16} /> 1. Create Empty Backpack (backpack = [])
                </button>
                <button type="button" className="dora-btn map-btn" onClick={addMap}>
                  <Map size={16} /> 2. Add Map (.append("Map"))
                </button>
                <button type="button" className="dora-btn key-btn" onClick={addKey}>
                  <Key size={16} /> 3. Add Golden Key (.append("Golden Key"))
                </button>
                <button type="button" className="dora-btn torch-btn" onClick={addBrokenTorch}>
                  <Plus size={16} /> Add Broken Torch
                </button>
                <button type="button" className="dora-btn remove-btn" onClick={removeBrokenTorch}>
                  <Trash2 size={16} /> 4. Remove Broken Torch (.remove("Broken Torch"))
                </button>
                <button type="button" className="dora-btn inspect-btn" onClick={checkFirstItem}>
                  <Sparkles size={16} /> 5. Check First Item (backpack[0])
                </button>
              </div>

              {/* Custom Add Row */}
              <div className="dora-custom-input">
                <input
                  type="text"
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  placeholder="Put any new item into Backpack (e.g. Telescope, Banana)..."
                />
                <button type="button" className="dora-add-custom-btn" onClick={addCustomItem}>
                  <Plus size={16} /> Put in Backpack
                </button>
              </div>

              {/* Cute Visual Backpack Display */}
              <div className="backpack-visual-box">
                <div className="backpack-visual-header">
                  <div className="backpack-icon-title">
                    <span className="big-backpack-emoji">🎒</span>
                    <div>
                      <strong>Dora's Backpack Contents</strong>
                      <span>Python List View</span>
                    </div>
                  </div>
                  <div className="backpack-count-badge">
                    <span className="count-num">{backpack.length}</span>
                    <small>Items (len(backpack))</small>
                  </div>
                </div>

                <div className="backpack-items-flex">
                  {backpack.length === 0 ? (
                    <p className="empty-backpack-msg">Backpack is empty! Click the buttons above to add items.</p>
                  ) : (
                    backpack.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={idx === 0 && highlightFirst ? 'backpack-item-chip highlighted' : 'backpack-item-chip'}
                      >
                        <span className="chip-index">Index [{idx}]</span>
                        <span className="chip-name">{item}</span>
                        <button type="button" className="chip-del" onClick={() => removeSpecificItem(idx)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live Generated Python Code Box */}
              <div className="python-code-box">
                <div className="code-header">
                  <Code2 size={18} color="#06d6a0" />
                  <strong>Live Python Code Execution</strong>
                </div>
                <pre>
{`# 1. Create Dora's Backpack list
backpack = [${backpack.map(i => `"${i}"`).join(', ')}]

# 2. Count total items inside backpack
total_items = len(backpack)  # Returns ${backpack.length}

# 3. Check the first item in backpack
first_item = backpack[0] if backpack else None  # Returns "${backpack[0] || 'None'}"

# 4. Display all items
print("Dora's Backpack:", backpack)`}
                </pre>
              </div>

              {/* Educational Python Concepts Cards */}
              <div className="python-concepts-cards-grid">
                <div className="concept-card">
                  <span className="card-num">1</span>
                  <h4>Create Backpack</h4>
                  <code>backpack = []</code>
                  <p>Creates a brand new empty list to hold items in order.</p>
                </div>
                <div className="concept-card">
                  <span className="card-num">2</span>
                  <h4>Add Items (.append)</h4>
                  <code>backpack.append("Map")</code>
                  <p>Puts a new item at the very end of the list.</p>
                </div>
                <div className="concept-card">
                  <span className="card-num">3</span>
                  <h4>Remove Items (.remove)</h4>
                  <code>backpack.remove("Broken Torch")</code>
                  <p>Finds and removes a specific unwanted item from the list.</p>
                </div>
                <div className="concept-card">
                  <span className="card-num">4</span>
                  <h4>Check First Item ([0])</h4>
                  <code>first = backpack[0]</code>
                  <p>In Python, indexing starts at 0! Index [0] accesses the first item.</p>
                </div>
                <div className="concept-card">
                  <span className="card-num">5</span>
                  <h4>Count Items (len)</h4>
                  <code>count = len(backpack)</code>
                  <p>Counts how many total items are stored inside the backpack.</p>
                </div>
              </div>
            </div>
          ) : (
            /* General List/Dict Simulator for other stories */
            <div className="ds-simulator-panel">
              <div className="simulator-header">
                <Sparkles size={20} color="#ffd166" />
                <h3>Interactive Python {activeStory.dsType === 'list' ? 'List' : 'Dictionary'} Builder</h3>
              </div>

              {activeStory.dsType === 'list' ? (
                <div className="list-simulator">
                  <div className="input-row">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Add new item to list..."
                    />
                    <button type="button" className="add-btn" onClick={() => {
                      if (!newItemText.trim()) return;
                      setListItems([...listItems, newItemText.trim()]);
                      setNewItemText('');
                    }}>
                      <Plus size={16} /> Append
                    </button>
                  </div>
                  <div className="visual-list-container">
                    <strong>my_list = [</strong>
                    <div className="list-items-row">
                      {listItems.map((item, idx) => (
                        <div key={idx} className="list-box-item">
                          <span className="idx-badge">Index [{idx}]</span>
                          <span className="item-val">"{item}"</span>
                        </div>
                      ))}
                    </div>
                    <strong>]</strong>
                  </div>
                </div>
              ) : (
                <div className="dict-simulator">
                  <div className="input-row">
                    <input
                      type="text"
                      value={newKeyText}
                      onChange={(e) => setNewKeyText(e.target.value)}
                      placeholder="Key (e.g. Door)"
                    />
                    <input
                      type="text"
                      value={newValueText}
                      onChange={(e) => setNewValueText(e.target.value)}
                      placeholder="Value (e.g. Password)"
                    />
                    <button type="button" className="add-btn" onClick={() => {
                      if (!newKeyText.trim() || !newValueText.trim()) return;
                      setDictPairs([...dictPairs, { key: newKeyText.trim(), value: newValueText.trim() }]);
                      setNewKeyText('');
                      setNewValueText('');
                    }}>
                      <Plus size={16} /> Add Key-Value
                    </button>
                  </div>
                  <div className="visual-dict-container">
                    <strong>my_dict = &#123;</strong>
                    <div className="dict-pairs-grid">
                      {dictPairs.map((pair, idx) => (
                        <div key={idx} className="dict-card-pair">
                          <div className="key-part">🔑 <strong>"{pair.key}"</strong></div>
                          <div className="arrow-part">➔</div>
                          <div className="val-part">💬 "{pair.value}"</div>
                        </div>
                      ))}
                    </div>
                    <strong>&#125;</strong>
                  </div>
                </div>
              )}
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
