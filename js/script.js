/* =========================================================
   KK FORGE — PUBLIC PORTFOLIO
   MASTER JAVASCRIPT
   ========================================================= */


/* =========================================================
   DOM
   ========================================================= */

const navLinks = document.querySelectorAll(".nav-links a");
const menuBtn = document.getElementById("menuBtn");
const navLinksContainer = document.getElementById("navLinks");

const projectsGrid = document.getElementById("projectsGrid");
const projectsEmpty = document.getElementById("projectsEmpty");

const notesGrid = document.getElementById("notesGrid");
const notesEmpty = document.getElementById("notesEmpty");

const projectSearch = document.getElementById("projectSearch");
const projectCategory = document.getElementById("projectCategory");

const notesSearch = document.getElementById("notesSearch");
const notesCategory = document.getElementById("notesCategory");

const heroProjectCount = document.getElementById("heroProjectCount");

const portfolioModal = document.getElementById("portfolioModal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

const contactForm = document.getElementById("contactForm");
const contactFormNote = document.getElementById("contactFormNote");

const footerYear = document.getElementById("footerYear");


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const STORAGE_KEYS = {

    projects: "kkforge_projects",
    notes: "kkforge_notes",
    files: "kkforge_files",
    categories: "kkforge_categories",
    settings: "kkforge_settings"

};


/* =========================================================
   STATE
   ========================================================= */

let allProjects = [];
let allNotes = [];

let projectSearchValue = "";
let projectCategoryValue = "all";

let notesSearchValue = "";
let notesCategoryValue = "all";


/* =========================================================
   HELPERS
   ========================================================= */

function safeParseStorage(key, fallback = []) {

    try {

        const raw = localStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        const parsed = JSON.parse(raw);

        return parsed;

    } catch (error) {

        console.warn(
            `KK Forge: Unable to read ${key}`,
            error
        );

        return fallback;

    }

}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .trim();

}


function arrayFromValue(value) {

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {

        return value
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

    }

    return [];

}


function getFirstValue(object, keys, fallback = "") {

    for (const key of keys) {

        if (
            object &&
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {

            return object[key];

        }

    }

    return fallback;

}


function isVisibleItem(item) {

    const status = normalizeText(
        getFirstValue(
            item,
            ["status", "visibility"],
            "published"
        )
    );

    return ![
        "draft",
        "hidden",
        "inactive",
        "archived",
        "private"
    ].includes(status);

}


/* =========================================================
   NAVIGATION
   ========================================================= */

if (menuBtn && navLinksContainer) {

    menuBtn.addEventListener("click", () => {

        const isOpen =
            navLinksContainer.classList.toggle("open");

        menuBtn.classList.toggle(
            "active",
            isOpen
        );

        menuBtn.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });


    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            navLinksContainer.classList.remove(
                "open"
            );

            menuBtn.classList.remove(
                "active"
            );

            menuBtn.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


/* =========================================================
   ACTIVE NAV
   ========================================================= */

function setActiveNav(activeLink) {

    navLinks.forEach((link) => {

        link.classList.remove("active");

    });

    if (activeLink) {

        activeLink.classList.add("active");

    }

}


/* =========================================================
   SMOOTH SCROLL
   ========================================================= */

function scrollToSection(targetId, updateHash = true) {

    const target =
        document.querySelector(targetId);

    if (!target) {
        return;
    }

    const navbar =
        document.querySelector(".navbar");

    const navbarHeight =
        navbar
            ? navbar.offsetHeight
            : 0;

    const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        navbarHeight;

    window.scrollTo({

        top: targetPosition,

        behavior: "smooth"

    });

    if (updateHash) {

        history.pushState(
            null,
            "",
            targetId
        );

    }

}


navLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

        const targetId =
            link.getAttribute("href");

        if (
            !targetId ||
            !targetId.startsWith("#")
        ) {
            return;
        }

        const target =
            document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();

        scrollToSection(
            targetId,
            true
        );

        setActiveNav(link);

    });

});


