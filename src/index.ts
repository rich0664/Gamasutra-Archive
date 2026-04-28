import { createDbWorker } from "sql.js-httpvfs";

// Define worker and WebAssembly URLs
const workerUrl = new URL("sql.js-httpvfs/dist/sqlite.worker.js", import.meta.url);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

// Pagination controls
let offset = 0; // Track the current offset for pagination
const limit = 20; // Posts per "page" or scroll event

// UI Elements: Preference Toggles
const nightModeToggle = document.getElementById("nightModeToggle") as HTMLInputElement;
const thumbnailToggle = document.getElementById("thumbnailToggle") as HTMLInputElement;


// Load saved preferences for night mode and thumbnails on page load
document.addEventListener("DOMContentLoaded", () => {
    const nightMode = localStorage.getItem("nightMode") === "true";
    document.body.classList.toggle("dark-mode", nightMode);
    nightModeToggle.checked = nightMode;

    const showThumbnails = localStorage.getItem("showThumbnails") === "true";
    thumbnailToggle.checked = showThumbnails;
});

// Toggle night mode and save to localStorage
nightModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", nightModeToggle.checked);
    localStorage.setItem("nightMode", String(nightModeToggle.checked));
});
// Toggle the About section on mobile
function toggleAbout() {
    const aboutSection = document.getElementById("aboutSection");
    const aboutToggle = document.getElementById("aboutToggle") as HTMLButtonElement;

    if (aboutSection && aboutToggle) {
        const isVisible = aboutSection.style.display === "block";
        aboutSection.style.display = isVisible ? "none" : "block";
        
        // Update button text based on the visibility of aboutSection
        aboutToggle.textContent = isVisible ? "About" : "Hide";
    }
}

// Expose toggleAbout to the global window object
(window as any).toggleAbout = toggleAbout;

// UI Elements: Date Range and Filter Toggles
const startDateInput = document.getElementById("startDate") as HTMLInputElement;
const endDateInput = document.getElementById("endDate") as HTMLInputElement;
const dateToggle = document.getElementById("dateToggle") as HTMLButtonElement;
const dateDropdown = document.getElementById("dateDropdown") as HTMLElement;
const dateOptions = document.getElementById("dateOptions") as HTMLElement;

// Load last scrape info and display in header
fetch("last_scrape_info.txt")
    .then(response => response.text())
    .then(text => {
        const header = document.getElementById("aboutSection");
        if (header) {
            const scrapeInfo = document.createElement("p");
            scrapeInfo.textContent = text;
            header.appendChild(scrapeInfo);
        }
    })
    .catch(error => console.error("Failed to load last scrape info:", error));

// Initialize database worker for querying posts
// Initialize database worker for querying posts
async function initDbWorker() {
    // 1. Fetch the database size from the newly generated text file
    let dbSize = 0; // Fallback default size
    try {
        const response = await fetch("db_size.txt");
        if (response.ok) {
            const sizeText = await response.text();
            dbSize = parseInt(sizeText.trim(), 10);
        } else {
            console.error("Could not load db_size.txt");
        }
    } catch (error) {
        console.error("Failed to fetch database size:", error);
    }

    // 2. Initialize the worker using the dynamic size
    return await createDbWorker(
        [
            {
                from: "inline",
                config: {
                    serverMode: "chunked",
                    urlPrefix: "/Data/gamedeveloper_blogs.sqlite3.",
                    requestChunkSize: 4096, 
                    serverChunkSize: dbSize,       // Set server chunk size to total DB size
                    databaseLengthBytes: dbSize,   // Set database length to total DB size
                    suffixLength: 1
                },
            },
        ],
        workerUrl.toString(),
        wasmUrl.toString()
    );
}

