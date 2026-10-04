/* =========================================
   KK FORGE - SETTINGS
========================================= */

const SETTINGS_KEY = "kkforge_settings";

const DEFAULT_SETTINGS = {
    theme: "dark",
    brightness: 100,
    animations: true,

    portfolioTitle: "KK Forge",
    portfolioTagline: "Learn. Build. Repeat.",
    portfolioStatus: "online",

    adminName: "Kartik",
    adminRole: "Administrator"
};


/* =========================================
   STORAGE HELPERS
========================================= */

function getSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);

        if (!saved) {
            return { ...DEFAULT_SETTINGS };
        }

        return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(saved)
        };

    } catch (error) {
        console.error("Settings load error:", error);

        return { ...DEFAULT_SETTINGS };
    }
}


function saveSettings(data) {
    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
            ...data,
            updatedAt: new Date().toISOString()
        })
    );
}


/* =========================================
   DOM
========================================= */

const themeButtons =
    document.querySelectorAll(".theme-option");

const brightnessRange =
    document.getElementById("brightnessRange");

const brightnessValue =
    document.getElementById("brightnessValue");

const animationsToggle =
    document.getElementById("animationsToggle");

const portfolioTitle =
    document.getElementById("portfolioTitle");

const portfolioTagline =
    document.getElementById("portfolioTagline");

const portfolioStatus =
    document.getElementById("portfolioStatus");

const adminName =
    document.getElementById("adminName");

const adminRole =
    document.getElementById("adminRole");

const profilePreviewName =
    document.getElementById("profilePreviewName");

const profilePreviewRole =
    document.getElementById("profilePreviewRole");

const saveBtn =
    document.getElementById("saveBtn");

const resetBtn =
    document.getElementById("resetBtn");

const saveStatus =
    document.getElementById("saveStatus");


/* =========================================
   THEME
========================================= */

function applyTheme(theme) {

    document.body.dataset.theme = theme;

    themeButtons.forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.theme === theme
        );

    });
}


themeButtons.forEach((button) => {

    button.addEventListener("click", () => {

        applyTheme(button.dataset.theme);

        markUnsaved();

    });

});


/* =========================================
   BRIGHTNESS
========================================= */

function applyBrightness(value) {

    const brightness = Number(value);

    document.documentElement.style.setProperty(
        "--brightness",
        brightness / 100
    );

    brightnessValue.textContent =
        `${brightness}%`;
}


brightnessRange.addEventListener(
    "input",
    () => {

        applyBrightness(
            brightnessRange.value
        );

        markUnsaved();
    }
);


/* =========================================
   ANIMATIONS
========================================= */

function applyAnimations(enabled) {

    document.body.classList.toggle(
        "no-animations",
        !enabled
    );
}


animationsToggle.addEventListener(
    "change",
    () => {

        applyAnimations(
            animationsToggle.checked
        );

        markUnsaved();
    }
);


/* =========================================
   PROFILE PREVIEW
========================================= */

function updateProfilePreview() {

    const name =
        adminName.value.trim() || "Kartik";

    const role =
        adminRole.value.trim() || "Administrator";

    profilePreviewName.textContent = name;

    profilePreviewRole.textContent = role;
}


adminName.addEventListener(
    "input",
    () => {

        updateProfilePreview();

        markUnsaved();
    }
);


adminRole.addEventListener(
    "input",
    () => {

        updateProfilePreview();

        markUnsaved();
    }
);


/* =========================================
   SAVE STATUS
========================================= */

function markUnsaved() {

    saveStatus.textContent =
        "Unsaved changes";

    saveStatus.style.color =
        "#ffc76b";

    saveStatus.style.borderColor =
        "rgba(255, 199, 107, 0.18)";

    saveStatus.style.background =
        "rgba(255, 199, 107, 0.05)";
}


function markSaved() {

    saveStatus.textContent =
        "All changes saved";

    saveStatus.style.color =
        "#72eaa7";

    saveStatus.style.borderColor =
        "rgba(37, 226, 122, 0.16)";

    saveStatus.style.background =
        "rgba(37, 226, 122, 0.05)";
}


/* =========================================
   COLLECT SETTINGS
========================================= */

