import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AnkiClone from './pages/AnkiClone';
import CreateAccount from './pages/CreateAccount';
import TestVocab from './pages/TestVocab';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="signup" element={<CreateAccount />} />
        <Route path="/anki" element={<AnkiClone />} />
        <Route path="/test" element={<TestVocab />} />
      </Routes>
    </BrowserRouter>
  );
}
