// File: assets/js/topbar.js

// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
  // Fetch the external topbar HTML
  fetch("assets/includes/topbar.html")
    .then(response => response.text())
    .then(html => {
      const topbarPlaceholder = document.getElementById("topbar-placeholder");
      if (!topbarPlaceholder) return;
      topbarPlaceholder.innerHTML = html;

      // Determine current page from the URL
      let currentPage = window.location.pathname.split("/").pop();
      if (!currentPage) currentPage = "index.html";

      // Query within the injected topbar HTML
      const activeLink = topbarPlaceholder.querySelector(`nav ul li a[href="${currentPage}"]`);
      if (activeLink) {
        activeLink.classList.add("active");
      }

      // Attach click event for mobile hamburger
      const hamburger = topbarPlaceholder.querySelector('.hamburger');
      const menu = topbarPlaceholder.querySelector('.menu');
      if (hamburger && menu) {
        hamburger.addEventListener('click', function(e) {
          e.preventDefault();
          menu.classList.toggle('open');
        });
      }
    })
    .catch(error => console.error("Error loading topbar:", error));
});