/* =========================================================
   SCROLL SPY
   ========================================================= */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );


if (sections.length > 0) {

    const sectionObserver =
        new IntersectionObserver(

            (entries) => {

                const visibleSections =
                    entries
                        .filter(
                            entry =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );

                if (
                    visibleSections.length === 0
                ) {
                    return;
                }

                const currentId =
                    visibleSections[0]
                        .target
                        .id;

                const currentLink =
                    document.querySelector(
                        `.nav-links a[href="#${currentId}"]`
                    );

                if (currentLink) {

                    setActiveNav(
                        currentLink
                    );

                }

            },

            {
                root: null,

                threshold: [
                    0.15,
                    0.35,
                    0.55
                ],

                rootMargin:
                    "-90px 0px -35% 0px"

            }

        );


    sections.forEach((section) => {

        sectionObserver.observe(
            section
        );

    });

}


/* =========================================================
   HASH NAVIGATION
   ========================================================= */

function handleHashNavigation() {

    const hash =
        window.location.hash;

    if (!hash) {
        return;
    }

    const target =
        document.querySelector(hash);

    if (!target) {
        return;
    }

    setTimeout(() => {

        scrollToSection(
            hash,
            false
        );

        const activeLink =
            document.querySelector(
                `.nav-links a[href="${hash}"]`
            );

        setActiveNav(
            activeLink
        );

    }, 100);

}


window.addEventListener(
    "load",
    handleHashNavigation
);


window.addEventListener(
    "popstate",
    handleHashNavigation
);


/* =========================================================
   ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            if (
                navLinksContainer
            ) {

                navLinksContainer.classList.remove(
                    "open"
                );

            }

            if (menuBtn) {

                menuBtn.classList.remove(
                    "active"
                );

                menuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

            closeModal();

        }

    }
);


/* =========================================================
   LOAD PROJECTS
   ========================================================= */

function loadProjects() {

    const stored =
        safeParseStorage(
            STORAGE_KEYS.projects,
            []
        );

    if (Array.isArray(stored)) {

        allProjects =
            stored.filter(
                isVisibleItem
            );

    } else {

        allProjects = [];

    }

    updateHeroProjectCount();

    populateProjectCategories();

    renderProjects();

}


/* =========================================================
   HERO PROJECT COUNT
   ========================================================= */

function updateHeroProjectCount() {

    if (!heroProjectCount) {
        return;
    }

    const count =
        allProjects.length;

    heroProjectCount.textContent =
        count > 0
            ? `${String(count).padStart(2, "0")}+`
            : "00";

}


/* =========================================================
   PROJECT CATEGORIES
   ========================================================= */

function populateProjectCategories() {

    if (!projectCategory) {
        return;
    }

    const categories =
        [
            ...new Set(
                allProjects
                    .map(project =>
                        getFirstValue(
                            project,
                            [
                                "category",
                                "projectCategory",
                                "type"
                            ]
                        )
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b)
                )
        );

    const current =
        projectCategoryValue;

    projectCategory.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;

    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            String(category);

        option.textContent =
            String(category);

        projectCategory.appendChild(
            option
        );

    });

    projectCategory.value =
        categories.some(
            category =>
                normalizeText(category) ===
                normalizeText(current)
        )
            ? current
            : "all";

}


/* =========================================================
   FILTER PROJECTS
   ========================================================= */

function getFilteredProjects() {

    const search =
        normalizeText(
            projectSearchValue
        );

    return allProjects.filter(
        project => {

            const title =
                normalizeText(
                    getFirstValue(
                        project,
                        [
                            "title",
                            "name",
                            "projectName"
                        ]
                    )
                );

            const description =
                normalizeText(
                    getFirstValue(
                        project,
                        [
                            "description",
                            "summary",
                            "details"
                        ]
                    )
                );

            const category =
                normalizeText(
                    getFirstValue(
                        project,
                        [
                            "category",
                            "projectCategory",
                            "type"
                        ]
                    )
                );

            const technologies =
                normalizeText(
                    arrayFromValue(
                        getFirstValue(
                            project,
                            [
                                "technologies",
                                "tech",
                                "techStack",
                                "tags"
                            ]
                        )
                    ).join(" ")
                );

            const matchesSearch =
                !search ||
                title.includes(search) ||
                description.includes(search) ||
                category.includes(search) ||
                technologies.includes(search);

            const matchesCategory =
                projectCategoryValue === "all" ||
                normalizeText(category) ===
                normalizeText(
                    projectCategoryValue
                );

            return (
                matchesSearch &&
                matchesCategory
            );

        }
    );

}


