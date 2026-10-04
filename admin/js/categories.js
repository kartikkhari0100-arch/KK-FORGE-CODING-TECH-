/* =========================================================
   KK FORGE - CATEGORIES ADMIN
========================================================= */


/* =========================
   STORAGE
========================= */

const STORAGE_KEYS = {
    categories: "kkforge_categories",
    projects: "kkforge_projects",
    notes: "kkforge_notes",
    files: "kkforge_files"
};


/* =========================
   DOM
========================= */

const categoriesGrid =
    document.getElementById("categoriesGrid");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const typeFilter =
    document.getElementById("typeFilter");

const resultCount =
    document.getElementById("resultCount");

const totalCategories =
    document.getElementById("totalCategories");

const usedCategories =
    document.getElementById("usedCategories");

const unusedCategories =
    document.getElementById("unusedCategories");

const totalReferences =
    document.getElementById("totalReferences");

const categoryModal =
    document.getElementById("categoryModal");

const deleteModal =
    document.getElementById("deleteModal");

const categoryForm =
    document.getElementById("categoryForm");

const categoryId =
    document.getElementById("categoryId");

const categoryName =
    document.getElementById("categoryName");

const categoryType =
    document.getElementById("categoryType");

const categoryColor =
    document.getElementById("categoryColor");

const colorValue =
    document.getElementById("colorValue");

const categoryDescription =
    document.getElementById("categoryDescription");

const modalTitle =
    document.getElementById("modalTitle");

const saveBtnText =
    document.getElementById("saveBtnText");

const deleteMessage =
    document.getElementById("deleteMessage");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================
   DATA HELPERS
========================= */

function getData(key) {

    try {

        const data =
            JSON.parse(localStorage.getItem(key));

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            `Unable to read ${key}`,
            error
        );

        return [];
    }
}


function saveData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );
}


