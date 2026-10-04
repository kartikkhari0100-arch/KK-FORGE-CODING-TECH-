/* =========================================================
   KK FORGE ADMIN — FILES MANAGEMENT
========================================================= */

const STORAGE_KEY = "kkforge_files";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

let files = [];
let deleteFileId = null;
let currentFile = null;


/* =========================================================
   DOM
========================================================= */

const fileModal =
    document.getElementById("fileModal");

const previewModal =
    document.getElementById("previewModal");

const deleteModal =
    document.getElementById("deleteModal");

const fileForm =
    document.getElementById("fileForm");

const filesContainer =
    document.getElementById("filesContainer");

const emptyState =
    document.getElementById("emptyState");

const fileSearch =
    document.getElementById("fileSearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const typeFilter =
    document.getElementById("typeFilter");

const fileInput =
    document.getElementById("fileInput");

const fileUpload =
    document.getElementById("fileUpload");

const selectedFile =
    document.getElementById("selectedFile");


/* =========================================================
   STORAGE
========================================================= */

function loadFiles() {

    try {

        const stored =
            localStorage.getItem(
                STORAGE_KEY
            );

        files =
            stored
                ? JSON.parse(stored)
                : [];

        if (!Array.isArray(files)) {
            files = [];
        }

    } catch (error) {

        console.error(
            "Unable to load files:",
            error
        );

        files = [];
    }
}


function saveFiles() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(files)
    );
}


/* =========================================================
   HELPERS
========================================================= */

function generateId() {

    return (
        "file_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2,8)
    );
}


function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


function getExtension(name = "") {

    const parts =
        name.split(".");

    return parts.length > 1
        ? parts.pop().toUpperCase()
        : "FILE";
}


function getExtensionLower(name = "") {

    return getExtension(name)
        .toLowerCase();
}


function formatBytes(bytes) {

    if (!bytes) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const index =
        Math.min(
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            ),
            units.length - 1
        );

    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(1)
        ) +
        " " +
        units[index]
    );
}


function getTotalStorage() {

    return files.reduce(
        (total,file) =>
            total +
            Number(
                file.fileSize || 0
            ),
        0
    );
}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const total =
        files.length;

    const featured =
        files.filter(
            file =>
                file.featured
        ).length;

    const categories =
        new Set(
            files
                .map(file =>
                    file.category
                )
                .filter(Boolean)
        ).size;

    const types =
        new Set(
            files
                .map(file =>
                    getExtension(
                        file.fileName
                    )
                )
                .filter(Boolean)
        ).size;

    const storage =
        getTotalStorage();


    document.getElementById(
        "totalFiles"
    ).textContent =
        total;


    document.getElementById(
        "featuredFiles"
    ).textContent =
        featured;


    document.getElementById(
        "fileCategories"
    ).textContent =
        categories;


    document.getElementById(
        "fileTypes"
    ).textContent =
        types;


    document.getElementById(
        "storageUsed"
    ).textContent =
        formatBytes(storage);


    /*
       Visual indicator only.
       localStorage is browser-limited.
    */

    const progress =
        Math.min(
            (storage /
                (5 * 1024 * 1024)
            ) * 100,
            100
        );


    document.getElementById(
        "storageProgress"
    ).style.width =
        `${progress}%`;
}


/* =========================================================
   FILTER OPTIONS
========================================================= */

function renderFilters() {

    const categories =
        [
            ...new Set(
                files
                    .map(file =>
                        file.category
                    )
                    .filter(Boolean)
            )
        ].sort();


    const types =
        [
            ...new Set(
                files
                    .map(file =>
                        getExtension(
                            file.fileName
                        )
                    )
                    .filter(Boolean)
            )
        ].sort();


    categoryFilter.innerHTML =
        `
            <option value="all">
                All Categories
            </option>
        `;


    typeFilter.innerHTML =
        `
            <option value="all">
                All Types
            </option>
        `;


    const suggestions =
        document.getElementById(
            "categorySuggestions"
        );

    suggestions.innerHTML = "";


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            category;

        option.textContent =
            category;

        categoryFilter.appendChild(
            option
        );


        const suggestion =
            document.createElement(
                "option"
            );

        suggestion.value =
            category;

        suggestions.appendChild(
            suggestion
        );

    });


    types.forEach(type => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            type;

        option.textContent =
            type;

        typeFilter.appendChild(
            option
        );

    });
}


