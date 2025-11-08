const API_URL = 'http://localhost:3000/api';

if (document.getElementById('login-form')) {
  const loginContainer = document.getElementById('login-form-container');
  const registerContainer = document.getElementById('register-form-container');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');

  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginContainer.style.display = 'none';
      registerContainer.style.display = 'block';
    });
  }

  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      registerContainer.style.display = 'none';
      loginContainer.style.display = 'block';
    });
  }

  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    
    if (loginInput.value.length < 3) {
      alert('Логин должен быть не менее 3 символов');
      return;
    }
    if (passwordInput.value.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: loginInput.value,
          password: passwordInput.value
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        alert('Вход успешен!');
        window.location.href = 'index.html';
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Ошибка подключения к серверу');
    }
  });

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('register-name');
      const loginInput = document.getElementById('register-username');
      const passwordInput = document.getElementById('register-password');
      
      if (nameInput.value.length < 2) {
        alert('Имя должно быть не менее 2 символов');
        return;
      }
      if (loginInput.value.length < 3) {
        alert('Логин должен быть не менее 3 символов');
        return;
      }
      if (passwordInput.value.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput.value,
            login: loginInput.value,
            password: passwordInput.value,
            role: 'user'
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('Регистрация успешна! Теперь вы можете войти.');
          registerContainer.style.display = 'none';
          loginContainer.style.display = 'block';
          registerForm.reset();
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert('Ошибка подключения к серверу');
      }
    });
  }
}

if (document.querySelector('.items')) {
  const container = document.querySelector('.items');
  
  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL}/products`);
      const products = await response.json();
      
      container.innerHTML = products.map(product => `
        <div class="item">
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <span class="price">${product.price} ₽</span>
          <a href="product.html?id=${product.id}" class="btn">Подробнее</a>
        </div>
      `).join('');
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      container.innerHTML = '<p>Ошибка загрузки товаров</p>';
    }
  }
  
  loadProducts();
}

if (document.querySelector('.product')) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (productId) {
    async function loadProduct() {
      try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const product = await response.json();
        
        if (product && !product.error) {
          document.querySelector('.product img').src = product.image;
          document.querySelector('.details h2').textContent = product.name;
          document.querySelector('.details p').textContent = product.description;
          document.querySelector('.details .price').textContent = `Цена: ${product.price} ₽`;
        }
      } catch (error) {
        console.error('Ошибка загрузки товара:', error);
      }
    }
    
    loadProduct();
  }
}