function generateId(prefix = "cat") {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================
   CATEGORY USAGE
========================= */

function getCategoryUsage(categoryName) {

    const projects =
        getData(STORAGE_KEYS.projects);

    const notes =
        getData(STORAGE_KEYS.notes);

    const files =
        getData(STORAGE_KEYS.files);


    const projectCount =
        projects.filter(
            item => item.category === categoryName
        ).length;


    const noteCount =
        notes.filter(
            item => item.category === categoryName
        ).length;


    const fileCount =
        files.filter(
            item => item.category === categoryName
        ).length;


    return {
        projects: projectCount,
        notes: noteCount,
        files: fileCount,
        total:
            projectCount +
            noteCount +
            fileCount
    };
}


/* =========================
   ALL CATEGORY USAGE
========================= */

function getAllUsage() {

    const projects =
        getData(STORAGE_KEYS.projects);

    const notes =
        getData(STORAGE_KEYS.notes);

    const files =
        getData(STORAGE_KEYS.files);


    return [
        ...projects,
        ...notes,
        ...files
    ].filter(
        item =>
            item &&
            typeof item.category === "string" &&
            item.category.trim() !== ""
    );
}


/* =========================
   STATS
========================= */

function updateStats() {

    const categories =
        getData(STORAGE_KEYS.categories);

    const usageItems =
        getAllUsage();


    let usedCount = 0;
    let references = 0;


    categories.forEach(category => {

        const usage =
            getCategoryUsage(category.name);

        if (usage.total > 0) {
            usedCount++;
        }

        references += usage.total;

    });


    totalCategories.textContent =
        categories.length;

    usedCategories.textContent =
        usedCount;

    unusedCategories.textContent =
        categories.length - usedCount;

    totalReferences.textContent =
        references;
}


/* =========================
   FILTER
========================= */

function getFilteredCategories() {

    const categories =
        getData(STORAGE_KEYS.categories);

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const type =
        typeFilter.value;


    return categories.filter(category => {

        const matchesSearch =
            !search ||
            category.name
                .toLowerCase()
                .includes(search) ||
            (category.description || "")
                .toLowerCase()
                .includes(search);


        const matchesType =
            type === "all" ||
            category.type === "all" ||
            category.type === type;


        return matchesSearch && matchesType;
    });
}


/* =========================
   TYPE LABEL
========================= */

function getTypeLabel(type) {

    const labels = {
        all: "All Content",
        project: "Projects",
        note: "Notes",
        file: "Files"
    };

    return labels[type] || "All Content";
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   RENDER
========================= */

function renderCategories() {

    const categories =
        getFilteredCategories();


    categoriesGrid.innerHTML = "";

    resultCount.textContent =
        `${categories.length} ${
            categories.length === 1
                ? "category"
                : "categories"
        }`;


    if (categories.length === 0) {

        emptyState.classList.add("show");

        return;
    }


    emptyState.classList.remove("show");


    categories.forEach(category => {

        const usage =
            getCategoryUsage(category.name);


        const color =
            category.color || "#11c8ff";


        const card =
            document.createElement("article");

        card.className = "category-card";

        card.style.setProperty(
            "--category-color",
            color
        );


        card.innerHTML = `
            <div class="category-top">

                <span
                    class="category-color"
                    title="${escapeHTML(color)}"
                ></span>

                <span class="category-type">
                    ${escapeHTML(
                        getTypeLabel(category.type)
                    )}
                </span>

            </div>


            <h4>
                ${escapeHTML(category.name)}
            </h4>


            <p class="category-description">
                ${
                    escapeHTML(
                        category.description
                    ) ||
                    "No description added."
                }
            </p>


            <div class="category-usage">

                <strong class="usage-number">
                    ${usage.total}
                </strong>

                <span class="usage-label">
                    ${usage.total === 1
                        ? "reference"
                        : "references"}
                </span>

            </div>


            <div class="usage-breakdown">

                <span class="usage-pill">
                    Projects ${usage.projects}
                </span>

                <span class="usage-pill">
                    Notes ${usage.notes}
                </span>

                <span class="usage-pill">
                    Files ${usage.files}
                </span>

            </div>


            <div class="category-actions">

                <button
                    class="category-action"
                    data-action="edit"
                    data-id="${category.id}"
                >
                    Edit
                </button>

                <button
                    class="category-action delete"
                    data-action="delete"
                    data-id="${category.id}"
                >
                    Delete
                </button>

            </div>
        `;


        categoriesGrid.appendChild(card);
    });
}


/* =========================
   OPEN ADD MODAL
========================= */

function openAddModal() {

    categoryForm.reset();

    categoryId.value = "";

    categoryColor.value =
        "#11c8ff";

    colorValue.textContent =
        "#11C8FF";

    modalTitle.textContent =
        "Add Category";

    saveBtnText.textContent =
        "Create Category";

    categoryModal.classList.add("show");

    setTimeout(() => {
        categoryName.focus();
    }, 100);
}


/* =========================
   OPEN EDIT MODAL
========================= */

function openEditModal(id) {

    const categories =
        getData(STORAGE_KEYS.categories);

    const category =
        categories.find(
            item => item.id === id
        );


    if (!category) return;


    categoryId.value =
        category.id;

    categoryName.value =
        category.name;

    categoryType.value =
        category.type || "all";

    categoryColor.value =
        category.color || "#11c8ff";

    colorValue.textContent =
        (
            category.color ||
            "#11c8ff"
        ).toUpperCase();

    categoryDescription.value =
        category.description || "";


    modalTitle.textContent =
        "Edit Category";

    saveBtnText.textContent =
        "Save Changes";


    categoryModal.classList.add("show");

    setTimeout(() => {
        categoryName.focus();
    }, 100);
}


/* =========================
   CLOSE MODAL
========================= */

function closeCategoryModal() {

    categoryModal.classList.remove("show");
}


/* =========================
   CREATE / UPDATE
========================= */

categoryForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            categoryName.value.trim();

        const type =
            categoryType.value;

        const color =
            categoryColor.value;

        const description =
            categoryDescription.value.trim();

        const editingId =
            categoryId.value;


        if (!name) {

            showToast(
                "Category name is required."
            );

            categoryName.focus();

            return;
        }


        let categories =
            getData(STORAGE_KEYS.categories);


        /* Prevent duplicate names */

        const duplicate =
            categories.some(category =>
                category.name.toLowerCase() ===
                name.toLowerCase() &&
                category.id !== editingId
            );


        if (duplicate) {

            showToast(
                "A category with this name already exists."
            );

            return;
        }


        if (editingId) {

            const existing =
                categories.find(
                    category =>
                        category.id === editingId
                );


            if (!existing) {

                showToast(
                    "Category not found."
                );

                return;
            }


            const oldName =
                existing.name;


            /* Update */

            existing.name =
                name;

            existing.type =
                type;

            existing.color =
                color;

            existing.description =
                description;

            existing.updatedAt =
                new Date().toISOString();


            saveData(
                STORAGE_KEYS.categories,
                categories
            );


            /*
             * If category name changed,
             * update all content records.
             */

            if (
                oldName.toLowerCase() !==
                name.toLowerCase()
            ) {

                propagateCategoryRename(
                    oldName,
                    name
                );
            }


            closeCategoryModal();

            refreshUI();

            showToast(
                "Category updated successfully."
            );

        } else {

            const newCategory = {

                id: generateId(),

                name,

                type,

                color,

                description,

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString()
            };


            categories.push(
                newCategory
            );


            saveData(
                STORAGE_KEYS.categories,
                categories
            );


            closeCategoryModal();

            refreshUI();

            showToast(
                "Category created successfully."
            );
        }

    }
);


/* =========================
   CATEGORY RENAME PROPAGATION
========================= */

