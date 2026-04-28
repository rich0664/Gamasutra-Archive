import requests
import sqlite3
import re
import time
import os
import json
from datetime import datetime

# --- Configuration ---
BASE_URL = "https://www.gamedeveloper.com"
KEYWORDS = [
    {"slug": "blogs", "type": "Blog"},
    {"slug": "featured-blogs", "type": "Featured Blog"},
    {"slug": "features", "type": "Feature"}
]
DB_NAME = "Data/gamedeveloper_blogs.sqlite3.0"
INFO_FILE = "last_scrape_info.txt"
SIZE_FILE = "db_size.txt"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

def clean_text(text):
    if isinstance(text, str):
        return ''.join(c for c in text if c.isprintable())
    return text

def format_date(date_str):
    try:
        # Expected input: "Apr 24, 2026"
        return datetime.strptime(date_str, "%b %d, %Y").strftime("%Y-%m-%d")
    except ValueError:
        return date_str

def setup_db():
    """Initializes the SQLite database with the robust structure."""
    os.makedirs(os.path.dirname(DB_NAME), exist_ok=True)
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'")
    table_exists = cursor.fetchone()

    if table_exists:
        # Check if we need to migrate from Featured (bool) to Type (text)
        cursor.execute("PRAGMA table_info(posts)")
        columns = [col[1] for col in cursor.fetchall()]
        if "Featured" in columns and "Type" not in columns:
            print("[*] Migrating database: Adding 'Type' column...")
            cursor.execute("ALTER TABLE posts ADD COLUMN Type TEXT")
            # Update Type based on Featured and CategoryName hints (if possible)
            cursor.execute("UPDATE posts SET Type = 'Featured Blog' WHERE Featured = 1")
            cursor.execute("UPDATE posts SET Type = 'Blog' WHERE Featured = 0")
            # We can't easily distinguish Feature from Blog just from Featured bool, 
            # but subsequent scrapes will fix this.
    else:
        cursor.execute('''
            CREATE TABLE posts (
                Title TEXT,
                Link TEXT PRIMARY KEY,
                Authors TEXT,
                Date TEXT,
                Summary TEXT,
                Thumbnail TEXT,
                TimeToRead TEXT,
                CategoryName TEXT,
                Type TEXT
            )
        ''')
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_date ON posts(Date);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_title ON posts(Title);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_authors ON posts(Authors);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_type ON posts(Type);")
    
    conn.commit()
    return conn

def fetch_category_page(keyword, page):
    """Fetches the .data JSON for a specific keyword and page."""
    url = f"{BASE_URL}/keyword/{keyword}.data"
    if page > 1:
        url += f"?page={page}"
    
    print(f"[*] Fetching {keyword} (Page {page})...")
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"[!] Error fetching {url}: {e}")
        return None

def parse_articles(raw_json, source_type):
    """
    Parses the Remix .data format to extract full post data using robust index mapping.
    """
    try:
        data = json.loads(raw_json)
    except Exception as e:
        print(f"[!] Error decoding JSON: {e}")
        return []

    # Map keys to indices dynamically
    key_map = {}
    for i, val in enumerate(data):
        if isinstance(val, str):
            if val == "articleName": key_map["Title"] = f"_{i}"
            elif val == "articleUrl": key_map["Link"] = f"_{i}"
            elif val == "date": key_map["Date"] = f"_{i}"
            elif val == "articleSummary": key_map["Summary"] = f"_{i}"
            elif val == "thumbnail": key_map["Thumbnail"] = f"_{i}"
            elif val == "categoryName": key_map["CategoryName"] = f"_{i}"
            elif val == "timeRead": key_map["TimeToRead"] = f"_{i}"
            elif val == "contributors": key_map["Authors"] = f"_{i}"
            elif val == "name": key_map["AuthorName"] = f"_{i}"

    def resolve_val(val, recursive=True):
        if isinstance(val, int) and 0 <= val < len(data):
            return data[val]
        if recursive and isinstance(val, dict):
            # Check for de-duplicated single-key dictionary reference
            if len(val) == 1:
                k = list(val.keys())[0]
                if k.startswith("_") and isinstance(val[k], int):
                    return resolve_val(val[k], recursive=recursive)
            
            return {k: resolve_val(v, recursive=recursive) for k, v in val.items()}
            
        return val

    def get_thumbnail_url(thumb_val):
        # Initial resolution of the index/dict
        resolved = resolve_val(thumb_val, recursive=False)
        
        # If it's an index to another dict
        if isinstance(resolved, int):
            resolved = resolve_val(resolved, recursive=False)
            
        if isinstance(resolved, str): return resolved
        
        if isinstance(resolved, dict):
            # Known thumbnail keys: _48 is often the URL
            # But the value at _48 might itself be an index
            if '_48' in resolved:
                url_candidate = resolve_val(resolved['_48'], recursive=False)
                if isinstance(url_candidate, str) and url_candidate.startswith("http"):
                    return url_candidate
            
            # Recursive fallback for other fields if needed, but thumbnails are usually simple
            for v in resolved.values():
                res_v = resolve_val(v, recursive=False)
                if isinstance(res_v, str) and res_v.startswith("http"):
                    return res_v
        return "N/A"

    def get_author_names(authors_val):
        authors_list = resolve_val(authors_val)
        if not isinstance(authors_list, list):
            return "N/A"
        
        names = []
        name_key = key_map.get("AuthorName", "_61")

        for auth_idx in authors_list:
            auth_obj = resolve_val(auth_idx)
            if isinstance(auth_obj, dict) and name_key in auth_obj:
                raw_name = str(resolve_val(auth_obj[name_key]))
                clean_name = ' '.join(raw_name.split())
                names.append(clean_name)
        return ", ".join(names) if names else "N/A"

    articles = []
    
    # Iterate through all objects in the flattened array to find article candidates
    for item in data:
        if isinstance(item, dict) and key_map.get("Title") in item and key_map.get("Link") in item:
            title = resolve_val(item[key_map["Title"]])
            link = resolve_val(item[key_map["Link"]])
            
            if not isinstance(title, str) or not isinstance(link, str) or not link.startswith("/"):
                continue
                
            date = resolve_val(item.get(key_map.get("Date"), "N/A"), recursive=False)
            summary = resolve_val(item.get(key_map.get("Summary"), "N/A"), recursive=False)
            thumbnail = get_thumbnail_url(item.get(key_map.get("Thumbnail")))
            category = resolve_val(item.get(key_map.get("CategoryName"), "N/A"), recursive=False)
            time_read = resolve_val(item.get(key_map.get("TimeToRead"), "N/A"), recursive=False)
            authors = get_author_names(item.get(key_map.get("Authors")))

            full_url = BASE_URL + link

            articles.append({
                "Title": clean_text(title),
                "Link": full_url,
                "Authors": clean_text(authors),
                "Date": format_date(date),
                "Summary": clean_text(summary),
                "Thumbnail": thumbnail,
                "TimeToRead": str(time_read),
                "CategoryName": clean_text(category),
                "Type": source_type
            })

    # Deduplicate by link within the same page
    unique_found = []
    seen_links = set()
    for art in articles:
        if art['Link'] not in seen_links:
            unique_found.append(art)
            seen_links.add(art['Link'])
            
    return unique_found

