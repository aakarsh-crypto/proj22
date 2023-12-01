const expenseForm = document.getElementById('finance-form');
const expenseTable = document.getElementById('expense-table');

expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const expenseDate = document.getElementById('expense-date').value;
  const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
  const expenseCategory = document.getElementById('expense-category').value;

  const newExpense = {
    date: expenseDate,
    amount: expenseAmount,
    category: expenseCategory
  };

  // Store expense data in localStorage
  const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  expenses.push(newExpense);
  localStorage.setItem('expenses', JSON.stringify(expenses));

  // Update expense table
  updateExpenseTable();

  // Clear form fields
  expenseForm.reset();
});

function removeExpense(removeButton) {
  const expenseRow = removeButton.parentElement.parentElement;
  const expenseIndex = expenseRow.rowIndex - 1; // Subtract 1 for table header row

  // Remove expense data from localStorage
  const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  expenses.splice(expenseIndex, 1);
  localStorage.setItem('expenses', JSON.stringify(expenses));

  // Remove expense row from table
  expenseTable.removeChild(expenseRow);
}

function updateExpenseTable() {
  const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

  // Clear existing table rows
  expenseTable.innerHTML = '';

  // Add new table rows for each expense
  expenses.forEach((expense, index) => {
    const newExpenseRow = document.createElement('tr');
    newExpenseRow.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.amount}</td>
      <td>${expense.category}</td>
      <td>
        <button onclick="removeExpense(this)">Remove</button>
      </td>
    `;

    expenseTable.appendChild(newExpenseRow);
  });
}

// Load initial expenses from localStorage and update table
updateExpenseTable();

const exportButton = document.getElementById('export-button');

exportButton.addEventListener('click', () => {
  // Export expense data to S3
  const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  const csvData = expenses.map((expense) => {
    return `${expense.date},${expense.amount},${expense.category}`;
  }).join('\n');

  // Upload CSV data to S3 using the S3 client
  const s3 = new S3({
    region: 'us-east-1', // Replace with your S3 bucket's region
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  });

  const params = {
    Bucket: 'YOUR_S3_BUCKET_NAME', // Replace with your S3 bucket name
    Key: 'expense_data.csv',
    Body: csvData,
    ContentType: 'text/csv',
  };

  s3.putObject(params, (err) => {
    if (err) {
      console.error('Error uploading data to S3:', err);
    } else {
      console.log('Data successfully uploaded to S3');
    }
  });
});
