/**
 * DOM Utilities Module
 * 
 * Contains utility functions for DOM manipulation and element selection.
 */

/**
 * Get all textarea elements in the document
 * @returns {HTMLTextAreaElement[]} Array of all textarea elements
 */
export function getAllTextareas() {
  return [...document.querySelectorAll("textarea")];
}

/**
 * Get the score display element for a specific textarea
 * @param {string} textareaId - The textarea identifier
 * @returns {HTMLElement|null} The score display element or null if not found
 */
export function getScoreDisplay(textareaId) {
  return document.getElementById(`score-${textareaId}`);
}

/**
 * Get the main results display element
 * @returns {HTMLElement|null} The results pre element
 */
export function getResultsElement() {
  return document.querySelector("pre");
}

/**
 * Get all paste buttons in the document
 * @returns {HTMLButtonElement[]} Array of all paste button elements
 */
export function getAllPasteButtons() {
  return [...document.querySelectorAll('.paste-button')];
}

/**
 * Get all game link elements
 * @returns {HTMLAnchorElement[]} Array of all game link elements
 */
export function getAllGameLinks() {
  return [...document.querySelectorAll('h3 a')];
}

/**
 * Get the share button element
 * @returns {HTMLButtonElement|null} The share button element
 */
export function getShareButton() {
  return document.getElementById("share");
}

/**
 * Get the form element
 * @returns {HTMLFormElement|null} The form element
 */
export function getFormElement() {
  return document.querySelector("form");
}

/**
 * Focus and select text in a textarea
 * @param {HTMLTextAreaElement} textarea - The textarea to focus and select
 */
export function focusAndSelectTextarea(textarea) {
  textarea.focus();
  textarea.select();
}

/**
 * Show temporary feedback on a button
 * @param {HTMLButtonElement} button - The button element
 * @param {string} temporaryText - The temporary text to show
 * @param {number} duration - Duration in milliseconds (default: 1000)
 */
export function showTemporaryButtonFeedback(button, temporaryText, duration = 1000) {
  const originalContent = button.innerHTML;
  button.innerHTML = temporaryText;
  
  setTimeout(() => {
    button.innerHTML = originalContent;
  }, duration);
}

/**
 * Check if IndexedDB is available
 * @returns {boolean} True if IndexedDB is available
 */
export function isIndexedDBAvailable() {
  return 'indexedDB' in window;
}

/**
 * Get cookie consent related elements
 * @returns {Object} Object containing cookie consent and stats link elements
 */
export function getCookieConsentElements() {
  return {
    linkCookieConsent: document.getElementById("link-cookie-consent"),
    linkStats: document.getElementById("link-stats")
  };
}