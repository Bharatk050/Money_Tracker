from flask import Flask, render_template, request, redirect, session, url_for, jsonify
from pymongo import MongoClient
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from collections import defaultdict
from datetime import datetime
import os
import time
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
import base64
from io import BytesIO

app = Flask(__name__)

# Load environment variables
load_dotenv()
app.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key-for-development")
MONGODB_URI = os.getenv("MONGODB_URI")

# MongoDB connections
client = MongoClient(MONGODB_URI)
login_db = client['loginDB']
users_collection = login_db['users']

expense_db = client['dataDB']
expense_collection = expense_db['usersdata']

# Cache buster for static files
@app.context_processor
def inject_cache_buster():
    return {'cache_bust': int(time.time())}

# Home
@app.route('/')
def home():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

# Register
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']

        if users_collection.find_one({"email": email}):
            return render_template('register.html', error='User already exists')

        hashed_pw = generate_password_hash(password)
        users_collection.insert_one({
            "name": name,
            "email": email,
            "password": hashed_pw
        })
        return redirect(url_for('login'))

    return render_template('register.html')

# Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = users_collection.find_one({"email": email})
        if user and check_password_hash(user['password'], password):
            session['user'] = user['name']
            return redirect(url_for('dashboard'))

        return render_template('login.html', error='Invalid email or password')

    return render_template('login.html')

# Logout
@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

# Dashboard
@app.route('/dashboard')
def dashboard():
    user_name = session.get('user')
    if not user_name:
        return redirect(url_for('login'))

    expenses = list(expense_collection.find({"user": user_name}))
    total_expense = sum(e.get("amount", 0) for e in expenses)
    total_deposit = sum(e.get("Deposit", 0) for e in expenses)

    # Calculate ACTUAL available balance
    current_balance = total_deposit - total_expense
    
    # Smart Budget Allocation based on REMAINING BALANCE (not total deposits)
    # This tells users how much they SHOULD allocate from what they have LEFT
    if current_balance > 0:
        # Recommended allocation for remaining money
        needs = current_balance * 0.50  # 50% for essential expenses
        wants = current_balance * 0.30  # 30% for lifestyle
        savings = current_balance * 0.20  # 20% for savings/emergency fund
    else:
        needs = wants = savings = 0
    
    # Calculate category-based actual spending
    needs_categories = ['Rent', 'Food & Beverage', 'Healthcare', 'Transport', 'Education']
    wants_categories = ['Entertainment', 'Shopping', 'Travel', 'Relaxing', 'Other']
    
    actual_needs_spent = sum(e.get("amount", 0) for e in expenses if e.get("category") in needs_categories)
    actual_wants_spent = sum(e.get("amount", 0) for e in expenses if e.get("category") in wants_categories)
    actual_savings = current_balance  # What's left is potential savings

    return render_template("dashboard.html",
                           user_name=user_name,
                           needs=round(needs, 2),
                           wants=round(wants, 2),
                           savings=round(savings, 2),
                           total_deposit=round(total_deposit, 2),
                           total_expense=round(total_expense, 2),
                           actual_needs_spent=round(actual_needs_spent, 2),
                           actual_wants_spent=round(actual_wants_spent, 2),
                           current_balance=round(current_balance, 2))

# Add/Get Expenses
@app.route("/expenses", methods=["GET", "POST"])
def handle_expenses():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if request.method == "POST":
        data = request.get_json()
        data["user"] = user
        inserted = expense_collection.insert_one(data)
        return jsonify({"message": "Expense saved", "id": str(inserted.inserted_id)})

    expenses = list(expense_collection.find({"user": user}))
    for e in expenses:
        e["_id"] = str(e["_id"])
    return jsonify(expenses)

