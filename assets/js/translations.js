// File: assets/js/translations.js

// Default language
let currentLang = localStorage.getItem('preferredLanguage') || 'en';

// Cache for loaded translations
const translationsCache = {};

// Elements with data-i18n attributes that need translation
let i18nElements = [];

// Function to load translations for a specific language
async function loadTranslations(lang) {
  // Map 'li' to 'nl' for fetching translations
  const effectiveLang = (lang === 'li') ? 'nl' : lang;

  if (translationsCache[effectiveLang]) {
    console.log(`Using cached translations for ${effectiveLang}`);
    return translationsCache[effectiveLang];
  }

  // ****** CORRECTION: Use root-relative path for fetch ******
  const fetchPath = `/translations/${effectiveLang}.json`;
  // ****** END CORRECTION ******
  console.log(`Fetching translations from: ${fetchPath}`); // Log path for debugging

  try {
    const response = await fetch(fetchPath); // Use root-relative path
    if (!response.ok) {
      // Throw an error with status text for better debugging
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText} for ${fetchPath}`);
    }
    const translations = await response.json();
    console.log(`Successfully loaded translations for ${effectiveLang}`);
    translationsCache[effectiveLang] = translations; // Cache under effectiveLang
    return translations;
  } catch (error) {
    console.error(`Error loading translations: ${error}`);

    // Fallback to English if loading fails AND it wasn't English we were trying to load
    if (effectiveLang !== 'en') {
        console.warn(`Falling back to English translations.`);
        // Ensure English is loaded or load it
        if (translationsCache['en']) {
            return translationsCache['en'];
        } else {
            return await loadTranslations('en'); // Await the recursive call
        }
    }

    return {}; // Return empty object if English also fails or was the initial target
  }
}


// Initialize translations on page load
async function initTranslations() {
  // Find all elements with data-i18n attribute
  i18nElements = document.querySelectorAll('[data-i18n]');
  console.log(`Found ${i18nElements.length} elements for translation.`);

  // Get language from localStorage or default to 'en'
  currentLang = localStorage.getItem('preferredLanguage') || 'en';
  console.log(`Initializing translations with language: ${currentLang}`);

  // Pre-load English translations if not the current language
  if (currentLang !== 'en' && !translationsCache['en']) {
    console.log("Pre-loading English translations for fallback.");
    await loadTranslations('en');
  }

  // Update the active language button
  updateLanguageButtons();

  // Apply translations for the current language
  await applyTranslations();

  // Set up event listeners for language buttons
  setupLanguageButtons();
}

// Apply translations to the page
async function applyTranslations() {
  console.log(`Applying translations for: ${currentLang}`);
  const translations = await loadTranslations(currentLang); // Pass currentLang (e.g., 'li')

  if (!translations || Object.keys(translations).length === 0) {
      console.error(`No translations loaded for ${currentLang}. Aborting apply.`);
      return; // Exit if translations are empty
  }

  // Update each element with the corresponding translation
  i18nElements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (!key) return;

    const keyParts = key.split('.');

    // Navigate through the translations object using the key parts
    let value = translations;
    let found = true; // Flag to track if key path is valid
    for (const part of keyParts) {
      if (value && typeof value === 'object' && value[part] !== undefined) {
        value = value[part];
      } else {
        found = false;
        break; // Key path invalid
      }
    }

    // If key path not found in current language, try fallback
    if (!found) {
        const originalValue = value; // Store original attempt
        value = null; // Reset value for fallback check
        console.warn(`Translation key "${key}" not found for lang "${currentLang}". Trying English fallback.`);
        const enTranslations = translationsCache['en']; // Assume English is loaded/cached

        if (enTranslations) {
             let fallbackValue = enTranslations;
             let fallbackFound = true;
             for (const fbPart of keyParts) {
                 if (fallbackValue && typeof fallbackValue === 'object' && fallbackValue[fbPart] !== undefined) {
                     fallbackValue = fallbackValue[fbPart];
                 } else {
                     fallbackFound = false;
                     break;
                 }
             }
             if (fallbackFound && typeof fallbackValue === 'string') { // Ensure the final value is a string
                 value = fallbackValue + " [EN]"; // Append marker for clarity
                 console.warn(`Using English fallback for "${key}"`);
             } else {
                 console.error(`Fallback failed for key "${key}".`);
             }
        } else {
            console.error(`English fallback translations not available for key "${key}".`);
        }

        if (value === null) { // If fallback also failed or not available
            console.error(`Translation key "${key}" remains unresolved for lang "${currentLang}". Element content unchanged.`);
            // Optionally set to a default placeholder like the key itself
            // element.textContent = `[${key}]`;
            return; // Skip applying translation for this element
        }
    }

    // Ensure the final value is a string before applying
    if (typeof value !== 'string') {
        console.error(`Value for key "${key}" is not a string:`, value);
        return; // Skip applying if not a string
    }

    // Apply translation if found (or fallback used)
    // Use innerHTML for keys likely containing HTML, textContent otherwise
    if (key.includes('.content') || key.includes('.excerpt') || key.includes('.title') || key.includes('.subtitle')) {
       element.innerHTML = value;
    } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      if (element.placeholder !== undefined) { // Check specifically for placeholder attribute
          element.placeholder = value;
      } else {
          element.value = value;
      }
    } else {
      element.textContent = value;
    }
  });

  // Update HTML lang attribute
  document.documentElement.lang = currentLang; // Keep 'li' if selected
  console.log(`Applied translations for: ${currentLang}`);
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

     // Close dropdown when clicking inside it (on options or whitespace)
     langDropdown.addEventListener('click', function(e) {
         // Prevent clicks on buttons from closing immediately
         if (!e.target.classList.contains('lang-btn')) {
             langDropdown.classList.remove('show-options');
         }
     });

  } else {
      console.error("Language dropdown elements not found.");
  }

  // Setup language selection
  const langButtons = document.querySelectorAll('.lang-btn');
  if (langButtons.length > 0) {
      langButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
          e.preventDefault();
          e.stopPropagation(); // Prevent outer dropdown click handler from firing

          const newLang = this.getAttribute('data-lang');
          console.log(`Language button clicked: ${newLang}`);

          // Process the language change if it's different
          if (newLang && newLang !== currentLang) {
            console.log(`Switching language from ${currentLang} to ${newLang}`);
            currentLang = newLang;
            localStorage.setItem('preferredLanguage', newLang);

            // Immediately close the dropdown visually
            if (langDropdown) {
              langDropdown.classList.remove('show-options');
            }

            updateLanguageButtons(); // Update button appearance
            await applyTranslations(); // Apply the new translations
          } else if (newLang === currentLang) {
             console.log(`Language ${newLang} already selected. Closing dropdown.`);
              // If the same language is clicked again, just close the dropdown
             if (langDropdown) {
                 langDropdown.classList.remove('show-options');
             }
          } else {
              console.warn("Language button clicked without a valid new language.");
          }
        });
      });
  } else {
      console.error("Language selection buttons (.lang-btn) not found.");
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTranslations);