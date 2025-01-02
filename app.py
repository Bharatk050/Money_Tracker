import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from babel.dates import format_date
from datetime import datetime

from pymongo import MongoClient
client = MongoClient("mongodb+srv://bharat:bharat050@bharat.fi8x5.mongodb.net/?retryWrites=true&w=majority&appName=bharat")  # Replace with your MongoDB URI
db = client["Tracker"]
collection = db["Money_Tracker"]
data_retrived = []

for document in collection.find():
    data_retrived.append(document)
    # print(document)

dataset = pd.DataFrame(data_retrived)
# print(dataset)

months = []
for i in dataset['date']:
    date_object = datetime.strptime(i, "%Y-%m-%d")
    word_date = format_date(date_object, format='long', locale='en')
    month = word_date.split(' ')
    months.append(month[0])

dataset['Months'] = months



le = LabelEncoder()
dataset['category'] = le.fit_transform(dataset['category'])
dataset['Months'] = le.fit_transform(dataset['Months'])
dataset = dataset.drop(['_id', 'date'], axis=1)
# print(dataset)
scaler = StandardScaler()
df = scaler.fit_transform(dataset)

# print(pd.DataFrame(df))

X = dataset.drop(['Months'], axis= 1)
y = dataset['Months']
# print(X)
# print(y)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# print(X_train)
model = LinearRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
# y_proba = model.predict_proba(X_test)[:, 1]

mse = mean_squared_error(y_test, y_pred)
print("mse:", mse)

# # plt.scatter(X_test, y_test, color="blue", label="Actual")
# plt.plot(X_test, y_pred, color="red", label="Predicted")
# plt.title("Linear Regression Fit")
# plt.xlabel("X")
# plt.ylabel("y")
# plt.legend()
# plt.show()