/* =========================================================
   FILTER
========================================================= */

function getFilteredFiles() {

    const search =
        fileSearch.value
            .trim()
            .toLowerCase();

    const category =
        categoryFilter.value;

    const type =
        typeFilter.value;


    return files.filter(file => {

        const text = [

            file.title,
            file.description,
            file.category,
            file.fileName,
            file.tags

        ]
            .join(" ")
            .toLowerCase();


        const extension =
            getExtension(
                file.fileName
            );


        return (

            (!search ||
                text.includes(search))

            &&

            (
                category === "all" ||
                file.category === category
            )

            &&

            (
                type === "all" ||
                extension === type
            )

        );

    });
}


/* =========================================================
   RENDER
========================================================= */

function renderFiles() {

    const filtered =
        getFilteredFiles();


    filesContainer.innerHTML = "";


    if (filtered.length === 0) {

        filesContainer.style.display =
            "none";

        emptyState.classList.add(
            "visible"
        );


        const heading =
            emptyState.querySelector("h3");

        const paragraph =
            emptyState.querySelector("p");


        if (files.length > 0) {

            heading.textContent =
                "No matching files";

            paragraph.textContent =
                "Try changing your search or filters.";

        } else {

            heading.textContent =
                "No files yet";

            paragraph.textContent =
                "Upload your first portfolio resource.";

        }

        return;
    }


    filesContainer.style.display =
        "grid";

    emptyState.classList.remove(
        "visible"
    );


    filtered.forEach(file => {

        filesContainer.appendChild(
            createFileCard(file)
        );

    });
}


/* =========================================================
   CARD
========================================================= */

function createFileCard(file) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "file-card";


    const extension =
        getExtension(
            file.fileName
        );


    const tags =
        Array.isArray(file.tags)
            ? file.tags
            : String(
                file.tags || ""
            )
                .split(",")
                .map(tag =>
                    tag.trim()
                )
                .filter(Boolean);


    card.innerHTML = `

        <div class="file-main">

            <div class="file-top">

                <div class="file-icon">
                    ${escapeHTML(extension)}
                </div>

                ${
                    file.featured
                        ? `
                            <span class="file-featured">
                                ★ FEATURED
                            </span>
                        `
                        : ""
                }

            </div>


            <div class="file-category">
                ${escapeHTML(
                    file.category ||
                    "UNCATEGORIZED"
                )}
            </div>


            <h3 class="file-title">
                ${escapeHTML(
                    file.title
                )}
            </h3>


            <p class="file-description">
                ${escapeHTML(
                    file.description ||
                    "No description added."
                )}
            </p>


            <div class="file-meta">

                <span>
                    ${escapeHTML(extension)}
                </span>

                <span>
                    ${formatBytes(
                        file.fileSize
                    )}
                </span>

                ${
                    tags
                        .slice(0,3)
                        .map(tag =>
                            `<span>
                                ${escapeHTML(tag)}
                            </span>`
                        )
                        .join("")
                }

            </div>


            <div class="file-footer">

                <div
                    class="file-status ${
                        file.status === "published"
                            ? "published"
                            : ""
                    }"
                >

                    <span class="status-dot"></span>

                    ${
                        file.status === "published"
                            ? "Published"
                            : "Draft"
                    }

                </div>


                <div class="file-actions">

                    <button
                        class="card-action"
                        data-action="preview"
                        data-id="${file.id}"
                        title="Preview"
                    >
                        ◉
                    </button>

                    <button
                        class="card-action"
                        data-action="download"
                        data-id="${file.id}"
                        title="Download"
                    >
                        ↓
                    </button>

                    <button
                        class="card-action"
                        data-action="edit"
                        data-id="${file.id}"
                        title="Edit"
                    >
                        ✎
                    </button>

                    <button
                        class="card-action delete"
                        data-action="delete"
                        data-id="${file.id}"
                        title="Delete"
                    >
                        ×
                    </button>

                </div>

            </div>

        </div>

    `;


    return card;
}


/* =========================================================
   MODAL
========================================================= */

