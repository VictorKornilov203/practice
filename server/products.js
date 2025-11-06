import { products } from "./mockDB.js"

export function loadProducts() {
    return products;
}

export function renderProductCard(product) {
  const shortDesc = product.description.split('.')[0];
    return `
    <div class="item" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${shortDesc}</p>
      <button>Подробнее</button>
    </div>
  `;
}

export function renderProductList(container) {
    const products = loadProducts();
    container.innerHTML = products.map(renderProductCard).join('');
    container.querySelectorAll('.item').forEach(card => {
    card.addEventListener('click', () => {
      const productId = card.dataset.id;
      window.location.href = `product.html?id=${productId}`;
    });
  });
}


