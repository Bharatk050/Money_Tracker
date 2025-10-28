// Enhanced MoneyTracker Script

let expenses = [];
let allExpenses = [];
let totalAmount = 0;
let totalDeposit = 0;
let currentEditingExpense = null;

const userName = window.userName || "Guest";

// DOM Elements
const categorySelect = document.getElementById('category-select');
const amountInput = document.getElementById('amount-input');
const depositInput = document.getElementById('deposit-input');
const dateInput = document.getElementById('date-input');
const addBtn = document.getElementById('add-btn');
const expensesTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');
const totalDepositCell = document.getElementById('total-deposit-amount');
const balanceCell = document.getElementById('balance-amount');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const dateFrom = document.getElementById('date-from');
const dateTo = document.getElementById('date-to');
const clearFilterBtn = document.getElementById('clear-filter-btn');
const themeToggle = document.getElementById('theme-toggle');
const editModal = document.getElementById('edit-modal');
const closeEditModal = document.getElementById('close-edit-modal');
const saveEditBtn = document.getElementById('save-edit-btn');

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  if (!userName || userName === "Guest") {
    alert("User not logged in.");
    return;
  }

  loadTheme();
  dateInput.valueAsDate = new Date();
  loadExpenses();
  loadForecast();
});

// Theme Toggle
themeToggle.addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  const icon = themeToggle.querySelector('i');
  icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
});

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    const icon = themeToggle.querySelector('i');
    icon.className = 'fas fa-sun';
  }
}

// Load Expenses
async function loadExpenses() {
  try {
    const res = await fetch(`/expenses`);
    const data = await res.json();
    allExpenses = data;
    expenses = [...allExpenses];
    
    renderExpenseTable();
    updateOverview();
  } catch (err) {
    console.error("Error loading expenses:", err);
  }
}

// Global chart instance
let predictionChart = null;

