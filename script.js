document.addEventListener('DOMContentLoaded', () => {
  // Elementos da UI
  const tabs = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');
  const settingsBtn = document.getElementById('settingsBtn');
  const configModal = document.getElementById('configModal');
  const aboutModal = document.getElementById('aboutModal');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const colorOptions = document.querySelectorAll('.color-option');
  const toggleThemeBtn = document.getElementById('toggleThemeBtn');
  const shareBtn = document.getElementById('shareBtn');
  const aboutBtn = document.getElementById('aboutBtn');
  const newItemInput = document.getElementById('newItem');
  const addItemBtn = document.getElementById('addItemBtn');
  const itemList = document.getElementById('itemList');
  const saveListBtn = document.getElementById('saveListBtn');
  const viewHistoryBtn = document.getElementById('viewHistoryBtn');
  const historyList = document.getElementById('historyList');
  const historySection = document.getElementById('historySection');
  const totalPriceElement = document.getElementById('totalPrice');
  const totalSection = document.getElementById('totalSection');
  const messageDiv = document.getElementById('message');
  const downloadListBtn = document.getElementById('downloadListBtn');
  const graficoCanvas = document.getElementById('graficoCanvas');
  const downloadGraphBtn = document.getElementById('downloadGraphBtn');
  const graficoMensalBtn = document.getElementById('graficoMensalBtn');
  const graficoSemanalBtn = document.getElementById('graficoSemanalBtn');
  const newListBtn = document.getElementById('newListBtn');

  // Variáveis de estado
  let chart = null;
  let shoppingList = [];

  // Mapeamento de temas
  const themeMap = {
    '#ffffff': {
      '--bg-color': '#ffffff',
      '--text-color': '#000000',
      '--active-tab-bg': '#dddddd',
      '--button-bg': '#f2f2f2'
    },
    '#007bff': {
      '--bg-color': '#007bff',
      '--text-color': '#ffffff',
      '--active-tab-bg': '#0056b3',
      '--button-bg': '#3399ff'
    },
    '#28a745': {
      '--bg-color': '#28a745',
      '--text-color': '#ffffff',
      '--active-tab-bg': '#1c7430',
      '--button-bg': '#5fd17b'
    },
    '#fd7e14': {
      '--bg-color': '#fd7e14',
      '--text-color': '#ffffff',
      '--active-tab-bg': '#c85d00',
      '--button-bg': '#ffaa66'
    },
    '#dc3545': {
      '--bg-color': '#dc3545',
      '--text-color': '#ffffff',
      '--active-tab-bg': '#a71d2a',
      '--button-bg': '#f77b85'
    },
    '#6f42c1': {
      '--bg-color': '#6f42c1',
      '--text-color': '#ffffff',
      '--active-tab-bg': '#4a2a99',
      '--button-bg': '#a78ce2'
    }
  };

  // Inicialização
  initTabs();
  initModals();
  initTheme();
  initEventListeners();

  // Funções principais
  function initTabs() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
  }

  function initModals() {
    settingsBtn.addEventListener('click', () => configModal.style.display = 'flex');
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        configModal.style.display = 'none';
        aboutModal.style.display = 'none';
      });
    });
  }

  function initTheme() {
    // Restaurar preferências
    const savedColor = localStorage.getItem('themeColor');
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    if (savedColor) applyTheme(savedColor);
    if (darkMode) document.body.classList.add('dark');

    // Event listeners
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        const color = option.dataset.color;
        applyTheme(color);
        localStorage.setItem('themeColor', color);
      });
    });

    toggleThemeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    });
  }

  function applyTheme(color) {
    const theme = themeMap[color];
    if (!theme) return;
    
    for (const prop in theme) {
      document.documentElement.style.setProperty(prop, theme[prop]);
    }
  }

  function initEventListeners() {
    // Botões principais
    addItemBtn.addEventListener('click', addItem);
    saveListBtn.addEventListener('click', saveList);
    viewHistoryBtn.addEventListener('click', viewHistory);
    newListBtn.addEventListener('click', startNewList);
    downloadListBtn.addEventListener('click', downloadList);
    
    // Gráficos
    graficoMensalBtn.addEventListener('click', gerarGraficoMensal);
    graficoSemanalBtn.addEventListener('click', gerarGraficoSemanal);
    downloadGraphBtn.addEventListener('click', downloadChartImage);
    
    // Configurações
    clearHistoryBtn.addEventListener('click', clearHistory);
    shareBtn.addEventListener('click', () => alert('Compartilhamento disponível na versão online!'));
    aboutBtn.addEventListener('click', () => {
      configModal.style.display = 'none';
      aboutModal.style.display = 'flex';
    });

    // Tecla Enter no input
    newItemInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addItem();
    });
  }

  // Funções de lista
  function addItem() {
    const name = newItemInput.value.trim();
    if (!name) return showMessage('Digite um nome válido.', true);
    
    shoppingList.push({ 
      name: escapeHtml(name), 
      price: 0, 
      quantity: 1, 
      checked: false 
    });
    
    newItemInput.value = '';
    renderList();
    updateTotalPrice();
  }

  function startNewList() {
    if (confirm('Deseja iniciar uma nova lista? Isso apagará a lista atual.')) {
      shoppingList = [];
      renderList();
      updateTotalPrice();
      historySection.style.display = 'none';
    }
  }

  function saveList() {
    if (shoppingList.length === 0) return showMessage('Lista vazia!', true);
    
    const timestamp = new Date().toISOString();
    const allLists = JSON.parse(localStorage.getItem('allLists') || '{}');
    allLists[timestamp] = shoppingList;
    localStorage.setItem('allLists', JSON.stringify(allLists));
    showMessage('Lista salva com sucesso!');
  }

  // Funções de renderização
  function renderList() {
  itemList.innerHTML = '';
  shoppingList.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="item-container">
        <input type="checkbox" ${item.checked ? 'checked' : ''}>
        <span class="item-name">${item.name}</span>
        <div class="price-qty-container">
          <div class="input-group">
            <span class="input-label">Preço (R$)</span>
            <input type="number" class="price-input" placeholder="" value="${item.price || ''}" min="0" step="0.01">
          </div>
          <div class="input-group">
            <span class="input-label">Quantia</span>
            <input type="number" class="quantity-input" placeholder="" value="${item.quantity || 1}" min="1">
          </div>
          <button class="delete-btn">Remover</button>
        </div>
      </div>
    `;

    // Event listeners (mantidos)
    const priceInput = li.querySelector('.price-input');
    const quantityInput = li.querySelector('.quantity-input');
    const deleteBtn = li.querySelector('.delete-btn');

    priceInput.addEventListener('input', () => {
      item.price = parseFloat(priceInput.value) || 0;
      updateTotalPrice();
    });

    quantityInput.addEventListener('input', () => {
      item.quantity = parseInt(quantityInput.value) || 1;
      updateTotalPrice();
    });

    deleteBtn.addEventListener('click', () => {
      shoppingList = shoppingList.filter(i => i !== item);
      renderList();
      updateTotalPrice();
    });

    itemList.appendChild(li);
  });
}
  // Funções utilitárias
  function updateTotalPrice() {
    const total = shoppingList.reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);
    
    totalPriceElement.textContent = total.toFixed(2);
    totalSection.style.display = total > 0 ? 'block' : 'none';
  }

  function showMessage(text, isError = false) {
    messageDiv.textContent = text;
    messageDiv.className = isError ? 'error' : 'success';
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Funções de histórico
  function viewHistory() {
    const allLists = JSON.parse(localStorage.getItem('allLists') || '{}');
    historyList.innerHTML = '';
    
    Object.keys(allLists).sort().reverse().forEach(key => {
      const li = document.createElement('li');
      li.textContent = new Date(key).toLocaleString();
      li.addEventListener('click', () => {
        shoppingList = allLists[key];
        renderList();
        updateTotalPrice();
        historySection.style.display = 'none';
      });
      historyList.appendChild(li);
    });
    
    historySection.style.display = 'block';
  }

  function clearHistory() {
    if (confirm('Tem certeza que deseja excluir todo o histórico?')) {
      const themeColor = localStorage.getItem('themeColor');
      const darkMode = localStorage.getItem('darkMode');
      
      localStorage.clear();
      
      if (themeColor) localStorage.setItem('themeColor', themeColor);
      if (darkMode) localStorage.setItem('darkMode', darkMode);
      
      showMessage('Histórico limpo!');
      historySection.style.display = 'none';
    }
  }

  // Funções de exportação
  function downloadList() {
    if (shoppingList.length === 0) return showMessage('Lista vazia!', true);
    
    let content = 'Lista de Compras:\n\n';
    shoppingList.forEach(item => {
      const status = item.checked ? '[✓]' : '[ ]';
      const total = (item.price || 0) * (item.quantity || 1);
      content += `${status} ${item.name} (x${item.quantity}) - R$ ${total.toFixed(2)}\n`;
    });
    
    const total = shoppingList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    content += `\nTOTAL: R$ ${total.toFixed(2)}`;
    
    downloadFile('lista-compras.txt', content);
  }

  function downloadChartImage() {
    if (!chart) return showMessage('Nenhum gráfico gerado!', true);
    const link = document.createElement('a');
    link.href = chart.toBase64Image();
    link.download = `grafico-${new Date().toISOString().slice(0,10)}.png`;
    link.click();
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Funções de gráficos
  function gerarGraficoMensal() {
    const { labels, values } = processHistoryData('month');
    updateChart('Gastos Mensais', labels, values, '#007bff');
  }

  function gerarGraficoSemanal() {
    const { labels, values } = processHistoryData('week');
    updateChart('Gastos Semanais', labels, values, '#28a745');
  }

  function processHistoryData(period) {
    const allLists = JSON.parse(localStorage.getItem('allLists') || '{}');
    const result = {};
    
    Object.keys(allLists).forEach(timestamp => {
      const date = new Date(timestamp);
      let key;
      
      if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // Lógica para semanas ISO 8601
        const dateCopy = new Date(date);
        dateCopy.setHours(0, 0, 0, 0);
        dateCopy.setDate(dateCopy.getDate() + 3 - (dateCopy.getDay() + 6) % 7);
        const week1 = new Date(dateCopy.getFullYear(), 0, 4);
        key = `${dateCopy.getFullYear()}-W${String(Math.ceil(((dateCopy - week1) / 86400000 + 1) / 7)).padStart(2, '0')}`;
      }
      
      const total = allLists[timestamp].reduce((sum, item) => sum + (item.price * item.quantity), 0);
      result[key] = (result[key] || 0) + total;
    });
    
    const labels = Object.keys(result).sort();
    const values = labels.map(label => result[label]);
    
    return { labels, values };
  }

  function updateChart(title, labels, data, color) {
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.data.datasets[0].backgroundColor = color;
      chart.options.plugins.title.text = title;
      chart.update();
    } else {
      const ctx = graficoCanvas.getContext('2d');
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: title,
            data: data,
            backgroundColor: color
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { 
              display: true, 
              text: title,
              font: { size: 16 }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => 'R$ ' + value.toFixed(2)
              }
            }
          }
        }
      });
    }
  }
});