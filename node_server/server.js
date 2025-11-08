import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const dataPath = path.join(__dirname, '..', 'data');

async function readJSON(filename) {
  const data = await fs.readFile(path.join(dataPath, filename), 'utf-8');
  return JSON.parse(data);
}

async function writeJSON(filename, data) {
  await fs.writeFile(path.join(dataPath, filename), JSON.stringify(data, null, 2));
}

app.get('/api/products', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка чтения товаров' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Товар не найден' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка чтения товара' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      ...req.body
    };
    products.push(newProduct);
    await writeJSON('products.json', products);
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания товара' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body, id: products[index].id };
      await writeJSON('products.json', products);
      res.json(products[index]);
    } else {
      res.status(404).json({ error: 'Товар не найден' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления товара' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    const filteredProducts = products.filter(p => p.id !== parseInt(req.params.id));
    await writeJSON('products.json', filteredProducts);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления товара' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await readJSON('users.json');
    res.json(users.map(u => ({ ...u, password: undefined })));
  } catch (error) {
    res.status(500).json({ error: 'Ошибка чтения пользователей' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const user = users.find(u => u.login === req.body.login && u.password === req.body.password);
    if (user) {
      res.json({ success: true, user: { ...user, password: undefined } });
    } else {
      res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const users = await readJSON('users.json');
    if (users.find(u => u.login === req.body.login)) {
      return res.status(400).json({ success: false, error: 'Пользователь с таким логином уже существует' });
    }
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      login: req.body.login,
      password: req.body.password,
      name: req.body.name,
      role: req.body.role || 'user'
    };
    users.push(newUser);
    await writeJSON('users.json', users);
    res.json({ success: true, user: { ...newUser, password: undefined } });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index !== -1) {
      users[index] = { ...users[index], ...req.body, id: users[index].id };
      await writeJSON('users.json', users);
      res.json({ success: true, user: { ...users[index], password: undefined } });
    } else {
      res.status(404).json({ error: 'Пользователь не найден' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления пользователя' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const filteredUsers = users.filter(u => u.id !== parseInt(req.params.id));
    await writeJSON('users.json', filteredUsers);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления пользователя' });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;

    const response = await fetch(
      'https://hfszwgjwistfvqmlpqli.supabase.co/storage/v1/object/askjdlsajd/' + fileName,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc3p3Z2p3aXN0ZnZxbWxwcWxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ2MTU5NywiZXhwIjoyMDc1MDM3NTk3fQ.2Aj-SZj2kr2Zld63ZIyPxMi4EGOPFB9UQc17FyF3OZ4'
        },
        body: req.file.buffer
      }
    );

    if (response.ok) {
      const imageUrl = `https://hfszwgjwistfvqmlpqli.supabase.co/storage/v1/object/public/askjdlsajd/${fileName}`;
      res.json({ url: imageUrl });
    } else {
      res.status(500).json({ error: 'Ошибка загрузки изображения' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки изображения' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

