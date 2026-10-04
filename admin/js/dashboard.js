/* =========================================================
   KK FORGE — ADMIN DASHBOARD JS
========================================================= */


/* ================= ELEMENTS ================= */

const sidebar = document.querySelector(".sidebar");
const mobileMenu = document.querySelector(".mobile-menu");
const sidebarOverlay = document.querySelector(".sidebar-overlay");

const logoutBtn = document.querySelector(".logout-btn");
const notificationBtn = document.querySelector(".icon-button");

const navItems = document.querySelectorAll(".nav-item");
const quickActions = document.querySelectorAll(".quick-action");
const overviewCards = document.querySelectorAll(".overview-card");


/* ================= MOBILE SIDEBAR ================= */

function openSidebar() {

    if (!sidebar || !sidebarOverlay) return;

    sidebar.classList.add("open");
    sidebarOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeSidebar() {

    if (!sidebar || !sidebarOverlay) return;

    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");

    document.body.style.overflow = "";
}


/* Mobile menu */

if (mobileMenu) {

    mobileMenu.addEventListener("click", () => {
        openSidebar();
    });

}


/* Overlay */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener("click", () => {
        closeSidebar();
    });

}


/* Close sidebar when clicking navigation on mobile */

navItems.forEach((item) => {

    item.addEventListener("click", () => {

        if (window.innerWidth <= 760) {
            closeSidebar();
        }

    });

});


/* Close sidebar with Escape */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeSidebar();
    }

});


/* ================= WINDOW RESIZE ================= */

window.addEventListener("resize", () => {

    if (window.innerWidth > 760) {
        closeSidebar();
    }

});


/* ================= ACTIVE NAVIGATION ================= */

navItems.forEach((item) => {

    item.addEventListener("click", (event) => {

        /*
         * Only handle links that actually point somewhere.
         * Placeholder links (#) remain on the current page.
         */

        const href = item.getAttribute("href");

        if (href && href !== "#") {

            navItems.forEach((nav) => {
                nav.classList.remove("active");
            });

            item.classList.add("active");

        }

    });

});


/* ================= NOTIFICATION ================= */

if (notificationBtn) {

    notificationBtn.addEventListener("click", () => {

        const dot = notificationBtn.querySelector(
            ".notification-dot"
        );

        if (dot) {
            dot.style.display = "none";
        }

        console.log("KK Forge notifications opened.");

    });

}


/* ================= LOGOUT ================= */

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;

        /*
         * Authentication will be connected later.
         * For now, return to the public portfolio.
         */

        window.location.href = "../index.html";

    });

}


/* ================= OVERVIEW CARD INTERACTION ================= */

overviewCards.forEach((card) => {

    card.addEventListener("click", () => {

        card.classList.add("card-clicked");

        setTimeout(() => {

            card.classList.remove("card-clicked");

        }, 180);

    });

});


/* ================= QUICK ACTIONS ================= */

quickActions.forEach((action) => {

    action.addEventListener("click", () => {

        const title =
            action.querySelector("strong")?.textContent.trim();

        if (!title) return;

        /*
         * These actions will be connected to real
         * project / notes / file management pages later.
         */

        console.log(`Quick Action: ${title}`);

    });

});


/* ================= DASHBOARD LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("KK Forge Admin Dashboard loaded.");

});

/* =========================================================
   KK FORGE ADMIN — MODULE NAVIGATION
   ========================================================= */

(function setupAdminModuleNavigation() {

    const navItems =
        document.querySelectorAll(
            ".sidebar-nav .nav-item"
        );


    if (!navItems.length) {
        return;
    }


    /* ================= CURRENT MODULE ================= */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    navItems.forEach((item) => {

        const href =
            item.getAttribute("href");


        if (!href) {
            return;
        }


        const itemPage =
            href
                .split("/")
                .pop()
                .toLowerCase();


        item.classList.toggle(
            "active",
            itemPage === currentPage
        );

    });


    /* ================= MODULE CLICK ================= */

    navItems.forEach((item) => {

        item.addEventListener(
            "click",
            () => {

                navItems.forEach((nav) => {

                    nav.classList.remove(
                        "active"
                    );

                });


                item.classList.add(
                    "active"
                );

            }
        );

    });


    /* ================= MOBILE MENU ================= */

    const mobileMenu =
        document.querySelector(
            ".mobile-menu"
        );


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const overlay =
        document.querySelector(
            ".sidebar-overlay"
        );


    function closeSidebar() {

        if (sidebar) {

            sidebar.classList.remove(
                "open"
            );

        }


        if (overlay) {

            overlay.classList.remove(
                "active"
            );

        }

    }


    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            () => {

                sidebar?.classList.toggle(
                    "open"
                );

                overlay?.classList.toggle(
                    "active"
                );

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    navItems.forEach((item) => {

        item.addEventListener(
            "click",
            closeSidebar
        );

    });


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeSidebar();

            }

        }
    );

})();