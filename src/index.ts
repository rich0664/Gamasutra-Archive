import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = new URL("sql.js-httpvfs/dist/sqlite.worker.js", import.meta.url);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

let offset = 0; // Track the current offset for pagination
const limit = 20; // Number of posts to load per "page" or scroll event
const nightModeToggle = document.getElementById("nightModeToggle") as HTMLInputElement;
const thumbnailToggle = document.getElementById("thumbnailToggle") as HTMLInputElement;

// Load preferences from localStorage
document.addEventListener("DOMContentLoaded", () => {
    // Load night mode state
    const nightMode = localStorage.getItem("nightMode") === "true";
    document.body.classList.toggle("dark-mode", nightMode);
    nightModeToggle.checked = nightMode;

    // Load thumbnail visibility state
    const showThumbnails = localStorage.getItem("showThumbnails") === "true";
    thumbnailToggle.checked = showThumbnails;
});

// Save night mode state to localStorage when toggled
nightModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", nightModeToggle.checked);
    localStorage.setItem("nightMode", String(nightModeToggle.checked));
});



// Fetch and display last scrape info
fetch("last_scrape_info.txt")
    .then(response => response.text())
    .then(text => {
        const header = document.getElementById("header");
        if (header) {
            const scrapeInfo = document.createElement("p");
            scrapeInfo.textContent = text;
            header.appendChild(scrapeInfo);
        }
    })
    .catch(error => console.error("Failed to load last scrape info:", error));

// Save thumbnail visibility state to localStorage when toggled


// Initialize the database worker
async function initDbWorker() {
    return await createDbWorker(
        [
            {
                from: "inline",
                config: {
                    serverMode: "full",
                    url: "https://rich0664.github.io/Gamasutra-Archive/Data/gamedeveloper_blogs.db",
                    requestChunkSize: 4096,
                },
            },
        ],
        workerUrl.toString(),
        wasmUrl.toString()
    );
}


