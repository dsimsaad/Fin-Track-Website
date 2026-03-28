import { dataManager } from "./db.js";
import { onAuthStateChanged, auth, db, doc, onSnapshot } from "./firebase.js";

function $(id) {
    return document.getElementById(id);
}

// Global state mirrors the dataManager cache for UI rendering
let budgetData = [];
let expenseData = [];
let incomeData = [];
let savingsData = [];
let savingsGoals = [];
let investments = [];
let debtData = { lent: [], borrowed: [] };
let marketRates = { gold_24k: 0, silver: 0, stocks: {} };

let selectedBudgetCategory = "food";
let selectedExpenseCategory = "food";
let selectedIncomeCategory = "salary";
let selectedSavingCategory = "general";
let selectedTicker = "";

// Initialize App
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user.uid);
        dataManager.init(user.uid, (data) => {
            // Update local state from db update
            budgetData = data.budgetData;
            expenseData = data.expenseData;
            incomeData = data.incomeData;
            savingsData = data.savingsData;
            savingsGoals = data.savingsGoals;
            investments = data.investments;
            debtData = data.debtData;

            renderAll();
        });

        // Listen to Market Data
        const marketDoc = doc(db, "market_rates", "latest");
        onSnapshot(marketDoc, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                marketRates = {
                    gold_24k: data.gold_24k || 0,
                    silver: data.silver || 0,
                    stocks: data.stocks || {}
                };
                renderInvestments(); // Re-render to update values
            }
        });

    } else {
        console.log("No user logged in");
        if (!window.location.href.includes("index.html") && !window.location.href.includes("signin.html") && !window.location.href.includes("signup.html")) {
            // Redirect to signin if accessing protected pages
            // window.location.href = "../html/signin.html";
        }
    }
});


// -- Budget Functions --
window.setCategory = function (category) {
    selectedBudgetCategory = category;
    const btn = $("budgetCategoryBtn");
    if (btn) btn.innerText = category.charAt(0).toUpperCase() + category.slice(1);
}

window.addBudget = function () {
    const limit = parseFloat($("budgetLimit")?.value);
    if (!limit || limit <= 0) {
        alert("Please enter a valid budget amount");
        return;
    }
    dataManager.addItem("budgetData", { category: selectedBudgetCategory, limit, spent: 0 });
    $("budgetLimit").value = "";
}

window.removeBudget = function (i) {
    if (confirm("Delete this budget?")) {
        dataManager.removeItem("budgetData", i);
    }
}

window.updateBudget = function (i) {
    const newLimit = prompt("Enter new budget amount:", budgetData[i].limit);
    if (newLimit && !isNaN(newLimit) && parseFloat(newLimit) > 0) {
        const updated = { ...budgetData[i], limit: parseFloat(newLimit) };
        dataManager.updateItem("budgetData", i, updated);
    }
}

function renderBudget() {
    const list = $("budgetList");
    if (!list) return;
    let totalBudget = 0;
    list.innerHTML = "";
    if (!budgetData || budgetData.length === 0) {
        list.innerHTML = "<p class='text-muted'>No budgets yet.</p>";
    } else {
        budgetData.forEach((b, i) => {
            totalBudget += b.limit;
            list.innerHTML += `
                <div class="border-bottom py-3">
                    <strong>${b.category.toUpperCase()}</strong><br>
                    Rs. ${b.limit}
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-success me-2" onclick="updateBudget(${i})">Update</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeBudget(${i})">Remove</button>
                    </div>
                </div>`;
        });
    }
    if ($("totalSpent")) $("totalSpent").innerText = totalBudget;
}

// -- Expense Functions --
window.setExpenseCategory = function (category) {
    selectedExpenseCategory = category;
    const btn = $("expenseDropdown");
    if (btn) btn.innerText = category.charAt(0).toUpperCase() + category.slice(1);
}

window.addExpense = function () {
    const amount = parseFloat($("expenseAmount")?.value);
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    dataManager.addItem("expenseData", { category: selectedExpenseCategory, amount });
    $("expenseAmount").value = "";
}

window.updateExpense = function (i) {
    const newAmount = prompt("Enter new amount:", expenseData[i].amount);
    if (newAmount && !isNaN(newAmount) && parseFloat(newAmount) > 0) {
        const updated = { ...expenseData[i], amount: parseFloat(newAmount) };
        dataManager.updateItem("expenseData", i, updated);
    }
}

