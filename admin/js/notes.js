/* =========================================================
   KK FORGE ADMIN — NOTES MANAGEMENT
========================================================= */

const STORAGE_KEY = "kkforge_notes";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

let notes = [];
let deleteNoteId = null;
let currentFile = null;


/* =========================================================
   DOM
========================================================= */

const noteModal =
    document.getElementById("noteModal");

const previewModal =
    document.getElementById("previewModal");

const deleteModal =
    document.getElementById("deleteModal");

const noteForm =
    document.getElementById("noteForm");

const notesContainer =
    document.getElementById("notesContainer");

const emptyState =
    document.getElementById("emptyState");

const noteSearch =
    document.getElementById("noteSearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const statusFilter =
    document.getElementById("statusFilter");

const noteFile =
    document.getElementById("noteFile");

const fileUpload =
    document.getElementById("fileUpload");

const selectedFile =
    document.getElementById("selectedFile");


/* =========================================================
   STORAGE
========================================================= */

function loadNotes() {

    try {

        const stored =
            localStorage.getItem(STORAGE_KEY);

        notes =
            stored
                ? JSON.parse(stored)
                : [];

        if (!Array.isArray(notes)) {
            notes = [];
        }

    } catch (error) {

        console.error(
            "Unable to load notes:",
            error
        );

        notes = [];
    }
}


function saveNotes() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notes)
    );
}


/* =========================================================
   HELPERS
========================================================= */

function generateId() {

    return (
        "note_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getFileExtension(name = "") {

    const parts =
        name.split(".");

    return parts.length > 1
        ? parts.pop().toUpperCase()
        : "FILE";
}


function formatDate(date) {

    if (!date) {
        return "Recently";
    }

    const parsed =
        new Date(date);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return "Recently";
    }

    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const total =
        notes.length;

    const featured =
        notes.filter(
            note => note.featured
        ).length;

    const published =
        notes.filter(
            note =>
                note.status === "published"
        ).length;

    const categories =
        new Set(
            notes
                .map(note => note.category)
                .filter(Boolean)
        ).size;


    document.getElementById(
        "totalNotes"
    ).textContent = total;

    document.getElementById(
        "featuredNotes"
    ).textContent = featured;

    document.getElementById(
        "publishedNotes"
    ).textContent = published;

    document.getElementById(
        "noteCategories"
    ).textContent = categories;
}


/* =========================================================
   CATEGORIES
========================================================= */

function getCategories() {

    return [
        ...new Set(
            notes
                .map(note => note.category)
                .filter(Boolean)
                .map(category =>
                    category.trim()
                )
        )
    ].sort(
        (a,b) =>
            a.localeCompare(b)
    );
}


