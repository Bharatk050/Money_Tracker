# 🚀 Money Tracker - Setup & Usage Guide

## 📦 Complete Setup Instructions

### **Step 1: Install Dependencies**

```bash
# Navigate to project directory
cd "d:\WorkSpace\X_Projects\Money Tracker\project\main"

# Activate virtual environment
.\venv\Scripts\activate

# Install all requirements (including new ML packages)
pip install -r requirements.txt
```

**New Dependencies Added:**
- `numpy` - For numerical calculations
- `python-dateutil` - For month calculations in ML predictions
- Chart.js 4.4.0 (loaded via CDN, no installation needed)

---

### **Step 2: Run the Application**

```bash
# Make sure virtual environment is activated
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### **Step 3: Access the Dashboard**

Open your browser and navigate to:
```
http://localhost:5000
```

---

## 💡 How to Use the Enhanced ML Features

### **Getting Started with Predictions**

#### **Minimum Requirements:**
- ✅ At least **2 months** of transaction data
- ✅ Transactions with dates in different months
- ✅ Mix of expenses and deposits

#### **Recommended for Best Results:**
- ✅ **3-6 months** of data
- ✅ Regular transaction entries
- ✅ Accurate dates and amounts

---

### **Step-by-Step Usage**

#### **1. Add Historical Data**

**Example Month 1 (October 2024):**
```
Date: 2024-10-05
Category: Food & Beverage
Deposit: 30,000 (salary)
Expense: 0

Date: 2024-10-10
Category: Rent
Deposit: 0
Expense: 12,000

Date: 2024-10-15
Category: Shopping
Deposit: 0
Expense: 3,500
```

**Example Month 2 (November 2024):**
```
Date: 2024-11-05
Category: Food & Beverage
Deposit: 32,000 (salary)
Expense: 0

Date: 2024-11-10
Category: Rent
Deposit: 0
Expense: 12,000

