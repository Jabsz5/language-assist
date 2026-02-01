import { useNavigate } from 'react-router-dom';
type AnkiActionsProps = {
    onAdd: () => void;
    onRemove: () => void;
    onExport: () => void;
    onRecommend: () => void;
}

export default function AnkiActions({ onAdd, onRemove, onExport, onRecommend }: AnkiActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="button-group">
      <button onClick={onAdd}>Add to List</button>
      <button onClick={onRemove}>Remove from list</button>
      <button onClick={onExport}>Export</button>

      <button onClick={() => navigate('/test')}>Test Yourself!</button>
      <button onClick={() => navigate('/ai')}>New AI feature!</button>

      <button onClick={onRecommend}>Recommend</button>
    </div>
  );
}