window.removeExpense = function (i) {
    if (confirm("Delete this expense?")) {
        dataManager.removeItem("expenseData", i);
    }
}

function renderExpenses() {
    const list = $("expenseList");
    if (!list) return;
    let total = 0;
    list.innerHTML = "";
    if (!expenseData || expenseData.length === 0) {
        list.innerHTML = "<p class='text-muted'>No expenses yet.</p>";
    } else {
        expenseData.forEach((e, i) => {
            total += e.amount;
            list.innerHTML += `
                <div class="d-flex justify-content-between border-bottom py-2">
                    <div><strong>${e.category.toUpperCase()}</strong><br>Rs. ${e.amount}</div>
                    <div>
                        <button class="btn btn-sm btn-outline-success me-2" onclick="updateExpense(${i})">Update</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeExpense(${i})">Remove</button>
                    </div>
                </div>`;
        });
    }
    if ($("totalExpense")) $("totalExpense").innerText = total;
}

// -- Income Functions --
window.setIncomeCategory = function (category) {
    selectedIncomeCategory = category;
    const btn = $("incomeDropdown");
    if (btn) btn.innerText = category.charAt(0).toUpperCase() + category.slice(1);
}

window.addIncome = function () {
    const amount = parseFloat($("incomeAmount")?.value);
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    dataManager.addItem("incomeData", { source: selectedIncomeCategory, amount });
    $("incomeAmount").value = "";
}

window.updateIncome = function (i) {
    const newAmount = prompt("Enter new amount:", incomeData[i].amount);
    if (newAmount && !isNaN(newAmount) && parseFloat(newAmount) > 0) {
        const updated = { ...incomeData[i], amount: parseFloat(newAmount) };
        dataManager.updateItem("incomeData", i, updated);
    }
}

window.removeIncome = function (i) {
    if (confirm("Delete this income?")) {
        dataManager.removeItem("incomeData", i);
    }
}

function renderIncome() {
    const list = $("incomeList");
    if (!list) return;
    let total = 0;
    list.innerHTML = "";
    if (!incomeData || incomeData.length === 0) {
        list.innerHTML = "<p class='text-muted'>No income yet.</p>";
    } else {
        incomeData.forEach((inc, i) => {
            total += inc.amount;
            list.innerHTML += `
                <div class="d-flex justify-content-between border-bottom py-2">
                    <div><strong>${inc.source.toUpperCase()}</strong><br>Rs. ${inc.amount}</div>
                    <div>
                        <button class="btn btn-sm btn-outline-success me-2" onclick="updateIncome(${i})">Update</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeIncome(${i})">Remove</button>
                    </div>
                </div>`;
        });
    }
    if ($("totalIncome")) $("totalIncome").innerText = total;
}

// -- Savings Functions --
window.setSavingCategory = function (category) {
    selectedSavingCategory = category;
    const btn = $("savingCategoryBtn");
    if (btn) btn.innerText = category.charAt(0).toUpperCase() + category.slice(1);
}

window.addSaving = function () {
    const amount = parseFloat($("savingAmount")?.value);
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    dataManager.addItem("savingsData", { category: selectedSavingCategory, amount });
    $("savingAmount").value = "";
}

window.updateSaving = function (i) {
    const newAmount = prompt("Enter new amount:", savingsData[i].amount);
    if (newAmount && !isNaN(newAmount) && parseFloat(newAmount) > 0) {
        const updated = { ...savingsData[i], amount: parseFloat(newAmount) };
        dataManager.updateItem("savingsData", i, updated);
    }
}

window.removeSaving = function (i) {
    if (confirm("Delete this saving?")) {
        dataManager.removeItem("savingsData", i);
    }
}

function renderSavings() {
    const list = $("savingList");
    const totalEl = $("totalSavings");
    if (!list || !totalEl) return;
    let total = 0;
    list.innerHTML = "";
    if (!savingsData || savingsData.length === 0) {
        list.innerHTML = "<p class='text-muted'>No savings yet.</p>";
    } else {
        savingsData.forEach((s, i) => {
            total += s.amount;
            list.innerHTML += `
                <div class="d-flex justify-content-between border-bottom py-2">
                    <div><strong>${s.category.toUpperCase()}</strong><br>Rs. ${s.amount}</div>
                    <div>
                        <button class="btn btn-sm btn-outline-success me-2" onclick="updateSaving(${i})">Update</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeSaving(${i})">Remove</button>
                    </div>
                </div>`;
        });
    }
    totalEl.innerText = total;
}