function renderCategoryFilters() {

    const categories =
        getCategories();


    categoryFilter.innerHTML =
        `
            <option value="all">
                All Categories
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
}


/* =========================================================
   FILTER
========================================================= */

function getFilteredNotes() {

    const search =
        noteSearch.value
            .trim()
            .toLowerCase();

    const category =
        categoryFilter.value;

    const status =
        statusFilter.value;


    return notes.filter(note => {

        const text = [

            note.title,

            note.description,

            note.category,

            note.fileName

        ]
            .join(" ")
            .toLowerCase();


        return (

            (!search ||
                text.includes(search))

            &&

            (
                category === "all" ||
                note.category === category
            )

            &&

            (
                status === "all" ||
                note.status === status
            )

        );

    });
}


/* =========================================================
   RENDER
========================================================= */

function renderNotes() {

    const filtered =
        getFilteredNotes();


    notesContainer.innerHTML = "";


    if (filtered.length === 0) {

        notesContainer.style.display =
            "none";

        emptyState.classList.add(
            "visible"
        );


        const heading =
            emptyState.querySelector("h3");

        const paragraph =
            emptyState.querySelector("p");


        if (notes.length > 0) {

            heading.textContent =
                "No matching notes";

            paragraph.textContent =
                "Try changing your search or filters.";

        } else {

            heading.textContent =
                "No notes yet";

            paragraph.textContent =
                "Add or upload your first learning resource.";

        }

        return;
    }


    notesContainer.style.display =
        "grid";

    emptyState.classList.remove(
        "visible"
    );


    filtered.forEach(note => {

        notesContainer.appendChild(
            createNoteCard(note)
        );

    });
}


/* =========================================================
   NOTE CARD
========================================================= */

function createNoteCard(note) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "note-card";


    const extension =
        getFileExtension(
            note.fileName
        );


    card.innerHTML = `

        <div class="note-header">

            <div>

                <div class="note-file-icon">
                    ${escapeHTML(extension)}
                </div>

                <div class="note-file-type">
                    ${escapeHTML(
                        note.fileName ||
                        "No file"
                    )}
                </div>

            </div>


            ${
                note.featured
                    ? `
                        <span class="note-featured">
                            ★ FEATURED
                        </span>
                    `
                    : ""
            }

        </div>


        <div class="note-body">

            <div class="note-category">
                ${escapeHTML(
                    note.category ||
                    "UNCATEGORIZED"
                )}
            </div>


            <h3 class="note-title">
                ${escapeHTML(note.title)}
            </h3>


            <p class="note-description">
                ${escapeHTML(
                    note.description ||
                    "No description added."
                )}
            </p>


            <div class="note-footer">

                <div
                    class="note-status ${
                        note.status === "published"
                            ? "published"
                            : ""
                    }"
                >

                    <span class="status-dot"></span>

                    ${
                        note.status === "published"
                            ? "Published"
                            : "Draft"
                    }

                </div>


                <div class="note-actions">

                    <button
                        class="card-action"
                        data-action="preview"
                        data-id="${note.id}"
                        title="Preview"
                    >
                        ◉
                    </button>

                    <button
                        class="card-action"
                        data-action="download"
                        data-id="${note.id}"
                        title="Download"
                    >
                        ↓
                    </button>

                    <button
                        class="card-action"
                        data-action="edit"
                        data-id="${note.id}"
                        title="Edit"
                    >
                        ✎
                    </button>

                    <button
                        class="card-action delete"
                        data-action="delete"
                        data-id="${note.id}"
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

function openNoteModal(note = null) {

    noteForm.reset();

    currentFile = null;

    selectedFile.classList.remove(
        "show"
    );

    selectedFile.textContent = "";


    document.getElementById(
        "noteId"
    ).value = "";


    if (note) {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Note";


        document.getElementById(
            "noteId"
        ).value =
            note.id;


        document.getElementById(
            "noteTitle"
        ).value =
            note.title || "";


        document.getElementById(
            "noteCategory"
        ).value =
            note.category || "";


        document.getElementById(
            "noteStatus"
        ).value =
            note.status || "draft";


        document.getElementById(
            "noteDescription"
        ).value =
            note.description || "";


        document.getElementById(
            "noteFeatured"
        ).checked =
            Boolean(note.featured);


        if (note.fileName) {

            selectedFile.textContent =
                `Current file: ${note.fileName}`;

            selectedFile.classList.add(
                "show"
            );

        }

    } else {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Add Note";


        document.getElementById(
            "noteStatus"
        ).value =
            "published";

    }


    noteModal.classList.add(
        "open"
    );
}


function closeNoteModal() {

    noteModal.classList.remove(
        "open"
    );

    currentFile = null;
}


/* =========================================================
   FILE SELECTION
========================================================= */

noteFile.addEventListener(
    "change",
    () => {

        const file =
            noteFile.files[0];

        if (!file) {
            return;
        }


        if (
            file.size >
            MAX_FILE_SIZE
        ) {

            noteFile.value = "";

            showToast(
                "File size must be 5 MB or less."
            );

            return;
        }


        currentFile = file;


        selectedFile.textContent =
            `${file.name} • ${formatBytes(file.size)}`;

        selectedFile.classList.add(
            "show"
        );

    }
);


