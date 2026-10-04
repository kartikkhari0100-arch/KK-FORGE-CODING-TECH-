/* =========================================================
   KK FORGE ADMIN — PROJECT MANAGEMENT
========================================================= */

const STORAGE_KEY = "kkforge_projects";

let projects = [];
let deleteProjectId = null;


/* =========================================================
   DOM
========================================================= */

const projectModal = document.getElementById("projectModal");
const previewModal = document.getElementById("previewModal");
const deleteModal = document.getElementById("deleteModal");

const projectForm = document.getElementById("projectForm");

const projectsContainer =
    document.getElementById("projectsContainer");

const emptyState =
    document.getElementById("emptyState");

const projectSearch =
    document.getElementById("projectSearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const statusFilter =
    document.getElementById("statusFilter");

const categorySuggestions =
    document.getElementById("categorySuggestions");


/* =========================================================
   STORAGE
========================================================= */

function loadProjects() {

    try {

        const stored =
            localStorage.getItem(STORAGE_KEY);

        projects =
            stored ? JSON.parse(stored) : [];

        if (!Array.isArray(projects)) {
            projects = [];
        }

    } catch (error) {

        console.error(
            "Unable to load projects:",
            error
        );

        projects = [];
    }
}


function saveProjects() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(projects)
    );
}


/* =========================================================
   HELPERS
========================================================= */

function generateId() {

    return (
        "project_" +
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


function formatDate(date) {

    if (!date) return "Recently";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
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
        projects.length;

    const featured =
        projects.filter(
            project => project.featured
        ).length;

    const published =
        projects.filter(
            project =>
                project.status === "published"
        ).length;

    const categories =
        new Set(
            projects
                .map(project => project.category)
                .filter(Boolean)
        ).size;


    document.getElementById(
        "totalProjects"
    ).textContent = total;

    document.getElementById(
        "featuredProjects"
    ).textContent = featured;

    document.getElementById(
        "publishedProjects"
    ).textContent = published;

    document.getElementById(
        "projectCategories"
    ).textContent = categories;
}


/* =========================================================
   CATEGORIES
========================================================= */

function getCategories() {

    return [
        ...new Set(
            projects
                .map(project => project.category)
                .filter(Boolean)
                .map(category => category.trim())
        )
    ].sort(
        (a, b) =>
            a.localeCompare(b)
    );
}


function renderCategoryFilters() {

    const categories =
        getCategories();


    categoryFilter.innerHTML =
        `<option value="all">
            All Categories
        </option>`;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        categoryFilter.appendChild(option);

    });


    categorySuggestions.innerHTML = "";


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        categorySuggestions.appendChild(option);

    });
}


/* =========================================================
   FILTER
========================================================= */

function getFilteredProjects() {

    const search =
        projectSearch.value
            .trim()
            .toLowerCase();

    const category =
        categoryFilter.value;

    const status =
        statusFilter.value;


    return projects.filter(project => {

        const searchableText = [
            project.title,
            project.description,
            project.category,
            ...(project.technologies || [])
        ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
            !search ||
            searchableText.includes(search);


        const matchesCategory =
            category === "all" ||
            project.category === category;


        const matchesStatus =
            status === "all" ||
            project.status === status;


        return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
        );

    });
}


/* =========================================================
   RENDER
========================================================= */

function renderProjects() {

    const filtered =
        getFilteredProjects();


    projectsContainer.innerHTML = "";


    if (filtered.length === 0) {

        projectsContainer.style.display =
            "none";

        emptyState.classList.add(
            "visible"
        );

        const hasAnyProjects =
            projects.length > 0;


        const heading =
            emptyState.querySelector("h3");

        const paragraph =
            emptyState.querySelector("p");


        if (hasAnyProjects) {

            heading.textContent =
                "No matching projects";

            paragraph.textContent =
                "Try changing your search or filters.";

        } else {

            heading.textContent =
                "No projects yet";

            paragraph.textContent =
                "Add your first project to start building your portfolio.";
        }

        return;
    }


    projectsContainer.style.display =
        "grid";

    emptyState.classList.remove(
        "visible"
    );


    filtered.forEach(project => {

        projectsContainer.appendChild(
            createProjectCard(project)
        );

    });
}


/* =========================================================
   PROJECT CARD
========================================================= */