window.addGoal = function () {
    const name = $("goalName")?.value;
    const target = parseFloat($("goalTarget")?.value);
    const saved = parseFloat($("goalSaved")?.value) || 0;
    if (!name || !target || target <= 0 || saved < 0) {
        alert("Please fill all fields correctly");
        return;
    }
    dataManager.addItem("savingsGoals", { name, target, saved });
    $("goalName").value = "";
    $("goalTarget").value = "";
    $("goalSaved").value = "";
}

window.addMoreToGoal = function (i) {
    const addAmount = prompt("Enter additional amount to add:");
    if (addAmount && !isNaN(addAmount) && parseFloat(addAmount) > 0) {
        const updated = { ...savingsGoals[i], saved: savingsGoals[i].saved + parseFloat(addAmount) };
        dataManager.updateItem("savingsGoals", i, updated);
    }
}

window.removeGoal = function (i) {
    if (confirm("Delete this goal?")) {
        dataManager.removeItem("savingsGoals", i);
    }
}

function renderGoals() {
    const list = $("goalList");
    if (!list) return;
    list.innerHTML = "";
    if (!savingsGoals || savingsGoals.length === 0) {
        list.innerHTML = "<p class='text-muted'>No goals yet.</p>";
        return;
    }
    savingsGoals.forEach((g, i) => {
        const percent = Math.min((g.saved / g.target) * 100, 100).toFixed(1);
        const status = percent >= 100 ? "Completed" : "In Progress";
        list.innerHTML += `
            <div class="border rounded p-3 mb-3">
                <strong>${g.name}</strong><br>
                Target: Rs. ${g.target}<br>
                Saved: Rs. ${g.saved}<br>
                Progress: ${percent}%<br>
                Status: <strong>${status}</strong>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-success me-2" onclick="addMoreToGoal(${i})">Add More</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeGoal(${i})">Remove</button>
                </div>
            </div>`;
    });
}

// -- Investments & Market Data --

// Populate ticker dropdown if exists
function renderTickerOptions() {
    const select = $("tickerSelect");
    if (!select) return;

    // Clear existing (except first)
    // select.innerHTML = '<option value="">Select a Ticker (Optional)</option>';
    // Actually better to just append.

    if (marketRates.stocks) {
        let opts = `<option value="">Select Ticker (Optional)</option>`;
        opts += `<option value="GOLD">Gold (24K)</option>`;
        opts += `<option value="SILVER">Silver</option>`;

        for (const [symbol, price] of Object.entries(marketRates.stocks)) {
            opts += `<option value="${symbol}">${symbol} (Rs. ${price})</option>`;
        }
        select.innerHTML = opts;
    }
}

window.addInvestment = function () {
    const name = $("investmentname")?.value;
    const invested = parseFloat($("investedamount")?.value);

    // Optional ticker linking
    const ticker = $("tickerSelect")?.value || "";

    if (!name || !invested || invested <= 0) {
        alert("Please fill all fields correctly");
        return;
    }

    // Initial profit is 0 unless manually set, but we are switching to calculated value
    const profit = parseFloat($("profitearned")?.value) || 0; // Legacy manual profit input

    dataManager.addItem("investments", {
        name,
        invested,
        profit,
        ticker: ticker,
        quantity: invested / (getTickerPrice(ticker) || 1) // Rough estimate if ticker used
    });

    $("investmentname").value = "";
    $("investedamount").value = "";
    if ($("profitearned")) $("profitearned").value = "";
    if ($("tickerSelect")) $("tickerSelect").value = "";
}

function getTickerPrice(ticker) {
    if (!ticker) return 0;
    if (ticker === "GOLD") return marketRates.gold_24k;
    if (ticker === "SILVER") return marketRates.silver;
    return marketRates.stocks[ticker] || 0;
}

