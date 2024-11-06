import requests
import sqlite3
from datetime import datetime
import time

def clean_text(text):
    if isinstance(text, str):
        return ''.join(c for c in text if c.isprintable())
    return text

def format_date(date_str):
    try:
        return datetime.strptime(date_str, "%b %d, %Y").strftime("%Y-%m-%d")
    except ValueError:
        return None

# Connect to SQLite database and create table if it doesn't exist
conn = sqlite3.connect('Data/gamedeveloper_blogs.db')
cursor = conn.cursor()

# Create table with indexed columns
cursor.execute('''
    CREATE TABLE IF NOT EXISTS posts (
        Title TEXT,
        Link TEXT PRIMARY KEY,
        Authors TEXT,
        Date TEXT,
        Summary TEXT,
        Thumbnail TEXT,
        TimeToRead TEXT,
        CategoryName TEXT,
        Featured BOOLEAN
    )
''')

# Add indexes on frequently queried fields
cursor.execute("CREATE INDEX IF NOT EXISTS idx_date ON posts(Date);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_title ON posts(Title);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_authors ON posts(Authors);")

# Define URLs and featured flag
sources = [
    {
        "url_template": "https://www.gamedeveloper.com/keyword/blogs?page={page_num}&_data=routes%2Fkeyword.%24slug",
        "featured": False
    },
    {
        "url_template": "https://www.gamedeveloper.com/keyword/featured-blogs?page={page_num}&_data=routes%2Fkeyword.%24slug",
        "featured": True
    }
]

# Loop through each source
for source in sources:
    page_num = 1
    consecutive_duplicate_pages = 0
    max_consecutive_duplicate_pages = 3

    while True:
        url = source["url_template"].format(page_num=page_num)
        featured = source["featured"]
        max_retries = 3
        page_has_new_data = False  # Track if the current page has at least one new post

        for attempt in range(max_retries):
            response = requests.get(url)

            if response.status_code == 200:
                data = response.json()  # Assuming the response is in JSON format

                if not data['template']['contents']:  # Stop if no posts found on this page
                    print(f"No more posts found on page {page_num}. Stopping.")
                    consecutive_duplicate_pages = max_consecutive_duplicate_pages
                    break

                for post in data['template']['contents']:
                    link = f"https://www.gamedeveloper.com{post.get('articleUrl', '')}"

                    # Check if post already exists in the database
                    cursor.execute("SELECT Featured FROM posts WHERE Link = ?", (link,))
                    existing_post = cursor.fetchone()
                    
                    if existing_post:
                        # If post exists and current source is featured, update Featured to True
                        if featured and not existing_post[0]:
                            cursor.execute("UPDATE posts SET Featured = True WHERE Link = ?", (link,))
                            print(f"Updated featured status for existing post - {link}")
                        continue  # Skip to the next post

                    # If a new post is found, reset consecutive duplicate counter and mark page as having new data
                    page_has_new_data = True

                    # Proceed to insert if no duplicate is found
                    title = clean_text(post.get('articleName', 'N/A'))
                    author = ", ".join([clean_text(contributor['name']) for contributor in post.get('contributors', [])])
                    date = format_date(post.get('date', 'N/A'))
                    summary = clean_text(post.get('articleSummary', 'N/A'))
                    thumbnail = post['thumbnail']['src'] if post.get('thumbnail') else None
                    time_to_read = post.get('timeRead', 'N/A')
                    category_name = clean_text(post.get('categoryName', 'N/A'))

                    cursor.execute('''
                        INSERT OR IGNORE INTO posts (Title, Link, Authors, Date, Summary, Thumbnail, TimeToRead, CategoryName, Featured)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (title, link, author, date, summary, thumbnail, time_to_read, category_name, featured))
                    print(f"Inserted post - {title}")

                # Check if the page had only duplicates
                if page_has_new_data:
                    consecutive_duplicate_pages = 0  # Reset the counter if this page had new data
                else:
                    consecutive_duplicate_pages += 1  # Increment if only duplicates found on this page

                print(f"Retrieved data for page {page_num}")
                time.sleep(0.5)
                page_num += 1  # Move to the next page
                break  # Break retry loop if successful
            else:
                print(f"Attempt {attempt + 1} failed for page {page_num}. Retrying in 2 seconds...")
                time.sleep(2)
                if attempt == max_retries - 1:
                    print(f"Failed to retrieve data for page {page_num} after {max_retries} attempts.")

        if consecutive_duplicate_pages >= max_consecutive_duplicate_pages:
            print(f"Stopping after {consecutive_duplicate_pages} consecutive pages with duplicates only.")
            break  # Exit while loop when consecutive duplicates exceed the threshold

# Commit changes and close the connection
conn.commit()

cursor.execute("SELECT COUNT(*) FROM posts")
total_posts = cursor.fetchone()[0]
last_scrape_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Write last scrape information to file
with open('last_scrape_info.txt', 'w') as file:
    file.write(f"Last updated on: {last_scrape_date}. Total posts in database: {total_posts}.\n")

conn.close()
print("Data saved to Data/gamedeveloper_blogs.db")