// Load Enhanced ML Forecast with Interactive Chart
async function loadForecast() {
  try {
    const res = await fetch('/predict-expense');
    const data = await res.json();
    
    const placeholder = document.getElementById('forecast-placeholder');
    const chartContainer = document.getElementById('chart-container');
    const mlStatistics = document.getElementById('ml-statistics');
    const mlInsights = document.getElementById('ml-insights');
    
    if (!data.success) {
      placeholder.style.display = 'block';
      chartContainer.style.display = 'none';
      mlStatistics.style.display = 'none';
      mlInsights.style.display = 'none';
      
      if (data.message) {
        placeholder.innerHTML = `
          <i class="fas fa-chart-area" style="font-size: 48px; color: var(--primary-color);"></i>
          <p>${data.message}</p>
        `;
      }
      return;
    }
    
    // Hide placeholder, show chart
    placeholder.style.display = 'none';
    chartContainer.style.display = 'block';
    mlStatistics.style.display = 'block';
    mlInsights.style.display = 'block';
    
    // Update ML statistics
    document.getElementById('ml-accuracy').textContent = `${data.statistics.accuracy}%`;
    document.getElementById('ml-avg-expense').textContent = `₹${data.statistics.avg_monthly_expense}`;
    
    const trendIcon = data.statistics.trend === 'increasing' ? '📈' : 
                      data.statistics.trend === 'decreasing' ? '📉' : '➡️';
    document.getElementById('ml-trend').textContent = `${trendIcon} ${data.statistics.trend}`;
    
    // Display ML insights
    if (data.insights && data.insights.length > 0) {
      const insightColors = {
        'success': '#00d4aa',
        'warning': '#ffb800',
        'danger': '#ff4757',
        'info': '#6a5af9'
      };
      
      mlInsights.innerHTML = data.insights.map(insight => `
        <div style="
          padding: 12px 20px;
          margin: 10px auto;
          max-width: 600px;
          background: rgba(${insight.type === 'success' ? '0, 212, 170' : 
                           insight.type === 'warning' ? '255, 184, 0' :
                           insight.type === 'danger' ? '255, 71, 87' : '106, 90, 249'}, 0.1);
          border-left: 4px solid ${insightColors[insight.type]};
          border-radius: 8px;
          text-align: left;
          font-size: 14px;
          color: var(--text-color);
        ">
          <i class="fas fa-${insight.icon}" style="color: ${insightColors[insight.type]}; margin-right: 8px;"></i>
          ${insight.message}
        </div>
      `).join('');
    }
    
    // Combine historical and predicted months
    const allMonths = [...data.historical.months, ...data.predictions.months];
    
    // Destroy existing chart if it exists
    if (predictionChart) {
      predictionChart.destroy();
    }
    
    // Create the interactive chart
    const ctx = document.getElementById('predictionChart').getContext('2d');
    predictionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allMonths,
        datasets: [
          {
            label: 'Actual Expenses',
            data: [...data.historical.expenses, ...Array(data.predictions.months.length).fill(null)],
            borderColor: '#ff4757',
            backgroundColor: 'rgba(255, 71, 87, 0.1)',
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#ff4757',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Predicted Expenses',
            data: [...Array(data.historical.months.length).fill(null), ...data.predictions.expenses],
            borderColor: '#6a5af9',
            backgroundColor: 'rgba(106, 90, 249, 0.1)',
            borderWidth: 3,
            borderDash: [10, 5],
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#6a5af9',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Actual Deposits',
            data: [...data.historical.deposits, ...Array(data.predictions.months.length).fill(null)],
            borderColor: '#00d4aa',
            backgroundColor: 'rgba(0, 212, 170, 0.1)',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#00d4aa',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Predicted Deposits',
            data: [...Array(data.historical.months.length).fill(null), ...data.predictions.deposits],
            borderColor: '#00d4aa',
            backgroundColor: 'rgba(0, 212, 170, 0.05)',
            borderWidth: 2,
            borderDash: [5, 3],
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#00d4aa',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Confidence Range (Upper)',
            data: [...Array(data.historical.months.length).fill(null), ...data.predictions.confidence_upper],
            borderColor: 'rgba(106, 90, 249, 0.3)',
            backgroundColor: 'rgba(106, 90, 249, 0.05)',
            borderWidth: 1,
            borderDash: [2, 2],
            pointRadius: 0,
            fill: '+1',
            tension: 0.3
          },
          {
            label: 'Confidence Range (Lower)',
            data: [...Array(data.historical.months.length).fill(null), ...data.predictions.confidence_lower],
            borderColor: 'rgba(106, 90, 249, 0.3)',
            backgroundColor: 'rgba(106, 90, 249, 0.05)',
            borderWidth: 1,
            borderDash: [2, 2],
            pointRadius: 0,
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                weight: '600'
              },
              filter: (legendItem) => {
                // Hide confidence range from legend
                return !legendItem.text.includes('Confidence Range');
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label && !label.includes('Confidence')) {
                  label += ': ₹' + context.parsed.y.toFixed(2);
                }
                return label;
              }
            }
          },
          title: {
            display: true,
            text: '📊 Monthly Expense & Deposit Analysis with ML Predictions',
            font: { size: 16, weight: 'bold' },
            padding: { top: 10, bottom: 20 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString();
              },
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: { size: 11 }
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
    
  } catch (err) {
    console.error("Failed to load ML predictions:", err);
    document.getElementById('forecast-placeholder').style.display = 'block';
    document.getElementById('chart-container').style.display = 'none';
  }
}

// Render Expense Table
function renderExpenseTable() {
  expensesTableBody.innerHTML = '';
  expenses.forEach(expense => {
    addExpenseToTable(expense);
  });
}

// Add Expense to Table
function addExpenseToTable(expense) {
  const newRow = expensesTableBody.insertRow();
  newRow.setAttribute('data-id', expense._id);
  
  const categoryCell = newRow.insertCell();
  const depositCell = newRow.insertCell();
  const amountCell = newRow.insertCell();
  const dateCell = newRow.insertCell();
  const actionCell = newRow.insertCell();

  categoryCell.innerHTML = `<span class="category-badge">${getCategoryEmoji(expense.category)} ${expense.category}</span>`;
  
  depositCell.textContent = `₹${expense.Deposit || 0}`;
  depositCell.style.color = 'var(--success-color)';
  depositCell.style.fontWeight = 'bold';
  
  amountCell.textContent = `₹${expense.amount || 0}`;
  amountCell.style.color = 'var(--danger-color)';
  amountCell.style.fontWeight = 'bold';
  
  dateCell.textContent = formatDate(expense.date);

  const actionButtons = document.createElement('div');
  actionButtons.className = 'action-buttons';
  
  const editBtn = document.createElement('button');
  editBtn.innerHTML = '<i class="fas fa-edit"></i>';
  editBtn.className = 'btn btn-warning btn-sm';
  editBtn.title = 'Edit';
  editBtn.addEventListener('click', () => openEditModal(expense));
  
  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.className = 'btn btn-danger btn-sm';
  deleteBtn.title = 'Delete';
  deleteBtn.addEventListener('click', () => deleteExpense(expense, newRow));

  actionButtons.appendChild(editBtn);
  actionButtons.appendChild(deleteBtn);
  actionCell.appendChild(actionButtons);
}

