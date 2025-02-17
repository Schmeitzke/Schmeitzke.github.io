// File: assets/js/topbar.js

// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
  // Fetch the external topbar HTML
  fetch("assets/includes/topbar.html")
    .then(response => response.text())
    .then(html => {
      // Insert the fetched HTML into the placeholder div
      document.getElementById("topbar-placeholder").innerHTML = html;

      // Determine the current page from the URL
      let currentPage = window.location.pathname.split("/").pop();
      // Default to index.html if URL is empty
      if (!currentPage) currentPage = "index.html";

      // Select the link that matches the current page and add the 'active' class
      const activeLink = document.querySelector(`nav ul li a[href="${currentPage}"]`);
      if (activeLink) {
        activeLink.classList.add("active");
      }
    })
    .catch(error => console.error("Error loading topbar:", error));
});