function formatBytes(bytes) {

    if (!bytes) {
        return "0 Bytes";
    }

    const units = [
        "Bytes",
        "KB",
        "MB"
    ];

    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
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


/* =========================================================
   FILE -> DATA URL
========================================================= */

function readFileAsDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => resolve(
                    reader.result
                );


            reader.onerror =
                () => reject(
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

noteForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const id =
            document.getElementById(
                "noteId"
            ).value;


        const title =
            document.getElementById(
                "noteTitle"
            ).value.trim();


        const category =
            document.getElementById(
                "noteCategory"
            ).value.trim();


        const description =
            document.getElementById(
                "noteDescription"
            ).value.trim();


        const status =
            document.getElementById(
                "noteStatus"
            ).value;


        const featured =
            document.getElementById(
                "noteFeatured"
            ).checked;


        let existingNote =
            id
                ? notes.find(
                    note =>
                        note.id === id
                )
                : null;


        let fileData =
            existingNote
                ? existingNote.fileData || ""
                : "";

        let fileName =
            existingNote
                ? existingNote.fileName || ""
                : "";

        let fileType =
            existingNote
                ? existingNote.fileType || ""
                : "";

        let fileSize =
            existingNote
                ? existingNote.fileSize || 0
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
                    "Unable to read the selected file."
                );

                return;
            }

        }


        if (!fileName) {

            showToast(
                "Please select a note file."
            );

            return;
        }


        /*
           Only one featured note.
        */

        if (featured) {

            notes.forEach(note => {

                note.featured =
                    id
                        ? note.id === id
                        : false;

            });

        }


        const now =
            new Date().toISOString();


        if (id) {

            const index =
                notes.findIndex(
                    note =>
                        note.id === id
                );


            if (index !== -1) {

                notes[index] = {

                    ...notes[index],

                    title,
                    category,
                    description,
                    status,
                    featured,

                    fileData,
                    fileName,
                    fileType,
                    fileSize,

                    updatedAt: now

                };

            }


            showToast(
                "Note updated successfully."
            );

        } else {

            if (featured) {

                notes.forEach(
                    note =>
                        note.featured = false
                );

            }


            notes.unshift({

                id: generateId(),

                title,
                category,
                description,

                status,
                featured,

                fileData,
                fileName,
                fileType,
                fileSize,

                createdAt: now,
                updatedAt: now

            });


            showToast(
                "Note added successfully."
            );

        }


        try {

            saveNotes();

        } catch (error) {

            console.error(error);

            showToast(
                "Storage limit reached. Try a smaller file."
            );

            return;
        }


        updateStats();

        renderCategoryFilters();

        renderNotes();

        closeNoteModal();

    }
);


/* =========================================================
   PREVIEW
========================================================= */