function getCategoryEmoji(category) {
  const emojiMap = {
    'Food & Beverage': '🍔',
    'Rent': '🏠',
    'Transport': '🚗',
    'Relaxing': '☕',
    'Travel': '✈️',
    'Entertainment': '🎮',
    'Healthcare': '💊',
    'Shopping': '🛍️',
    'Education': '📚',
    'Other': '📌'
  };
  return emojiMap[category] || '📌';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Add Expense
addBtn.addEventListener('click', async function () {
  const category = categorySelect.value;
  const Deposit = Number(depositInput.value) || 0;
  const amount = Number(amountInput.value) || 0;
  const date = dateInput.value;

  if (!category || !date) {
    alert('Category and Date are required!');
    return;
  }

  if (Deposit === 0 && amount === 0) {
    alert('Please enter either a deposit or expense amount!');
    return;
  }

  const expense = { category, Deposit, amount, date };

  try {
    const res = await fetch('/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    const result = await res.json();
    
    if (result.id) {
      expense._id = result.id;
      allExpenses.push(expense);
      expenses = [...allExpenses];
      
      checkOverspending();
      
      depositInput.value = '';
      amountInput.value = '';
      dateInput.valueAsDate = new Date();
      
      renderExpenseTable();
      await refreshSummaryAndCharts();
      await loadForecast();
      
      showNotification('Transaction added successfully!', 'success');
    }
  } catch (error) {
    console.error('Error saving expense:', error);
    showNotification('Failed to add transaction', 'error');
  }
});

function checkOverspending() {
  const currentDeposit = allExpenses.reduce((acc, e) => acc + (e.Deposit || 0), 0);
  const currentExpense = allExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const currentBalance = currentDeposit - currentExpense;
  
  // Smart overspending check based on remaining balance
  if (currentBalance < 0) {
    showNotification('🚨 Alert: You have overspent! Balance is negative!', 'error');
  } else if (currentExpense > currentDeposit * 0.8) {
    showNotification('⚠️ Warning: You\'ve spent 80%+ of your deposits!', 'warning');
  }
}

// Delete Expense
async function deleteExpense(expense, row) {
  if (!confirm('Are you sure you want to delete this transaction?')) {
    return;
  }

  try {
    if (expense._id) {
      const res = await fetch(`/expenses/${expense._id}`, { method: 'DELETE' });
      const result = await res.json();
      console.log('Deleted:', result.message);
    }

    const index = allExpenses.findIndex(e => e._id === expense._id);
    if (index > -1) {
      allExpenses.splice(index, 1);
    }
    const expenseIndex = expenses.findIndex(e => e._id === expense._id);
    if (expenseIndex > -1) {
      expenses.splice(expenseIndex, 1);
    }

    expensesTableBody.removeChild(row);

    await refreshSummaryAndCharts();
    await loadForecast();
    
    showNotification('Transaction deleted successfully!', 'success');
  } catch (err) {
    console.error('Failed to delete:', err);
    showNotification('Failed to delete transaction', 'error');
  }
}

// Edit Modal Functions
function openEditModal(expense) {
  currentEditingExpense = expense;
  
  document.getElementById('edit-date').value = expense.date;
  document.getElementById('edit-deposit').value = expense.Deposit || 0;
  document.getElementById('edit-amount').value = expense.amount || 0;
  document.getElementById('edit-category').value = expense.category;
  
  editModal.classList.add('active');
}

closeEditModal.addEventListener('click', () => {
  editModal.classList.remove('active');
  currentEditingExpense = null;
});

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editModal.classList.remove('active');
    currentEditingExpense = null;
  }
});

