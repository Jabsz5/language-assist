import { useState } from 'react';

import StoryPanel from '../components/StoryPanel';
import SpanishList from '../components/SpanishList';
import RussianList from '../components/RussianList';

import '../styles/testVocab.css';

type Language = 'Spanish' | 'Russian';

export default function TestVocab() {
  const [activeLang, setActiveLang] = useState<Language>('Spanish');

  // TEMP DATA for now (later: pull from global state / backend)
  const [spanishWords] = useState<string[]>([]);
  const [russianWords] = useState<string[]>([]);

  function handleSubmitStory(story: string) {
    console.log('Story submitted:', story);
    // Later: send to AI / store in DB / generate feedback
  }

  return (
    <div className="testvocab-page">
      {/* Left side */}
      <StoryPanel onSubmit={handleSubmitStory} />

      {/* Right side */}
      <div className="sidebar">
        <h2>Your Vocabulary</h2>

        <div className="toggle-buttons">
          <button type="button" onClick={() => setActiveLang('Spanish')}>
            Spanish
          </button>
          <button type="button" onClick={() => setActiveLang('Russian')}>
            Russian
          </button>
        </div>

        <div className="vocab-list">
          {activeLang === 'Spanish' ? (
            <SpanishList words={spanishWords} />
          ) : (
            <RussianList words={russianWords} />
          )}
        </div>
      </div>
    </div>
  );
}
