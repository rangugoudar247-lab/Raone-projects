/**
 * Lumina Finance - Core Application Engine
 * Handles State, LocalStorage, Charts, Filters, and UI Interactions
 */

(() => {
  'use strict';

  // --- Category Color and Icon Presets ---
  const CATEGORIES = {
    expense: [
      { name: 'Housing', color: '#818cf8', icon: '🏠' },
      { name: 'Food & Dining', color: '#f59e0b', icon: '🍔' },
      { name: 'Transportation', color: '#38bdf8', icon: '🚗' },
      { name: 'Utilities', color: '#34d399', icon: '⚡' },
      { name: 'Entertainment', color: '#ec4899', icon: '🎬' },
      { name: 'Health', color: '#f43f5e', icon: '🩺' },
      { name: 'Shopping', color: '#a855f7', icon: '🛍️' },
      { name: 'Other', color: '#94a3b8', icon: '📦' }
    ],
    income: [
      { name: 'Salary', color: '#10b981', icon: '💼' },
      { name: 'Freelance', color: '#06b6d4', icon: '💻' },
      { name: 'Investment', color: '#8b5cf6', icon: '📈' },
      { name: 'Gifts & Bonus', color: '#f97316', icon: '🎁' },
      { name: 'Other Income', color: '#64748b', icon: '💰' }
    ]
  };

  // --- Initial Realistic Demo Data ---
  const DEFAULT_DEMO_TRANSACTIONS = [
    {
      id: 'tx-1',
      description: 'Monthly Tech Salary',
      amount: 4850.00,
      type: 'income',
      category: 'Salary',
      date: getRecentDate(1)
    },
    {
      id: 'tx-2',
      description: 'Luxury Apartment Rent',
      amount: 1450.00,
      type: 'expense',
      category: 'Housing',
      date: getRecentDate(2)
    },
    {
      id: 'tx-3',
      description: 'Whole Foods Market',
      amount: 182.40,
      type: 'expense',
      category: 'Food & Dining',
      date: getRecentDate(3)
    },
    {
      id: 'tx-4',
      description: 'Freelance UI/UX System',
      amount: 920.00,
      type: 'income',
      category: 'Freelance',
      date: getRecentDate(4)
    },
    {
      id: 'tx-5',
      description: 'Electricity & High-speed Fiber',
      amount: 115.60,
      type: 'expense',
      category: 'Utilities',
      date: getRecentDate(5)
    },
    {
      id: 'tx-6',
      description: 'Cinema & Weekend Bistro',
      amount: 78.50,
      type: 'expense',
      category: 'Entertainment',
      date: getRecentDate(7)
    },
    {
      id: 'tx-7',
      description: 'Index Fund Dividend',
      amount: 145.00,
      type: 'income',
      category: 'Investment',
      date: getRecentDate(9)
    },
    {
      id: 'tx-8',
      description: 'Tesla Supercharging & Tolls',
      amount: 64.20,
      type: 'expense',
      category: 'Transportation',
      date: getRecentDate(11)
    }
  ];

  function getRecentDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }

  // --- Application State ---
  const state = {
    transactions: [],
    monthlyBudget: 2500,
    currency: '$',
    theme: 'dark',
    filterType: 'all',
    filterCategory: 'all',
    searchQuery: '',
    modalType: 'expense',
    cashFlowChart: null,
    categoryChart: null
  };

  // --- DOM Elements ---
  const elements = {
    totalBalance: document.getElementById('total-balance'),
    totalIncome: document.getElementById('total-income'),
    totalExpenses: document.getElementById('total-expenses'),
    savingsRateBadge: document.getElementById('savings-rate-badge'),
    incomeCountBadge: document.getElementById('income-count-badge'),
    expenseCountBadge: document.getElementById('expense-count-badge'),
    budgetSpent: document.getElementById('budget-spent'),
    budgetTotal: document.getElementById('budget-total'),
    budgetProgressBar: document.getElementById('budget-progress-bar'),
    budgetStatusText: document.getElementById('budget-status-text'),
    budgetRemaining: document.getElementById('budget-remaining'),
    currencySelect: document.getElementById('currency-select'),
    currencySymbols: document.querySelectorAll('.active-currency-symbol'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    themeIconMoon: document.getElementById('theme-icon-moon'),
    searchInput: document.getElementById('search-input'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    categoryFilterSelect: document.getElementById('category-filter-select'),
    transactionsTbody: document.getElementById('transactions-tbody'),
    emptyState: document.getElementById('empty-state'),
    openModalBtn: document.getElementById('open-modal-btn'),
    emptyStateAddBtn: document.getElementById('empty-state-add-btn'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    cancelModalBtn: document.getElementById('cancel-modal-btn'),
    transactionModal: document.getElementById('transaction-modal'),
    transactionForm: document.getElementById('transaction-form'),
    typeExpenseSelect: document.getElementById('type-expense-select'),
    typeIncomeSelect: document.getElementById('type-income-select'),
    transactionAmount: document.getElementById('transaction-amount'),
    transactionDesc: document.getElementById('transaction-desc'),
    transactionCategory: document.getElementById('transaction-category'),
    transactionDate: document.getElementById('transaction-date'),
    editTransactionId: document.getElementById('edit-transaction-id'),
    quickChips: document.querySelectorAll('.quick-chips .chip'),
    editBudgetBtn: document.getElementById('edit-budget-btn'),
    budgetModal: document.getElementById('budget-modal'),
    closeBudgetModalBtn: document.getElementById('close-budget-modal-btn'),
    cancelBudgetModalBtn: document.getElementById('cancel-budget-modal-btn'),
    budgetForm: document.getElementById('budget-form'),
    budgetTargetInput: document.getElementById('budget-target-input'),
    exportCsvBtn: document.getElementById('export-csv-btn'),
    resetDemoBtn: document.getElementById('reset-demo-btn'),
    toastContainer: document.getElementById('toast-container'),
    totalCategoriesCount: document.getElementById('total-categories-count'),
    categoryLegend: document.getElementById('category-legend')
  };

  // --- Storage Helpers ---
  function loadFromStorage() {
    try {
      const storedTx = localStorage.getItem('lumina_transactions');
      state.transactions = storedTx ? JSON.parse(storedTx) : [...DEFAULT_DEMO_TRANSACTIONS];
      
      const storedBudget = localStorage.getItem('lumina_budget');
      if (storedBudget) state.monthlyBudget = parseFloat(storedBudget);

      const storedCurrency = localStorage.getItem('lumina_currency');
      if (storedCurrency) state.currency = storedCurrency;

      const storedTheme = localStorage.getItem('lumina_theme');
      if (storedTheme) state.theme = storedTheme;
    } catch (e) {
      console.warn('LocalStorage error, using defaults', e);
      state.transactions = [...DEFAULT_DEMO_TRANSACTIONS];
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem('lumina_transactions', JSON.stringify(state.transactions));
      localStorage.setItem('lumina_budget', state.monthlyBudget.toString());
      localStorage.setItem('lumina_currency', state.currency);
      localStorage.setItem('lumina_theme', state.theme);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // --- Formatting Helpers ---
  function formatMoney(amount, showSign = false) {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const prefix = showSign ? (amount < 0 ? '-' : '+') : '';
    return `${prefix}${state.currency}${formatted}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getCategoryMeta(categoryName, type) {
    const list = CATEGORIES[type] || [...CATEGORIES.expense, ...CATEGORIES.income];
    const found = list.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    return found || { name: categoryName, color: '#64748b', icon: '📌' };
  }

  // --- Toast Feedback ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // --- Render & Update KPI Cards ---
  function updateKPIs() {
    let incomeTotal = 0;
    let expenseTotal = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    state.transactions.forEach(tx => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'income') {
        incomeTotal += amt;
        incomeCount++;
      } else {
        expenseTotal += amt;
        expenseCount++;
      }
    });

    const netBalance = incomeTotal - expenseTotal;
    const savingsRate = incomeTotal > 0 ? Math.max(0, Math.round(((incomeTotal - expenseTotal) / incomeTotal) * 100)) : 0;

    // Balance
    elements.totalBalance.textContent = formatMoney(netBalance);
    elements.totalBalance.className = `kpi-value ${netBalance >= 0 ? '' : 'text-danger'}`;
    elements.savingsRateBadge.textContent = `Savings Rate: ${savingsRate}%`;

    // Inflow
    elements.totalIncome.textContent = `+${formatMoney(incomeTotal)}`;
    elements.incomeCountBadge.textContent = `${incomeCount} Records`;

    // Outflow
    elements.totalExpenses.textContent = `-${formatMoney(expenseTotal)}`;
    elements.expenseCountBadge.textContent = `${expenseCount} Records`;

    // Budget Calculations
    const spentPercent = Math.min(100, Math.round((expenseTotal / state.monthlyBudget) * 100));
    const remaining = state.monthlyBudget - expenseTotal;

    elements.budgetSpent.textContent = formatMoney(expenseTotal);
    elements.budgetTotal.textContent = formatMoney(state.monthlyBudget);
    elements.budgetProgressBar.style.width = `${Math.min(100, (expenseTotal / state.monthlyBudget) * 100)}%`;
    elements.budgetStatusText.textContent = `${spentPercent}% of monthly cap used`;

    if (remaining >= 0) {
      elements.budgetRemaining.textContent = `${formatMoney(remaining)} remaining`;
      elements.budgetRemaining.className = 'text-subtle';
      elements.budgetProgressBar.className = spentPercent > 80 ? 'budget-progress-fill warning' : 'budget-progress-fill';
    } else {
      elements.budgetRemaining.textContent = `${formatMoney(Math.abs(remaining))} exceeded!`;
      elements.budgetRemaining.className = 'text-danger';
      elements.budgetProgressBar.className = 'budget-progress-fill danger';
    }
  }

  // --- Render Transactions Table ---
  function renderTransactions() {
    const q = state.searchQuery.toLowerCase().trim();
    
    const filtered = state.transactions.filter(tx => {
      // Type filter
      if (state.filterType !== 'all' && tx.type !== state.filterType) return false;
      // Category filter
      if (state.filterCategory !== 'all' && tx.category !== state.filterCategory) return false;
      // Search
      if (q) {
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const catMatch = (tx.category || '').toLowerCase().includes(q);
        if (!descMatch && !catMatch) return false;
      }
      return true;
    });

    // Sort newest date first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    elements.transactionsTbody.innerHTML = '';

    if (filtered.length === 0) {
      elements.emptyState.classList.remove('hidden');
      return;
    }

    elements.emptyState.classList.add('hidden');

    filtered.forEach(tx => {
      const meta = getCategoryMeta(tx.category, tx.type);
      const isIncome = tx.type === 'income';
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>
          <div class="tx-title">
            <div class="tx-icon-circle" style="background: ${meta.color}22; color: ${meta.color}">
              <span>${meta.icon}</span>
            </div>
            <span>${escapeHTML(tx.description)}</span>
          </div>
        </td>
        <td>
          <span class="tx-category-badge" style="border-left: 3px solid ${meta.color}">
            ${escapeHTML(tx.category)}
          </span>
        </td>
        <td class="text-subtle">${formatDate(tx.date)}</td>
        <td>
          <span class="badge ${isIncome ? 'badge-success' : 'badge-danger'}">
            ${isIncome ? 'Income' : 'Expense'}
          </span>
        </td>
        <td class="text-right">
          <span class="tx-amount ${isIncome ? 'text-success' : 'text-danger'}">
            ${isIncome ? '+' : '-'}${formatMoney(tx.amount)}
          </span>
        </td>
        <td class="text-center">
          <button class="btn-delete-tx" data-id="${tx.id}" title="Delete transaction" aria-label="Delete ${escapeHTML(tx.description)}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </td>
      `;

      elements.transactionsTbody.appendChild(tr);
    });

    // Attach delete listeners
    document.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        deleteTransaction(id);
      });
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // --- Charts Management (Chart.js) ---
  function initCharts() {
    if (typeof Chart === 'undefined') return;

    // 1. Monthly Cashflow Bar Chart
    const cashFlowCtx = document.getElementById('cashflow-chart');
    if (cashFlowCtx) {
      state.cashFlowChart = new Chart(cashFlowCtx, {
        type: 'bar',
        data: {
          labels: ['Total Inflow', 'Total Outflow', 'Net Retained'],
          datasets: [{
            data: [0, 0, 0],
            backgroundColor: [
              'rgba(16, 185, 129, 0.85)',
              'rgba(244, 63, 94, 0.85)',
              'rgba(99, 102, 241, 0.85)'
            ],
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#f8fafc',
              bodyColor: '#cbd5e1',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ` ${formatMoney(ctx.raw)}`
              }
            }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: {
                color: '#94a3b8',
                callback: (val) => `${state.currency}${val}`
              }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { weight: '600' } }
            }
          }
        }
      });
    }

    // 2. Expense Category Donut Chart
    const categoryCtx = document.getElementById('category-chart');
    if (categoryCtx) {
      state.categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [],
            borderWidth: 2,
            borderColor: state.theme === 'dark' ? '#111827' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#f8fafc',
              bodyColor: '#cbd5e1',
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.raw)}`
              }
            }
          }
        }
      });
    }

    updateCharts();
  }

  function updateCharts() {
    if (!state.cashFlowChart || !state.categoryChart) return;

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCat = {};

    state.transactions.forEach(tx => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        expenseByCat[tx.category] = (expenseByCat[tx.category] || 0) + amt;
      }
    });

    const net = Math.max(0, totalIncome - totalExpense);

    // Update Cashflow
    state.cashFlowChart.data.datasets[0].data = [totalIncome, totalExpense, net];
    state.cashFlowChart.options.scales.y.ticks.callback = (val) => `${state.currency}${val}`;
    state.cashFlowChart.update();

    // Update Categories Donut
    const catLabels = Object.keys(expenseByCat);
    const catData = Object.values(expenseByCat);
    const catColors = catLabels.map(cat => getCategoryMeta(cat, 'expense').color);

    elements.totalCategoriesCount.textContent = `${catLabels.length} Categories`;

    state.categoryChart.data.labels = catLabels.length ? catLabels : ['No Expenses'];
    state.categoryChart.data.datasets[0].data = catData.length ? catData : [1];
    state.categoryChart.data.datasets[0].backgroundColor = catColors.length ? catColors : ['#475569'];
    state.categoryChart.data.datasets[0].borderColor = state.theme === 'dark' ? '#111827' : '#ffffff';
    state.categoryChart.update();

    // Render Custom HTML Legend for the donut
    elements.categoryLegend.innerHTML = '';
    const totalExpForLegend = catData.reduce((acc, v) => acc + v, 0);

    catLabels.forEach((label, idx) => {
      const val = catData[idx];
      const percent = totalExpForLegend > 0 ? Math.round((val / totalExpForLegend) * 100) : 0;
      const meta = getCategoryMeta(label, 'expense');

      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `
        <div class="legend-left">
          <span class="legend-color-dot" style="background-color: ${meta.color}"></span>
          <span>${meta.icon} ${escapeHTML(label)}</span>
        </div>
        <div>
          <span class="legend-percent">${percent}%</span>
          <span class="text-subtle" style="margin-left: 6px;">(${formatMoney(val)})</span>
        </div>
      `;
      elements.categoryLegend.appendChild(item);
    });
  }

  // --- Category Options in Modal Form ---
  function populateCategoryOptions(type) {
    const categories = CATEGORIES[type] || CATEGORIES.expense;
    elements.transactionCategory.innerHTML = '';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = `${cat.icon} ${cat.name}`;
      elements.transactionCategory.appendChild(opt);
    });
  }

  // --- Modal Open/Close ---
  function openTransactionModal(editId = null) {
    elements.transactionForm.reset();
    elements.editTransactionId.value = '';
    
    // Default to current date
    elements.transactionDate.value = new Date().toISOString().split('T')[0];
    
    // Set type to expense by default
    setTypeSelection('expense');

    elements.transactionModal.classList.remove('hidden');
    elements.transactionAmount.focus();
  }

  function closeTransactionModal() {
    elements.transactionModal.classList.add('hidden');
  }

  function setTypeSelection(type) {
    state.modalType = type;
    if (type === 'income') {
      elements.typeIncomeSelect.classList.add('active');
      elements.typeExpenseSelect.classList.remove('active');
    } else {
      elements.typeExpenseSelect.classList.add('active');
      elements.typeIncomeSelect.classList.remove('active');
    }
    populateCategoryOptions(type);
  }

  // --- Add Transaction Submission ---
  function handleTransactionSubmit(e) {
    e.preventDefault();

    const amount = parseFloat(elements.transactionAmount.value);
    const desc = elements.transactionDesc.value.trim();
    const category = elements.transactionCategory.value;
    const date = elements.transactionDate.value;
    const type = state.modalType;

    if (!amount || isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount greater than zero', 'danger');
      return;
    }
    if (!desc) {
      showToast('Please provide a description', 'danger');
      return;
    }
    if (!date) {
      showToast('Please select a valid date', 'danger');
      return;
    }

    const newTx = {
      id: 'tx-' + Date.now(),
      description: desc,
      amount: amount,
      type: type,
      category: category,
      date: date
    };

    state.transactions.unshift(newTx);
    saveToStorage();

    updateKPIs();
    renderTransactions();
    updateCharts();
    closeTransactionModal();

    showToast(`Recorded ${type === 'income' ? 'income' : 'expense'}: ${desc}`, 'success');
  }

  // --- Delete Transaction ---
  function deleteTransaction(id) {
    const target = state.transactions.find(t => t.id === id);
    if (!target) return;

    state.transactions = state.transactions.filter(t => t.id !== id);
    saveToStorage();

    updateKPIs();
    renderTransactions();
    updateCharts();

    showToast(`Removed "${target.description}"`, 'info');
  }

  // --- Budget Modal ---
  function openBudgetModal() {
    elements.budgetTargetInput.value = state.monthlyBudget;
    elements.budgetModal.classList.remove('hidden');
    elements.budgetTargetInput.focus();
  }

  function closeBudgetModal() {
    elements.budgetModal.classList.add('hidden');
  }

  function handleBudgetSubmit(e) {
    e.preventDefault();
    const newBudget = parseFloat(elements.budgetTargetInput.value);
    if (!newBudget || isNaN(newBudget) || newBudget <= 0) {
      showToast('Please enter a valid monthly budget target', 'danger');
      return;
    }
    state.monthlyBudget = newBudget;
    saveToStorage();
    updateKPIs();
    closeBudgetModal();
    showToast(`Monthly budget ceiling updated to ${formatMoney(newBudget)}`, 'success');
  }

  // --- Export CSV ---
  function exportToCSV() {
    if (state.transactions.length === 0) {
      showToast('No transactions to export', 'danger');
      return;
    }

    const headers = ['ID', 'Type', 'Amount', 'Currency', 'Category', 'Date', 'Description'];
    const rows = state.transactions.map(t => [
      t.id,
      t.type,
      t.amount.toFixed(2),
      state.currency,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lumina_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Transactions exported to CSV successfully', 'success');
  }

  // --- Theme Toggle ---
  function applyTheme(theme) {
    state.theme = theme;
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      elements.themeIconSun.classList.add('hidden');
      elements.themeIconMoon.classList.remove('hidden');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      elements.themeIconMoon.classList.add('hidden');
      elements.themeIconSun.classList.remove('hidden');
    }
    saveToStorage();
    if (state.categoryChart) {
      state.categoryChart.data.datasets[0].borderColor = theme === 'dark' ? '#111827' : '#ffffff';
      state.categoryChart.update();
    }
  }

  // --- Reset Demo Data ---
  function resetDemoData() {
    state.transactions = [...DEFAULT_DEMO_TRANSACTIONS];
    state.monthlyBudget = 2500;
    saveToStorage();
    updateKPIs();
    renderTransactions();
    updateCharts();
    showToast('Demo data restored successfully', 'info');
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Currency Change
    elements.currencySelect.value = state.currency;
    elements.currencySelect.addEventListener('change', (e) => {
      state.currency = e.target.value;
      elements.currencySymbols.forEach(el => el.textContent = state.currency);
      saveToStorage();
      updateKPIs();
      renderTransactions();
      updateCharts();
      showToast(`Active currency changed to ${state.currency}`, 'info');
    });

    // Theme Toggle
    elements.themeToggleBtn.addEventListener('click', () => {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // Search
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderTransactions();
    });

    // Filter Tabs
    elements.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.filterType = tab.dataset.filter;
        renderTransactions();
      });
    });

    // Category Filter
    elements.categoryFilterSelect.addEventListener('change', (e) => {
      state.filterCategory = e.target.value;
      renderTransactions();
    });

    // Modal Triggers
    elements.openModalBtn.addEventListener('click', () => openTransactionModal());
    elements.emptyStateAddBtn.addEventListener('click', () => openTransactionModal());
    elements.closeModalBtn.addEventListener('click', closeTransactionModal);
    elements.cancelModalBtn.addEventListener('click', closeTransactionModal);
    elements.transactionModal.addEventListener('click', (e) => {
      if (e.target === elements.transactionModal) closeTransactionModal();
    });

    // Type Selector in Modal
    elements.typeExpenseSelect.addEventListener('click', () => setTypeSelection('expense'));
    elements.typeIncomeSelect.addEventListener('click', () => setTypeSelection('income'));

    // Quick Chips for Amount
    elements.quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const addVal = parseFloat(chip.dataset.val);
        const curVal = parseFloat(elements.transactionAmount.value) || 0;
        elements.transactionAmount.value = (curVal + addVal).toFixed(2);
      });
    });

    // Transaction Form Submit
    elements.transactionForm.addEventListener('submit', handleTransactionSubmit);

    // Budget Modal
    elements.editBudgetBtn.addEventListener('click', openBudgetModal);
    elements.closeBudgetModalBtn.addEventListener('click', closeBudgetModal);
    elements.cancelBudgetModalBtn.addEventListener('click', closeBudgetModal);
    elements.budgetModal.addEventListener('click', (e) => {
      if (e.target === elements.budgetModal) closeBudgetModal();
    });
    elements.budgetForm.addEventListener('submit', handleBudgetSubmit);

    // Export & Reset
    elements.exportCsvBtn.addEventListener('click', exportToCSV);
    elements.resetDemoBtn.addEventListener('click', resetDemoData);

    // Escape Key Modal Close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTransactionModal();
        closeBudgetModal();
      }
    });
  }

  // --- Application Initialization ---
  function init() {
    loadFromStorage();
    elements.currencySymbols.forEach(el => el.textContent = state.currency);
    applyTheme(state.theme);
    populateCategoryOptions('expense');
    setupEventListeners();
    updateKPIs();
    renderTransactions();
    initCharts();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