saveEditBtn.addEventListener('click', async function() {
  if (!currentEditingExpense) return;

  const updatedExpense = {
    date: document.getElementById('edit-date').value,
    Deposit: Number(document.getElementById('edit-deposit').value) || 0,
    amount: Number(document.getElementById('edit-amount').value) || 0,
    category: document.getElementById('edit-category').value
  };

  try {
    const oldId = currentEditingExpense._id;
    await fetch(`/expenses/${oldId}`, { method: 'DELETE' });
    
    const res = await fetch('/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedExpense)
    });
    const result = await res.json();
    
    if (result.id) {
      updatedExpense._id = result.id;
      
      const index = allExpenses.findIndex(e => e._id === oldId);
      if (index > -1) {
        allExpenses[index] = updatedExpense;
      }
      
      expenses = [...allExpenses];
      applyFilters();
      
      editModal.classList.remove('active');
      currentEditingExpense = null;
      
      await refreshSummaryAndCharts();
      await loadForecast();
      
      showNotification('Transaction updated successfully!', 'success');
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    showNotification('Failed to update transaction', 'error');
  }
});

// Search and Filter
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
dateFrom.addEventListener('change', applyFilters);
dateTo.addEventListener('change', applyFilters);

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const fromDate = dateFrom.value;
  const toDate = dateTo.value;

  expenses = allExpenses.filter(expense => {
    const matchesSearch = !searchTerm || 
      expense.category.toLowerCase().includes(searchTerm) ||
      expense.date.includes(searchTerm);
    
    const matchesCategory = !category || expense.category === category;
    
    const matchesDateFrom = !fromDate || expense.date >= fromDate;
    const matchesDateTo = !toDate || expense.date <= toDate;

    return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  renderExpenseTable();
  updateInsights();
}

clearFilterBtn.addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = '';
  dateFrom.value = '';
  dateTo.value = '';
  expenses = [...allExpenses];
  renderExpenseTable();
  updateInsights();
});

// Export to CSV
document.getElementById('export-btn').addEventListener('click', () => {
  exportTableToCSV('MoneyTracker_Expenses.csv');
});

function exportTableToCSV(filename) {
  let csv = ['Category,Deposit,Expense,Date'];
  
  allExpenses.forEach(expense => {
    csv.push(`${expense.category},${expense.Deposit || 0},${expense.amount || 0},${expense.date}`);
  });
  
  downloadCSV(csv.join('\n'), filename);
  showNotification('Expenses exported successfully!', 'success');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Update Overview
function updateOverview() {
  refreshSummaryAndCharts();
  updateInsights();
}

// Update Insights
function updateInsights() {
  const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalDays = expenses.length > 0 ? 
    Math.ceil((new Date() - new Date(Math.min(...expenses.map(e => new Date(e.date))))) / (1000 * 60 * 60 * 24)) || 1 : 1;
  
  const avgDaily = totalExpense / totalDays;
  
  const categoryTotals = {};
  expenses.forEach(e => {
    if (e.amount > 0) {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    }
  });
  
  const topCategory = Object.keys(categoryTotals).length > 0 ?
    Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b) : '-';
  
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = expenses.filter(e => e.date.startsWith(thisMonth))
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  
  document.getElementById('insight-avg').textContent = `₹${avgDaily.toFixed(2)}`;
  document.getElementById('insight-category').textContent = topCategory;
  document.getElementById('insight-count').textContent = expenses.length;
  document.getElementById('insight-month').textContent = `₹${thisMonthExpenses.toFixed(2)}`;
}

// Refresh Summary and Charts
async function refreshSummaryAndCharts() {
  try {
    const res = await fetch(`/budget-summary`);
    const data = await res.json();

    document.getElementById('needs-box').textContent = `₹${data.needs}`;
    document.getElementById('wants-box').textContent = `₹${data.wants}`;
    document.getElementById('savings-box').textContent = `₹${data.savings}`;
    document.getElementById('total-deposit-amount').textContent = `₹${data.total_deposit}`;
    document.getElementById('total-amount').textContent = `₹${data.total_expense}`;
    
    const balance = data.current_balance;
    balanceCell.textContent = `₹${balance.toFixed(2)}`;
    balanceCell.style.color = balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
    
    const expensePercent = data.total_deposit > 0 ? (data.total_expense / data.total_deposit) * 100 : 0;
    document.getElementById('expense-progress').style.width = `${Math.min(expensePercent, 100)}%`;

    // Update new smart insights
    updateSmartInsights(data);
    updateInsights();
  } catch (error) {
    console.error("Error fetching summary:", error);
  }
}

