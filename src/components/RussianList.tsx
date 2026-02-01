type RussianListProps = {
  words: string[];
};

export default function RussianList({ words }: RussianListProps) {
  return (
    <div className="list-container">
      <h3>Russian List</h3>

      <ul>
        {words.length === 0 && <li>No Russian words yet</li>}

        {words.map((word, index) => {
          const href = `https://en.openrussian.org/ru/${encodeURIComponent(word)}`;
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
