require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY || 'change_me';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// simple admin key middleware
function checkAdmin(req, res, next) {
  const key = req.header('x-admin-key');
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });
  next();
}

// list files (optionally prefix)
app.get('/admin/list', checkAdmin, async (req, res) => {
  const prefix = req.query.prefix || '';
  const { data, error } = await supabase.storage.from('user-uploads').list(prefix);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ data });
});

// delete file
app.post('/admin/delete', checkAdmin, async (req, res) => {
  const { path } = req.body;
  const { data, error } = await supabase.storage.from('user-uploads').remove([path]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ data });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Admin server listening on', port));
