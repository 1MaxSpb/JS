import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, 'data', 'posts.json');

const readPosts = async () => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

// Обновленная функция writePosts
const writePosts = async (posts) => {
  try {
    // Рекурсивно создаем директорию, если она не существует
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    // Записываем файл
    await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing posts:', error);
    throw error; // Пробрасываем ошибку дальше для обработки
  }
};

export const getPosts = async (req, res) => {
  const posts = await readPosts();
  res.json(posts);
};

export const getPost = async (req, res) => {
  const posts = await readPosts();
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
};

export const getUserPosts = async (req, res) => {
    const posts = await readPosts();
    const userId = parseInt(req.params.userId);
    const userPosts = posts.filter(p => p.userId === userId);
    res.json(userPosts);
};

export const createPost = async (req, res, next) => {
  try {
    const { userId, title, body } = req.body;
    if (!userId || !title || !body) {
      return res.status(400).json({ message: 'Missing required fields: userId, title, body' });
    }

    const posts = await readPosts();
    const newPost = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      userId,
      title,
      body
    };
    posts.push(newPost);
    await writePosts(posts);

    res.status(201).json(newPost);
  } catch (error) {
    next(error); // Передаем ошибку в централизованный обработчик
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const posts = await readPosts();
    const id = parseInt(req.params.id);
    const index = posts.findIndex(p => p.id === id);

    if (index !== -1) {
      posts[index] = { ...posts[index], ...req.body, id };
      await writePosts(posts);
      res.json(posts[index]);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch(error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const posts = await readPosts();
    const id = parseInt(req.params.id);
    const updatedPosts = posts.filter(p => p.id !== id);

    if (posts.length !== updatedPosts.length) {
      await writePosts(updatedPosts);
      res.json({ message: 'Post deleted successfully' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch(error) {
    next(error);
  }
};