# Gamasutra/GameDeveloper Developer Blog Archive

Hey there! 👋 I put together this **Gamasutra Developer Blog Archive** as a way to preserve some of the great blog content that used to live on Gamasutra. After the rebranding to GameDeveloper.com, a lot of the old links to those articles have broken and searching for the articles on gamedeveloper.com is not the easisest.
This project is a little attempt to keep those resources accessible for devs who are still looking to learn from all that shared wisdom. You'll find articles on everything from game design to programming, production, art, and beyond.

**sadly, gamedeveloper.com changed how their search works so this archive is only updated up to  2025-01-12**

What This Does
--------------

The archive lets you:

-   **Search** for posts by title, summary, or author -- to quickly find specific content.
-   **Filter by Category** -- so you can check out posts focused on a certain aspect of game development (e.g., Audio, Business).
-   **Sort** the results -- by date, title, or category, ascending or descending, however you prefer.
-   **Toggle Night Mode and Thumbnails** -- because why not

How to Use
----------
**https://rich0664.github.io/Gamasutra-Archive/ go here, click on links, search stuff, find neat things and share them with others!**

if you want to run the archive locally, change in src/index.ts
`urlPrefix: "https://rich0664.github.io/Gamasutra-Archive/Data/gamedeveloper_blogs.sqlite3."`
to 
`urlPrefix: "Data/gamedeveloper_blogs.sqlite3."`
and rebuild


Tech Stuff
----------
Mainly used **[sql.js-httpvfs](https://github.com/phiresky/sql.js-httpvfs)**  for the website side of things, hosted on github pages with a simple python script updating the database occasionally