function openFileModal(file = null) {

    fileForm.reset();

    currentFile = null;

    selectedFile.classList.remove(
        "show"
    );

    selectedFile.textContent = "";


    document.getElementById(
        "fileId"
    ).value = "";


    if (file) {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit File";


        document.getElementById(
            "fileId"
        ).value =
            file.id;


        document.getElementById(
            "fileTitle"
        ).value =
            file.title || "";


        document.getElementById(
            "fileCategory"
        ).value =
            file.category || "";


        document.getElementById(
            "fileStatus"
        ).value =
            file.status || "draft";


        document.getElementById(
            "fileDescription"
        ).value =
            file.description || "";


        document.getElementById(
            "fileTags"
        ).value =
            Array.isArray(file.tags)
                ? file.tags.join(", ")
                : file.tags || "";


        document.getElementById(
            "fileFeatured"
        ).checked =
            Boolean(file.featured);


        if (file.fileName) {

            selectedFile.textContent =
                `Current file: ${file.fileName}`;

            selectedFile.classList.add(
                "show"
            );

        }

    } else {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Upload File";


        document.getElementById(
            "fileStatus"
        ).value =
            "published";

    }


    fileModal.classList.add(
        "open"
    );
}


function closeFileModal() {

    fileModal.classList.remove(
        "open"
    );

    currentFile = null;
}


/* =========================================================
   FILE SELECTION
========================================================= */

function validateFile(file) {

    if (!file) {
        return false;
    }


    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        showToast(
            "File size must be 5 MB or less."
        );

        return false;
    }


    return true;
}


function setCurrentFile(file) {

    if (!validateFile(file)) {
        return;
    }


    currentFile = file;


    selectedFile.textContent =
        `${file.name} • ${formatBytes(file.size)}`;

    selectedFile.classList.add(
        "show"
    );
}


fileInput.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files[0];

        if (file) {
            setCurrentFile(file);
        }

    }
);


/* =========================================================
   DATA URL
========================================================= */

function readFileAsDataURL(file) {

    return new Promise(
        (resolve,reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () =>
                    resolve(
                        reader.result
                    );


            reader.onerror =
                () =>
                    reject(
                        reader.error
                    );


            reader.readAsDataURL(
                file
            );

        }
    );
}


/* =========================================================
   SAVE
========================================================= */

fileForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const id =
            document.getElementById(
                "fileId"
            ).value;


        const title =
            document.getElementById(
                "fileTitle"
            ).value.trim();


        const category =
            document.getElementById(
                "fileCategory"
            ).value.trim();


        const status =
            document.getElementById(
                "fileStatus"
            ).value;


        const description =
            document.getElementById(
                "fileDescription"
            ).value.trim();


        const tags =
            document.getElementById(
                "fileTags"
            ).value
                .split(",")
                .map(tag =>
                    tag.trim()
                )
                .filter(Boolean);


        const featured =
            document.getElementById(
                "fileFeatured"
            ).checked;


        const existingFile =
            id
                ? files.find(
                    file =>
                        file.id === id
                )
                : null;


        let fileData =
            existingFile
                ? existingFile.fileData || ""
                : "";

        let fileName =
            existingFile
                ? existingFile.fileName || ""
                : "";

        let fileType =
            existingFile
                ? existingFile.fileType || ""
                : "";

        let fileSize =
            existingFile
                ? existingFile.fileSize || 0
                : 0;


        /* New / replacement file */

        if (currentFile) {

            try {

                fileData =
                    await readFileAsDataURL(
                        currentFile
                    );

                fileName =
                    currentFile.name;

                fileType =
                    currentFile.type ||
                    "application/octet-stream";

                fileSize =
                    currentFile.size;

            } catch (error) {

                showToast(
                    "Unable to read this file."
                );

                return;
            }

        }


        if (!fileName) {

            showToast(
                "Please select a file."
            );

            return;
        }


        const now =
            new Date().toISOString();


        /*
           Only one featured file.
        */

        if (featured) {

            files.forEach(file => {

                file.featured =
                    id
                        ? file.id === id
                        : false;

            });

        }


        if (id) {

            const index =
                files.findIndex(
                    file =>
                        file.id === id
                );


            if (index !== -1) {

                files[index] = {

                    ...files[index],

                    title,
                    category,
                    status,
                    description,
                    tags,
                    featured,

                    fileData,
                    fileName,
                    fileType,
                    fileSize,

                    updatedAt: now

                };

            }


            showToast(
                "File updated successfully."
            );

        } else {

            files.unshift({

                id: generateId(),

                title,
                category,
                status,
                description,
                tags,
                featured,

                fileData,
                fileName,
                fileType,
                fileSize,

                createdAt: now,
                updatedAt: now

            });


            showToast(
                "File uploaded successfully."
            );

        }


        try {

            saveFiles();

        } catch (error) {

            console.error(error);

            showToast(
                "Browser storage limit reached."
            );

            return;
        }


        updateStats();

        renderFilters();

        renderFiles();

        closeFileModal();

    }
);


