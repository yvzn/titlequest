/**
 * Statistics Page - Main Entry Point
 * 
 * Displays game statistics and processes incomplete score data.
 * This module orchestrates the statistics functionality using specialized services and utilities.
 */

import { statsService } from './stats-service.js'
import { StatsDOMUtils } from './stats-dom-utils.js'

import './stats.css'

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initialize the statistics application
 * Handles database connection, score processing, and display
 */
async function initializeStatsApplication() {
    // Initialize database connection
    await statsService.initialize()

    // Display the activity calendar
    await statsService.displayActivityCalendar()

    // Process any incomplete scores
    await statsService.processIncompleteScores()

    // Display all available scores
    await statsService.displayAllScores()
}

// ============================================================================
// APPLICATION STARTUP
// ============================================================================

// Initialize the application when DOM is ready
StatsDOMUtils.onDOMReady(initializeStatsApplication)