function openPreview(note) {

    const content =
        document.getElementById(
            "previewContent"
        );


    const extension =
        getFileExtension(
            note.fileName
        );


    let previewHTML = `

        <div class="preview-header">

            <span class="preview-category">
                ${escapeHTML(
                    note.category ||
                    "NOTE"
                )}
            </span>

            <h2 class="preview-title">
                ${escapeHTML(
                    note.title
                )}
            </h2>

            <p class="preview-description">
                ${escapeHTML(
                    note.description ||
                    ""
                )}
            </p>

        </div>

    `;


    if (
        extension === "PDF" &&
        note.fileData
    ) {

        previewHTML += `

            <iframe
                class="preview-file"
                src="${note.fileData}"
                title="PDF Preview"
            ></iframe>

        `;

    } else if (
        (
            extension === "TXT" ||
            extension === "MD"
        ) &&
        note.fileData
    ) {

        previewHTML += `

            <pre
                class="preview-text"
                id="textPreview"
            >Loading...</pre>

        `;

    } else {

        previewHTML += `

            <div class="unsupported-preview">

                <div class="unsupported-icon">
                    ${escapeHTML(extension)}
                </div>

                <h3>
                    Preview unavailable
                </h3>

                <p>
                    This file type can be downloaded
                    but cannot be previewed here.
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
        previewHTML;


    previewModal.classList.add(
        "open"
    );


    if (
        extension === "TXT" ||
        extension === "MD"
    ) {

        loadTextPreview(
            note.fileData
        );

    }


    const downloadButton =
        document.getElementById(
            "previewDownloadBtn"
        );


    downloadButton?.addEventListener(
        "click",
        () => downloadNote(note)
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

function downloadNote(note) {

    if (!note.fileData) {

        showToast(
            "No file available."
        );

        return;
    }


    const link =
        document.createElement("a");

    link.href =
        note.fileData;

    link.download =
        note.fileName ||
        note.title;

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

    deleteNoteId = id;

    deleteModal.classList.add(
        "open"
    );
}


function closeDeleteModal() {

    deleteNoteId = null;

    deleteModal.classList.remove(
        "open"
    );
}


function deleteNote() {

    if (!deleteNoteId) {
        return;
    }


    notes =
        notes.filter(
            note =>
                note.id !==
                deleteNoteId
        );


    saveNotes();

    updateStats();

    renderCategoryFilters();

    renderNotes();

    closeDeleteModal();

    showToast(
        "Note deleted successfully."
    );
}


/* =========================================================
   CARD ACTIONS
========================================================= */

notesContainer.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const note =
            notes.find(
                item =>
                    item.id ===
                    button.dataset.id
            );


        if (!note) {
            return;
        }


        const action =
            button.dataset.action;


        if (
            action === "preview"
        ) {

            openPreview(note);

        }


        if (
            action === "download"
        ) {

            downloadNote(note);

        }


        if (
            action === "edit"
        ) {

            openNoteModal(note);

        }


        if (
            action === "delete"
        ) {

            openDeleteModal(
                note.id
            );

        }

    }
);


/* =========================================================
   EVENTS
========================================================= */

document
    .getElementById("addNoteBtn")
    .addEventListener(
        "click",
        () => openNoteModal()
    );


document
    .getElementById("emptyAddBtn")
    .addEventListener(
        "click",
        () => openNoteModal()
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeNoteModal
    );


document
    .getElementById("cancelModal")
    .addEventListener(
        "click",
        closeNoteModal
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
        deleteNote
    );


noteSearch.addEventListener(
    "input",
    renderNotes
);


categoryFilter.addEventListener(
    "change",
    renderNotes
);


statusFilter.addEventListener(
    "change",
    renderNotes
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


        if (!file) {
            return;
        }


        if (
            file.size >
            MAX_FILE_SIZE
        ) {

            showToast(
                "File size must be 5 MB or less."
            );

            return;
        }


        const allowed =
            [
                "pdf",
                "doc",
                "docx",
                "txt",
                "md"
            ];


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (
            !allowed.includes(
                extension
            )
        ) {

            showToast(
                "Unsupported file type."
            );

            return;
        }


        currentFile = file;


        selectedFile.textContent =
            `${file.name} • ${formatBytes(file.size)}`;

        selectedFile.classList.add(
            "show"
        );

    }
);


/* =========================================================
   REFRESH
========================================================= */

document
    .getElementById("refreshBtn")
    .addEventListener(
        "click",
        () => {

            loadNotes();

            updateStats();

            renderCategoryFilters();

            renderNotes();

            showToast(
                "Notes refreshed."
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
    noteModal,
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


        closeNoteModal();

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

        if (!href) return;


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


        loadNotes();

        updateStats();

        renderCategoryFilters();

        renderNotes();

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initNotes() {

    loadNotes();

    updateStats();

    renderCategoryFilters();

    renderNotes();

    setupModuleNavigation();

}


initNotes();