/**
 * Stats Service Module
 * 
 * Provides high-level services for statistics processing with enhanced error handling.
 * Acts as a facade over database operations and score processing.
 */

import { dbService } from './db-service.js';
import { formatScore } from './score-manager.js';
import { parseScoreAsInteger, categorizeScores, SPECIAL_SCORES } from './score-parsing-utils.js';
import { ProgressUI, StatsDisplay, ActivityCalendar } from './stats-dom-utils.js';
import { GAMES } from './game-config.js';
import { calendarService } from './stats-calendar.js';

/**
 * Statistics processing service
 */
export class StatsService {
    /**
     * Initialize the database connection
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initialize() {
        await dbService.connect();
        return true;
    }

    /**
     * Process incomplete scores with progress feedback
     * @returns {Promise<{processed: number, errors: number}>} Processing results
     */
    async processIncompleteScores() {
        const unprocessedScores = await dbService.getIncompleteScores();

        if (unprocessedScores.length === 0) {
            return;
        }

        // Show progress UI
        ProgressUI.show(unprocessedScores.length);

        for (let i = 0; i < unprocessedScores.length; i++) {
            try {
                const scoreEntry = unprocessedScores[i];
                await this.processScoreEntry(scoreEntry);
            } catch (error) {
                // Continue processing other scores even if one fails
            }

            // Update progress
            ProgressUI.updateProgress(i + 1);
        }

        // Hide progress UI
        ProgressUI.hide();
    }

    /**
     * Process a single score entry
     * @param {Object} scoreEntry - The score entry to process
     * @returns {Promise<boolean>} True if processing was successful
     */
    async processScoreEntry(scoreEntry) {
        const formattedScore = formatScore(scoreEntry.game, scoreEntry.score, false);
        const intScore = parseScoreAsInteger(formattedScore);

        // Skip invalid scores
        if (intScore === SPECIAL_SCORES.INVALID_SCORE) {
            return false;
        }

        const updatedScoreEntry = {
            ...scoreEntry,
            intScore
        };

        await dbService.updateScoreRaw(updatedScoreEntry);
        return true;
    }

    /**
     * Display scores for all games
     * @returns {Promise<{displayed: number, total: number}>} Display results
     */
    async displayAllScores() {
        const gameIds = GAMES.keys();
        const results = await Promise.all(
            gameIds.map(gameId => this.displayScoresForGame(gameId))
        );

        const displayedCount = results.filter(Boolean).length;
        const totalGames = gameIds.length;

        if (displayedCount === 0) {
            StatsDisplay.showNoDataMessage();
        } else {
            StatsDisplay.hideNoDataMessage();
        }

        return { displayed: displayedCount, total: totalGames };
    }

    /**
     * Display scores for a specific game
     * @param {string} gameId - The game identifier
     * @returns {Promise<boolean>} True if scores were displayed successfully
     */
    async displayScoresForGame(gameId) {
        try {
            const scoresByRound = await dbService.getScoresForGame(gameId);

            if (Object.keys(scoresByRound).length === 0) {
                return false;
            }

            const categorizedScores = categorizeScores(scoresByRound);
            return StatsDisplay.displayGameScores(gameId, categorizedScores);

        } catch (error) {
            return false;
        }
    }

    /**
     * Display the activity calendar with all game data
     * @returns {Promise<boolean>} True if calendar was displayed successfully
     */
    async displayActivityCalendar() {
        try {
            const allScores = await dbService.getAllScores();
            
            if (!allScores || allScores.length === 0) {
                // Calendar will show empty if no data
                return false;
            }

            const calendarData = calendarService.generateCalendarFromScores(allScores);
            ActivityCalendar.render(calendarData);
            
            return true;
        } catch (error) {
            console.error('Error displaying activity calendar:', error);
            return false;
        }
    }
}

// Export a singleton instance
export const statsService = new StatsService();