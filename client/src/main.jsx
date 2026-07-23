import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  Brain,
  ChartNoAxesCombined,
  CheckCircle2,
  Code2,
  Compass,
  Key,
  Layers,
  Lightbulb,
  MessageSquareText,
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
  ArrowLeft
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

  // Render Cute Interactive Story Quest Page if activated
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

        {/* Cute Navigation Button to Open Story Quest Page */}
        <button 
          type="button" 
          className="story-quest-trigger-btn"
          onClick={() => setViewMode('storyQuest')}
        >
          <Sparkles size={18} />
          <span>Interactive Story Quest</span>
          <small className="badge-new">NEW PAGE ✨</small>
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
 * 🌟 Brand New Interactive Cute Story Quest Page Component
 */
function StoryQuestPage({ onBack, scenarios }) {
  const storyList = [
    {
      id: 'alibaba_treasure',
      title: 'Ali Baba & 40 Thieves: Secret Cave List',
      category: 'Python List (Arrays)',
      icon: '🗝️',
      image: '/images/ali_baba.jpg',
      moral: 'Order matters! Just like storing treasures sequentially inside a cave, a Python List keeps items in exact order.',
      dsType: 'list',
      initialItems: ['Gold Coins', 'Ruby Necklace', 'Diamond Crown'],
      newItemPlaceholder: 'e.g. Silver Lamp'
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
      initialItems: ['Red Pebble', 'Blue Pebble', 'Shiny Pebble'],
      newItemPlaceholder: 'e.g. Smooth Pebble'
    },
    {
      id: 'tortoise_hare',
      title: 'Panchatantra: Tortoise & Hare Checkpoints',
      category: 'Python List (Indexing)',
      icon: '🐢',
      image: '/images/tortoise_hare.jpg',
      moral: 'Index 0 to Finish! Access any checkpoint instantly using Python list indexing [0] or [-1].',
      dsType: 'list',
      initialItems: ['Start Line', 'Big Banyan Tree', 'River Bridge', 'Finish Line'],
      newItemPlaceholder: 'e.g. Mango Grove'
    },
    {
      id: 'tenali_rama',
      title: 'Tenali Rama: Royal Vault Map',
      category: 'Python Dictionary (Key-Value)',
      icon: '🧠',
      image: '/images/tenali_rama.jpg',
      moral: 'No endless searching! Tenali Rama looks up item counts directly by Room Name in a Dictionary.',
      dsType: 'dict',
      initialPairs: [
        { key: 'Treasury Room', value: '500 Gold Vessels' },
        { key: 'Jewel Tower', value: '120 Emerald Rings' }
      ]
    }
  ];

  const [activeStory, setActiveStory] = useState(storyList[0]);
  const [listItems, setListItems] = useState(activeStory.initialItems || []);
  const [dictPairs, setDictPairs] = useState(activeStory.initialPairs || []);
  const [newItemText, setNewItemText] = useState('');
  const [newKeyText, setNewKeyText] = useState('');
  const [newValueText, setNewValueText] = useState('');

  // Switch story selection
  function selectStory(story) {
    setActiveStory(story);
    if (story.dsType === 'list') {
      setListItems(story.initialItems || []);
    } else {
      setDictPairs(story.initialPairs || []);
    }
  }

  // Interactive List operations
  function addListItem() {
    if (!newItemText.trim()) return;
    setListItems([...listItems, newItemText.trim()]);
    setNewItemText('');
  }

  function removeListItem(index) {
    setListItems(listItems.filter((_, i) => i !== index));
  }

  // Interactive Dict operations
  function addDictPair() {
    if (!newKeyText.trim() || !newValueText.trim()) return;
    setDictPairs([...dictPairs, { key: newKeyText.trim(), value: newValueText.trim() }]);
    setNewKeyText('');
    setNewValueText('');
  }

  function removeDictPair(index) {
    setDictPairs(dictPairs.filter((_, i) => i !== index));
  }

  return (
    <div className="story-page-wrapper">
      {/* Top Cute Navbar */}
      <header className="story-nav">
        <button type="button" className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Main Dashboard</span>
        </button>
        <div className="story-nav-title">
          <BookOpen size={24} color="#ffd166" />
          <h2>Folk Story Quest Mode ✨</h2>
        </div>
        <div className="cute-badge">
          <Star size={16} fill="#ffd166" color="#ffd166" />
          <span>Interactive Story Reader</span>
        </div>
      </header>

      {/* Main Story Interactive Container */}
      <div className="story-content-grid">
        {/* Left Side: Cute Story Carousel & Selector */}
        <aside className="story-selector-sidebar">
          <h3>📖 Select a Story Legend</h3>
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

        {/* Right Side: Interactive Story Reader & Live Code Playground */}
        <section className="story-interactive-viewer">
          <div className="story-hero-banner">
            <img src={activeStory.image} alt={activeStory.title} className="story-hero-img" />
            <div className="story-banner-overlay">
              <span className="cute-hero-pill">{activeStory.category}</span>
              <h1>{activeStory.title}</h1>
              <p className="moral-quote">💡 <strong>Story Moral:</strong> {activeStory.moral}</p>
            </div>
          </div>

          {/* Interactive Visual Data Structure Simulator */}
          <div className="ds-simulator-panel">
            <div className="simulator-header">
              <Sparkles size={20} color="#ffd166" />
              <h3>Interactive Python {activeStory.dsType === 'list' ? 'List' : 'Dictionary'} Builder</h3>
            </div>

            {activeStory.dsType === 'list' ? (
              <div className="list-simulator">
                <p>Click below to dynamically <code>.append()</code> items into your Python List!</p>
                <div className="input-row">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder={activeStory.newItemPlaceholder || 'Add new item'}
                  />
                  <button type="button" className="add-btn" onClick={addListItem}>
                    <Plus size={16} /> Append to List
                  </button>
                </div>

                <div className="visual-list-container">
                  <strong>my_story_list = [</strong>
                  <div className="list-items-row">
                    {listItems.map((item, idx) => (
                      <div key={idx} className="list-box-item">
                        <span className="idx-badge">Index [{idx}]</span>
                        <span className="item-val">"{item}"</span>
                        <button type="button" className="remove-item-btn" onClick={() => removeListItem(idx)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <strong>]</strong>
                </div>

                <div className="python-code-box">
                  <Code2 size={18} color="#06d6a0" />
                  <pre>
{`# Generated Python Code for this Story
my_story_list = [${listItems.map(i => `"${i}"`).join(', ')}]

print("Total elements in list:", len(my_story_list))
print("First item:", my_story_list[0])`}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="dict-simulator">
                <p>Click below to map <code>Key ➔ Value</code> pairs in your Python Dictionary!</p>
                <div className="input-row">
                  <input
                    type="text"
                    value={newKeyText}
                    onChange={(e) => setNewKeyText(e.target.value)}
                    placeholder="Key (e.g. Room / Door)"
                  />
                  <input
                    type="text"
                    value={newValueText}
                    onChange={(e) => setNewValueText(e.target.value)}
                    placeholder="Value (e.g. Password / Count)"
                  />
                  <button type="button" className="add-btn" onClick={addDictPair}>
                    <Plus size={16} /> Add Key-Value
                  </button>
                </div>

                <div className="visual-dict-container">
                  <strong>my_story_dict = &#123;</strong>
                  <div className="dict-pairs-grid">
                    {dictPairs.map((pair, idx) => (
                      <div key={idx} className="dict-card-pair">
                        <div className="key-part">🔑 <strong>"{pair.key}"</strong></div>
                        <div className="arrow-part">➔</div>
                        <div className="val-part">💬 "{pair.value}"</div>
                        <button type="button" className="remove-item-btn" onClick={() => removeDictPair(idx)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <strong>&#125;</strong>
                </div>

                <div className="python-code-box">
                  <Code2 size={18} color="#06d6a0" />
                  <pre>
{`# Generated Python Code for this Story
my_story_dict = {
${dictPairs.map(p => `    "${p.key}": "${p.value}"`).join(',\n')}
}

# Fast Key Lookup example
first_key = "${dictPairs[0]?.key || 'Cave Door'}"
print("Lookup Value:", my_story_dict[first_key])`}
                  </pre>
                </div>
              </div>
            )}
          </div>
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
