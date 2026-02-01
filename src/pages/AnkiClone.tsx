import { useMemo, useState } from 'react';
import '../styles/ankiClone.css';

import AnkiActions from '../components/AnkiActions';
import SpanishList from '../components/SpanishList';
import RussianList from '../components/RussianList';

export default function AnkiClone() {
  const [textbox, setTextbox] = useState('');
  const [spanishWords, setSpanishWords] = useState<string[]>([]);
  const [russianWords, setRussianWords] = useState<string[]>([]);

  const trimmed = useMemo(() => textbox.trim(), [textbox]);

  // For now: very simple rule like your old app
  // - if it contains Cyrillic -> Russian
  // - else -> Spanish
  function detectLanguage(word: string): 'spanish' | 'russian' {
    const hasCyrillic = /[А-Яа-яЁё]/.test(word);
    return hasCyrillic ? 'russian' : 'spanish';
  }

  function handleAdd() {
    if (!trimmed) return;

    const lang = detectLanguage(trimmed);

    if (lang === 'spanish') {
      setSpanishWords((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    } else {
      setRussianWords((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    }

    setTextbox('');
  }

  function handleRemove() {
    if (!trimmed) return;

    const lang = detectLanguage(trimmed);

    if (lang === 'spanish') {
      setSpanishWords((prev) => prev.filter((w) => w !== trimmed));
    } else {
      setRussianWords((prev) => prev.filter((w) => w !== trimmed));
    }

    setTextbox('');
  }

  function handleExport() {
    // We’ll hook XLSX later after you send the CSS + you confirm desired format
    console.log('Export:', { spanishWords, russianWords });
  }

  function handleRecommend() {
    console.log('Recommend based on words:', { spanishWords, russianWords });
  }

  return (
    <div className="anki-page">    
    <main>
      <header>
        <h1 id="Welcome"></h1>
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
        />

        {/* Pass handlers into actions */}
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
