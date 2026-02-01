type SpanishListProps = {
  words: string[];
};

export default function SpanishList({ words }: SpanishListProps) {
  return (
    <div className="list-container">
      <h3>Spanish List</h3>

      <ul>
        {words.length === 0 && (
          <li>No Spanish words yet</li>
        )}

        {words.map((word, index) => (
          <li key={`${word}-${index}`}>
            {word}
          </li>
        ))}
      </ul>
    </div>
  );
}
