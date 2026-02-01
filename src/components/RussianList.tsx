type RussianListProps = {
  words: string[];
};

export default function RussianList({ words }: RussianListProps) {
  return (
    <div className="list-container">
      <h3>Russian List</h3>

      <ul>
        {words.length === 0 && (
          <li>No Russian words yet</li>
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