/* =========================================================
   PROJECT CARD
   ========================================================= */

function createProjectCard(project, index) {

    const title =
        getFirstValue(
            project,
            [
                "title",
                "name",
                "projectName"
            ],
            "Untitled Project"
        );

    const description =
        getFirstValue(
            project,
            [
                "description",
                "summary",
                "details"
            ],
            "Project description will appear here."
        );

    const category =
        getFirstValue(
            project,
            [
                "category",
                "projectCategory",
                "type"
            ],
            "Project"
        );

    const status =
        getFirstValue(
            project,
            [
                "status",
                "visibility"
            ],
            "Published"
        );

    const github =
        getFirstValue(
            project,
            [
                "github",
                "githubUrl",
                "repository",
                "repo"
            ],
            ""
        );

    const live =
        getFirstValue(
            project,
            [
                "live",
                "liveUrl",
                "demo",
                "demoUrl",
                "website"
            ],
            ""
        );

    const technologies =
        arrayFromValue(
            getFirstValue(
                project,
                [
                    "technologies",
                    "tech",
                    "techStack",
                    "tags"
                ],
                []
            )
        );

    const isFeatured =
        Boolean(
            project.featured === true ||
            project.featured === "true" ||
            project.isFeatured === true
        );

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "public-project-card reveal-card";

    article.innerHTML = `

        <div class="public-project-top">

            <span class="public-project-index">
                ${String(index + 1).padStart(2, "0")}
                ${isFeatured ? " / FEATURED" : ""}
            </span>

            <span class="public-project-status">
                ${escapeHTML(status)}
            </span>

        </div>


        <h3>
            ${escapeHTML(title)}
        </h3>


        <p>
            ${escapeHTML(description)}
        </p>


        ${
            technologies.length
                ? `
                    <div class="public-project-tech">

                        ${technologies
                            .slice(0, 8)
                            .map(
                                tech =>
                                    `<span>${escapeHTML(tech)}</span>`
                            )
                            .join("")}

                    </div>
                `
                : ""
        }


        <div class="public-project-actions">

            <button
                type="button"
                class="public-project-action"
                data-project-view
            >
                Details
            </button>


            ${
                live
                    ? `
                        <a
                            href="${escapeHTML(live)}"
                            class="public-project-action primary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Live Demo ↗
                        </a>
                    `
                    : ""
            }


            ${
                github
                    ? `
                        <a
                            href="${escapeHTML(github)}"
                            class="public-project-action"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub ↗
                        </a>
                    `
                    : ""
            }

        </div>

    `;


    const detailsButton =
        article.querySelector(
            "[data-project-view]"
        );

    if (detailsButton) {

        detailsButton.addEventListener(
            "click",
            () => {

                openProjectModal(
                    project
                );

            }
        );

    }


    return article;

}


/* =========================================================
   RENDER PROJECTS
   ========================================================= */

function renderProjects() {

    if (!projectsGrid) {
        return;
    }

    const filtered =
        getFilteredProjects();

    projectsGrid.innerHTML = "";

    if (
        filtered.length === 0
    ) {

        if (projectsEmpty) {
            projectsEmpty.hidden =
                false;
        }

        return;

    }

    if (projectsEmpty) {
        projectsEmpty.hidden =
            true;
    }

    filtered.forEach(
        (project, index) => {

            projectsGrid.appendChild(
                createProjectCard(
                    project,
                    index
                )
            );

        }
    );

    activateRevealCards(
        projectsGrid
    );

}


