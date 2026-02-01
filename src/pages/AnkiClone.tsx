import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import '../styles/ankiClone.css';
import AnkiActions from '../components/AnkiActions';
import SpanishList from '../components/SpanishList';
import RussianList from '../components/RussianList';

type LoginState = {
  username: string;
  userId: number;
  vocabulary: {
    spanish: string[];
    russian: string[];
  };
};

type Language = 'Latin' | 'Cyrillic';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export default function AnkiClone() {
  const location = useLocation();
  const navigate = useNavigate();

  const session = (location.state ?? null) as LoginState | null;

  const [textbox, setTextbox] = useState('');
  const [spanishWords, setSpanishWords] = useState<string[]>(session?.vocabulary.spanish ?? []);
  const [russianWords, setRussianWords] = useState<string[]>(session?.vocabulary.russian ?? []);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const trimmed = useMemo(() => textbox.trim(), [textbox]);

  // If user refreshes /anki, location.state is lost → kick back to login for now
  useEffect(() => {
    if (!session?.userId) {
      navigate('/login');
    }
  }, [session?.userId, navigate]);

  function detectLanguage(word: string): Language {
    // mimic your old detectChar logic:
    // if ANY Cyrillic char -> Cyrillic, else -> Latin
    return /[А-Яа-яЁё]/.test(word) ? 'Cyrillic' : 'Latin';
  }

  async function fetchVocabulary(userId: number) {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/get-vocabulary?userId=${encodeURIComponent(String(userId))}`);
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Failed to load vocabulary (${res.status})`);
      }

      // Successful fetch + expect rows with nullable spanish_word and russian_word columns
      const rows = (await res.json()) as Array<{
        spanish_word: string | null;
        russian_word: string | null;
      }>;

      const spanish = rows.filter(r => r.spanish_word).map(r => r.spanish_word as string);
      const russian = rows.filter(r => r.russian_word).map(r => r.russian_word as string);

      setSpanishWords(spanish);
      setRussianWords(russian);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocabulary');
    }
  }

  // On mount, load vocabulary from backend (source of truth)
  useEffect(() => {
    if (session?.userId) {
      fetchVocabulary(session.userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId]);

  async function handleAdd() {
    if (!session?.userId) return;
    if (!trimmed) return;

    const language = detectLanguage(trimmed);

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/store-word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.userId,
          word: trimmed,
          language,
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Failed to add word (${res.status})`);
      }

      // Update UI optimistically (no re-fetch required)
      if (language === 'Latin') {
        setSpanishWords(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
      } else {
        setRussianWords(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
      }

      setTextbox('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add word');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!session?.userId) return;
    if (!trimmed) return;

    const language = detectLanguage(trimmed);

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/remove-word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.userId,
          word: trimmed,
          language,
        }),
      });

      if (!res.ok) {
        // remove endpoint returns JSON error sometimes; handle both
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const j = await res.json().catch(() => null);
          throw new Error(j?.error || `Failed to remove word (${res.status})`);
        }
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Failed to remove word (${res.status})`);
      }

      // Update UI
      if (language === 'Latin') {
        setSpanishWords(prev => prev.filter(w => w !== trimmed));
      } else {
        setRussianWords(prev => prev.filter(w => w !== trimmed));
      }

      setTextbox('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove word');
    } finally {
      setBusy(false);
    }
  }

  function handleExport() {
    // We'll add XLSX later once you want it back
    console.log('Export:', { spanishWords, russianWords });
  }

  function handleRecommend() {
    console.log('Recommend:', { spanishWords, russianWords });
  }

  return (
    <div className="anki-page">
      <main>
        <header>
          <h1 id="Welcome">{session ? `Welcome, ${session.username}` : ''}</h1>
          <h2>Anki-Clone for Spanish and Russian</h2>
        </header>

        <section className="input-section">
          <input
            type="text"
            id="textbox"
            placeholder="Enter a word"
            value={textbox}
            onChange={(e) => setTextbox(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            disabled={busy}
          />

          {error && <p style={{ color: 'crimson' }}>{error}</p>}

          <AnkiActions
            onAdd={handleAdd}
            onRemove={handleRemove}
            onExport={handleExport}
            onRecommend={handleRecommend}
          />
        </section>

        <section className="LanguageList">
          <SpanishList words={spanishWords} />
          <RussianList words={russianWords} />
        </section>
      </main>
    </div>
  );
}
