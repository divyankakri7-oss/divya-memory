// ========================================
// DIVYA MEMORY - MAIN JAVASCRIPT
// ========================================

document.addEventListener("DOMContentLoaded", function () {

   // BOOKING FORM
const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {
    bookingForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const eventType = document.getElementById("event").value;
        const date = document.getElementById("date").value;
        const message = document.getElementById("message").value.trim();

        if (!name || !phone || !eventType || !date) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    phone: phone,
                    event_type: eventType,
                    event_date: date,
                    message: message
                })
            });

            const result = await response.json();

            if (result.success) {
                alert("Your booking request has been submitted successfully!");
                bookingForm.reset();
            } else {
                alert(result.message || "Booking could not be submitted.");
            }

        } catch (error) {
            console.error("Booking error:", error);
            alert("Unable to connect to the booking server.");
        }
    });
}

    // ========================================
    // SMOOTH SCROLLING
    // ========================================

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            // Ignore empty #
            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    // ========================================
    // MOBILE MENU
    // ========================================

    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.querySelector(".nav-links");

    if (menuBtn && navLinks) {

        // Open / close mobile menu
        menuBtn.addEventListener("click", function () {

            navLinks.classList.toggle("active");

        });


        // Close menu after clicking a link
        navLinks.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navLinks.classList.remove("active");

            });

        });

    }


    // ========================================
    // PORTFOLIO FILTER
    // ========================================

    const filterButtons = document.querySelectorAll(".filter-btn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    const showMoreBtn = document.getElementById("showMoreBtn");

    if (filterButtons.length > 0 && portfolioItems.length > 0) {

        let currentFilter = "all";
        let showAll = false;

        function updatePortfolio() {

            const matchingItems = [];

            portfolioItems.forEach(function (item) {

                const category = item.getAttribute("data-category");

                if (
                    currentFilter === "all" ||
                    category === currentFilter
                ) {

                    matchingItems.push(item);

                }

                item.style.display = "none";

            });


            const itemsToShow = showAll
                ? matchingItems
                : matchingItems.slice(0, 6);


            itemsToShow.forEach(function (item) {

                item.style.display = "block";

            });


            // Show More / Show Less button
            if (showMoreBtn) {

                if (matchingItems.length > 6) {

                    showMoreBtn.style.display = "inline-block";

                    showMoreBtn.textContent =
                        showAll ? "Show Less" : "Show More";

                } else {

                    showMoreBtn.style.display = "none";

                }

            }

        }


        // Filter buttons
        filterButtons.forEach(function (button) {

            button.addEventListener("click", function () {

                filterButtons.forEach(function (btn) {

                    btn.classList.remove("active");

                });


                button.classList.add("active");

                currentFilter =
                    button.getAttribute("data-filter");

                showAll = false;

                updatePortfolio();

            });

        });


        // Show More button
        if (showMoreBtn) {

            showMoreBtn.addEventListener("click", function () {

                showAll = !showAll;

                updatePortfolio();

            });

        }


        // Initial portfolio
        updatePortfolio();

    }


    // ========================================
    // CONSOLE MESSAGE
    // ========================================

    console.log(
        "Divya Memory website loaded successfully."
    );

});
