import { useState } from 'react';

import StoryPanel from '../components/StoryPanel';
import SpanishList from '../components/SpanishList';
import RussianList from '../components/RussianList';
import SelectWords from '../components/SelectWords';
import '../styles/testVocab.css';

type Language = 'Spanish' | 'Russian';
type NLPToken = {
  word: string;
  lemma: string;
  POS: string;
}


export default function TestVocab() {

  function detectChar(word: string): "Latin" | "Cyrillic" {
    const cyrillicRegex = /[\u0400-\u04FF]/;
    if (cyrillicRegex.test(word)) {
      return "Cyrillic";
    }

    return "Latin";
  }

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
  async function handleSubmitStory(storyInput: string) {
    try {
      // ---------- normalize input ----------
      const storyArray = storyInput
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\s]/gu, "")
        .split(/\s+/);

      if (!storyArray.length || !storyArray[0]) {
        alert("Please write something before submitting!");
        return;
      }

      const firstWord = String(storyArray[0] ?? "");
      const currLang = detectChar(firstWord);

      console.log("Detected language:", currLang);

      // ===================================================
      // REAL NLP FETCH
      // ===================================================

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({
          text: storyArray.join(" "),
          language: currLang,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get analysis from NLP server");
      }

      const result: NLPToken[] = await response.json();

      console.log("NLP Result:", result);
      // ===================================================
      // Lemmatization Logic (PORTED EXACTLY)
      // ===================================================

      if (currLang === "Latin") {
        for (let i = 0; i < result.length; i++) {
          let { POS, word, lemma } = result[i];

          if (POS === "ADJ" && typeof word === "string") {
            const lower = word.toLowerCase();

            if (
              lower.endsWith("os") ||
              lower.endsWith("as") ||
              lower.endsWith("es") ||
              lower.endsWith("a")
            ) {
              result[i].word = lemma;
              console.log(`Replaced: "${word}" → "${lemma}"`);
            }
          }

          if (POS === "NOUN" && word !== lemma) {
            result[i].word = lemma;
          }

          if ((POS === "VERB" || POS === "AUX") && word !== lemma) {
            result[i].word = lemma;
          }
        }
      }

      if (currLang === "Cyrillic") {
        for (let i = 0; i < result.length; i++) {
          let { POS, word, lemma } = result[i];

          if (
            (POS === "VERB" || POS === "NOUN") &&
            typeof word === "string" &&
            word !== lemma
          ) {
            result[i].word = lemma;
            console.log(`Replaced: "${word}" → "${lemma}"`);
          }
        }
      }

      // ===================================================
      // Compare Against Selected Words
      // ===================================================

      // assuming SelectWords stores selections in localStorage
      const storedSelected =
        JSON.parse(localStorage.getItem("selectedWords") || "[]");

      const selected = storedSelected
        .map((w: string) => w?.toLowerCase())
        .filter(Boolean);

      const selectedWordCount = selected.length;
      console.log("Selected words for testing:", selected);
      console.log("Selected word count:", selectedWordCount);
      let matchCount = 0;

      for (let i = 0; i < result.length; i++) {
        const wordInResponse = result[i].word?.toLowerCase();

        if (selected.includes(wordInResponse)) {
          matchCount++;
        }
      }

      if (matchCount === selectedWordCount) {
        alert("All selected vocab words!");
      } else {
        alert(
          `You used ${matchCount} out of ${selectedWordCount} selected words. Try again!`
        );
      }
    } catch (err) {
      console.log("NLP request failed:", err);
      alert("There was an error analyzing your story.");
    }
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
