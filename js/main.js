import { validateForm } from '../server/validation.js';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../server/auth.js';
import { renderProductList } from '../server/products.js';
import { products } from "../server/mockDB.js";

// Для auth.html
if (document.querySelector('.auth-container form')) {
  const form = document.querySelector('form');
  const inputs = form.querySelectorAll('input');
  
  if(inputs.length === 2) {
  const loginInput = form.querySelector('input[type="text"]');
  const passwordInput = form.querySelector('input[type="password"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { isValid, loginError, passwordError } = validateForm(loginInput.value, passwordInput.value);
    if (!isValid) {
      alert(`${loginError}`);
      return;
    }
    const result = loginUser(loginInput.value, passwordInput.value);
    if (result.success) {
      alert('Вход успешен!');
      window.location.href = 'index.html';
    } else {
      alert(result.error);
    }
  });
  }
}

// Для index.html
if (document.querySelector('.items')) {
  const container = document.querySelector('.items');
  renderProductList(container);
}

// Для product.html
if (document.querySelector('.product')) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (productId) {
    const product = products.find(p => p.id == productId);
    if (product) {
      document.querySelector('.product img').src = product.image;
      document.querySelector('.details h2').textContent = product.name;
      document.querySelector('.details p').textContent = product.description;
      document.querySelector('.details .price').textContent = `Цена: ${product.price} ₽`;
    }
  }
}