/* =========================================================
   PREVIEW
========================================================= */

function openPreview(file) {

    const content =
        document.getElementById(
            "previewContent"
        );


    const extension =
        getExtension(
            file.fileName
        );


    const lower =
        extension.toLowerCase();


    let html = `

        <div class="preview-header">

            <span class="preview-category">
                ${escapeHTML(
                    file.category ||
                    "FILE"
                )}
            </span>

            <h2 class="preview-title">
                ${escapeHTML(
                    file.title
                )}
            </h2>

            <p class="preview-description">
                ${escapeHTML(
                    file.description ||
                    ""
                )}
            </p>

        </div>

    `;


    if (
        lower === "pdf" &&
        file.fileData
    ) {

        html += `

            <iframe
                class="preview-file"
                src="${file.fileData}"
                title="PDF Preview"
            ></iframe>

        `;

    } else if (
        [
            "png",
            "jpg",
            "jpeg",
            "gif",
            "webp",
            "svg"
        ].includes(lower) &&
        file.fileData
    ) {

        html += `

            <img
                class="preview-image"
                src="${file.fileData}"
                alt="${escapeHTML(file.title)}"
            >

        `;

    } else if (
        [
            "txt",
            "md",
            "csv",
            "json"
        ].includes(lower) &&
        file.fileData
    ) {

        html += `

            <pre
                class="preview-text"
                id="textPreview"
            >Loading...</pre>

        `;

    } else {

        html += `

            <div class="unsupported-preview">

                <div class="unsupported-icon">
                    ${escapeHTML(extension)}
                </div>

                <h3>
                    Preview unavailable
                </h3>

                <p>
                    This file type can be downloaded
                    but cannot be previewed directly.
                </p>

                <button
                    class="primary-btn"
                    id="previewDownloadBtn"
                >
                    ↓ Download File
                </button>

            </div>

        `;

    }


    content.innerHTML =
        html;


    previewModal.classList.add(
        "open"
    );


    if (
        [
            "txt",
            "md",
            "csv",
            "json"
        ].includes(lower)
    ) {

        loadTextPreview(
            file.fileData
        );

    }


    document
        .getElementById(
            "previewDownloadBtn"
        )
        ?.addEventListener(
            "click",
            () =>
                downloadFile(file)
        );
}


/* =========================================================
   TEXT PREVIEW
========================================================= */

async function loadTextPreview(
    dataURL
) {

    const preview =
        document.getElementById(
            "textPreview"
        );


    if (!preview) {
        return;
    }


    try {

        const response =
            await fetch(dataURL);

        const text =
            await response.text();

        preview.textContent =
            text;

    } catch (error) {

        preview.textContent =
            "Unable to preview this file.";

    }
}


function closePreview() {

    previewModal.classList.remove(
        "open"
    );
}


/* =========================================================
   DOWNLOAD
========================================================= */

function downloadFile(file) {

    if (!file.fileData) {

        showToast(
            "No file available."
        );

        return;
    }


    const link =
        document.createElement(
            "a"
        );


    link.href =
        file.fileData;


    link.download =
        file.fileName ||
        file.title;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();
}


/* =========================================================
   DELETE
========================================================= */

function openDeleteModal(id) {

    deleteFileId = id;

    deleteModal.classList.add(
        "open"
    );
}


function closeDeleteModal() {

    deleteFileId = null;

    deleteModal.classList.remove(
        "open"
    );
}


function deleteFile() {

    if (!deleteFileId) {
        return;
    }


    files =
        files.filter(
            file =>
                file.id !==
                deleteFileId
        );


    saveFiles();

    updateStats();

    renderFilters();

    renderFiles();

    closeDeleteModal();

    showToast(
        "File deleted successfully."
    );
}