/* =========================================================
   PROJECT EVENTS
   ========================================================= */

if (projectSearch) {

    projectSearch.addEventListener(
        "input",
        (event) => {

            projectSearchValue =
                event.target.value;

            renderProjects();

        }
    );

}


if (projectCategory) {

    projectCategory.addEventListener(
        "change",
        (event) => {

            projectCategoryValue =
                event.target.value;

            renderProjects();

        }
    );

}


/* =========================================================
   LOAD NOTES
   ========================================================= */

function loadNotes() {

    const stored =
        safeParseStorage(
            STORAGE_KEYS.notes,
            []
        );

    if (Array.isArray(stored)) {

        allNotes =
            stored.filter(
                isVisibleItem
            );

    } else {

        allNotes = [];

    }

    populateNoteCategories();

    renderNotes();

}


/* =========================================================
   NOTE CATEGORIES
   ========================================================= */

function populateNoteCategories() {

    if (!notesCategory) {
        return;
    }

    const categories =
        [
            ...new Set(
                allNotes
                    .map(note =>
                        getFirstValue(
                            note,
                            [
                                "category",
                                "noteCategory",
                                "type"
                            ]
                        )
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b)
                )
        );

    notesCategory.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;

    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            String(category);

        option.textContent =
            String(category);

        notesCategory.appendChild(
            option
        );

    });

    notesCategory.value =
        categories.some(
            category =>
                normalizeText(category) ===
                normalizeText(
                    notesCategoryValue
                )
        )
            ? notesCategoryValue
            : "all";

}


/* =========================================================
   FILTER NOTES
   ========================================================= */

function getFilteredNotes() {

    const search =
        normalizeText(
            notesSearchValue
        );

    return allNotes.filter(
        note => {

            const title =
                normalizeText(
                    getFirstValue(
                        note,
                        [
                            "title",
                            "name",
                            "noteName"
                        ]
                    )
                );

            const description =
                normalizeText(
                    getFirstValue(
                        note,
                        [
                            "description",
                            "summary",
                            "details"
                        ]
                    )
                );

            const category =
                normalizeText(
                    getFirstValue(
                        note,
                        [
                            "category",
                            "noteCategory",
                            "type"
                        ]
                    )
                );

            const fileName =
                normalizeText(
                    getFirstValue(
                        note,
                        [
                            "fileName",
                            "filename",
                            "originalName"
                        ]
                    )
                );

            const matchesSearch =
                !search ||
                title.includes(search) ||
                description.includes(search) ||
                category.includes(search) ||
                fileName.includes(search);

            const matchesCategory =
                notesCategoryValue === "all" ||
                normalizeText(category) ===
                normalizeText(
                    notesCategoryValue
                );

            return (
                matchesSearch &&
                matchesCategory
            );

        }
    );

}


/* =========================================================
   NOTE TYPE
   ========================================================= */

function getNoteType(note) {

    const type =
        getFirstValue(
            note,
            [
                "fileType",
                "mimeType",
                "type"
            ],
            ""
        );

    const fileName =
        getFirstValue(
            note,
            [
                "fileName",
                "filename",
                "originalName"
            ],
            ""
        );

    const combined =
        `${type} ${fileName}`
            .toLowerCase();

    if (combined.includes("pdf")) {
        return "PDF";
    }

    if (
        combined.includes("docx") ||
        combined.includes("word")
    ) {
        return "DOCX";
    }

    if (combined.includes("doc")) {
        return "DOC";
    }

    if (combined.includes("markdown")) {
        return "MD";
    }

    if (combined.includes("text")) {
        return "TXT";
    }

    return "FILE";

}


/* =========================================================
   NOTE CARD
   ========================================================= */

