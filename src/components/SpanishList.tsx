type SpanishListProps = {
  words: string[];
};

export default function SpanishList({ words }: SpanishListProps) {
  return (
    <div className="list-container">
      <h3>Spanish List</h3>

      <ul>
        {words.length === 0 && <li>No Spanish words yet</li>}

        {words.map((word, index) => {
          const href = `https://www.spanishdict.com/translate/${encodeURIComponent(word)}`;
          return (
            <li key={`${word}-${index}`}>
              <a href={href} target="_blank" rel="noreferrer">
                {word}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
