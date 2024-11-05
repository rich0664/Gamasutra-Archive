import pandas as pd
import sqlite3

# Load the Excel file
excel_file = "gamedeveloper_blogs.xlsx"  # Replace with your Excel file name
sheet_name = "Sheet1"  # Replace with your sheet name if different

# Read the sheet into a DataFrame
df = pd.read_excel(excel_file, sheet_name=sheet_name)

# Connect to SQLite (or create it if it doesn't exist)
conn = sqlite3.connect("gamasutra.db")  # Replace with your database name
cursor = conn.cursor()

# Convert DataFrame to SQLite table
table_name = "posts"  # Replace with your desired table name
df.to_sql(table_name, conn, if_exists="replace", index=False)

# Commit changes and close connection
conn.commit()
conn.close()

print(f"Data successfully written to {table_name} in your_database.db")
