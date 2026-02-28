import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Supabase client (SERVICE ROLE) ----
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Health check ----
app.get('/', (req, res) => {
  res.json({ status: 'anki_clone backend running' });
});

// ---- SIGNUP ----
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('Users')
      .insert([{ username, password_hash: passwordHash }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(400).send('Username already exists');
      }
      console.error(error);
      return res.status(500).send('Internal server error');
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// ---- LOGIN ----
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    const { data: user, error: userErr } = await supabase
      .from('Users')
      .select('user_id, username, password_hash')
      .eq('username', username)
      .maybeSingle();

    if (userErr || !user) {
      return res.status(401).send('Invalid username or password');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).send('Invalid username or password');
    }

    const { data: vocab } = await supabase
      .from('Vocabulary')
      .select('spanish_word, russian_word')
      .eq('user_id', user.user_id);

    const spanish = (vocab ?? [])
      .filter(v => v.spanish_word)
      .map(v => v.spanish_word);

    const russian = (vocab ?? [])
      .filter(v => v.russian_word)
      .map(v => v.russian_word);

    res.json({
      username: user.username,
      userId: user.user_id,
      vocabulary: { spanish, russian }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// POST ---- Store a word ----
app.post('/store-word', async (req, res) => {
  try {
    const { userId, word, language } = req.body ?? {};
    console.log('adding word:', { userId, word, language });

    if (!userId || !word || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const w = String(word).trim();
    if (!w) return res.status(400).json({ error: 'Missing required fields' });

    // Map old language values to new column names
    let payload;
    if (language === 'Latin') {
      payload = { user_id: userId, spanish_word: w, russian_word: null };
    } else if (language === 'Cyrillic') {
      payload = { user_id: userId, spanish_word: null, russian_word: w };
    } else {
      return res.status(400).json({ error: 'Invalid language specified' });
    }

    const { error } = await supabase.from('Vocabulary').insert([payload]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to add word to the database' });
    }

    return res.status(200).json({ message: 'Word added successfully' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Failed to add word to the database' });
  }
});

// POST ---- Clear vocabulary word  ----
app.post('/remove-word', async (req, res) => {
  try {
    const { userId, word, language } = req.body ?? {};

    if (!userId || !word || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const w = String(word).trim();
    if (!w) return res.status(400).json({ error: 'Missing required fields' });

    let column;
    if (language === 'Latin') column = 'spanish_word';
    else if (language === 'Cyrillic') column = 'russian_word';
    else return res.status(400).json({ error: 'Invalid language specified' });

    // Delete matching row(s)
    const { data, error } = await supabase
      .from('Vocabulary')
      .delete()
      .eq('user_id', userId)
      .eq(column, w)
      .select('word_id');

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ error: 'Failed to remove word from the database' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Word not found in the database' });
    }

    return res.status(200).json({ message: 'Word removed successfully' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Failed to remove word from the database' });
  }
});

// GET ---- Get vocabulary for a user ----
app.get('/get-vocabulary', async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log('GET /get-vocabulary hit with userId:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const { data, error } = await supabase
      .from('Vocabulary')
      .select('spanish_word, russian_word')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase fetch vocab error:', error);
      return res.status(500).send('Server error');
    }

    return res.status(200).json(data ?? []);
  } catch (err) {
    console.error('Error fetching vocabulary:', err);
    return res.status(500).send('Server error');
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify({ story: storyInput }),
    });

    const data = await response.json();
    res.json(data);
    } catch(err){
      res.status(500).json({ error: "NLP service failed" });
    }
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