Date: 2024-11-20
Category: Entertainment
Deposit: 0
Expense: 2,800
```

#### **2. View Interactive Predictions**

Once you have data from 2+ months:

1. Scroll to **"AI Expense Prediction & Monthly Analysis"** section
2. You'll see:
   - **ML Statistics**: Accuracy, Average Expense, Trend
   - **AI Insights**: Smart recommendations
   - **Interactive Chart**: Hover over any point for details

#### **3. Interact with the Chart**

**Hover Features:**
- Hover over any data point to see exact amounts
- Tooltips show: Month, Expense, Deposit values

**Legend Interaction:**
- Click legend items to show/hide data series
- Example: Hide "Actual Deposits" to focus on expenses

**Visual Elements:**
- 🔴 Red solid line = Your actual expenses
- 🟣 Purple dashed line = Predicted expenses
- 🟢 Green solid line = Your actual deposits
- 🟢 Green dashed line = Predicted deposits
- 🟣 Shaded area = Confidence range (uncertainty)

---

## 📊 Understanding Your Dashboard

### **Top Section: Key Metrics**

```
┌─────────────────────────────────────────────────────┐
│  Total Deposit    Total Expenses    Balance         │
│     ₹45,000          ₹28,000        ₹17,000 🟢      │
└─────────────────────────────────────────────────────┘
```

### **Budget Allocation Cards**

```
┌──────────────────────────────────────────────┐
│  Allocate for Needs (50%)      ₹8,500        │
│  💡 Recommended from your balance            │
├──────────────────────────────────────────────┤
│  Allocate for Wants (30%)      ₹5,100        │
│  💡 Recommended from your balance            │
├──────────────────────────────────────────────┤
│  Keep as Savings (20%)         ₹3,400        │
│  💡 Recommended from your balance            │
└──────────────────────────────────────────────┘
```

### **Smart Financial Metrics**

```
┌──────────────────────────────────────────────────┐
│  💰 Savings Rate        🔥 Money Runway          │
│     24% 🟢                45 days 🟡            │
│  Target: 20%+            At current spending    │
├──────────────────────────────────────────────────┤
│  🛡️ Emergency Fund      📊 Budget Utilization    │
│     67% 🟡                95% 🟢                 │
│  Goal: 6 months         Ideal: ≤100%            │
└──────────────────────────────────────────────────┘
```

### **AI Financial Advisor**

```
┌────────────────────────────────────────────────────┐
│  ✅ Excellent savings rate! You're building       │
│     wealth effectively.                            │
├────────────────────────────────────────────────────┤
│  ⚠️ Your money will last 45 days at current       │
│     spending. Good, but aim for 90+ days.         │
├────────────────────────────────────────────────────┤
│  ℹ️  Build your emergency fund to 6 months of     │
│     expenses. Target: ₹72,000                      │
└────────────────────────────────────────────────────┘
```

### **ML Prediction Section**

```
┌────────────────────────────────────────────────────┐
│  Model Accuracy    Avg Monthly     Trend           │
│      87.5%          ₹12,450       📈 increasing    │
├────────────────────────────────────────────────────┤
│  📈 Expenses predicted to increase by 15%         │
│  ⚠️  Dec 2025: Predicted overspending by ₹2,500   │
├────────────────────────────────────────────────────┤
│  [Interactive Chart Showing 6-Month Forecast]     │
│   - Actual vs Predicted Expenses                  │
│   - Actual vs Predicted Deposits                  │
│   - Confidence Range (Uncertainty)                │
└────────────────────────────────────────────────────┘
```

---

## 🎯 Real-World Examples

### **Example 1: Planning for Big Expense**

**Situation:**
- Current balance: ₹25,000
- Prediction shows: Next month expense ₹18,000
- Want to buy laptop: ₹30,000

**What Dashboard Shows:**
```
💰 Savings Rate: 18% 🟡
🔥 Money Runway: 42 days 🟡
Chart: Predicted Dec expense = ₹18,000
Insight: "Expenses expected to remain stable"
```

**Action Plan:**
1. Current balance covers 1 month + some savings
2. Need ₹30k for laptop but have ₹25k
3. Wait 1 month + save ₹5k more
4. Dashboard predicts you'll have ₹32k next month ✅

---

### **Example 2: Detecting Overspending Trend**

**Situation:**
- Past 3 months: ₹10k → ₹12k → ₹14k

**What Dashboard Shows:**
```
📊 Trend: 📈 increasing
Growth Rate: 20%
Prediction: Next month ₹16,000
Insight: "⚠️ Expenses predicted to increase by 20%"
```

**Action:**
1. Review spending categories
2. Cut non-essential wants by 20%
3. Target back to ₹12k/month
4. Monitor chart next month

---

### **Example 3: Building Emergency Fund**

**Situation:**
- Monthly expense: ₹12,000
- Emergency fund target: ₹72,000 (6 months)
- Current balance: ₹35,000

**What Dashboard Shows:**
```
🛡️ Emergency Fund: 48.6% 🟡
Goal: ₹72,000
Need: ₹37,000 more
Recommendation: "Build your emergency fund..."
```

**Action:**
1. Need ₹37k more
2. Save ₹6k per month
3. Reach goal in 6 months
4. Dashboard tracks progress automatically

---

## 🔍 Troubleshooting

### **Issue 1: Chart Not Showing**

**Symptom:** Placeholder message appears

**Causes:**
- ❌ Less than 2 months of data
- ❌ All transactions in same month
- ❌ No transactions at all

**Solution:**
```
1. Add transactions from October
2. Add transactions from November
3. Refresh page
4. Chart should appear! ✅
```

---

### **Issue 2: Balance Shows Zero**

**Symptom:** Balance always shows ₹0

**Solution:**
- ✅ Enter amount in **Deposit** field (not Expense)
- ✅ Leave Expense field empty when adding money
- ✅ Click "Add Transaction"
- ✅ Balance should update immediately

**Correct Form Entry:**
```
Date: [2024-10-28]
Deposit: [5000]      ← Enter here!
Expense: [Leave empty or 0]
Category: [Any category]
```

---

### **Issue 3: Low ML Accuracy (<70%)**

**Symptom:** "Model Accuracy: 55%"

**Causes:**
- Inconsistent spending patterns
- Only 2 months of data
- Missing many transactions

**Solution:**
1. Add more months of data (aim for 3-6 months)
2. Record all transactions consistently
3. Accuracy will improve with more data

---

### **Issue 4: Predictions Seem Wrong**

**Symptom:** Predicted amounts don't match reality

**Causes:**
- Major life change (new job, moved cities)
- Seasonal variation (holidays, festivals)
- Incomplete historical data

**Solution:**
1. Check if all past transactions are recorded
2. Model learns from YOUR data
3. More consistent data = better predictions
4. After 3-6 months, predictions become very accurate

---

## 📱 Mobile Usage

The dashboard is fully responsive:

**Desktop:** Full charts and all features
**Tablet:** Optimized layout
**Mobile:** Vertical layout with touch-friendly controls

---

## 🎓 Best Practices

### **Data Entry**
✅ Record transactions immediately
✅ Use accurate dates
✅ Categorize correctly (Rent = Need, Shopping = Want)
✅ Include all expenses (even small ones)

### **Regular Review**
✅ Check dashboard weekly
✅ Review AI recommendations
✅ Adjust budget based on predictions
✅ Track progress toward goals

### **Financial Planning**
✅ Aim for 20%+ savings rate
✅ Build 6-month emergency fund
✅ Keep burn rate above 90 days
✅ Stay within budget (≤100% utilization)

---

## 🎉 Success Metrics

You're doing great if you see:

```
✅ Savings Rate: 20%+ (Green)
✅ Money Runway: 90+ days (Green)
✅ Emergency Fund: 100% (Green)
✅ Budget Utilization: ≤100% (Green)
✅ AI Advisor: "Excellent financial management!"
```

---

## 📞 Quick Reference

### **Add Money (Deposit)**
```
Deposit: [Amount]
Expense: [Leave empty]
```

### **Add Expense**
```
Deposit: [Leave empty]
Expense: [Amount]
```

### **View Predictions**
```
Scroll down → "AI Expense Prediction"
→ See 6-month forecast
```

### **Export Data**
```
Click "Export CSV" button
→ Download all transactions
```

---

## 🚀 You're All Set!

Your Money Tracker now has:
- ✅ Smart budget formulas
- ✅ AI financial advisor
- ✅ Interactive ML predictions
- ✅ 6-month forecasts
- ✅ Real-time insights

**Start adding transactions and watch the magic happen!** 💰✨

---

**Need Help?** Check the documentation files:
- `FORMULA_IMPROVEMENTS_SUMMARY.md` - Budget formula details
- `ML_PREDICTION_FEATURES.md` - ML system details
- `CHANGELOG.md` - Complete change history

