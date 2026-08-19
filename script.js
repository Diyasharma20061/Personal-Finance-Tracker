let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;

const budgetInput =
    document.getElementById("budgetInput");

const setBudgetBtn =
    document.getElementById("setBudgetBtn");

const monthlyBudgetElement =
    document.getElementById("monthlyBudget");

const budgetSpentElement =
    document.getElementById("budgetSpent");

const budgetRemainingElement =
    document.getElementById("budgetRemaining");

const budgetMessage =
    document.getElementById("budgetMessage");
    const budgetProgress =
    document.getElementById("budgetProgress");
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const form = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

const transactionList = document.getElementById("transactionList");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");


// ============================
// CHART
// ============================

const chartCanvas = document.getElementById("financeChart");
const chartContext = chartCanvas.getContext("2d");

let financeChart = new Chart(chartContext, {
    type: "doughnut",

    data: {
        labels: ["Income", "Expense"],

        datasets: [{
            data: [0, 0]
        }]
    },

    options: {
        responsive: true,

        plugins: {
            legend: {
                position: "bottom"
            }
        }
    }
});


// ============================
// ADD TRANSACTION
// ============================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput.value;
    const type = typeInput.value;
    const category = categoryInput.value;

    if (description === "" || amount <= 0 || date === "") {

        alert("Please fill all transaction details.");

        return;
    }

    const transaction = {

        id: Date.now(),

        description: description,

        amount: amount,

        date: date,

        type: type,

        category: category

    };

    transactions.push(transaction);

    saveTransactions();

    updateDashboard();

    displayTransactions();

    form.reset();

});


// ============================
// SAVE DATA
// ============================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ============================
// UPDATE DASHBOARD
// ============================

function updateDashboard() {

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            totalIncome += Number(transaction.amount);

        } else {

            totalExpense += Number(transaction.amount);

        }

    });


    const balance = totalIncome - totalExpense;


    incomeElement.textContent =
        "₹" + totalIncome.toFixed(2);

    expenseElement.textContent =
        "₹" + totalExpense.toFixed(2);

    balanceElement.textContent =
        "₹" + balance.toFixed(2);


    // Update Chart

    financeChart.data.datasets[0].data = [

        totalIncome,

        totalExpense

    ];

    financeChart.update();

}


// ============================
// DISPLAY TRANSACTIONS
// ============================

function displayTransactions() {

    transactionList.innerHTML = "";


    const searchText =
        searchInput.value.toLowerCase().trim();


    const selectedCategory =
        filterCategory.value;


    const filteredTransactions =
        transactions.filter(function(transaction) {


            const description =
                transaction.description.toLowerCase();


            const matchesSearch =
                description.includes(searchText);


            const matchesCategory =
                selectedCategory === "All" ||
                transaction.category === selectedCategory;


            return matchesSearch && matchesCategory;

        });


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML =
            "<p>No matching transactions found.</p>";

        return;

    }


    filteredTransactions
        .slice()
        .reverse()
        .forEach(function(transaction) {


            const item =
                document.createElement("div");


            item.className =
                "transaction-item";


            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";
           const amountClass =
    transaction.type === "income"
        ? "income-amount"
        : "expense-amount";


            const dateText =
                transaction.date
                    ? transaction.date
                    : "No date";


            item.innerHTML = `

                <div class="transaction-info">

                    <strong>
                        ${transaction.description}
                    </strong>

                    <span class="transaction-category">
                        ${transaction.category}
                    </span>

                    <span class="transaction-category">
                        📅 ${dateText}
                    </span>

                </div>


                <div>

                    <strong class="${amountClass}">
    ${sign} ₹${Number(transaction.amount).toFixed(2)}
</strong>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">

                        Delete

                    </button>

                </div>

            `;


            transactionList.appendChild(item);

        });

}


// ============================
// DELETE TRANSACTION
// ============================

function deleteTransaction(id) {

    transactions =
        transactions.filter(function(transaction) {

            return transaction.id !== id;

        });


    saveTransactions();

    updateDashboard();

    displayTransactions();

}


// ============================
// SEARCH
// ============================

searchInput.addEventListener(
    "input",
    function() {

        displayTransactions();

    }
);


// ============================
// CATEGORY FILTER
// ============================

filterCategory.addEventListener(
    "change",
    function() {

        displayTransactions();

    }
);


// ============================
// LOAD SAVED DATA
// ============================

updateDashboard();

displayTransactions();
setBudgetBtn.addEventListener("click", function () {

    const budget = Number(budgetInput.value);

    if (budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    monthlyBudget = budget;

    localStorage.setItem(
        "monthlyBudget",
        monthlyBudget
    );

    budgetInput.value = "";

    updateBudget();

});
function updateBudget() {

    let totalSpent = 0;

    transactions.forEach(function (transaction) {

        if (transaction.type === "expense") {

            totalSpent += Number(transaction.amount);

        }

    });

    const remaining =
        monthlyBudget - totalSpent;
       let progress = 0;

if (monthlyBudget > 0) {
    progress = (totalSpent / monthlyBudget) * 100;
}

if (progress > 100) {
    progress = 100;
}

budgetProgress.style.width = progress + "%";


    monthlyBudgetElement.textContent =
        "₹" + monthlyBudget.toFixed(2);

    budgetSpentElement.textContent =
        "₹" + totalSpent.toFixed(2);

    budgetRemainingElement.textContent =
        "₹" + remaining.toFixed(2);


    if (monthlyBudget === 0) {

        budgetMessage.textContent =
            "Set your monthly budget to start tracking.";

    } else if (remaining < 0) {

        budgetMessage.textContent =
            "⚠️ Budget exceeded!";

    } else {

        budgetMessage.textContent =
            "✅ You are within your budget.";

    }

}
updateBudget();