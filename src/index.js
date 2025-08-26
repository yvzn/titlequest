/**
 * Title Quest - Main Application Entry Point
 * 
 * A set of bookmarks to play selected title-guessing games.
 * This module orchestrates the main application functionality using specialized modules.
 */

import Cookies from 'js-cookie'
import './style.css'

// Import utility modules
import { updateScoreDisplay, updateResultsDisplay } from './score-manager.js'
import { setupPasteButton, pasteToTextarea, writeToClipboard, isClipboardReadAvailable } from './clipboard-utils.js'
import * as DOM from './dom-utils.js'

// ============================================================================
// GLOBAL STATE
// ============================================================================

let focusedTextareaId = undefined

// ============================================================================
// DOM ELEMENT REFERENCES
// ============================================================================

const allTextareas = DOM.getAllTextareas()
const resultsElement = DOM.getResultsElement()
const shareButton = DOM.getShareButton()
const formElement = DOM.getFormElement()

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Update score displays when textarea content changes
 * @param {Event} event - The change event
 */
function updateScores(event) {
  const textarea = event.currentTarget
  const scoreDisplay = DOM.getScoreDisplay(textarea.id)
  
  // Update individual score display
  updateScoreDisplay(textarea, scoreDisplay)
  
  // Update aggregated results display
  updateResultsDisplay(allTextareas, resultsElement)
}

/**
 * Focus and select textarea content
 * @param {Event} event - The focus event
 */
function focusTextarea(event) {
  const textarea = event.currentTarget
  DOM.focusAndSelectTextarea(textarea)
  focusedTextareaId = textarea.id
}

/**
 * Share results to clipboard
 * @param {Event} event - The click event
 */
async function shareResults(event) {
  const button = event.currentTarget
  const textToShare = resultsElement.innerText.trim()
  
  try {
    await writeToClipboard(textToShare)
    DOM.showTemporaryButtonFeedback(button, 'Copied !', 1000)
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error)
    DOM.showTemporaryButtonFeedback(button, 'Failed to copy', 1000)
  }
}

/**
 * Focus the corresponding game textarea
 * @param {Event} event - The click event
 */
function focusGameTextarea(event) {
  const gameLink = event.currentTarget
  const targetTextareaId = gameLink.dataset['for']
  const textarea = document.getElementById(targetTextareaId)
  
  if (textarea) {
    textarea.focus()
    const focusEvent = new Event('focus', { bubbles: true })
    textarea.dispatchEvent(focusEvent)
  }
}

/**
 * Automatically paste from clipboard when window gains focus
 */
async function autoPasteFromClipboard() {
  console.debug('Focused textarea:', focusedTextareaId)
  if (!isClipboardReadAvailable() || !focusedTextareaId) {
    return
  }

  const textarea = document.getElementById(focusedTextareaId)
  if (textarea) {
    const success = await pasteToTextarea(textarea)
    if (success) {
      focusedTextareaId = undefined
      console.debug('Focused textarea:', focusedTextareaId)
      return
    }
  }
}

async function checkForAutoPaste() {
  if (document.visibilityState === 'visible') {
    await autoPasteFromClipboard()
  }
}

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initialize textarea event listeners
 */
function initializeTextareas() {
  allTextareas.forEach(textarea => {
    textarea.addEventListener('change', updateScores)
    textarea.addEventListener('focus', focusTextarea)
  })
}

/**
 * Initialize form submission prevention
 */
function initializeForm() {
  if (formElement) {
    formElement.addEventListener("submit", (event) => {
      event.preventDefault()
    })
  }
}

/**
 * Initialize share button functionality
 */
function initializeShareButton() {
  if (shareButton) {
    shareButton.addEventListener("click", shareResults)
  }
}

/**
 * Initialize paste buttons functionality
 */
function initializePasteButtons() {
  const pasteButtons = DOM.getAllPasteButtons()
  pasteButtons.forEach(setupPasteButton)
}

/**
 * Initialize game links functionality
 */
function initializeGameLinks() {
  const gameLinks = DOM.getAllGameLinks()
  gameLinks.forEach(gameLink => {
    gameLink.addEventListener('click', focusGameTextarea)
  })
}

/**
 * Initialize window-level event listeners
 */
function initializeWindowEvents() {
  window.addEventListener('focus', autoPasteFromClipboard)
  document.addEventListener("visibilitychange", checkForAutoPaste)
}

// ============================================================================
// COOKIE CONSENT AND DATABASE FUNCTIONALITY
// ============================================================================

/**
 * Initialize cookie consent functionality and database features
 */
function initializeCookieConsent() {
  if (!DOM.isIndexedDBAvailable()) {
    return
  }

  const { linkCookieConsent, linkStats } = DOM.getCookieConsentElements()
  const cookieConsent = Cookies.get('cookie-consent')
  
  // Show/hide appropriate links based on consent
  if (cookieConsent === 'true') {
    linkCookieConsent.hidden = true
    linkStats.hidden = false
    
    // Initialize database functionality if consent is given
    initializeDatabaseFeatures()
  } else {
    linkCookieConsent.hidden = false
    linkStats.hidden = true
  }
}

/**
 * Initialize database features for score tracking
 */
function initializeDatabaseFeatures() {
  window.addEventListener('load', async () => {
    try {
      // Dynamically import database service
      const module = await import('./db-service')
      const dbService = module.dbService
      
      // Connect to database
      await dbService.connect()
      
      // Add database save functionality to textareas
      allTextareas.forEach(textarea => {
        textarea.addEventListener('change', (event) => {
          saveScoreToDatabase(event, dbService)
        })
      })
    } catch (error) {
      console.warn('Failed to initialize database features:', error)
    }
  })
}

/**
 * Save score to database
 * @param {Event} event - The change event from textarea
 * @param {Object} dbService - The database service instance
 */
function saveScoreToDatabase(event, dbService) {
  const gameId = event.currentTarget.id
  const rawScore = event.currentTarget.value
  const date = new Date().toISOString().split('T')[0]
  
  try {
    dbService.saveScore(gameId, date, rawScore)
  } catch (error) {
    console.warn('Failed to save score to database:', error)
  }
}

// ============================================================================
// APPLICATION STARTUP
// ============================================================================

/**
 * Initialize the entire application
 */
function initializeApplication() {
  // Initialize all core functionality
  initializeTextareas()
  initializeForm()
  initializeShareButton()
  initializePasteButtons()
  initializeGameLinks()
  initializeWindowEvents()
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApplication()
    initializeCookieConsent()
  })
} else {
  // DOM is already ready
  initializeApplication()
  initializeCookieConsent()
}