// Update Smart Insights with new beneficial formulas
function updateSmartInsights(data) {
  // Update savings rate
  const savingsRateElem = document.getElementById('savings-rate-value');
  if (savingsRateElem) {
    savingsRateElem.textContent = `${data.savings_rate}%`;
    savingsRateElem.style.color = data.savings_rate >= 20 ? 'var(--success-color)' : 
                                   data.savings_rate >= 10 ? 'var(--warning-color)' : 'var(--danger-color)';
  }
  
  // Update burn rate
  const burnRateElem = document.getElementById('burn-rate-value');
  if (burnRateElem) {
    if (data.burn_rate_days > 0 && data.burn_rate_days < 9999) {
      burnRateElem.textContent = `${data.burn_rate_days} days`;
      burnRateElem.style.color = data.burn_rate_days >= 90 ? 'var(--success-color)' : 
                                  data.burn_rate_days >= 30 ? 'var(--warning-color)' : 'var(--danger-color)';
    } else {
      burnRateElem.textContent = 'No expenses yet';
      burnRateElem.style.color = 'var(--text-color)';
    }
  }
  
  // Update emergency fund progress
  const emergencyFundElem = document.getElementById('emergency-fund-value');
  if (emergencyFundElem) {
    emergencyFundElem.textContent = `${data.emergency_fund_progress}%`;
    emergencyFundElem.style.color = data.emergency_fund_progress >= 100 ? 'var(--success-color)' : 
                                     data.emergency_fund_progress >= 50 ? 'var(--warning-color)' : 'var(--danger-color)';
  }
  
  // Update spending efficiency
  const spendingEfficiencyElem = document.getElementById('spending-efficiency-value');
  if (spendingEfficiencyElem) {
    const avgEfficiency = (data.needs_efficiency + data.wants_efficiency) / 2;
    spendingEfficiencyElem.textContent = `${avgEfficiency.toFixed(1)}%`;
    spendingEfficiencyElem.style.color = avgEfficiency <= 100 ? 'var(--success-color)' : 
                                          avgEfficiency <= 120 ? 'var(--warning-color)' : 'var(--danger-color)';
  }
  
  // Update recommendations
  displayRecommendations(data.recommendations || []);
}

// Display personalized recommendations
function displayRecommendations(recommendations) {
  const container = document.getElementById('recommendations-container');
  if (!container) return;
  
  if (recommendations.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; opacity: 0.6;">
        <i class="fas fa-comments" style="font-size: 42px; color: var(--primary-color);"></i>
        <p style="margin-top: 15px;">Add some transactions to get personalized recommendations</p>
      </div>
    `;
    return;
  }
  
  const typeColors = {
    'success': 'var(--success-color)',
    'warning': 'var(--warning-color)',
    'danger': 'var(--danger-color)',
    'info': 'var(--primary-color)'
  };
  
  const typeBgColors = {
    'success': 'rgba(0, 212, 170, 0.1)',
    'warning': 'rgba(255, 184, 0, 0.1)',
    'danger': 'rgba(255, 71, 87, 0.1)',
    'info': 'rgba(106, 90, 249, 0.1)'
  };
  
  container.innerHTML = recommendations.map(rec => `
    <div style="
      padding: 18px 24px;
      margin-bottom: 15px;
      border-radius: 12px;
      background: ${typeBgColors[rec.type]};
      border-left: 4px solid ${typeColors[rec.type]};
      display: flex;
      align-items: center;
      gap: 18px;
      transition: all 0.3s ease;
      cursor: pointer;
    " 
    onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 5px 20px rgba(0,0,0,0.1)';"
    onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none';">
      <i class="fas fa-${rec.icon}" style="font-size: 28px; color: ${typeColors[rec.type]}; min-width: 28px;"></i>
      <div style="flex: 1;">
        <p style="margin: 0; font-weight: 700; font-size: 15px; color: var(--text-color);">${rec.message}</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.8; color: ${typeColors[rec.type]};">
          <i class="fas fa-arrow-right" style="font-size: 11px;"></i> ${rec.action}
        </p>
      </div>
    </div>
  `).join('');
}

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#00d4aa' : type === 'error' ? '#ff4757' : '#ffb800'};
    color: white;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    font-weight: 600;
    animation: slideInRight 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);