window.addMoreProfit = function (i) {
    const addProfit = prompt("Enter additional profit (Manual Update):");
    if (addProfit && !isNaN(addProfit) && parseFloat(addProfit) > 0) {
        const updated = { ...investments[i], profit: investments[i].profit + parseFloat(addProfit) };
        dataManager.updateItem("investments", i, updated);
    }
}

window.removeInvestment = function (i) {
    if (confirm("Delete this investment?")) {
        dataManager.removeItem("investments", i);
    }
}

function renderInvestments() {
    renderTickerOptions();

    const list = $("investmentList");
    const totalEl = $("totalinvestments");
    if (!list || !totalEl) return;

    let totalInvested = 0;
    let totalCurrentValue = 0;

    list.innerHTML = "";
    if (!investments || investments.length === 0) {
        list.innerHTML = "<p class='text-muted'>No investments yet.</p>";
    } else {
        investments.forEach((inv, i) => {
            totalInvested += inv.invested;

            // Calculate current value based on ticker if available
            let currentValue = inv.invested + inv.profit;
            let isLive = false;

            if (inv.ticker) {
                const currentPrice = getTickerPrice(inv.ticker);
                if (currentPrice > 0) {
                    // Update quantity if it was missing (migration)
                    if (!inv.quantity) inv.quantity = inv.invested / currentPrice;

                    // Or actually, let's assume quantity was set on purchase. 
                    // But for simplicity in this migration, let's treat 'invested' as cost basis.
                    // If we stored quantity, we do quantity * currentPrice.
                    // If we didn't, we can't magically know.
                    // Let's rely on manual profit unless it's a new entry with quantity.

                    if (inv.quantity) {
                        currentValue = inv.quantity * currentPrice;
                        isLive = true;
                    }
                }
            }

            totalCurrentValue += currentValue;
            const profitOrLoss = currentValue - inv.invested;
            const profitPercent = inv.invested > 0 ? ((profitOrLoss / inv.invested) * 100).toFixed(1) : "0.0";
            const colorClass = profitOrLoss >= 0 ? "text-success" : "text-danger";

            list.innerHTML += `
                <div class="border rounded p-3 mb-3">
                    <div class="d-flex justify-content-between">
                         <strong>${inv.name} ${inv.ticker ? `<span class="badge bg-info">${inv.ticker}</span>` : ""}</strong>
                         <span class="${colorClass}">${profitPercent}%</span>
                    </div>
                    Invested: Rs. ${inv.invested.toFixed(2)}<br>
                    Current Value: Rs. ${currentValue.toFixed(2)} ${isLive ? "(Live)" : ""}<br>
                    Profit/Loss: <span class="${colorClass}">Rs. ${profitOrLoss.toFixed(2)}</span>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-success me-2" onclick="addMoreProfit(${i})">Adjust Manual Profit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeInvestment(${i})">Remove</button>
                    </div>
                </div>`;
        });
    }
    totalEl.innerText = totalInvested.toFixed(2);
    if ($("totalAmount")) $("totalAmount").innerText = totalCurrentValue.toFixed(2);
}

// -- Calculators --
window.calculateInvestment = function () {
    const amount = parseFloat($("invAmount")?.value);
    const rate = parseFloat($("invReturn")?.value);
    const years = parseFloat($("invTime")?.value);

    if (!amount || amount <= 0 || !rate || rate <= 0 || !years || years <= 0) {
        alert("Please enter valid values");
        return;
    }

    const profit = (amount * rate * years) / 100;
    const total = amount + profit;

    const resultDiv = $("investmentResult");
    if (resultDiv) {
        resultDiv.innerHTML = `
            <h5>Calculation Results:</h5>
            <p>Principal Amount: Rs. ${amount.toFixed(2)}</p>
            <p>Annual Return: ${rate}%</p>
            <p>Time: ${years} years</p>
            <p><strong>Total Profit: Rs. ${profit.toFixed(2)}</strong></p>
            <p><strong>Total Amount: Rs. ${total.toFixed(2)}</strong></p>
        `;
    }
}

