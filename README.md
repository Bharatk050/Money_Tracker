# MoneyTracker 💰

A web-based personal finance tracker with **AI-powered insights** that helps you manage your money smartly and predict future spending using machine learning.

## Features

### Core Features
- 🔐 **User Authentication** - Secure registration and login system
- 📊 **Expense Tracking** - Track deposits and expenses by category
- 📥 **Export Data** - Download expense reports as CSV
- 🎨 **Dark Mode** - Eye-friendly theme switcher

### 🧠 Smart Financial Insights (NEW!)
- 💰 **Savings Rate Tracker** - See what % of income you're actually saving (Target: 20%+)
- 🔥 **Money Runway** - Know exactly how many days your money will last at current spending
- 🛡️ **Emergency Fund Monitor** - Track progress toward recommended 6-month emergency fund
- 📊 **Budget Utilization** - Real-time tracking of spending efficiency by category
- 📈 **Smart Budget Recommendations** - Get allocation advice based on your REMAINING balance, not just deposits
- 🎯 **Category-Based Analysis** - Automatic classification of spending as "needs" vs "wants"

### 🤖 AI Financial Advisor (NEW!)
- Personalized recommendations based on your spending patterns
- Proactive alerts when money is running low
- Smart tips for improving savings rate
- Context-aware financial advice
- Color-coded alerts (success/warning/danger)

### 📈 Predictive Analytics
- 🤖 **ML Expense Predictions** - Linear regression model predicts next 3 months of expenses
- 📉 **Visual Forecasts** - Beautiful graphs showing actual vs predicted spending
- ⚠️ **Smart Overspending Alerts** - Context-aware notifications based on spending patterns

## What Makes This Different? 🌟

Unlike simple expense trackers that just show you numbers, MoneyTracker provides **actionable insights**:

| Traditional Apps | MoneyTracker |
|------------------|--------------|
| Shows total expenses | Shows how many days your money will last |
| Generic budget percentages | Smart recommendations based on YOUR remaining balance |
| No savings tracking | Tracks savings rate with 20% target |
| Manual category analysis | Automatic needs vs wants classification |
| Basic alerts | AI-powered personalized financial advice |
| Static reports | Emergency fund progress with 6-month goal |

**Example Insights You'll Get:**
- "Your money will last 45 days at current spending" (Burn Rate)
- "You're saving 15% - try to reach 20%" (Savings Rate)
- "Emergency fund is 67% complete - keep going!" (Emergency Fund)
- "You're spending 125% of recommended wants budget" (Budget Efficiency)
- Personalized tips based on YOUR spending patterns

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: MongoDB
- **ML/Analytics**: scikit-learn, pandas, matplotlib, numpy
- **Frontend**: HTML, CSS, JavaScript
- **AI Engine**: Custom recommendation system with 8+ financial rules

## Setup Instructions

### Prerequisites

- Python 3.8+
- MongoDB account (MongoDB Atlas recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd main
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values:
     ```
     MONGODB_URI=your_mongodb_connection_string
     SECRET_KEY=your_secure_random_secret_key
     ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the app**
   - Open your browser and go to `http://localhost:5000`

## Usage

1. **Register** a new account
2. **Login** with your credentials
3. **Add expenses** by selecting category, amount, date
4. **Add deposits** to track income
5. **View analytics** on the dashboard
6. **Check predictions** to see forecasted expenses
7. **Export data** as CSV for external analysis

## Project Structure

```
main/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in git)
├── .gitignore            # Git ignore rules
├── static/               # Static assets
│   ├── script.js         # Frontend JavaScript
│   └── forecast_*.png    # Generated prediction graphs
└── templates/            # HTML templates
    ├── login.html
    ├── register.html
    └── dashboard.html
```

## Categories

- Food & Beverage
- Rent
- Transport
- Relaxing
- Travel
- Entertainment

## Security

- Passwords are hashed using Werkzeug's security utilities
- Session-based authentication
- Environment variables for sensitive data
- MongoDB authentication enabled

## License

MIT License

## Contributing

Pull requests are welcome! For major changes, please open an issue first.