/* =========================================================
   CARD ACTIONS
========================================================= */

filesContainer.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const file =
            files.find(
                item =>
                    item.id ===
                    button.dataset.id
            );


        if (!file) {
            return;
        }


        const action =
            button.dataset.action;


        if (
            action === "preview"
        ) {

            openPreview(file);

        }


        if (
            action === "download"
        ) {

            downloadFile(file);

        }


        if (
            action === "edit"
        ) {

            openFileModal(file);

        }


        if (
            action === "delete"
        ) {

            openDeleteModal(
                file.id
            );

        }

    }
);


/* =========================================================
   DRAG & DROP
========================================================= */

[
    "dragenter",
    "dragover"
].forEach(eventName => {

    fileUpload.addEventListener(
        eventName,
        event => {

            event.preventDefault();

            fileUpload.classList.add(
                "dragover"
            );

        }
    );

});


[
    "dragleave",
    "drop"
].forEach(eventName => {

    fileUpload.addEventListener(
        eventName,
        event => {

            event.preventDefault();

            fileUpload.classList.remove(
                "dragover"
            );

        }
    );

});


fileUpload.addEventListener(
    "drop",
    event => {

        const file =
            event.dataTransfer.files[0];


        if (file) {
            setCurrentFile(file);
        }

    }
);


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById("uploadFileBtn")
    .addEventListener(
        "click",
        () => openFileModal()
    );


document
    .getElementById("emptyUploadBtn")
    .addEventListener(
        "click",
        () => openFileModal()
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeFileModal
    );


document
    .getElementById("cancelModal")
    .addEventListener(
        "click",
        closeFileModal
    );


document
    .getElementById("closePreview")
    .addEventListener(
        "click",
        closePreview
    );


document
    .getElementById("cancelDelete")
    .addEventListener(
        "click",
        closeDeleteModal
    );


document
    .getElementById("confirmDelete")
    .addEventListener(
        "click",
        deleteFile
    );


/* =========================================================
   FILTER EVENTS
========================================================= */

fileSearch.addEventListener(
    "input",
    renderFiles
);


categoryFilter.addEventListener(
    "change",
    renderFiles
);


typeFilter.addEventListener(
    "change",
    renderFiles
);


/* =========================================================
   REFRESH
========================================================= */

document
    .getElementById("refreshBtn")
    .addEventListener(
        "click",
        () => {

            loadFiles();

            updateStats();

            renderFilters();

            renderFiles();

            showToast(
                "Files refreshed."
            );

        }
    );


/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "../index.html";

        }
    );


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


function closeSidebar() {

    sidebar?.classList.remove(
        "open"
    );

    sidebarOverlay?.classList.remove(
        "active"
    );
}


mobileMenu?.addEventListener(
    "click",
    () => {

        sidebar?.classList.toggle(
            "open"
        );

        sidebarOverlay?.classList.toggle(
            "active"
        );

    }
);


sidebarOverlay?.addEventListener(
    "click",
    closeSidebar
);


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

[
    fileModal,
    previewModal,
    deleteModal
].forEach(modal => {

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    "open"
                );

            }

        }
    );

});


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        closeFileModal();

        closePreview();

        closeDeleteModal();

        closeSidebar();

    }
);


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    messageElement.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2600
        );
}


/* =========================================================
   MODULE NAVIGATION
========================================================= */

function setupModuleNavigation() {

    const navItems =
        document.querySelectorAll(
            ".sidebar-nav .nav-item"
        );


    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    navItems.forEach(item => {

        const href =
            item.getAttribute(
                "href"
            );


        if (!href) {
            return;
        }


        const page =
            href
                .split("/")
                .pop()
                .toLowerCase();


        item.classList.toggle(
            "active",
            page === currentPage
        );


        item.addEventListener(
            "click",
            closeSidebar
        );

    });

}


/* =========================================================
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key !== STORAGE_KEY
        ) {
            return;
        }


        loadFiles();

        updateStats();

        renderFilters();

        renderFiles();

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initFiles() {

    loadFiles();

    updateStats();

    renderFilters();

    renderFiles();

    setupModuleNavigation();

}


initFiles();