window.calculateCompounding = function () {
    const amount = parseFloat($("cmpAmount")?.value);
    const rate = parseFloat($("cmpReturn")?.value) / 100;
    const years = parseInt($("cmpTime")?.value);
    const freq = parseInt($("cmpFreq")?.value) || 1;
    const monthly = parseFloat($("cmpMonthly")?.value) || 0;
    if (!amount || amount <= 0 || !rate || rate <= 0 || !years || years <= 0) {
        alert("Please enter valid values");
        return;
    }

    let total = amount;
    let totalInvested = amount;
    for (let year = 0; year < years; year++) {
        total *= Math.pow(1 + rate / freq, freq);
        if (monthly > 0) {
            const yearlyContribution = monthly * 12;
            total += yearlyContribution;
            totalInvested += yearlyContribution;
        }
    }

    const profit = total - totalInvested;
    const profitPercent = ((profit / totalInvested) * 100).toFixed(2);
    const resultDiv = $("compoundingResult");
    if (resultDiv) {
        resultDiv.innerHTML = `
            <h5>Compound Investment Results</h5>
            <p>Total Invested: <strong>Rs. ${totalInvested.toFixed(2)}</strong></p>
            <p>Initial Amount: Rs. ${amount.toFixed(2)}</p>
            ${monthly > 0 ? `<p>Monthly Contribution: Rs. ${monthly.toFixed(2)}</p>` : ""}
            <p>Annual Return: ${(rate * 100).toFixed(2)}%</p>
            <p>Time Period: ${years} years</p>
            <p>Compounding Frequency: ${freq === 12 ? "Monthly" : freq === 4 ? "Quarterly" : "Yearly"
            }</p>
            <hr>
            <p><strong>Total Profit: Rs. ${profit.toFixed(2)}</strong></p>
            <p><strong>Profit Percentage: ${profitPercent}%</strong></p>
            <p><strong>Final Amount: Rs. ${total.toFixed(2)}</strong></p>
        `;
    }
}

// -- Summary Functions --
function generateSummaryReport() {
    // Safety checks
    const iData = incomeData || [];
    const eData = expenseData || [];
    const sData = savingsData || [];
    const invData = investments || [];

    const totalIncome = iData.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = eData.reduce((sum, e) => sum + e.amount, 0);
    const totalSavings = sData.reduce((sum, s) => sum + s.amount, 0);
    const totalInvested = invData.reduce((sum, inv) => sum + inv.invested, 0);
    const totalAssets = totalSavings + totalInvested;

    const expenseRatio = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0;

    if ($("totalIncome")) $("totalIncome").innerText = `Rs. ${totalIncome}`;
    if ($("totalExpense")) $("totalExpense").innerText = `Rs. ${totalExpense}`;
    if ($("totalSavings")) $("totalSavings").innerText = `Rs. ${totalSavings}`;
    if ($("totalInvested")) $("totalInvested").innerText = `Rs. ${totalInvested}`;
    if ($("totalAssets")) $("totalAssets").innerText = `Rs. ${totalAssets}`;

    const incomeListHTML = iData.length
        ? iData.map(i => `<li class="list-group-item px-0 border-0 py-1">${i.source}: Rs.${i.amount}</li>`).join("")
        : "<li class='list-group-item px-0 border-0 py-1 text-muted'>No Income Data</li>";

    const expenseListHTML = eData.length
        ? eData.map(e => `<li class="list-group-item px-0 border-0 py-1">${e.category}: Rs.${e.amount}</li>`).join("")
        : "<li class='list-group-item px-0 border-0 py-1 text-muted'>No Expense Data</li>";

    const savingsListHTML = sData.length
        ? sData.map(s => `<li class="list-group-item px-0 border-0 py-1">${s.category}: Rs.${s.amount}</li>`).join("")
        : "<li class='list-group-item px-0 border-0 py-1 text-muted'>No Savings Data</li>";

    const investmentsListHTML = invData.length
        ? invData.map(inv => `<li class="list-group-item px-0 border-0 py-1">${inv.name}: Rs.${inv.invested}</li>`).join("")
        : "<li class='list-group-item px-0 border-0 py-1 text-muted'>No Investments Data</li>";

    if ($("incomeListSummary")) $("incomeListSummary").innerHTML = incomeListHTML;
    if ($("expenseListSummary")) $("expenseListSummary").innerHTML = expenseListHTML;
    if ($("savingListSummary")) $("savingListSummary").innerHTML = savingsListHTML;
    if ($("investmentListSummary")) $("investmentListSummary").innerHTML = investmentsListHTML;

    if ($("incomeProgressBar")) {
        $("incomeProgressBar").style.width = `${Math.min(expenseRatio, 100)}%`;
        $("incomeProgressBar").className = `progress-bar ${totalExpense > totalIncome ? 'bg-danger' : 'bg-success'}`;
    }
    if ($("expenseRatioText")) $("expenseRatioText").innerText = `${expenseRatio}% Spent`;
}

