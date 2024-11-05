/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/sql.js-httpvfs/dist/index.js":
/*!***************************************************!*\
  !*** ./node_modules/sql.js-httpvfs/dist/index.js ***!
  \***************************************************/
/***/ (function(module) {

eval("!function(e,t){if(true)module.exports=t();else { var r, n; }}(this,(function(){return(()=>{\"use strict\";var e={870:(e,t,n)=>{n.r(t),n.d(t,{createEndpoint:()=>o,expose:()=>l,proxy:()=>v,proxyMarker:()=>r,releaseProxy:()=>a,transfer:()=>y,transferHandlers:()=>c,windowEndpoint:()=>g,wrap:()=>f});const r=Symbol(\"Comlink.proxy\"),o=Symbol(\"Comlink.endpoint\"),a=Symbol(\"Comlink.releaseProxy\"),i=Symbol(\"Comlink.thrown\"),s=e=>\"object\"==typeof e&&null!==e||\"function\"==typeof e,c=new Map([[\"proxy\",{canHandle:e=>s(e)&&e[r],serialize(e){const{port1:t,port2:n}=new MessageChannel;return l(e,t),[n,[n]]},deserialize:e=>(e.start(),f(e))}],[\"throw\",{canHandle:e=>s(e)&&i in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function l(e,t=self){t.addEventListener(\"message\",(function n(r){if(!r||!r.data)return;const{id:o,type:a,path:s}=Object.assign({path:[]},r.data),c=(r.data.argumentList||[]).map(w);let f;try{const t=s.slice(0,-1).reduce(((e,t)=>e[t]),e),n=s.reduce(((e,t)=>e[t]),e);switch(a){case 0:f=n;break;case 1:t[s.slice(-1)[0]]=w(r.data.value),f=!0;break;case 2:f=n.apply(t,c);break;case 3:f=v(new n(...c));break;case 4:{const{port1:t,port2:n}=new MessageChannel;l(e,n),f=y(t,[t])}break;case 5:f=void 0}}catch(e){f={value:e,[i]:0}}Promise.resolve(f).catch((e=>({value:e,[i]:0}))).then((e=>{const[r,i]=b(e);t.postMessage(Object.assign(Object.assign({},r),{id:o}),i),5===a&&(t.removeEventListener(\"message\",n),u(t))}))})),t.start&&t.start()}function u(e){(function(e){return\"MessagePort\"===e.constructor.name})(e)&&e.close()}function f(e,t){return d(e,[],t)}function p(e){if(e)throw new Error(\"Proxy has been released and is not useable\")}function d(e,t=[],n=function(){}){let r=!1;const i=new Proxy(n,{get(n,o){if(p(r),o===a)return()=>E(e,{type:5,path:t.map((e=>e.toString()))}).then((()=>{u(e),r=!0}));if(\"then\"===o){if(0===t.length)return{then:()=>i};const n=E(e,{type:0,path:t.map((e=>e.toString()))}).then(w);return n.then.bind(n)}return d(e,[...t,o])},set(n,o,a){p(r);const[i,s]=b(a);return E(e,{type:1,path:[...t,o].map((e=>e.toString())),value:i},s).then(w)},apply(n,a,i){p(r);const s=t[t.length-1];if(s===o)return E(e,{type:4}).then(w);if(\"bind\"===s)return d(e,t.slice(0,-1));const[c,l]=m(i);return E(e,{type:2,path:t.map((e=>e.toString())),argumentList:c},l).then(w)},construct(n,o){p(r);const[a,i]=m(o);return E(e,{type:3,path:t.map((e=>e.toString())),argumentList:a},i).then(w)}});return i}function m(e){const t=e.map(b);return[t.map((e=>e[0])),(n=t.map((e=>e[1])),Array.prototype.concat.apply([],n))];var n}const h=new WeakMap;function y(e,t){return h.set(e,t),e}function v(e){return Object.assign(e,{[r]:!0})}function g(e,t=self,n=\"*\"){return{postMessage:(t,r)=>e.postMessage(t,n,r),addEventListener:t.addEventListener.bind(t),removeEventListener:t.removeEventListener.bind(t)}}function b(e){for(const[t,n]of c)if(n.canHandle(e)){const[r,o]=n.serialize(e);return[{type:3,name:t,value:r},o]}return[{type:0,value:e},h.get(e)||[]]}function w(e){switch(e.type){case 3:return c.get(e.name).deserialize(e.value);case 0:return e.value}}function E(e,t,n){return new Promise((r=>{const o=new Array(4).fill(0).map((()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16))).join(\"-\");e.addEventListener(\"message\",(function t(n){n.data&&n.data.id&&n.data.id===o&&(e.removeEventListener(\"message\",t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:o},t),n)}))}},162:function(e,t,n){var r=this&&this.__createBinding||(Object.create?function(e,t,n,r){void 0===r&&(r=n),Object.defineProperty(e,r,{enumerable:!0,get:function(){return t[n]}})}:function(e,t,n,r){void 0===r&&(r=n),e[r]=t[n]}),o=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,\"default\",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)\"default\"!==n&&Object.prototype.hasOwnProperty.call(e,n)&&r(t,e,n);return o(t,e),t};Object.defineProperty(t,\"__esModule\",{value:!0}),t.createDbWorker=void 0;const i=a(n(870));async function s(e){if(e.data&&\"eval\"===e.data.action){const t=new Int32Array(e.data.notify,0,2),n=new Uint8Array(e.data.notify,8);let r;try{r={ok:await u(e.data.request)}}catch(t){console.error(\"worker request error\",e.data.request,t),r={err:String(t)}}const o=(new TextEncoder).encode(JSON.stringify(r));n.set(o,0),t[1]=o.length,Atomics.notify(t,0)}}function c(e){if(\"BODY\"===e.tagName)return\"body\";const t=[];for(;e.parentElement&&\"BODY\"!==e.tagName;){if(e.id){t.unshift(\"#\"+e.id);break}{let n=1,r=e;for(;r.previousElementSibling;)r=r.previousElementSibling,n++;t.unshift(e.tagName.toLowerCase()+\":nth-child(\"+n+\")\")}e=e.parentElement}return t.join(\" > \")}function l(e){return Object.keys(e)}async function u(e){if(console.log(\"dom vtable request\",e),\"select\"===e.type)return[...document.querySelectorAll(e.selector)].map((t=>{const n={};for(const r of e.columns)\"selector\"===r?n.selector=c(t):\"parent\"===r?t.parentElement&&(n.parent=t.parentElement?c(t.parentElement):null):\"idx\"===r||(n[r]=t[r]);return n}));if(\"insert\"===e.type){if(!e.value.parent)throw Error('\"parent\" column must be set when inserting');const t=document.querySelectorAll(e.value.parent);if(0===t.length)throw Error(`Parent element ${e.value.parent} could not be found`);if(t.length>1)throw Error(`Parent element ${e.value.parent} ambiguous (${t.length} results)`);const n=t[0];if(!e.value.tagName)throw Error(\"tagName must be set for inserting\");const r=document.createElement(e.value.tagName);for(const t of l(e.value))if(null!==e.value[t]){if(\"tagName\"===t||\"parent\"===t)continue;if(\"idx\"===t||\"selector\"===t)throw Error(`${t} can't be set`);r[t]=e.value[t]}return n.appendChild(r),null}if(\"update\"===e.type){const t=document.querySelector(e.value.selector);if(!t)throw Error(`Element ${e.value.selector} not found!`);const n=[];for(const r of l(e.value)){const o=e.value[r];if(\"parent\"!==r){if(\"idx\"!==r&&\"selector\"!==r&&o!==t[r]){if(console.log(\"SETTING \",r,t[r],\"->\",o),\"tagName\"===r)throw Error(\"can't change tagName\");n.push(r)}}else if(o!==c(t.parentElement)){const e=document.querySelectorAll(o);if(1!==e.length)throw Error(`Invalid target parent: found ${e.length} matches`);e[0].appendChild(t)}}for(const r of n)t[r]=e.value[r];return null}throw Error(`unknown request ${e.type}`)}i.transferHandlers.set(\"WORKERSQLPROXIES\",{canHandle:e=>!1,serialize(e){throw Error(\"no\")},deserialize:e=>(e.start(),i.wrap(e))}),t.createDbWorker=async function(e,t,n,r=1/0){const o=new Worker(t),a=i.wrap(o),c=await a.SplitFileHttpDatabase(n,e,void 0,r);return o.addEventListener(\"message\",s),{db:c,worker:a,configs:e}}},432:function(e,t,n){var r=this&&this.__createBinding||(Object.create?function(e,t,n,r){void 0===r&&(r=n),Object.defineProperty(e,r,{enumerable:!0,get:function(){return t[n]}})}:function(e,t,n,r){void 0===r&&(r=n),e[r]=t[n]}),o=this&&this.__exportStar||function(e,t){for(var n in e)\"default\"===n||Object.prototype.hasOwnProperty.call(t,n)||r(t,e,n)};Object.defineProperty(t,\"__esModule\",{value:!0}),o(n(162),t)}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var a=t[r]={exports:{}};return e[r].call(a.exports,a,a.exports,n),a.exports}return n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{\"undefined\"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:\"Module\"}),Object.defineProperty(e,\"__esModule\",{value:!0})},n(432)})()}));\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///./node_modules/sql.js-httpvfs/dist/index.js?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var sql_js_httpvfs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sql.js-httpvfs */ \"./node_modules/sql.js-httpvfs/dist/index.js\");\n/* harmony import */ var sql_js_httpvfs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sql_js_httpvfs__WEBPACK_IMPORTED_MODULE_0__);\n\nconst workerUrl = new URL(/* asset import */ __webpack_require__(/*! sql.js-httpvfs/dist/sqlite.worker.js */ \"./node_modules/sql.js-httpvfs/dist/sqlite.worker.js\"), __webpack_require__.b);\nconst wasmUrl = new URL(/* asset import */ __webpack_require__(/*! sql.js-httpvfs/dist/sql-wasm.wasm */ \"./node_modules/sql.js-httpvfs/dist/sql-wasm.wasm\"), __webpack_require__.b);\nlet offset = 0; // Track the current offset for pagination\nconst limit = 20; // Number of posts to load per \"page\" or scroll event\nconst nightModeToggle = document.getElementById(\"nightModeToggle\");\nconst thumbnailToggle = document.getElementById(\"thumbnailToggle\");\n// Load preferences from localStorage\ndocument.addEventListener(\"DOMContentLoaded\", () => {\n    // Load night mode state\n    const nightMode = localStorage.getItem(\"nightMode\") === \"true\";\n    document.body.classList.toggle(\"dark-mode\", nightMode);\n    nightModeToggle.checked = nightMode;\n    // Load thumbnail visibility state\n    const showThumbnails = localStorage.getItem(\"showThumbnails\") === \"true\";\n    thumbnailToggle.checked = showThumbnails;\n});\n// Save night mode state to localStorage when toggled\nnightModeToggle.addEventListener(\"change\", () => {\n    document.body.classList.toggle(\"dark-mode\", nightModeToggle.checked);\n    localStorage.setItem(\"nightMode\", String(nightModeToggle.checked));\n});\n// Save thumbnail visibility state to localStorage when toggled\n// Initialize the database worker\nasync function initDbWorker() {\n    return await (0,sql_js_httpvfs__WEBPACK_IMPORTED_MODULE_0__.createDbWorker)([\n        {\n            from: \"inline\",\n            config: {\n                serverMode: \"full\",\n                url: \"/Data/gamedeveloper_blogs.db\",\n                requestChunkSize: 4096,\n            },\n        },\n    ], workerUrl.toString(), wasmUrl.toString());\n}\n// Function to query posts based on search input, limit, and offset for pagination\nasync function searchPosts(worker, query, limit = 20, offset = 0, sortColumn = \"Date\", sortOrder = \"DESC\", category = \"All\", startDate = \"\", endDate = \"\") {\n    let sqlQuery = `\r\n        SELECT Title, Authors, Date, Summary, CategoryName, Link, Thumbnail\r\n        FROM posts\r\n        WHERE (Title LIKE '%' || ? || '%' OR Summary LIKE '%' || ? || '%' OR Authors LIKE '%' || ? || '%')\r\n    `;\n    // Add category filter if not \"All\"\n    if (category !== \"All\") {\n        sqlQuery += ` AND CategoryName = ?`;\n    }\n    // Add date range filters if specified\n    if (startDate) {\n        sqlQuery += ` AND Date >= ?`;\n    }\n    if (endDate) {\n        sqlQuery += ` AND Date <= ?`;\n    }\n    sqlQuery += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;\n    // Collect parameters for the query\n    const params = [query, query, query];\n    if (category !== \"All\")\n        params.push(category);\n    if (startDate)\n        params.push(startDate);\n    if (endDate)\n        params.push(endDate);\n    params.push(limit.toString(), offset.toString());\n    const results = await worker.db.query(sqlQuery, params);\n    return results;\n}\n// Function to highlight the search term\nfunction highlightText(text, searchTerm) {\n    if (!searchTerm)\n        return text;\n    const regex = new RegExp(`(${searchTerm})`, \"gi\");\n    return text.replace(regex, `<span class=\"highlight\">$1</span>`);\n}\n// Function to display posts with an optional parameter to append results\nfunction displayPosts(posts, searchTerm, append = false) {\n    const listElement = document.getElementById(\"postList\");\n    if (!listElement)\n        return;\n    // Clear list if not appending\n    if (!append)\n        listElement.innerHTML = \"\";\n    const showThumbnails = thumbnailToggle.checked; // Get checkbox state\n    posts.forEach((post) => {\n        const postElement = document.createElement(\"div\");\n        postElement.className = \"post\";\n        const highlightedTitle = highlightText(post.Title, searchTerm);\n        const postLink = `<a href=\"${post.Link}\" target=\"_blank\" rel=\"noopener noreferrer\">${highlightedTitle}</a>`;\n        // Conditionally include thumbnail based on checkbox state\n        const thumbnailHtml = showThumbnails && post.Thumbnail\n            ? `<div class=\"thumbnail\">\r\n             <a href=\"${post.Link}\" target=\"_blank\" rel=\"noopener noreferrer\">\r\n                 <img src=\"${post.Thumbnail}\" alt=\"Thumbnail\" />\r\n             </a>\r\n           </div>`\n            : \"\";\n        postElement.innerHTML = `\r\n            <div class=\"post-container\">\r\n              ${thumbnailHtml}\r\n              <div class=\"post-content\">\r\n                <h3>${postLink}</h3>\r\n                <p><strong>Author:</strong> ${highlightText(post.Authors, searchTerm)}</p>\r\n                <p><strong>Date:</strong> ${post.Date}</p>\r\n                <p><strong>Category:</strong> ${post.CategoryName}</p>\r\n                <p>${highlightText(post.Summary, searchTerm)}</p>\r\n              </div>\r\n            </div>\r\n        `;\n        listElement.appendChild(postElement);\n    });\n}\n// Load results based on the query and reset offset when starting a new search\nasync function loadResults(worker, query, sortColumn = \"Date\", sortOrder = \"DESC\", category = \"All\", startDate = \"\", endDate = \"\") {\n    const postList = document.getElementById(\"postList\");\n    offset = 0;\n    const results = await searchPosts(worker, query, limit, offset, sortColumn, sortOrder, category, startDate, endDate);\n    displayPosts(results, query);\n    if (postList) {\n        postList.scrollTop = 0;\n    }\n}\nasync function init() {\n    const worker = await initDbWorker();\n    await loadResults(worker, \"\", \"Date\", \"DESC\", \"All\");\n    let debounceTimeout;\n    const searchInput = document.getElementById(\"searchInput\");\n    const categorySelect = document.getElementById(\"categorySelect\");\n    const startDateInput = document.getElementById(\"startDate\");\n    const endDateInput = document.getElementById(\"endDate\");\n    const sortSelect = document.getElementById(\"sortSelect\");\n    const sortOrderSelect = document.getElementById(\"sortOrderSelect\");\n    // Helper to reload results\n    const reloadResults = async () => {\n        const query = searchInput.value;\n        const sortColumn = sortSelect.value;\n        const sortOrder = sortOrderSelect.value;\n        const category = categorySelect.value;\n        const startDate = startDateInput.value;\n        const endDate = endDateInput.value;\n        await loadResults(worker, query, sortColumn, sortOrder, category, startDate, endDate);\n    };\n    searchInput.addEventListener(\"input\", () => {\n        clearTimeout(debounceTimeout);\n        debounceTimeout = setTimeout(reloadResults, 300);\n    });\n    categorySelect.addEventListener(\"change\", reloadResults);\n    startDateInput.addEventListener(\"change\", reloadResults);\n    endDateInput.addEventListener(\"change\", reloadResults);\n    sortSelect.addEventListener(\"change\", reloadResults);\n    sortOrderSelect.addEventListener(\"change\", reloadResults);\n    thumbnailToggle.addEventListener(\"change\", () => {\n        localStorage.setItem(\"showThumbnails\", String(thumbnailToggle.checked));\n        const query = document.getElementById(\"searchInput\").value;\n        loadResults(worker, query, sortSelect.value, sortOrderSelect.value); // Reload results to apply thumbnail change\n    });\n    // Infinite scroll\n    const postList = document.getElementById(\"postList\");\n    if (postList) {\n        postList.addEventListener(\"scroll\", async () => {\n            // Trigger if close to the bottom\n            if (postList.scrollTop + postList.clientHeight >= postList.scrollHeight - 50) {\n                offset += limit; // Increment offset for the next page of results\n                const moreResults = await searchPosts(worker, searchInput.value, limit, offset, sortSelect.value, sortOrderSelect.value, categorySelect.value, startDateInput.value, endDateInput.value);\n                displayPosts(moreResults, searchInput.value, true); // Append new results\n            }\n        });\n    }\n}\n// Start the app\ninit();\n\n\n//# sourceURL=webpack:///./src/index.ts?");

/***/ }),

/***/ "./node_modules/sql.js-httpvfs/dist/sql-wasm.wasm":
/*!********************************************************!*\
  !*** ./node_modules/sql.js-httpvfs/dist/sql-wasm.wasm ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"8a2a3c8efae774018112.wasm\";\n\n//# sourceURL=webpack:///./node_modules/sql.js-httpvfs/dist/sql-wasm.wasm?");

/***/ }),

/***/ "./node_modules/sql.js-httpvfs/dist/sqlite.worker.js":
/*!***********************************************************!*\
  !*** ./node_modules/sql.js-httpvfs/dist/sqlite.worker.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"9181ee78cd72b9be8ba3.js\";\n\n//# sourceURL=webpack:///./node_modules/sql.js-httpvfs/dist/sqlite.worker.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;