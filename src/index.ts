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
    category = "All", startDate = "", endDate = ""
) {
    let sqlQuery = `
        SELECT Title, Authors, Date, Summary, CategoryName, Link, Thumbnail
        FROM posts
        WHERE (Title LIKE '%' || ? || '%' OR Summary LIKE '%' || ? || '%' OR Authors LIKE '%' || ? || '%')
    `;

    // Add category filter if not "All"
    if (category !== "All") {
        sqlQuery += ` AND CategoryName = ?`;
    }

    // Add date range filters if specified
    if (startDate) {
        sqlQuery += ` AND Date >= ?`;
    }
    if (endDate) {
        sqlQuery += ` AND Date <= ?`;
    }

    sqlQuery += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;

    // Collect parameters for the query
    const params = [query, query, query];
    if (category !== "All") params.push(category);
    if (startDate) params.push(startDate);
    if (endDate) params.push(endDate);
    params.push(limit.toString(), offset.toString());

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

    // If there are posts, render them normally
    posts.forEach((post: any) => {
        const postElement = document.createElement("div");
        postElement.className = "post";

        const highlightedTitle = highlightText(post.Title, searchTerm);
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


// Load results based on the query and reset offset when starting a new search
async function loadResults(
    worker: any, query: string, sortColumn = "Date", sortOrder = "DESC",
    category = "All", startDate = "", endDate = ""
) {
    const postList = document.getElementById("postList");
    offset = 0;
    const results = await searchPosts(worker, query, limit, offset, sortColumn, sortOrder, category, startDate, endDate);
    displayPosts(results, query);
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
    const reloadResults = async () => {
        const query = searchInput.value;
        const sortColumn = sortSelect.value;
        const sortOrder = sortOrderSelect.value;
        const category = categorySelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        await loadResults(worker, query, sortColumn, sortOrder, category, startDate, endDate);
    };

    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(reloadResults, 300);
    });
    categorySelect.addEventListener("change", reloadResults);
    startDateInput.addEventListener("change", reloadResults);
    endDateInput.addEventListener("change", reloadResults);
    sortSelect.addEventListener("change", reloadResults);
    sortOrderSelect.addEventListener("change", reloadResults);

    thumbnailToggle.addEventListener("change", () => {
        localStorage.setItem("showThumbnails", String(thumbnailToggle.checked));
        const query = (document.getElementById("searchInput") as HTMLInputElement).value;
        loadResults(worker, query, sortSelect.value, sortOrderSelect.value); // Reload results to apply thumbnail change
    });

    // Infinite scroll
    const postList = document.getElementById("postList");
    if (postList) {
        postList.addEventListener("scroll", async () => {
            // Trigger if close to the bottom
            if (postList.scrollTop + postList.clientHeight >= postList.scrollHeight - 50) {
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
                    endDateInput.value
                );
                displayPosts(moreResults, searchInput.value, true); // Append new results
            }
        });
    }
}



// Start the app
init();