function propagateCategoryRename(
    oldName,
    newName
) {

    const contentKeys = [
        STORAGE_KEYS.projects,
        STORAGE_KEYS.notes,
        STORAGE_KEYS.files
    ];


    contentKeys.forEach(key => {

        const items =
            getData(key);


        let changed = false;


        items.forEach(item => {

            if (
                item.category === oldName
            ) {

                item.category =
                    newName;

                item.updatedAt =
                    new Date().toISOString();

                changed = true;
            }

        });


        if (changed) {

            saveData(
                key,
                items
            );
        }

    });
}


/* =========================
   DELETE
========================= */

function requestDelete(id) {

    const categories =
        getData(STORAGE_KEYS.categories);

    const category =
        categories.find(
            item => item.id === id
        );


    if (!category) return;


    const usage =
        getCategoryUsage(category.name);


    /*
     * Important:
     * Used category cannot be deleted.
     */

    if (usage.total > 0) {

        showToast(
            `Cannot delete "${category.name}" because it is being used.`
        );

        return;
    }


    deleteModal.dataset.id =
        id;


    deleteMessage.innerHTML =
        `Are you sure you want to delete <strong>"${escapeHTML(
            category.name
        )}"</strong>? This action cannot be undone.`;


    deleteModal.classList.add("show");
}


/* =========================
   CONFIRM DELETE
========================= */

document
    .getElementById("confirmDelete")
    .addEventListener(
        "click",
        function () {

            const id =
                deleteModal.dataset.id;


            let categories =
                getData(
                    STORAGE_KEYS.categories
                );


            const category =
                categories.find(
                    item => item.id === id
                );


            if (!category) {

                deleteModal.classList.remove(
                    "show"
                );

                return;
            }


            /*
             * Double safety check
             */

            const usage =
                getCategoryUsage(
                    category.name
                );


            if (usage.total > 0) {

                deleteModal.classList.remove(
                    "show"
                );

                showToast(
                    "Category is currently in use."
                );

                return;
            }


            categories =
                categories.filter(
                    item => item.id !== id
                );


            saveData(
                STORAGE_KEYS.categories,
                categories
            );


            deleteModal.classList.remove(
                "show"
            );


            refreshUI();

            showToast(
                "Category deleted successfully."
            );
        }
    );


/* =========================
   EVENT DELEGATION
========================= */

categoriesGrid.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) return;


        const action =
            button.dataset.action;

        const id =
            button.dataset.id;


        if (action === "edit") {

            openEditModal(id);
        }


        if (action === "delete") {

            requestDelete(id);
        }

    }
);


/* =========================
   COLOR
========================= */

categoryColor.addEventListener(
    "input",
    function () {

        colorValue.textContent =
            categoryColor.value.toUpperCase();

    }
);


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    renderCategories
);


typeFilter.addEventListener(
    "change",
    renderCategories
);


/* =========================
   ADD BUTTONS
========================= */

document
    .getElementById("addCategoryBtn")
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById("emptyAddBtn")
    .addEventListener(
        "click",
        openAddModal
    );


/* =========================
   CLOSE BUTTONS
========================= */

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeCategoryModal
    );


document
    .getElementById("cancelBtn")
    .addEventListener(
        "click",
        closeCategoryModal
    );


document
    .getElementById("cancelDelete")
    .addEventListener(
        "click",
        function () {

            deleteModal.classList.remove(
                "show"
            );

        }
    );


/* =========================
   OUTSIDE CLICK
========================= */

categoryModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            categoryModal
        ) {

            closeCategoryModal();
        }

    }
);


deleteModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            deleteModal
        ) {

            deleteModal.classList.remove(
                "show"
            );
        }

    }
);


/* =========================
   ESCAPE KEY
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }


        closeCategoryModal();

        deleteModal.classList.remove(
            "show"
        );

    }
);


/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(message) {

    toastMessage.textContent =
        message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);
}


/* =========================
   REFRESH
========================= */

function refreshUI() {

    updateStats();

    renderCategories();
}


document
    .getElementById("refreshBtn")
    .addEventListener(
        "click",
        function () {

            refreshUI();

            showToast(
                "Categories refreshed."
            );

        }
    );


/* =========================
   MOBILE SIDEBAR
========================= */

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


function openSidebar() {

    sidebar.classList.add("open");

    sidebarOverlay.classList.add("show");
}


function closeSidebar() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove(
        "show"
    );
}


mobileMenu.addEventListener(
    "click",
    openSidebar
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebar
);


document
    .querySelectorAll(".nav-item, .view-site")
    .forEach(link => {

        link.addEventListener(
            "click",
            closeSidebar
        );

    });


/* =========================
   LOGOUT
========================= */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmLogout) {

                window.location.href =
                    "../index.html";
            }

        }
    );


/* =========================
   STORAGE SYNC
========================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            [
                STORAGE_KEYS.categories,
                STORAGE_KEYS.projects,
                STORAGE_KEYS.notes,
                STORAGE_KEYS.files
            ].includes(event.key)
        ) {

            refreshUI();
        }

    }
);


/* =========================
   INITIAL LOAD
========================= */

refreshUI();