function createNoteCard(note, index) {

    const title =
        getFirstValue(
            note,
            [
                "title",
                "name",
                "noteName"
            ],
            "Untitled Note"
        );

    const description =
        getFirstValue(
            note,
            [
                "description",
                "summary",
                "details"
            ],
            "Study resource available in the KK Forge library."
        );

    const category =
        getFirstValue(
            note,
            [
                "category",
                "noteCategory",
                "type"
            ],
            "Resource"
        );

    const fileName =
        getFirstValue(
            note,
            [
                "fileName",
                "filename",
                "originalName"
            ],
            ""
        );

    const type =
        getNoteType(note);

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "public-note-card reveal-card";

    card.innerHTML = `

        <span class="public-note-type">
            ${escapeHTML(type)}
        </span>


        <h3>
            ${escapeHTML(title)}
        </h3>


        <p>
            ${escapeHTML(description)}
        </p>


        <div class="public-note-meta">

            <span>
                ${escapeHTML(category)}
            </span>

            ${
                fileName
                    ? `
                        <span>
                            ${escapeHTML(fileName)}
                        </span>
                    `
                    : ""
            }

        </div>


        <div class="public-note-actions">

            <button
                type="button"
                class="note-action"
                data-note-preview
            >
                Preview
            </button>


            <button
                type="button"
                class="note-action primary"
                data-note-download
            >
                Download
            </button>

        </div>

    `;


    const previewButton =
        card.querySelector(
            "[data-note-preview]"
        );

    const downloadButton =
        card.querySelector(
            "[data-note-download]"
        );


    if (previewButton) {

        previewButton.addEventListener(
            "click",
            () => {

                previewNote(
                    note
                );

            }
        );

    }


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            () => {

                downloadNote(
                    note
                );

            }
        );

    }


    return card;

}


/* =========================================================
   RENDER NOTES
   ========================================================= */

function renderNotes() {

    if (!notesGrid) {
        return;
    }

    const filtered =
        getFilteredNotes();

    notesGrid.innerHTML = "";

    if (
        filtered.length === 0
    ) {

        if (notesEmpty) {
            notesEmpty.hidden =
                false;
        }

        return;

    }

    if (notesEmpty) {
        notesEmpty.hidden =
            true;
    }

    filtered.forEach(
        (note, index) => {

            notesGrid.appendChild(
                createNoteCard(
                    note,
                    index
                )
            );

        }
    );

    activateRevealCards(
        notesGrid
    );

}


/* =========================================================
   NOTES EVENTS
   ========================================================= */

if (notesSearch) {

    notesSearch.addEventListener(
        "input",
        (event) => {

            notesSearchValue =
                event.target.value;

            renderNotes();

        }
    );

}


if (notesCategory) {

    notesCategory.addEventListener(
        "change",
        (event) => {

            notesCategoryValue =
                event.target.value;

            renderNotes();

        }
    );

}


/* =========================================================
   GET FILE DATA
   ========================================================= */

function getFileData(item) {

    return getFirstValue(
        item,
        [
            "data",
            "fileData",
            "content",
            "url",
            "fileUrl",
            "src"
        ],
        ""
    );

}


/* =========================================================
   PREVIEW NOTE
   ========================================================= */