# Delete Expense
@app.route("/expenses/<expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    user = session.get("user")
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    result = expense_collection.delete_one({"_id": ObjectId(expense_id), "user": user})
    return jsonify({"message": "Deleted" if result.deleted_count else "Not found"})

# Budget Summary API
@app.route("/budget-summary")
def budget_summary():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    expenses = list(expense_collection.find({"user": user}))
    total_expense = sum(e.get("amount", 0) for e in expenses)
    total_deposit = sum(e.get("Deposit", 0) for e in expenses)

    # Calculate ACTUAL available balance
    current_balance = total_deposit - total_expense
    
    # Smart Budget Allocation based on REMAINING BALANCE
    if current_balance > 0:
        needs = current_balance * 0.50
        wants = current_balance * 0.30
        savings = current_balance * 0.20
    else:
        needs = wants = savings = 0
    
    # Calculate category-based actual spending
    needs_categories = ['Rent', 'Food & Beverage', 'Healthcare', 'Transport', 'Education']
    wants_categories = ['Entertainment', 'Shopping', 'Travel', 'Relaxing', 'Other']
    
    actual_needs_spent = sum(e.get("amount", 0) for e in expenses if e.get("category") in needs_categories)
    actual_wants_spent = sum(e.get("amount", 0) for e in expenses if e.get("category") in wants_categories)
    
    # Calculate savings rate (what percentage of income is saved)
    savings_rate = (current_balance / total_deposit * 100) if total_deposit > 0 else 0
    
    # Calculate burn rate (days until money runs out based on average daily spending)
    if total_expense > 0 and len(expenses) > 0:
        dates = [datetime.strptime(e["date"], "%Y-%m-%d") for e in expenses if "date" in e]
        if dates:
            days_tracked = (max(dates) - min(dates)).days + 1
            avg_daily_expense = total_expense / days_tracked if days_tracked > 0 else 0
            # Only calculate days remaining if balance is positive
            if current_balance > 0 and avg_daily_expense > 0:
                days_remaining = current_balance / avg_daily_expense
            elif current_balance <= 0:
                days_remaining = 0  # Money already ran out
            else:
                days_remaining = float('inf')
        else:
            avg_daily_expense = 0
            days_remaining = float('inf')
    else:
        avg_daily_expense = 0
        days_remaining = float('inf')
    
    # Calculate monthly average expenses
    monthly_data = defaultdict(lambda: {'deposit': 0, 'expense': 0})
    category_data = defaultdict(lambda: 0)

    for e in expenses:
        try:
            month = datetime.strptime(e["date"], "%Y-%m-%d").strftime("%Y-%m")
        except:
            continue

        monthly_data[month]['deposit'] += e.get("Deposit", 0)
        monthly_data[month]['expense'] += e.get("amount", 0)
        category = e.get("category", "Other")
        category_data[category] += e.get("amount", 0)
    
    # Calculate average monthly expense for emergency fund recommendation
    if len(monthly_data) > 0:
        avg_monthly_expense = sum(m['expense'] for m in monthly_data.values()) / len(monthly_data)
        emergency_fund_target = avg_monthly_expense * 6  # 6 months of expenses
    else:
        avg_monthly_expense = 0
        emergency_fund_target = 0
    
    # Calculate spending efficiency
    recommended_needs_budget = total_deposit * 0.50
    recommended_wants_budget = total_deposit * 0.30
    
    needs_efficiency = (actual_needs_spent / recommended_needs_budget * 100) if recommended_needs_budget > 0 else 0
    wants_efficiency = (actual_wants_spent / recommended_wants_budget * 100) if recommended_wants_budget > 0 else 0
    
    # Calculate emergency fund progress BEFORE using it in recommendations
    emergency_fund_progress = (current_balance / emergency_fund_target * 100) if emergency_fund_target > 0 else 0
    
    # Generate personalized recommendations
    recommendations = []
    
    if savings_rate < 10:
        recommendations.append({
            "type": "warning",
            "icon": "exclamation-triangle",
            "message": "Your savings rate is low. Try to save at least 20% of your income.",
            "action": "Cut back on non-essential spending"
        })
    elif savings_rate >= 30:
        recommendations.append({
            "type": "success",
            "icon": "check-circle",
            "message": "Excellent savings rate! You're building wealth effectively.",
            "action": "Consider investing your surplus"
        })
    
    if days_remaining < 30 and days_remaining > 0:
        recommendations.append({
            "type": "danger",
            "icon": "fire",
            "message": f"Warning: Your money will run out in {days_remaining:.0f} days at current spending.",
            "action": "Reduce expenses immediately"
        })
    
    if current_balance < 0:
        recommendations.append({
            "type": "danger",
            "icon": "exclamation-circle",
            "message": "You're overspending! Your balance is negative.",
            "action": "Stop non-essential purchases"
        })
    
    if emergency_fund_progress < 50:
        recommendations.append({
            "type": "info",
            "icon": "shield-alt",
            "message": "Build your emergency fund to 6 months of expenses for financial security.",
            "action": f"Target: ₹{emergency_fund_target:.2f}"
        })
    elif emergency_fund_progress >= 100:
        recommendations.append({
            "type": "success",
            "icon": "shield-alt",
            "message": "Great! Your emergency fund is fully funded.",
            "action": "You're financially secure"
        })
    
    if wants_efficiency > 100:
        recommendations.append({
            "type": "warning",
            "icon": "shopping-cart",
            "message": "You're overspending on wants (entertainment, shopping, travel).",
            "action": "Reduce lifestyle expenses by 20%"
        })
    
    if needs_efficiency > 100:
        recommendations.append({
            "type": "warning",
            "icon": "home",
            "message": "Your essential expenses are too high relative to income.",
            "action": "Look for ways to reduce bills or increase income"
        })
    
    # Add positive reinforcement if doing well
    if savings_rate >= 20 and wants_efficiency <= 100 and needs_efficiency <= 100:
        recommendations.append({
            "type": "success",
            "icon": "trophy",
            "message": "Excellent financial management! Keep up the great work.",
            "action": "You're on track to financial freedom"
        })

    return jsonify({
        "total_expense": round(total_expense, 2),
        "total_deposit": round(total_deposit, 2),
        "current_balance": round(current_balance, 2),
        "needs": round(needs, 2),
        "wants": round(wants, 2),
        "savings": round(savings, 2),
        "actual_needs_spent": round(actual_needs_spent, 2),
        "actual_wants_spent": round(actual_wants_spent, 2),
        "savings_rate": round(savings_rate, 2),
        "burn_rate_days": round(days_remaining, 1) if days_remaining != float('inf') else 0,
        "avg_daily_expense": round(avg_daily_expense, 2),
        "emergency_fund_target": round(emergency_fund_target, 2),
        "emergency_fund_progress": round(emergency_fund_progress, 1),
        "needs_efficiency": round(needs_efficiency, 1),
        "wants_efficiency": round(wants_efficiency, 1),
        "recommendations": recommendations,
        "monthly_data": monthly_data,
        "category_data": category_data
    })

# Enhanced ML Prediction with Interactive Monthly Analysis
@app.route("/predict-expense")
def predict_expense():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        expenses = list(expense_collection.find({"user": user}))
        
        if len(expenses) < 2:
            return jsonify({
                "success": False,
                "message": "Add at least 2 months of data for predictions"
            })

        # Prepare monthly data with deposits too
        monthly_data = defaultdict(lambda: {"expense": 0, "deposit": 0, "transactions": 0})
        
        for e in expenses:
            try:
                month_key = datetime.strptime(e["date"], "%Y-%m-%d").strftime("%Y-%m")
                monthly_data[month_key]["expense"] += e.get("amount", 0)
                monthly_data[month_key]["deposit"] += e.get("Deposit", 0)
                monthly_data[month_key]["transactions"] += 1
            except:
                continue

        if len(monthly_data) < 2:
            return jsonify({
                "success": False,
                "message": "Need at least 2 months of data"
            })

        # Sort by month
        sorted_months = sorted(monthly_data.keys())
        
        # Prepare training data
        expenses_amounts = [monthly_data[m]["expense"] for m in sorted_months]
        deposits_amounts = [monthly_data[m]["deposit"] for m in sorted_months]
        
        # Create X (month indices) for training
        X_train = np.array(range(len(expenses_amounts))).reshape(-1, 1)
        y_train_expense = np.array(expenses_amounts)
        y_train_deposit = np.array(deposits_amounts)

        # Train Linear Regression model for expenses
        expense_model = LinearRegression()
        expense_model.fit(X_train, y_train_expense)
        
        # Train model for deposits (income prediction)
        deposit_model = LinearRegression()
        deposit_model.fit(X_train, y_train_deposit)
        
        # Calculate model performance metrics
        from sklearn.metrics import r2_score, mean_absolute_error
        
        expense_predictions_train = expense_model.predict(X_train)
        r2 = r2_score(y_train_expense, expense_predictions_train)
        mae = mean_absolute_error(y_train_expense, expense_predictions_train)
        
        # Predict next 3-6 months
        num_future_months = 6
        future_X = np.array(range(len(expenses_amounts), len(expenses_amounts) + num_future_months)).reshape(-1, 1)
        
        future_expenses = expense_model.predict(future_X)
        future_deposits = deposit_model.predict(future_X)
        
        # Ensure predictions are not negative
        future_expenses = np.maximum(future_expenses, 0)
        future_deposits = np.maximum(future_deposits, 0)
        
        # Calculate confidence intervals (simple approach using standard deviation)
        std_expense = np.std(y_train_expense)
        confidence_margin = std_expense * 1.5  # 1.5 standard deviations
        
        # Generate future month names
        from dateutil.relativedelta import relativedelta
        last_month_date = datetime.strptime(sorted_months[-1] + "-01", "%Y-%m-%d")
        future_month_labels = []
        
        for i in range(1, num_future_months + 1):
            future_date = last_month_date + relativedelta(months=i)
            future_month_labels.append(future_date.strftime("%b %Y"))
        
        # Format historical month labels
        historical_labels = [datetime.strptime(m + "-01", "%Y-%m-%d").strftime("%b %Y") 
                           for m in sorted_months]
        
        # Calculate average growth rate
        if len(expenses_amounts) > 1:
            growth_rate = ((expenses_amounts[-1] - expenses_amounts[0]) / expenses_amounts[0] * 100) if expenses_amounts[0] > 0 else 0
        else:
            growth_rate = 0
        
        # Prepare response data for interactive chart
        response_data = {
            "success": True,
            "historical": {
                "months": historical_labels,
                "expenses": [round(x, 2) for x in expenses_amounts],
                "deposits": [round(x, 2) for x in deposits_amounts],
                "balance": [round(deposits_amounts[i] - expenses_amounts[i], 2) 
                          for i in range(len(expenses_amounts))]
            },
            "predictions": {
                "months": future_month_labels,
                "expenses": [round(x, 2) for x in future_expenses],
                "deposits": [round(x, 2) for x in future_deposits],
                "balance": [round(future_deposits[i] - future_expenses[i], 2) 
                          for i in range(len(future_expenses))],
                "confidence_upper": [round(x + confidence_margin, 2) for x in future_expenses],
                "confidence_lower": [round(max(0, x - confidence_margin), 2) for x in future_expenses]
            },
            "statistics": {
                "accuracy": round(r2 * 100, 1),  # R² as percentage
                "avg_error": round(mae, 2),
                "avg_monthly_expense": round(np.mean(expenses_amounts), 2),
                "avg_monthly_deposit": round(np.mean(deposits_amounts), 2),
                "trend": "increasing" if growth_rate > 5 else "decreasing" if growth_rate < -5 else "stable",
                "growth_rate": round(growth_rate, 1)
            },
            "insights": []
        }
        
        # Generate AI insights
        avg_expense = np.mean(expenses_amounts)
        predicted_avg = np.mean(future_expenses)
        
        if predicted_avg > avg_expense * 1.2:
            response_data["insights"].append({
                "type": "warning",
                "message": f"Expenses predicted to increase by {round((predicted_avg/avg_expense - 1)*100, 0)}%",
                "icon": "arrow-up"
            })
        elif predicted_avg < avg_expense * 0.8:
            response_data["insights"].append({
                "type": "success",
                "message": f"Expenses predicted to decrease by {round((1 - predicted_avg/avg_expense)*100, 0)}%",
                "icon": "arrow-down"
            })
        else:
            response_data["insights"].append({
                "type": "info",
                "message": "Expenses expected to remain stable",
                "icon": "minus"
            })
        
        # Check if any future month will be overspending
        for i, (exp, dep) in enumerate(zip(future_expenses, future_deposits)):
            if exp > dep:
                response_data["insights"].append({
                    "type": "danger",
                    "message": f"⚠️ {future_month_labels[i]}: Predicted overspending by ₹{round(exp - dep, 0)}",
                    "icon": "exclamation-triangle"
                })
                break
        
        return jsonify(response_data)

    except Exception as e:
        print(f"Error in prediction: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Failed to generate prediction",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