function createProjectCard(project) {

    const card =
        document.createElement("article");

    card.className =
        "project-card";


    const imageHTML =
        project.image
            ? `
                <div class="project-image">
                    <img
                        src="${escapeHTML(project.image)}"
                        alt="${escapeHTML(project.title)}"
                        loading="lazy"
                    >
                </div>
            `
            : `
                <div class="project-image">
                    <div class="project-image-placeholder">
                        &lt;/&gt;
                    </div>
                </div>
            `;


    const technologies =
        Array.isArray(project.technologies)
            ? project.technologies
            : [];


    const techHTML =
        technologies.length
            ? technologies
                .slice(0, 6)
                .map(
                    tech =>
                        `<span>${escapeHTML(tech)}</span>`
                )
                .join("")
            : `<span>No technologies added</span>`;


    card.innerHTML = `

        ${imageHTML}

        <div class="project-body">

            <div class="project-top">

                <div class="project-category">
                    ${escapeHTML(
                        project.category ||
                        "Uncategorized"
                    )}
                </div>

                ${
                    project.featured
                        ? `
                            <span class="project-featured">
                                ★ FEATURED
                            </span>
                        `
                        : ""
                }

            </div>


            <h3 class="project-title">
                ${escapeHTML(project.title)}
            </h3>


            <p class="project-description">
                ${escapeHTML(project.description)}
            </p>


            <div class="project-tech">
                ${techHTML}
            </div>


            <div class="project-footer">

                <div
                    class="project-status ${
                        project.status === "published"
                            ? "published"
                            : ""
                    }"
                >

                    <span class="status-dot"></span>

                    ${
                        project.status === "published"
                            ? "Published"
                            : "Draft"
                    }

                </div>


                <div class="project-actions">

                    <button
                        class="card-action"
                        data-action="preview"
                        data-id="${project.id}"
                        title="Preview"
                    >
                        ◉
                    </button>

                    <button
                        class="card-action"
                        data-action="edit"
                        data-id="${project.id}"
                        title="Edit"
                    >
                        ✎
                    </button>

                    <button
                        class="card-action delete"
                        data-action="delete"
                        data-id="${project.id}"
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
   ADD / EDIT MODAL
========================================================= */

function openProjectModal(project = null) {

    projectForm.reset();

    document.getElementById(
        "projectId"
    ).value = "";


    if (project) {

        document.getElementById(
            "modalTitle"
        ).textContent = "Edit Project";


        document.getElementById(
            "projectId"
        ).value = project.id;


        document.getElementById(
            "projectTitle"
        ).value =
            project.title || "";


        document.getElementById(
            "projectCategory"
        ).value =
            project.category || "";


        document.getElementById(
            "projectStatus"
        ).value =
            project.status || "draft";


        document.getElementById(
            "projectDescription"
        ).value =
            project.description || "";


        document.getElementById(
            "projectTechnologies"
        ).value =
            Array.isArray(project.technologies)
                ? project.technologies.join(", ")
                : "";


        document.getElementById(
            "projectGithub"
        ).value =
            project.github || "";


        document.getElementById(
            "projectLive"
        ).value =
            project.live || "";


        document.getElementById(
            "projectImage"
        ).value =
            project.image || "";


        document.getElementById(
            "projectFeatured"
        ).checked =
            Boolean(project.featured);

    } else {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Add Project";


        document.getElementById(
            "projectStatus"
        ).value =
            "published";

    }


    projectModal.classList.add(
        "open"
    );


    setTimeout(() => {

        document.getElementById(
            "projectTitle"
        ).focus();

    }, 100);
}


function closeProjectModal() {

    projectModal.classList.remove(
        "open"
    );
}


/* =========================================================
   SAVE PROJECT
========================================================= */

projectForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const id =
            document.getElementById(
                "projectId"
            ).value;


        const title =
            document.getElementById(
                "projectTitle"
            ).value.trim();


        const category =
            document.getElementById(
                "projectCategory"
            ).value.trim();


        const description =
            document.getElementById(
                "projectDescription"
            ).value.trim();


        const technologies =
            document.getElementById(
                "projectTechnologies"
            ).value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);


        const status =
            document.getElementById(
                "projectStatus"
            ).value;


        const github =
            document.getElementById(
                "projectGithub"
            ).value.trim();


        const live =
            document.getElementById(
                "projectLive"
            ).value.trim();


        const image =
            document.getElementById(
                "projectImage"
            ).value.trim();


        const featured =
            document.getElementById(
                "projectFeatured"
            ).checked;


        /*
           Only ONE featured project.
           If this project becomes featured,
           remove featured from others.
        */

        if (featured) {

            projects.forEach(project => {

                project.featured =
                    project.id === id;

            });

        }


        const now =
            new Date().toISOString();


        if (id) {

            const index =
                projects.findIndex(
                    project =>
                        project.id === id
                );


            if (index !== -1) {

                const oldProject =
                    projects[index];


                projects[index] = {

                    ...oldProject,

                    title,
                    category,
                    description,
                    technologies,
                    status,
                    github,
                    live,
                    image,
                    featured,

                    updatedAt: now

                };

            }

            showToast(
                "Project updated successfully."
            );

        } else {

            /*
               If adding first featured project,
               no other project needs changes.
            */

            if (featured) {

                projects.forEach(
                    project =>
                        project.featured = false
                );

            }


            const newProject = {

                id: generateId(),

                title,
                category,
                description,
                technologies,

                status,

                github,
                live,
                image,

                featured,

                createdAt: now,
                updatedAt: now

            };


            projects.unshift(
                newProject
            );


            showToast(
                "Project added successfully."
            );

        }


        saveProjects();

        updateStats();

        renderCategoryFilters();

        renderProjects();

        closeProjectModal();

    }
);


/* =========================================================
   PREVIEW
========================================================= */

function openPreview(project) {

    const technologies =
        Array.isArray(project.technologies)
            ? project.technologies
            : [];


    const techHTML =
        technologies
            .map(
                tech =>
                    `<span>${escapeHTML(tech)}</span>`
            )
            .join("");


    const imageHTML =
        project.image
            ? `
                <img
                    class="preview-project-image"
                    src="${escapeHTML(project.image)}"
                    alt="${escapeHTML(project.title)}"
                >
            `
            : "";


    const linksHTML = `

        <div class="preview-links">

            ${
                project.github
                    ? `
                        <a
                            href="${escapeHTML(project.github)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="primary-btn"
                        >
                            GitHub ↗
                        </a>
                    `
                    : ""
            }


            ${
                project.live
                    ? `
                        <a
                            href="${escapeHTML(project.live)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="secondary-btn"
                        >
                            Live Demo ↗
                        </a>
                    `
                    : ""
            }

        </div>
    `;


    document.getElementById(
        "previewContent"
    ).innerHTML = `

        <span class="preview-project-category">
            ${escapeHTML(
                project.category ||
                "PROJECT"
            )}
        </span>

        <h2 class="preview-project-title">
            ${escapeHTML(project.title)}
        </h2>

        <p class="preview-project-description">
            ${escapeHTML(project.description)}
        </p>

        ${imageHTML}

        <div class="preview-tech">
            ${techHTML}
        </div>

        ${linksHTML}

        <p class="preview-project-date">
            Last updated:
            ${formatDate(
                project.updatedAt ||
                project.createdAt
            )}
        </p>
    `;


    previewModal.classList.add(
        "open"
    );
}


function closePreview() {

    previewModal.classList.remove(
        "open"
    );
}


/* =========================================================
   DELETE
========================================================= */

function openDeleteModal(id) {

    deleteProjectId = id;

    deleteModal.classList.add(
        "open"
    );
}


function closeDeleteModal() {

    deleteProjectId = null;

    deleteModal.classList.remove(
        "open"
    );
}


function deleteProject() {

    if (!deleteProjectId) {
        return;
    }


    projects =
        projects.filter(
            project =>
                project.id !==
                deleteProjectId
        );


    saveProjects();

    updateStats();

    renderCategoryFilters();

    renderProjects();

    closeDeleteModal();

    showToast(
        "Project deleted successfully."
    );
}


/* =========================================================
   EVENTS
========================================================= */

document
    .getElementById("addProjectBtn")
    .addEventListener(
        "click",
        () => openProjectModal()
    );


document
    .getElementById("emptyAddBtn")
    .addEventListener(
        "click",
        () => openProjectModal()
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeProjectModal
    );


document
    .getElementById("cancelModal")
    .addEventListener(
        "click",
        closeProjectModal
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
        deleteProject
    );


projectSearch.addEventListener(
    "input",
    renderProjects
);


categoryFilter.addEventListener(
    "change",
    renderProjects
);


statusFilter.addEventListener(
    "change",
    renderProjects
);


/* CARD ACTIONS */

projectsContainer.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;


        const project =
            projects.find(
                item =>
                    item.id === id
            );


        if (!project) {
            return;
        }


        const action =
            button.dataset.action;


        if (action === "preview") {

            openPreview(project);

        }


        if (action === "edit") {

            openProjectModal(project);

        }


        if (action === "delete") {

            openDeleteModal(id);

        }

    }
);


/* REFRESH */

document
    .getElementById("refreshBtn")
    .addEventListener(
        "click",
        () => {

            loadProjects();

            updateStats();

            renderCategoryFilters();

            renderProjects();

            showToast(
                "Projects refreshed."
            );

        }
    );


/* LOGOUT */

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
    projectModal,
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
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        closeProjectModal();

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

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    toastMessage.textContent =
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
   ADMIN MODULE ACTIVE STATE
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
            item.getAttribute("href");

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


        loadProjects();

        updateStats();

        renderCategoryFilters();

        renderProjects();

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initProjects() {

    loadProjects();

    updateStats();

    renderCategoryFilters();

    renderProjects();

    setupModuleNavigation();

}


initProjects();