function previewNote(note) {

    const title =
        getFirstValue(
            note,
            [
                "title",
                "name",
                "noteName"
            ],
            "Note"
        );

    const description =
        getFirstValue(
            note,
            [
                "description",
                "summary",
                "details"
            ],
            ""
        );

    const fileData =
        getFileData(note);

    const fileType =
        getFirstValue(
            note,
            [
                "fileType",
                "mimeType"
            ],
            ""
        );

    const fileName =
        getFirstValue(
            note,
            [
                "fileName",
                "filename",
                "originalName"
            ],
            ""
        );


    let previewHTML = "";


    if (fileData) {

        const normalizedType =
            `${fileType} ${fileName}`
                .toLowerCase();


        if (
            normalizedType.includes("pdf") ||
            String(fileData).startsWith(
                "data:application/pdf"
            )
        ) {

            previewHTML = `

                <div class="modal-document-preview">

                    <iframe
                        src="${escapeHTML(fileData)}"
                        title="${escapeHTML(title)}"
                    ></iframe>

                </div>

            `;

        } else if (
            normalizedType.includes("image") ||
            /\.(png|jpe?g|gif|webp)$/i.test(
                fileName
            )
        ) {

            previewHTML = `

                <div class="modal-document-preview">

                    <img
                        src="${escapeHTML(fileData)}"
                        alt="${escapeHTML(title)}"
                        style="
                            display:block;
                            width:100%;
                            height:auto;
                            max-height:600px;
                            object-fit:contain;
                            background:#050911;
                        "
                    >

                </div>

            `;

        } else {

            previewHTML = `

                <div class="modal-document-preview">

                    <iframe
                        src="${escapeHTML(fileData)}"
                        title="${escapeHTML(title)}"
                    ></iframe>

                </div>

            `;

        }

    } else {

        previewHTML = `

            <div class="dynamic-empty">

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    Preview unavailable
                </h3>

                <p>
                    This resource does not contain a browser-previewable file.
                </p>

            </div>

        `;

    }


    openModal(`

        <p class="modal-label">
            ${escapeHTML(
                getFirstValue(
                    note,
                    [
                        "category",
                        "noteCategory",
                        "type"
                    ],
                    "RESOURCE"
                )
            )}
        </p>


        <h3>
            ${escapeHTML(title)}
        </h3>


        ${
            description
                ? `
                    <p class="modal-description">
                        ${escapeHTML(description)}
                    </p>
                `
                : ""
        }


        ${previewHTML}

    `);

}


/* =========================================================
   DOWNLOAD NOTE
   ========================================================= */

function downloadNote(note) {

    const fileData =
        getFileData(note);

    if (!fileData) {

        alert(
            "Download is unavailable because this note has no attached file."
        );

        return;

    }


    const fileName =
        getFirstValue(
            note,
            [
                "fileName",
                "filename",
                "originalName",
                "title",
                "name"
            ],
            "kk-forge-note"
        );


    const anchor =
        document.createElement(
            "a"
        );

    anchor.href =
        fileData;

    anchor.download =
        fileName;

    document.body.appendChild(
        anchor
    );

    anchor.click();

    anchor.remove();

}


/* =========================================================
   PROJECT MODAL
   ========================================================= */

function openProjectModal(project) {

    const title =
        getFirstValue(
            project,
            [
                "title",
                "name",
                "projectName"
            ],
            "Project"
        );

    const description =
        getFirstValue(
            project,
            [
                "description",
                "summary",
                "details"
            ],
            ""
        );

    const category =
        getFirstValue(
            project,
            [
                "category",
                "projectCategory",
                "type"
            ],
            "PROJECT"
        );

    const technologies =
        arrayFromValue(
            getFirstValue(
                project,
                [
                    "technologies",
                    "tech",
                    "techStack",
                    "tags"
                ],
                []
            )
        );

    const github =
        getFirstValue(
            project,
            [
                "github",
                "githubUrl",
                "repository",
                "repo"
            ],
            ""
        );

    const live =
        getFirstValue(
            project,
            [
                "live",
                "liveUrl",
                "demo",
                "demoUrl",
                "website"
            ],
            ""
        );


    openModal(`

        <p class="modal-label">
            ${escapeHTML(category)}
        </p>


        <h3>
            ${escapeHTML(title)}
        </h3>


        <p class="modal-description">
            ${escapeHTML(description)}
        </p>


        ${
            technologies.length
                ? `
                    <div class="public-project-tech">

                        ${technologies
                            .map(
                                tech =>
                                    `<span>${escapeHTML(tech)}</span>`
                            )
                            .join("")}

                    </div>
                `
                : ""
        }


        <div class="public-project-actions">

            ${
                live
                    ? `
                        <a
                            href="${escapeHTML(live)}"
                            class="public-project-action primary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open Live Demo ↗
                        </a>
                    `
                    : ""
            }


            ${
                github
                    ? `
                        <a
                            href="${escapeHTML(github)}"
                            class="public-project-action"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View GitHub ↗
                        </a>
                    `
                    : ""
            }

        </div>

    `);

}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(content) {

    if (
        !portfolioModal ||
        !modalContent
    ) {
        return;
    }

    modalContent.innerHTML =
        content;

    portfolioModal.classList.add(
        "open"
    );

    portfolioModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function closeModal() {

    if (
        !portfolioModal
    ) {
        return;
    }

    portfolioModal.classList.remove(
        "open"
    );

    portfolioModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    if (modalContent) {
        modalContent.innerHTML = "";
    }

}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


if (portfolioModal) {

    portfolioModal
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeModal
                );

            }
        );

}


