// File: assets/js/translations.js

// Default language
let currentLang = localStorage.getItem('preferredLanguage') || 'en';

// Cache for loaded translations
const translationsCache = {};

// Elements with data-i18n attributes that need translation
let i18nElements = [];

// Function to load translations for a specific language
async function loadTranslations(lang) {
  if (translationsCache[lang]) {
    return translationsCache[lang];
  }
  
  try {
    const response = await fetch(`translations/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${lang}`);
    }
    
    const translations = await response.json();
    translationsCache[lang] = translations;
    return translations;
  } catch (error) {
    console.error(`Error loading translations: ${error}`);
    
    // Fallback to English if loading fails
    if (lang !== 'en') {
      return loadTranslations('en');
    }
    
    return {};
  }
}

// Initialize translations on page load
async function initTranslations() {
  // Find all elements with data-i18n attribute
  i18nElements = document.querySelectorAll('[data-i18n]');
  
  // Get language from localStorage or default to 'en'
  currentLang = localStorage.getItem('preferredLanguage') || 'en';
  
  // Update the active language button
  updateLanguageButtons();
  
  // Apply translations
  await applyTranslations();
  
  // Set up event listeners for language buttons
  setupLanguageButtons();
}

// Apply translations to the page
async function applyTranslations() {
  const translations = await loadTranslations(currentLang);
  
  // Update each element with the corresponding translation
  i18nElements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    
    const keyParts = key.split('.');
    
    // Navigate through the translations object using the key parts
    let value = translations;
    for (const part of keyParts) {
      if (value && value[part] !== undefined) {
        value = value[part];
      } else {
        // If key not found, exit the loop early
        value = null;
        break;
      }
    }
    
    // Apply translation if found
    if (value !== null) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.getAttribute('placeholder')) {
          element.setAttribute('placeholder', value);
        } else {
          element.value = value;
        }
      } else {
        element.textContent = value;
      }
    }
  });
  
  // Update HTML lang attribute
  document.documentElement.lang = currentLang;
}

// Update the active language button and dropdown display
function updateLanguageButtons() {
  // Update active class on language buttons
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(button => {
    if (button.getAttribute('data-lang') === currentLang) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Update the current language display in dropdown
  const currentLangDisplay = document.querySelector('.current-lang');
  if (currentLangDisplay) {
    currentLangDisplay.textContent = currentLang.toUpperCase();
  }
}

// Set up event listeners for language buttons
function setupLanguageButtons() {
  // Setup dropdown toggle behavior
  const currentLangButton = document.querySelector('.current-lang');
  const langDropdown = document.querySelector('.lang-dropdown');
  
  if (currentLangButton && langDropdown) {
    // Toggle dropdown on click
    currentLangButton.addEventListener('click', function(e) {
      e.stopPropagation();
      langDropdown.classList.toggle('show-options');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      langDropdown.classList.remove('show-options');
    });
  }

  // Setup language selection
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const newLang = this.getAttribute('data-lang');
      
      // Always process the language change, even if it's 'en'
      if (newLang) {
        currentLang = newLang;
        localStorage.setItem('preferredLanguage', newLang);
        
        // Close the dropdown after selection
        if (langDropdown) {
          langDropdown.classList.remove('show-options');
        }
        
        updateLanguageButtons();
        await applyTranslations();
      }
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTranslations); 