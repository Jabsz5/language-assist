import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type StoryPanelProps = {
  onSubmit: (story: string) => void;
};

export default function StoryPanel({ onSubmit }: StoryPanelProps) {
  const navigate = useNavigate();
  const [story, setStory] = useState('');

  return (
    <div className="content">
      <h1>Test Your Vocabulary</h1>
      <p>Write a short story using the vocabulary words you've learned.</p>

      <textarea
        id="storyInput"
        placeholder="Start writing here..."
        value={story}
        onChange={(e) => setStory(e.currentTarget.value)}
      />

      <div className="button-group">
        <button type="button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <button
          type="button"
          id="submitStory"
          onClick={() => onSubmit(story)}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