/* =========================================================
   CONTACT FORM
   ========================================================= */

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "contactName"
                )?.value.trim() || "";


            const email =
                document.getElementById(
                    "contactEmail"
                )?.value.trim() || "";


            const subject =
                document.getElementById(
                    "contactSubject"
                )?.value.trim() || "";


            const message =
                document.getElementById(
                    "contactMessage"
                )?.value.trim() || "";


            if (
                !name ||
                !email ||
                !subject ||
                !message
            ) {

                if (contactFormNote) {

                    contactFormNote.textContent =
                        "Please complete all fields first.";

                    contactFormNote.style.color =
                        "#ff879b";

                }

                return;

            }


            const mailSubject =
                encodeURIComponent(
                    subject
                );


            const mailBody =
                encodeURIComponent(
                    `Hello Kartik,

Name: ${name}
Email: ${email}

Message:
${message}

Sent from KK Forge Portfolio.`
                );


            const mailto =
                `mailto:kartikkhari0100@gmail.com?subject=${mailSubject}&body=${mailBody}`;


            window.location.href =
                mailto;


            if (contactFormNote) {

                contactFormNote.textContent =
                    "Your email app should open with the message prepared.";

                contactFormNote.style.color =
                    "#6edfff";

            }

        }
    );

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function activateRevealSections() {

    const revealSections =
        document.querySelectorAll(
            ".reveal-section"
        );

    if (
        !("IntersectionObserver" in window)
    ) {

        revealSections.forEach(
            section =>
                section.classList.add(
                    "active"
                )
        );

        return;

    }


    const revealObserver =
        new IntersectionObserver(

            (entries, observer) => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "active"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },

            {
                threshold: 0.12
            }

        );


    revealSections.forEach(
        section =>
            revealObserver.observe(
                section
            )
    );

}


function activateRevealCards(
    container = document
) {

    const cards =
        container.querySelectorAll(
            ".reveal-card"
        );

    if (
        !("IntersectionObserver" in window)
    ) {

        cards.forEach(
            card =>
                card.classList.add(
                    "active"
                )
        );

        return;

    }


    const cardObserver =
        new IntersectionObserver(

            (entries, observer) => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "active"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },

            {
                threshold: 0.1
            }

        );


    cards.forEach(
        (card, index) => {

            card.style.transitionDelay =
                `${(index % 3) * 0.08}s`;

            cardObserver.observe(
                card
            );

        }
    );

}


/* =========================================================
   ADMIN DATA LIVE REFRESH
   ========================================================= */

window.addEventListener(
    "storage",
    (event) => {

        if (
            [
                STORAGE_KEYS.projects,
                STORAGE_KEYS.notes,
                STORAGE_KEYS.files,
                STORAGE_KEYS.categories
            ].includes(event.key)
        ) {

            loadProjects();

            loadNotes();

        }

    }
);


/* =========================================================
   SAME-TAB REFRESH SUPPORT
   ========================================================= */

window.addEventListener(
    "focus",
    () => {

        loadProjects();

        loadNotes();

    }
);


/* =========================================================
   FOOTER YEAR
   ========================================================= */

if (footerYear) {

    footerYear.textContent =
        new Date().getFullYear();

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializePortfolio() {

    loadProjects();

    loadNotes();

    activateRevealSections();

    activateRevealCards();

}


initializePortfolio();