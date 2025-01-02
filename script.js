let expenses = [];
let totalAmount = 0;
let totalDeposit = 0;

const categorySelect = document.getElementById('category-select');
const amountInput = document.getElementById('amount-input');
const DepositInput = document.getElementById('deposit-input');
const dateInput = document.getElementById('date-input');
const addBtn = document.getElementById('add-btn');
const expensesTableBody = document.getElementById('expnese-table-body');
const totalAmountCell = document.getElementById('total-amount');
const totalDepositCell = document.getElementById('total-deposit-amount');

// Load data from localStorage when the page is reloaded
document.addEventListener('DOMContentLoaded', function() {
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses = savedExpenses;

    for (const expense of expenses) {
        addExpenseToTable(expense);
        totalAmount += expense.amount;
        totalDeposit += expense.Deposit - expense.amount;
    }

    totalAmountCell.textContent = totalAmount;
    totalDepositCell.textContent = totalDeposit;
});

// Add expense to table
function addExpenseToTable(expense) {
    const newRow = expensesTableBody.insertRow();
    const categoryCell = newRow.insertCell();
    const DepositCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();
    const deleteBtn = document.createElement('button');

    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', function() {
        expenses.splice(expenses.indexOf(expense), 1);
        updateLocalStorage();
        
        totalAmount -= expense.amount;
        totalDeposit -= expense.Deposit - expense.amount;
        
        totalAmountCell.textContent = totalAmount;
        totalDepositCell.textContent = totalDeposit;

        expensesTableBody.removeChild(newRow);
    });

    categoryCell.textContent = expense.category;
    DepositCell.textContent = expense.Deposit;
    amountCell.textContent = expense.amount;
    dateCell.textContent = expense.date;
    deleteCell.appendChild(deleteBtn);
}

// Add expense button click handler
addBtn.addEventListener('click', function() {
    const category = categorySelect.value;
    const Deposit = Number(DepositInput.value);
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (!category || !amount || !date) {
        alert('All fields are required!');
        return;
    }

    const expense = {category, Deposit, amount, date };
    expenses.push(expense);

    totalAmount += amount;
    totalDeposit += (Deposit - amount);
    totalAmountCell.textContent = totalAmount;
    totalDepositCell.textContent = totalDeposit;

    addExpenseToTable(expense);
    updateLocalStorage();

    // Send data to the backend
    sendDataToBackend(expense);
});

// Update localStorage with expenses data
function updateLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Export to CSV functionality
document.getElementById('export-btn').addEventListener('click', () => {
    exportTableToCSV('expenses.csv');
});

// Convert table data to CSV
function exportTableToCSV(filename) {
    var csv = [];
    var rows = document.querySelectorAll('table tr');

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        for (var j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }
        csv.push(row.join(','));
    }

    downloadCSV(csv.join('\n'), filename);
}

// Download CSV file
function downloadCSV(csv, filename) {
    var csvFile = new Blob([csv], { type: 'text/csv' });
    var downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Function to send data to the backend
async function sendDataToBackend(expense) {
    try {
        const response = await fetch('http://localhost:3000/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expense),
        });

        const result = await response.json();
        console.log('Response from server:', result);
        alert(result.message);
    } catch (error) {
        console.error('Error sending data to server:', error);
    }
}
