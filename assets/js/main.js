// File: assets/js/main.js

document.addEventListener('DOMContentLoaded', function () {
  // Add a shadow to the header when scrolling
  const header = document.querySelector('header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});