window.getRecommendation = async function () {
    const userInput = $("userInput").value.trim();
    if (!userInput) return;

    const chatArea = $("chatArea");

    const userContainer = document.createElement("div");
    userContainer.style.display = "flex";
    userContainer.style.justifyContent = "flex-end";
    userContainer.style.marginBottom = "15px";
    userContainer.style.width = "100%";

    userContainer.innerHTML = `<span style="background:#e2e8f0; color:#1e293b; padding: 12px 18px; border-radius:15px 15px 0px 15px; max-width: 80%; line-height: 1.5; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">${userInput}</span>`;
    chatArea.appendChild(userContainer);

    $("userInput").value = "";

    const botContainer = document.createElement("div");
    botContainer.style.display = "flex";
    botContainer.style.justifyContent = "flex-start";
    botContainer.style.marginBottom = "15px";
    botContainer.style.width = "100%";

    const botMsgDiv = document.createElement("div");
    botMsgDiv.innerHTML = `<span style="background:#f8fafc; border: 1px solid #e2e8f0; padding:12px 18px; border-radius:15px 15px 15px 0px; max-width: 80%; line-height: 1.5; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">Mark is thinking...</span>`;
    botContainer.appendChild(botMsgDiv);
    chatArea.appendChild(botContainer);

    chatArea.scrollTop = chatArea.scrollHeight;

    const apiKey = "";
    const url = ``;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are Mark. You only Give halal finance advice on expenses, savings, and simple investments, if the user asks an irrelevant question you would tell them that you can only help them with basic finances. User asks: ${userInput}` }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            botMsgDiv.innerHTML = `<span style="color:red; background:#fff1f2; padding:10px; border-radius:8px;">API Error: ${data.error.message}</span>`;
            return;
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        botMsgDiv.innerHTML = `<span style="background:#f8fafc; border: 1px solid #e2e8f0; padding:12px 18px; border-radius:15px 15px 15px 0px; max-width: 100%; display: inline-block; line-height: 1.5; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><b style="color:#059669;">Mark:</b><br>${aiResponse.replace(/\n/g, '<br>')}</span>`;

    } catch (error) {
        botMsgDiv.innerHTML = `<span style="color:orange; background:#fff7ed; padding:10px; border-radius:8px;">Connection issue. Use 'Live Server'.</span>`;
        console.log("Full error for debugging:", error);
    }
    chatArea.scrollTop = chatArea.scrollHeight;
}

