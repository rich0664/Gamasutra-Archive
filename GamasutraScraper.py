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
DB_NAME = "Data/gamedeveloper_blogs.sqlite3.1"
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
    Parses the Remix .data format to extract post data from the main content list.
    Filters out 'Sponsored Content' and sidebar items.
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
            elif val == "loaderData": key_map["loaderData"] = f"_{i}"
            elif val == "root": key_map["root"] = f"_{i}"
            elif val == "data": key_map["data"] = f"_{i}"
            elif val == "template": key_map["template"] = f"_{i}"
            elif val == "contents": key_map["contents"] = f"_{i}"

    def resolve_val(val, recursive=True):
        if isinstance(val, int) and 0 <= val < len(data):
            return data[val]
        if recursive and isinstance(val, dict):
            if len(val) == 1:
                k = list(val.keys())[0]
                if k.startswith("_") and isinstance(val[k], int):
                    return resolve_val(val[k], recursive=recursive)
            return {k: resolve_val(v, recursive=recursive) for k, v in val.items()}
        return val

    def get_thumbnail_url(thumb_val):
        resolved = resolve_val(thumb_val, recursive=False)
        if isinstance(resolved, int):
            resolved = resolve_val(resolved, recursive=False)
        if isinstance(resolved, str): return resolved
        if isinstance(resolved, dict):
            if '_48' in resolved:
                url_candidate = resolve_val(resolved['_48'], recursive=False)
                if isinstance(url_candidate, str) and url_candidate.startswith("http"):
                    return url_candidate
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

    # Precise Traversal
    try:
        # data[0] is usually the root map in newer Remix versions
        # We search for the dict that contains the keyword route
        loader_data = None
        for i in range(min(5, len(data))):
            item = resolve_val(i)
            if isinstance(item, dict):
                for k in item.keys():
                    res_k = resolve_val(int(k[1:])) if k.startswith("_") else k
                    if isinstance(res_k, str) and ("keyword" in res_k or "$slug" in res_k):
                        loader_data = item
                        break
            if loader_data: break

        if not loader_data:
            # Fallback to index 2 if search fails (legacy)
            loader_data = resolve_val(2)

        if not isinstance(loader_data, dict):
            return []

        # Find route data
        route_data = None
        for k, v in loader_data.items():
            resolved_k = resolve_val(int(k[1:])) if k.startswith("_") else k
            if isinstance(resolved_k, str) and ("keyword" in resolved_k or "$slug" in resolved_k):
                route_data = resolve_val(v)
                break
        
        if not route_data: return []

        # Navigate: data -> template -> contents
        data_inner = resolve_val(route_data.get(key_map.get("data", "_3")))
        if not data_inner: return []
        
        template = resolve_val(data_inner.get(key_map.get("template")))
        if not template: return []
        
        contents_indices = resolve_val(template.get(key_map.get("contents")))
        if not contents_indices or not isinstance(contents_indices, list):
            return []

        articles = []
        for idx in contents_indices:
            item = resolve_val(idx)
            if not isinstance(item, dict): continue
            
            title = resolve_val(item.get(key_map.get("Title")))
            link = resolve_val(item.get(key_map.get("Link")))
            category = resolve_val(item.get(key_map.get("CategoryName"), "N/A"), recursive=False)

            if not isinstance(title, str) or not isinstance(link, str):
                continue
                
            # Filter out Sponsored Content
            if category == "Sponsored Content" or "sponsored content" in title.lower():
                print(f"[*] Skipping Sponsored Content: {title}")
                continue

            date = resolve_val(item.get(key_map.get("Date"), "N/A"), recursive=False)
            summary = resolve_val(item.get(key_map.get("Summary"), "N/A"), recursive=False)
            thumbnail = get_thumbnail_url(item.get(key_map.get("Thumbnail")))
            time_read = resolve_val(item.get(key_map.get("TimeToRead"), "N/A"), recursive=False)
            authors = get_author_names(item.get(key_map.get("Authors")))

            articles.append({
                "Title": clean_text(title),
                "Link": BASE_URL + link if link.startswith("/") else link,
                "Authors": clean_text(authors),
                "Date": format_date(date),
                "Summary": clean_text(summary),
                "Thumbnail": thumbnail,
                "TimeToRead": str(time_read),
                "CategoryName": clean_text(category),
                "Type": source_type
            })
            
        return articles
    except Exception as e:
        print(f"[!] Error in precise traversal: {e}")
        return []

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
