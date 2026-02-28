import sqlite3
import datetime

db_path = r'c:\Users\KENZY\OneDrive\Desktop\brandshoppingLTD\backend\prisma\dev.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Ensure columns exist (Manual migration)
try:
    cursor.execute("ALTER TABLE Product ADD COLUMN oldPrice REAL")
except sqlite3.OperationalError:
    pass # Already exists

try:
    cursor.execute("ALTER TABLE Product ADD COLUMN category TEXT DEFAULT 'Clothing'")
except sqlite3.OperationalError:
    pass # Already exists

now = datetime.datetime.now().isoformat() + 'Z'

products = [
    ('Engin Designer Peacoat', 'Signature', 245.0, 320.0, 'Clothing', 'A luxurious, high-end peacoat for the discerning fashionista.', '/pictures/posts/pexels-enginakyurt-1642228.jpg', now, now),
    ('Lumen Silk Blouse', 'Premium', 185.0, None, 'Clothing', 'Elegant silk blouse with a smooth finish and tailored fit.', '/pictures/posts/pexels-lum3n-44775-322207.jpg', now, now)
]

try:
    cursor.executemany('''
        INSERT INTO Product (name, brand, price, oldPrice, category, description, imagePath, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', products)
    conn.commit()
    print("Successfully migrated and added new products via sqlite3.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
