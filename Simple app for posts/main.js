const api = 'http://localhost:3000';
const postsDiv = document.getElementById('posts');
const messageDiv = document.getElementById('message');

function showMessage(msg, type = 'error') {
  messageDiv.innerHTML = `<div class="${type}">${msg}</div>`;
  setTimeout(() => messageDiv.innerHTML = '', 3000);
}

function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    postsDiv.innerHTML = '<div>Нет постов</div>';
    return;
  }
  postsDiv.innerHTML = posts.map(post => `
    <div class="post">
      <div class="post-title">${post.title}</div>
      <div class="post-body">${post.body}</div>
      <div class="post-meta">ID: ${post.id}, Пользователь: ${post.userId}</div>
    </div>
  `).join('');
}

function renderSinglePost(post) {
  if (!post) {
    postsDiv.innerHTML = '<div>Пост не найден</div>';
    return;
  }
  renderPosts([post]);
}

async function fetchAllPosts() {
  hideCreateForm();
  try {
    const res = await fetch(`${api}/posts`);
    const data = await res.json();
    renderPosts(data);
  } catch (e) {
    showMessage('Ошибка загрузки постов');
  }
}

async function fetchUserPosts() {
  hideCreateForm();
  const userId = document.getElementById('userIdInput').value;
  if (!userId) return showMessage('Введите ID пользователя');
  try {
    const res = await fetch(`${api}/users/${userId}/posts`);
    const data = await res.json();
    renderPosts(data);
  } catch (e) {
    showMessage('Ошибка загрузки постов пользователя');
  }
}

async function fetchPostById() {
  hideCreateForm();
  const postId = document.getElementById('postIdInput').value;
  if (!postId) return showMessage('Введите ID поста');
  try {
    const res = await fetch(`${api}/posts/${postId}`);
    if (res.status === 404) {
      renderSinglePost(null);
      return;
    }
    const data = await res.json();
    renderSinglePost(data);
  } catch (e) {
    showMessage('Ошибка загрузки поста');
  }
}

function showCreateForm() {
  document.getElementById('createForm').style.display = '';
}
function hideCreateForm() {
  document.getElementById('createForm').style.display = 'none';
}

async function createPost() {
  const userId = document.getElementById('newUserId').value;
  const title = document.getElementById('newTitle').value;
  const body = document.getElementById('newBody').value;
  if (!userId || !title || !body) return showMessage('Заполните все поля');
  try {
    const res = await fetch(`${api}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(userId), title, body })
    });
    if (res.status === 201) {
      showMessage('Пост создан!', 'success');
      hideCreateForm();
      fetchAllPosts();
    } else {
      const err = await res.json();
      showMessage(err.message || 'Ошибка создания поста');
    }
  } catch (e) {
    showMessage('Ошибка создания поста');
  }
}

function showUserSearchForm() {
  document.getElementById('userSearchForm').style.display = '';
  document.getElementById('findByIdForm').style.display = 'none';
  document.getElementById('createForm').style.display = 'none';
}
function hideUserSearchForm() {
  document.getElementById('userSearchForm').style.display = 'none';
}
function showPostIdSearchForm() {
  document.getElementById('findByIdForm').style.display = '';
  document.getElementById('userSearchForm').style.display = 'none';
  document.getElementById('createForm').style.display = 'none';
}
function hidePostIdSearchForm() {
  document.getElementById('findByIdForm').style.display = 'none';
}

// По умолчанию показываем все посты
fetchAllPosts(); 