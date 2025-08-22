/**
 * Clipboard Utilities Module
 * 
 * Handles all clipboard-related operations including reading, writing, and validation.
 */

import { hasTextValidator, getTextValidator } from './game-config.js';

/**
 * Check if clipboard API is available
 * @returns {boolean} True if clipboard read functionality is available
 */
export function isClipboardReadAvailable() {
  return navigator.clipboard && typeof navigator.clipboard.readText === 'function';
}

/**
 * Check if clipboard write API is available
 * @returns {boolean} True if clipboard write functionality is available
 */
export function isClipboardWriteAvailable() {
  return navigator.clipboard && typeof navigator.clipboard.writeText === 'function';
}

/**
 * Validate text content for a specific game
 * @param {string} gameId - The game identifier
 * @param {string} text - The text to validate
 * @returns {boolean} True if the text is valid for the game
 */
export function validateTextForGame(gameId, text) {
  if (!hasTextValidator(gameId)) {
    return true; // No validator means any text is valid
  }
  
  const validator = getTextValidator(gameId);
  return validator.test(text);
}

/**
 * Read text from clipboard
 * @returns {Promise<string>} The clipboard text content
 */
export async function readFromClipboard() {
  if (!isClipboardReadAvailable()) {
    throw new Error('Clipboard read not available');
  }
  
  return await navigator.clipboard.readText();
}

/**
 * Write text to clipboard
 * @param {string} text - The text to write to clipboard
 * @returns {Promise<void>}
 */
export async function writeToClipboard(text) {
  if (!isClipboardWriteAvailable()) {
    throw new Error('Clipboard write not available');
  }
  
  return await navigator.clipboard.writeText(text);
}

/**
 * Paste clipboard content to a textarea with validation
 * @param {HTMLTextAreaElement} textarea - The target textarea
 * @returns {Promise<boolean>} True if paste was successful, false if validation failed
 */
export async function pasteToTextarea(textarea) {
  try {
    const clipboardText = await readFromClipboard();
    
    // Validate the text for the specific game
    if (!validateTextForGame(textarea.id, clipboardText)) {
      return false; // Validation failed
    }
    
    // Set the textarea value
    textarea.value = clipboardText;
    
    // Trigger change event to update displays
    const changeEvent = new Event('change', { bubbles: true });
    textarea.dispatchEvent(changeEvent);
    
    return true; // Success
  } catch (error) {
    console.warn('Failed to paste from clipboard:', error);
    return false;
  }
}

/**
 * Setup paste button functionality
 * @param {HTMLButtonElement} button - The paste button element
 */
export function setupPasteButton(button) {
  if (!isClipboardReadAvailable()) {
    return; // Don't show button if clipboard read is not available
  }
  
  button.hidden = false;
  
  button.addEventListener('click', async (event) => {
    const targetTextareaId = event.currentTarget.dataset['for'];
    const textarea = document.getElementById(targetTextareaId);
    
    if (textarea) {
      await pasteToTextarea(textarea);
    }
  });
}