// Function to query posts based on search input, limit, and offset for pagination
async function searchPosts(
    worker: any, query: string, limit = 20, offset = 0, sortColumn = "Date", sortOrder = "DESC",
    category = "All", startDate = "", endDate = "", featured = "all"
) {
    let sqlQuery = `
        SELECT Title, Authors, Date, Summary, CategoryName, Link, Thumbnail, Featured
        FROM posts
        WHERE (Title LIKE '%' || ? || '%' OR Summary LIKE '%' || ? || '%' OR Authors LIKE '%' || ? || '%')
    `;

    // Array to store query parameters
    const params = [query, query, query];

    // Add category filter if not "All"
    if (category !== "All") {
        sqlQuery += ` AND CategoryName = ?`;
        params.push(category);
    }

    // Add date range filters if specified
    if (startDate) {
        sqlQuery += ` AND Date >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        sqlQuery += ` AND Date <= ?`;
        params.push(endDate);
    }

    // Add featured filter based on the dropdown selection
    if (featured === "featured") {
        sqlQuery += ` AND Featured = 1`;  // Explicitly check for integer 1
    } else if (featured === "not_featured") {
        sqlQuery += ` AND Featured = 0`;  // Explicitly check for integer 0
    }

    sqlQuery += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit.toString(), offset.toString());

    // Execute the query with the parameters array
    const results = await worker.db.query(sqlQuery, params);
    return results;
}






// Function to highlight the search term
function highlightText(text: string, searchTerm: string): string {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, `<span class="highlight">$1</span>`);
}

// Function to display posts with an optional parameter to append results
function displayPosts(posts: any[], searchTerm: string, append = false) {
    const listElement = document.getElementById("postList");
    if (!listElement) return;

    // Clear the list if not appending (initial load or new search)
    if (!append) listElement.innerHTML = "";

    const showThumbnails = thumbnailToggle.checked; // Get checkbox state

    // If there are no posts and it's not appending, show "No results found"
    if (posts.length === 0 && !append) {
        listElement.innerHTML = "<p>No results found.</p>";
        return;
    }

    posts.forEach((post: any) => {
        const postElement = document.createElement("div");
        
        // Assign a category class for color-coding based on category name
        const categoryClass = `category-${post.CategoryName.toLowerCase().replace(/\s+/g, '-')}`;
        postElement.className = `post ${categoryClass}`;

        // Add star if the post is featured
        const title = post.Featured ? `⭐ ${post.Title}` : post.Title;
        const highlightedTitle = highlightText(title, searchTerm);
        const postLink = `<a href="${post.Link}" target="_blank" rel="noopener noreferrer">${highlightedTitle}</a>`;

        // Conditionally include clickable thumbnail
        const thumbnailHtml = showThumbnails && post.Thumbnail
            ? `<div class="thumbnail">
                 <a href="${post.Link}" target="_blank" rel="noopener noreferrer">
                     <img src="${post.Thumbnail}" alt="Thumbnail" />
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




// Show loading indicator
function showLoading() {
    document.body.classList.add("loading");
}

// Hide loading indicator
function hideLoading() {
    document.body.classList.remove("loading");
}

// Update loadResults to show and hide the loading indicator
async function loadResults(
    worker: any, query: string, sortColumn = "Date", sortOrder = "DESC",
    category = "All", startDate = "", endDate = "", featured = "all"
) {
    showLoading();  // Show loading indicator
    const postList = document.getElementById("postList");
    offset = 0;
    const results = await searchPosts(worker, query, limit, offset, sortColumn, sortOrder, category, startDate, endDate, featured);
    displayPosts(results, query);
    hideLoading();  // Hide loading indicator
    if (postList) {
        postList.scrollTop = 0;
    }
}


async function init() {
    const worker = await initDbWorker();

    await loadResults(worker, "", "Date", "DESC", "All");

    let debounceTimeout: NodeJS.Timeout;
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const categorySelect = document.getElementById("categorySelect") as HTMLSelectElement;
    const startDateInput = document.getElementById("startDate") as HTMLInputElement;
    const endDateInput = document.getElementById("endDate") as HTMLInputElement;
    const sortSelect = document.getElementById("sortSelect") as HTMLSelectElement;
    const sortOrderSelect = document.getElementById("sortOrderSelect") as HTMLSelectElement;

    // Helper to reload results
    const featuredSelect = document.getElementById("featuredSelect") as HTMLSelectElement;

    // Helper to reload results
    const reloadResults = async () => {
        const query = searchInput.value;
        const sortColumn = sortSelect.value;
        const sortOrder = sortOrderSelect.value;
        const category = categorySelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const featured = featuredSelect.value;
        await loadResults(worker, query, sortColumn, sortOrder, category, startDate, endDate, featured);
    };
    
// Modify event listeners to show loading while waiting for results
searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        showLoading();
        reloadResults();
    }, 300);
});
// Save thumbnail visibility state to localStorage when toggled
thumbnailToggle.addEventListener("change", () => {
    localStorage.setItem("showThumbnails", String(thumbnailToggle.checked));
    reloadResults(); // Reload results to reflect the change in thumbnail visibility
});

categorySelect.addEventListener("change", () => {
    showLoading();
    reloadResults();
});
startDateInput.addEventListener("change", () => {
    showLoading();
    reloadResults();
});
endDateInput.addEventListener("change", () => {
    showLoading();
    reloadResults();
});
sortSelect.addEventListener("change", () => {
    showLoading();
    reloadResults();
});
sortOrderSelect.addEventListener("change", () => {
    showLoading();
    reloadResults();
});
featuredSelect.addEventListener("change", () => {
    showLoading();
    reloadResults();
});

    // Infinite scroll
    const postList = document.getElementById("postList");
    if (postList) {
        postList.addEventListener("scroll", async () => {
            if (postList.scrollTop + postList.clientHeight >= postList.scrollHeight - 50) {
                showLoading();
                offset += limit; // Increment offset for the next page of results
                const moreResults = await searchPosts(
                    worker,
                    searchInput.value,
                    limit,
                    offset,
                    sortSelect.value,
                    sortOrderSelect.value,
                    categorySelect.value,
                    startDateInput.value,
                    endDateInput.value,
                    featuredSelect.value
                );
                displayPosts(moreResults, searchInput.value, true);
                hideLoading();
            }
        });
    }
}



// Start the app
init();