def main():
    conn = setup_db()
    cursor = conn.cursor()
    
    total_new = 0
    max_consecutive_duplicate_pages = 3

    for source in KEYWORDS:
        page_num = 1
        consecutive_duplicate_pages = 0
        kw = source["slug"]
        source_type = source["type"]
        
        while True:
            raw_data = fetch_category_page(kw, page_num)
            if not raw_data:
                break
                
            found = parse_articles(raw_data, source_type)
            if not found:
                print(f"No more posts found on page {page_num}. Stopping.")
                break
                
            page_has_new_data = False
            for art in found:
                # Check if post exists
                cursor.execute("SELECT Type FROM posts WHERE Link = ?", (art['Link'],))
                existing = cursor.fetchone()
                
                if existing:
                    existing_type = existing[0]
                    # Enum priority logic: Featured Blog > Blog > Feature
                    # Actually user said: "if it's any combination of these, set it as either featured blog or blog"
                    # And: "Tiny handful of blogs that are also features but if that's the case just default it to blog or featured blog"
                    
                    type_priority = {"Featured Blog": 3, "Blog": 2, "Feature": 1}
                    
                    if type_priority.get(art['Type'], 0) > type_priority.get(existing_type, 0):
                        cursor.execute("UPDATE posts SET Type = ? WHERE Link = ?", (art['Type'], art['Link']))
                        print(f"Updated Type to {art['Type']} for - {art['Link']}")
                    continue
                
                page_has_new_data = True
                cursor.execute('''
                    INSERT INTO posts (Title, Link, Authors, Date, Summary, Thumbnail, TimeToRead, CategoryName, Type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (art['Title'], art['Link'], art['Authors'], art['Date'], art['Summary'], 
                      art['Thumbnail'], art['TimeToRead'], art['CategoryName'], art['Type']))
                print(f"Inserted post - {art['Title']}")
            
            conn.commit()
            
            if page_has_new_data:
                consecutive_duplicate_pages = 0
                print(f"Retrieved {len(found)} articles from page {page_num}")
            else:
                consecutive_duplicate_pages += 1
                print(f"Page {page_num} had only duplicates.")
                
            if consecutive_duplicate_pages >= max_consecutive_duplicate_pages:
                print(f"Stopping {kw} after {consecutive_duplicate_pages} consecutive pages with duplicates only.")
                break
                
            page_num += 1
            time.sleep(0.8) # Core Directive delay
            
    cursor.execute("SELECT COUNT(*) FROM posts")
    total_posts = cursor.fetchone()[0]
    last_scrape_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    
    with open(INFO_FILE, 'w') as file:
        file.write(f"Last updated on: {last_scrape_date}. Total posts in database: {total_posts}.\n")

    conn.close()
    
    db_size = os.path.getsize(DB_NAME)
    with open(SIZE_FILE, 'w') as file:
        file.write(str(db_size))
        
    print(f"Data saved to {DB_NAME} (Size: {db_size} bytes)")

if __name__ == "__main__":
    main()
