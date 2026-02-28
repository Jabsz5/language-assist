import { useState } from 'react';

import StoryPanel from '../components/StoryPanel';
import SpanishList from '../components/SpanishList';
import RussianList from '../components/RussianList';
import SelectWords from '../components/SelectWords';
import '../styles/testVocab.css';

type Language = 'Spanish' | 'Russian';

export default function TestVocab() {
  const [activeLang, setActiveLang] = useState<Language>('Spanish');
  
  // grab from localStorage for display. 
  const storedSpanish = localStorage.getItem('spanishWords');
  const storedRussian = localStorage.getItem('russianWords');
  console.log("Stored Spanish Words:", storedSpanish);
  console.log("Stored Russian Words:", storedRussian);
  
  // convert JSON string back into array for display
  // typescript requires us to check if storedSpanish and storedRussian are not null before parsing, otherwise it will throw an error. If they are null, we can default to an empty array.
  // localStorage defined as string | null, so we need to handle the null case. If it's null, we can just use an empty array as a fallback.
  const parsedSpanish = storedSpanish ? JSON.parse(storedSpanish) : [];
  const parsedRussian = storedRussian ? JSON.parse(storedRussian) : [];
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
          <SelectWords
            spanishWords={parsedSpanish}
            russianWords={parsedRussian}
            activeLang={activeLang}
          />
        </div>
      </div>
    </div>
  );
}