function renderSummaryChart() {
    const canvas = document.getElementById("summaryChart");
    if (!canvas) return;

    if (window.summaryChartInstance) {
        window.summaryChartInstance.destroy();
    }

    // Safety
    const iData = incomeData || [];
    const eData = expenseData || [];
    const sData = savingsData || [];
    const invData = investments || [];

    const totalIncome = iData.reduce((s, i) => s + i.amount, 0);
    const totalExpense = eData.reduce((s, e) => s + e.amount, 0);
    const totalSavings = sData.reduce((s, s2) => s + s2.amount, 0);
    const totalInvested = invData.reduce((s, inv) => s + inv.invested, 0);

    window.summaryChartInstance = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Income", "Expenses", "Savings", "Investments"],
            datasets: [{
                label: "Amount (Rs)",
                data: [totalIncome, totalExpense, totalSavings, totalInvested],
                backgroundColor: "rgba(25, 135, 84, 0.7)",
                borderColor: "rgba(25, 135, 84, 1)",
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderAll() {
    renderBudget();
    renderExpenses();
    renderIncome();
    renderSavings();
    renderGoals();
    renderInvestments();
    if (debtData) renderDebt(); // New
    generateSummaryReport();
    renderSummaryChart();
}

// -- Debt Module Logic --
window.renderDebt = function () {
    renderLent();
    renderBorrowed();
    updateDebtSummary();
}

function renderLent() {
    const list = $("lentList");
    if (!list) return;
    list.innerHTML = "";
    const lent = debtData?.lent || [];

    if (lent.length === 0) {
        list.innerHTML = "<p class='text-muted'>No lent records.</p>";
        return;
    }

    lent.forEach((item, i) => {
        const remaining = item.amount - item.received;
        const statusClass = remaining <= 0 ? "text-success" : "text-warning";
        const statusText = remaining <= 0 ? "Cleared" : "Pending";

        list.innerHTML += `
            <div class="border rounded p-3 mb-3">
                <div class="d-flex justify-content-between">
                     <strong>${item.person}</strong>
                     <span class="${statusClass} fw-bold">${statusText}</span>
                </div>
                <div class="text-secondary small mt-1">Lent: Rs. ${item.amount}</div>
                <div class="text-secondary small">Received: Rs. ${item.received}</div>
                <div class="mt-2 text-danger fw-bold">Remaining: Rs. ${remaining}</div>

                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="addReceived(${i})">Add Received</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeLent(${i})">Remove</button>
                </div>
            </div>`;
    });
}

function renderBorrowed() {
    const list = $("borrowedList");
    if (!list) return;
    list.innerHTML = "";
    const borrowed = debtData?.borrowed || [];

    if (borrowed.length === 0) {
        list.innerHTML = "<p class='text-muted'>No borrowed records.</p>";
        return;
    }

    borrowed.forEach((item, i) => {
        const remaining = item.amount - item.paid;
        const statusClass = remaining <= 0 ? "text-success" : "text-warning";
        const statusText = remaining <= 0 ? "Cleared" : "Pending";

        list.innerHTML += `
             <div class="border rounded p-3 mb-3">
                <div class="d-flex justify-content-between">
                     <strong>${item.person}</strong>
                     <span class="${statusClass} fw-bold">${statusText}</span>
                </div>
                <div class="text-secondary small mt-1">Borrowed: Rs. ${item.amount}</div>
                <div class="text-secondary small">Paid: Rs. ${item.paid}</div>
                <div class="mt-2 text-danger fw-bold">Remaining: Rs. ${remaining}</div>

                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="addPaid(${i})">Add Paid</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeBorrowed(${i})">Remove</button>
                </div>
            </div>`;
    });
}

window.addLent = function () {
    const person = $("lentPerson")?.value;
    const amount = parseFloat($("lentAmount")?.value);

    if (!person || !amount || amount <= 0) return;

    dataManager.addDebtItem("lent", {
        person,
        amount,
        received: 0,
        status: "pending"
    });

    $("lentPerson").value = "";
    $("lentAmount").value = "";
}

window.addBorrowed = function () {
    const person = $("borrowedPerson")?.value;
    const amount = parseFloat($("borrowedAmount")?.value);

    if (!person || !amount || amount <= 0) return;

    dataManager.addDebtItem("borrowed", {
        person,
        amount,
        paid: 0,
        status: "pending"
    });

    $("borrowedPerson").value = "";
    $("borrowedAmount").value = "";
}

window.addReceived = function (i) {
    const amt = prompt("Enter amount received:");
    if (!amt || isNaN(amt)) return;

    const item = debtData.lent[i];
    const updated = { ...item, received: item.received + parseFloat(amt) };
    if (updated.received >= updated.amount) updated.status = "cleared";

    dataManager.updateDebtItem("lent", i, updated);
}

window.addPaid = function (i) {
    const amt = prompt("Enter amount paid:");
    if (!amt || isNaN(amt)) return;

    const item = debtData.borrowed[i];
    const updated = { ...item, paid: item.paid + parseFloat(amt) };
    if (updated.paid >= updated.amount) updated.status = "cleared";

    dataManager.updateDebtItem("borrowed", i, updated);
}

window.removeLent = function (i) {
    if (confirm("Remove this record?")) dataManager.removeDebtItem("lent", i);
}

window.removeBorrowed = function (i) {
    if (confirm("Remove this record?")) dataManager.removeDebtItem("borrowed", i);
}

function updateDebtSummary() {
    // optional total calc
}

// Initial Render
window.onload = function () {
    // Wait for auth to trigger init
    renderAll();
};