// Query posts based on search filters, pagination, and sorting options
// Query posts based on search filters, pagination, and sorting options
async function searchPosts(
    worker: any, query: string, limit = 20, offset = 0, sortColumn = "Date", sortOrder = "DESC",
    category = "All", startDate = "", endDate = "", type = "all"
) {
    let sqlQuery = `
        SELECT Title, Authors, Date, Summary, CategoryName, Link, Thumbnail, Type
        FROM posts
        WHERE (Title LIKE '%' || ? || '%' OR Summary LIKE '%' || ? || '%' OR Authors LIKE '%' || ? || '%')
    `;
    const params = [query, query, query];

    // Apply additional filters
    if (category !== "All") {
        sqlQuery += ` AND CategoryName = ?`;
        params.push(category);
    }
    if (startDate) {
        sqlQuery += ` AND Date >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        sqlQuery += ` AND Date <= ?`;
        params.push(endDate);
    }
    if (type !== "all") {
        sqlQuery += ` AND Type = ?`;
        params.push(type);
    }

    sqlQuery += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit.toString(), offset.toString());

    return await worker.db.query(sqlQuery, params);
}

// Highlight matching search terms in displayed text
function highlightText(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, `<span class="highlight">$1</span>`);
}

// Display posts in the list with optional appending for pagination
function displayPosts(posts: any[], searchTerm: string, append = false) {
    const listElement = document.getElementById("postList");
    if (!listElement) return;

    if (!append) listElement.innerHTML = ""; // Clear list if not appending
    const showThumbnails = thumbnailToggle.checked;

    if (posts.length === 0 && !append) {
        listElement.innerHTML = "<p id='noResults'>No results found.</p>";
        return;
    }

    posts.forEach((post: any) => {
        const postElement = document.createElement("div");
        const categoryClass = `category-${post.CategoryName.toLowerCase().replace(/\s+/g, '-')}`;
        postElement.className = `post ${categoryClass}`;
        
        // --- NEW EMOJI LOGIC ---
        let titlePrefix = "";
        if (post.Type === "Featured Blog") {
            titlePrefix = "⭐ ";
        } else if (post.Type === "Feature") {
            titlePrefix = "📰 ";
        }
        const title = `${titlePrefix}${post.Title}`;
        // -----------------------

        const highlightedTitle = highlightText(title, searchTerm);
        const postLink = `<a href="${post.Link}" target="_blank" rel="noopener noreferrer">${highlightedTitle}</a>`;
        
        const thumbnailHtml = showThumbnails && post.Thumbnail
            ? `<div class="thumbnail">
                 <a href="${post.Link}" target="_blank" rel="noopener noreferrer">
                     <img src="${post.Thumbnail}?width=120&amp;auto=webp&amp;quality=80&amp;disable=upscale" alt="Thumbnail" />
                 </a>
               </div>`
            : "";

        postElement.innerHTML = `
            <div class="post-container">
              ${thumbnailHtml}
              <div class="post-content">
                <h3>${postLink}</h3>
                <p><strong>Author:</strong> ${highlightText(post.Authors, searchTerm)}</p>
                <p><strong>Date:</strong> ${post.Date}</p>
                <p><strong>Category:</strong> ${post.CategoryName}</p>
                <p>${highlightText(post.Summary, searchTerm)}</p>
              </div>
            </div>
        `;
        listElement.appendChild(postElement);
    });
}

// Update date toggle button text based on selected range
function updateDateToggleText() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (startDate && endDate) {
        dateToggle.textContent = `From: ${startDate} To: ${endDate}`;
    } else if (startDate) {
        dateToggle.textContent = `From: ${startDate}`;
    } else if (endDate) {
        dateToggle.textContent = `To: ${endDate}`;
    } else {
        dateToggle.textContent = "Select Date Range";
    }
}


// Toggle the dropdown and update date text
dateToggle.addEventListener("click", () => {
    dateDropdown.classList.toggle("active");
});

// Close the dropdown when clicking outside and update button text
document.addEventListener("click", (event) => {
    if (!dateDropdown.contains(event.target as Node)) {
        dateDropdown.classList.remove("active");
        updateDateToggleText();  // Update the text when closing
    }
});

// Show and hide loading indicator for user feedback during data fetching
function showLoading() {
    document.body.classList.add("loading");
}
function hideLoading() {
    document.body.classList.remove("loading");
}

// Load and display initial or updated results based on user inputs
async function loadResults(
    worker: any, query: string, sortColumn = "Date", sortOrder = "DESC",
    category = "All", startDate = "", endDate = "", type = "all"
) {
    showLoading();
    const postList = document.getElementById("postList");
    offset = 0;
    const results = await searchPosts(worker, query, limit, offset, sortColumn, sortOrder, category, startDate, endDate, type); // <--- pass type here
    displayPosts(results, query);
    hideLoading();
    if (postList) {
        postList.scrollTop = 0;
    }
}

// Initialize search and filter elements and set event listeners
async function init() {
    const worker = await initDbWorker();
    await loadResults(worker, "", "Date", "DESC", "All");

    let debounceTimeout: NodeJS.Timeout;
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const categorySelect = document.getElementById("categorySelect") as HTMLSelectElement;
    const sortSelect = document.getElementById("sortSelect") as HTMLSelectElement;
    const sortOrderSelect = document.getElementById("sortOrderSelect") as HTMLSelectElement;
    const typeSelect = document.getElementById("typeSelect") as HTMLSelectElement;

    // Reload results when a filter or sort option changes
  const reloadResults = async () => {
        await loadResults(worker, searchInput.value, sortSelect.value, sortOrderSelect.value, categorySelect.value, startDateInput.value, endDateInput.value, typeSelect.value); // <--- typeSelect
    };

    // Debounce search input to avoid excessive reloads
    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(reloadResults, 300);
    });

    // Apply changes on toggles and other filter inputs
    thumbnailToggle.addEventListener("change", () => {
        localStorage.setItem("showThumbnails", String(thumbnailToggle.checked));
        reloadResults();
    });

    categorySelect.addEventListener("change", reloadResults);
    startDateInput.addEventListener("change", () => {
        updateDateToggleText();
        reloadResults();
    });
    
    endDateInput.addEventListener("change", () => {
        updateDateToggleText();
        reloadResults();
    });
    sortSelect.addEventListener("change", reloadResults);
    sortOrderSelect.addEventListener("change", reloadResults);
    typeSelect.addEventListener("change", reloadResults);

    // Infinite scroll listener to load more results when scrolled near the bottom
    const postList = document.getElementById("postList");
    if (postList) {
        postList.addEventListener("scroll", async () => {
            if (postList.scrollTop + postList.clientHeight >= postList.scrollHeight - 50) {
                showLoading();
                offset += limit;
                const moreResults = await searchPosts(worker, searchInput.value, limit, offset, sortSelect.value, sortOrderSelect.value, categorySelect.value, startDateInput.value, endDateInput.value, typeSelect.value);
                displayPosts(moreResults, searchInput.value, true);
                hideLoading();
            }
        });
    }
}

// Start the app
init();
