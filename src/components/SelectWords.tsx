import { useState } from "react";

type Language = "Spanish" | "Russian";

type SelectWordsProps = {
  spanishWords: string[];
  russianWords: string[];
  activeLang: Language;
};

export default function SelectWords({
  spanishWords,
  russianWords,
  activeLang,
}: SelectWordsProps) {
  // independent selections
  const [selectedSpanish, setSelectedSpanish] = useState<Set<string>>(new Set());
  const [selectedRussian, setSelectedRussian] = useState<Set<string>>(new Set());

  const words =
    activeLang === "Spanish" ? spanishWords : russianWords;

  const selected =
    activeLang === "Spanish"
      ? selectedSpanish
      : selectedRussian;

  // toggle highlight + logging
  function toggleWord(word: string) {
    if (activeLang === "Spanish") {
      setSelectedSpanish(prev => {
        const next = new Set(prev);

        if (next.has(word)) {
          next.delete(word);
          console.log(`Unhighlighted Spanish word: ${word}`);
        } else {
          next.add(word);
          console.log(`Highlighted Spanish word: ${word}`);
        }

        console.log("Spanish highlighted count:", next.size);
        return next;
      });
    } else {
      setSelectedRussian(prev => {
        const next = new Set(prev);

        if (next.has(word)) {
          next.delete(word);
          console.log(`Unhighlighted Russian word: ${word}`);
        } else {
          next.add(word);
          console.log(`Highlighted Russian word: ${word}`);
        }

        console.log("Russian highlighted count:", next.size);
        return next;
      });
    }
  }

  return (
    <div className="list-container">
      <h3>{activeLang} List</h3>

      <p>
        Highlighted words: <strong>{selected.size}</strong>
      </p>

      <ul className="selectable-list">
        {words.length === 0 && <li>No words yet</li>}

        {words.map((word, index) => {
          const isSelected = selected.has(word);

          return (
            <li
              key={`${word}-${index}`}
              className={isSelected ? "selected-word" : ""}
              onClick={() => toggleWord(word)}
            >
              {word}
            </li>
          );
        })}
      </ul>
    </div>
  );
}