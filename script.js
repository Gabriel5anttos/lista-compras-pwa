document.addEventListener('DOMContentLoaded', () => {
    const newItemInput = document.getElementById('newItem');
    const addItemBtn = document.getElementById('addItemBtn');
    const itemList = document.getElementById('itemList');
    const saveListBtn = document.getElementById('saveListBtn');
    const addPricesBtn = document.getElementById('addPricesBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    const historyList = document.getElementById('historyList');
    const historySection = document.querySelector('.history');
    const totalSection = document.querySelector('.total');
    const totalPriceElement = document.getElementById('totalPrice');
    const messageDiv = document.getElementById('message');

    // Criar botão Nova Lista
    const novaListaBtn = document.createElement('button');
    novaListaBtn.textContent = 'Nova Lista';
    novaListaBtn.id = 'novaListaBtn';
    document.querySelector('.actions').appendChild(novaListaBtn);

    let shoppingList = [];
    let totalPrice = 0;

    function showMessage(text, isError = false) {
        messageDiv.textContent = text;
        messageDiv.className = isError ? 'error' : '';
        messageDiv.style.display = 'block';
        setTimeout(() => messageDiv.style.display = 'none', 3000);
    }

    function updateTotalPrice() {
        totalPrice = shoppingList.reduce((sum, item) => sum + (item.price || 0), 0);
        totalPriceElement.textContent = totalPrice.toFixed(2);
        totalSection.style.display = totalPrice > 0 ? 'block' : 'none';
    }

    function renderList() {
        itemList.innerHTML = '';
        shoppingList.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${item.checked ? 'checked' : ''}>
                <span class="item-name">${item.name}</span>
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Remover</button>
            `;
            itemList.appendChild(li);

            li.querySelector('.delete-btn').addEventListener('click', () => {
                shoppingList = shoppingList.filter(i => i.name !== item.name);
                renderList();
                updateTotalPrice();
            });

            li.querySelector('.edit-btn').addEventListener('click', () => {
                const nameSpan = li.querySelector('.item-name');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = nameSpan.textContent;
                li.insertBefore(input, nameSpan);
                li.removeChild(nameSpan);

                input.addEventListener('blur', () => {
                    const newName = input.value.trim();
                    if (newName) {
                        item.name = newName;
                        nameSpan.textContent = newName;
                    }
                    li.insertBefore(nameSpan, input);
                    li.removeChild(input);
                });
            });

            li.querySelector('input[type="checkbox"]').addEventListener('change', e => {
                item.checked = e.target.checked;
            });
        });
    }

    function addItem() {
        const name = newItemInput.value.trim();
        if (!name) return showMessage('Digite um nome válido.', true);
        shoppingList.push({ name, price: 0, checked: false });
        newItemInput.value = '';
        renderList();
    }

    function saveList() {
        if (!shoppingList.length) return showMessage('Adicione itens antes de salvar.', true);
        const timestamp = new Date().toISOString();
        const allLists = JSON.parse(localStorage.getItem('allLists') || '{}');
        allLists[timestamp] = shoppingList;
        localStorage.setItem('allLists', JSON.stringify(allLists));
        addPricesBtn.style.display = 'inline-block';
        showMessage('Lista salva com sucesso!');
    }

    function addPrices() {
        itemList.innerHTML = '';
        shoppingList.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${item.checked ? 'checked' : ''}>
                <span>${item.name}</span>
                <div class="add-price">
                    <input type="number" placeholder="Preço (R$)" value="${item.price}" min="0">
                    <button class="price-btn">Salvar Preço</button>
                </div>
                <button class="delete-btn">Remover</button>
            `;
            itemList.appendChild(li);

            li.querySelector('.price-btn').addEventListener('click', () => {
                const input = li.querySelector('input[type="number"]');
                const preco = parseFloat(input.value);
                if (!isNaN(preco) && preco >= 0) {
                    item.price = preco;
                    updateTotalPrice();
                    showMessage(`Preço atualizado: R$${preco.toFixed(2)}`);
                }
            });

            li.querySelector('.delete-btn').addEventListener('click', () => {
                shoppingList = shoppingList.filter(i => i.name !== item.name);
                addPrices();
                updateTotalPrice();
            });

            li.querySelector('input[type="checkbox"]').addEventListener('change', e => {
                item.checked = e.target.checked;
            });
        });
        totalSection.style.display = 'block';
    }

    function viewHistory() {
        historySection.style.display = 'block';
        historyList.innerHTML = '';
        const allLists = JSON.parse(localStorage.getItem('allLists') || '{}');
        Object.keys(allLists).forEach(key => {
            const li = document.createElement('li');
            li.textContent = new Date(key).toLocaleString();
            li.onclick = () => {
                shoppingList = allLists[key];
                renderList();
                updateTotalPrice();
            };
            historyList.appendChild(li);
        });
    }

    function novaLista() {
        if (confirm('Deseja iniciar uma nova lista?')) {
            shoppingList = [];
            renderList();
            updateTotalPrice();
            totalSection.style.display = 'none';
            showMessage('Nova lista iniciada.');
        }
    }

    addItemBtn.addEventListener('click', addItem);
    saveListBtn.addEventListener('click', saveList);
    addPricesBtn.addEventListener('click', addPrices);
    viewHistoryBtn.addEventListener('click', viewHistory);
    novaListaBtn.addEventListener('click', novaLista);

    // Carrega última lista usada (opcional)
    const lastLists = JSON.parse(localStorage.getItem('allLists') || '{}');
    const keys = Object.keys(lastLists);
    if (keys.length) {
        shoppingList = lastLists[keys[keys.length - 1]];
        renderList();
        updateTotalPrice();
    }
});
