const API_URL = 'http://localhost:3000/api';

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

const user = getCurrentUser();
if (!user || user.role !== 'admin') {
  alert('Доступ запрещен');
  window.location.href = 'auth.html';
  throw new Error('Unauthorized');
}

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');
const closeBtn = document.querySelector('.close');

const userModal = document.getElementById('user-modal');
const userModalTitle = document.getElementById('user-modal-title');
const userForm = document.getElementById('user-form');
const closeUserBtn = document.querySelector('.close-user');

closeBtn.onclick = () => modal.style.display = 'none';
closeUserBtn.onclick = () => userModal.style.display = 'none';

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = 'none';
  if (e.target === userModal) userModal.style.display = 'none';
};

async function loadProducts() {
  const response = await fetch(`${API_URL}/products`);
  const products = await response.json();
  const container = document.getElementById('products-list');
  
  container.innerHTML = products.map(product => `
    <div class="admin-item">
      <img src="${product.image}" alt="${product.name}">
      <div class="admin-item-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="price">${product.price} ₽</span>
      </div>
      <div class="admin-item-actions">
        <button class="edit-btn" data-id="${product.id}">Редактировать</button>
        <button class="delete-btn" data-id="${product.id}">Удалить</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editProduct(btn.dataset.id));
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
  });
}

async function loadUsers() {
  const response = await fetch(`${API_URL}/users`);
  const users = await response.json();
  const container = document.getElementById('users-list');
  
  container.innerHTML = users.map(u => `
    <div class="admin-item">
      <div class="admin-item-info">
        <h3>${u.name}</h3>
        <p>Логин: ${u.login}</p>
        <p>Роль: ${u.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
      </div>
      <div class="admin-item-actions">
        <button class="edit-btn" data-id="${u.id}">Редактировать</button>
        <button class="delete-btn" data-id="${u.id}">Удалить</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editUser(btn.dataset.id));
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteUser(btn.dataset.id));
  });
}

document.getElementById('add-product-btn').addEventListener('click', () => {
  modalTitle.textContent = 'Добавить товар';
  productForm.reset();
  document.getElementById('product-id').value = '';
  modal.style.display = 'block';
});

document.getElementById('add-user-btn').addEventListener('click', () => {
  userModalTitle.textContent = 'Добавить пользователя';
  userForm.reset();
  document.getElementById('user-id').value = '';
  document.getElementById('user-password').required = true;
  userModal.style.display = 'block';
});

async function editProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`);
  const product = await response.json();
  
  modalTitle.textContent = 'Редактировать товар';
  document.getElementById('product-id').value = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-description').value = product.description;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-image').value = product.image;
  modal.style.display = 'block';
}

async function deleteProduct(id) {
  if (!confirm('Удалить товар?')) return;
  
  await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
  loadProducts();
}

async function editUser(id) {
  const response = await fetch(`${API_URL}/users`);
  const users = await response.json();
  const user = users.find(u => u.id === parseInt(id));
  
  if (user) {
    userModalTitle.textContent = 'Редактировать пользователя';
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-login').value = user.login;
    document.getElementById('user-password').value = '';
    document.getElementById('user-password').required = false;
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-role').value = user.role;
    userModal.style.display = 'block';
  }
}

async function deleteUser(id) {
  if (!confirm('Удалить пользователя?')) return;
  
  await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
  loadUsers();
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value;
  const description = document.getElementById('product-description').value;
  const price = parseFloat(document.getElementById('product-price').value);
  let image = document.getElementById('product-image').value;
  const imageFile = document.getElementById('product-image-file').files[0];

  if (imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const uploadResponse = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (uploadResponse.ok) {
      const data = await uploadResponse.json();
      image = data.url;
    }
  }

  const productData = { name, description, price, image };
  
  if (id) {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
  } else {
    await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
  }
  
  modal.style.display = 'none';
  loadProducts();
});

userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('user-id').value;
  const login = document.getElementById('user-login').value;
  const password = document.getElementById('user-password').value;
  const name = document.getElementById('user-name').value;
  const role = document.getElementById('user-role').value;

  let response;
  let result;

  if (id) {
    const userData = { login, name, role };
    if (password) {
      userData.password = password;
    }
    
    response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    result = await response.json();
  } else {
    const userData = { login, password, name, role };
    
    response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    result = await response.json();
  }
  
  if (result.success) {
    userModal.style.display = 'none';
    loadUsers();
  } else {
    alert(result.error || 'Ошибка сохранения пользователя');
  }
});

loadProducts();
loadUsers();