function collectSettings() {

    const activeTheme =
        document.querySelector(
            ".theme-option.active"
        );

    return {

        theme:
            activeTheme?.dataset.theme ||
            "dark",

        brightness:
            Number(brightnessRange.value),

        animations:
            animationsToggle.checked,

        portfolioTitle:
            portfolioTitle.value.trim() ||
            "KK Forge",

        portfolioTagline:
            portfolioTagline.value.trim() ||
            "Learn. Build. Repeat.",

        portfolioStatus:
            portfolioStatus.value,

        adminName:
            adminName.value.trim() ||
            "Kartik",

        adminRole:
            adminRole.value.trim() ||
            "Administrator"
    };
}


/* =========================================
   APPLY SETTINGS
========================================= */

function applySettings(settings) {

    applyTheme(settings.theme);

    brightnessRange.value =
        settings.brightness;

    applyBrightness(
        settings.brightness
    );

    animationsToggle.checked =
        settings.animations;

    applyAnimations(
        settings.animations
    );

    portfolioTitle.value =
        settings.portfolioTitle;

    portfolioTagline.value =
        settings.portfolioTagline;

    portfolioStatus.value =
        settings.portfolioStatus;

    adminName.value =
        settings.adminName;

    adminRole.value =
        settings.adminRole;

    updateProfilePreview();
}


/* =========================================
   SAVE
========================================= */

saveBtn.addEventListener(
    "click",
    () => {

        const settings =
            collectSettings();

        saveSettings(settings);

        applySettings(settings);

        markSaved();

        saveBtn.textContent =
            "Saved ✓";

        setTimeout(() => {

            saveBtn.textContent =
                "Save Settings";

        }, 1500);
    }
);


/* =========================================
   RESET APPEARANCE
========================================= */

resetBtn.addEventListener(
    "click",
    () => {

        const current =
            getSettings();

        const resetAppearance = {
            ...current,

            theme: "dark",
            brightness: 100,
            animations: true
        };

        applySettings(
            resetAppearance
        );

        saveSettings(
            resetAppearance
        );

        markSaved();

        resetBtn.textContent =
            "Reset ✓";

        setTimeout(() => {

            resetBtn.textContent =
                "Reset Appearance";

        }, 1200);
    }
);


/* =========================================
   STORAGE STATS
========================================= */

function getArray(key) {

    try {

        const data =
            localStorage.getItem(key);

        if (!data) return [];

        const parsed =
            JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        return [];
    }
}


function updateStorageStats() {

    const projects =
        getArray("kkforge_projects");

    const notes =
        getArray("kkforge_notes");

    const files =
        getArray("kkforge_files");

    const categories =
        getArray("kkforge_categories");


    document.getElementById(
        "storageProjects"
    ).textContent = projects.length;


    document.getElementById(
        "storageNotes"
    ).textContent = notes.length;


    document.getElementById(
        "storageFiles"
    ).textContent = files.length;


    document.getElementById(
        "storageCategories"
    ).textContent = categories.length;
}


/* =========================================
   MOBILE SIDEBAR
========================================= */

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


function closeSidebar() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove(
        "active"
    );
}


mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

        sidebarOverlay.classList.toggle(
            "active"
        );
    }
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebar
);


/* =========================================
   LOGOUT
========================================= */

const logoutBtn =
    document.getElementById("logoutBtn");

logoutBtn.addEventListener(
    "click",
    () => {

        const confirmLogout =
            confirm(
                "Are you sure you want to leave the admin panel?"
            );

        if (!confirmLogout) {
            return;
        }

        window.location.href =
            "../index.html";
    }
);


/* =========================================
   INITIALIZE
========================================= */

function initializeSettings() {

    const settings =
        getSettings();

    applySettings(
        settings
    );

    updateStorageStats();

    markSaved();
}


initializeSettings();


/* =========================================
   STORAGE SYNC
========================================= */

window.addEventListener(
    "storage",
    (event) => {

        if (
            event.key === SETTINGS_KEY
        ) {

            const settings =
                getSettings();

            applySettings(
                settings
            );

            markSaved();
        }

        if (
            [
                "kkforge_projects",
                "kkforge_notes",
                "kkforge_files",
                "kkforge_categories"
            ].includes(event.key)
        ) {

            updateStorageStats();
        }
    }
);