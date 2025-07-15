import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPosts, getPost, createPost, updatePost, deletePost, getUserPosts } from './postsController.js';

const app = express();
const PORT = 3000;

// Для ES-модулей определяем __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Раздача статики для main.js и styles.css
app.use(express.static(__dirname));

app.get('/posts', getPosts);
app.get('/posts/:id', getPost);
app.get('/users/:userId/posts', getUserPosts);
app.post('/posts', createPost);
app.put('/posts/:id', updatePost);
app.delete('/posts/:id', deletePost);

// Отдача index.html по корню
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});