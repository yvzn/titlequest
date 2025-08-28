import { dbService } from './db-service.js'
import { formatScore } from './score-manager.js';

import './stats.css'

async function initializeStats() {
    await dbService.connect();
    const unprocessed = await dbService.getIncompleteScores();
    if (unprocessed.length === 0) {
        return;
    }

    const statsProcessing = document.getElementById('stats-processing');
    const statsProgress = document.getElementById('stats-progress');
    statsProcessing.hidden = false;
    statsProgress.max = unprocessed.length;
    statsProgress.value = 0;

    for (const scoreEntry of unprocessed) {
        const formattedScore = formatScore(scoreEntry.game, scoreEntry.score, false);

        const intScore = parseScoreAsInteger(formattedScore);
        if (intScore === -1) {
            statsProgress.value += 1;
            continue;
        }

        const updatedScoreEntry = {
            ...scoreEntry,
            intScore
        };
        await dbService.updateScoreRaw(updatedScoreEntry);

        statsProgress.value += 1;
    }

    statsProcessing.hidden = true;
}

/**
 * Parse a formatted score string into an integer
 * @param {string} scoreText - The score text
 * @returns {number} The integer representation of the score, 1000 if game over or -1 if invalid
 */
function parseScoreAsInteger(scoreText) {
    const isMultiline = scoreText.includes('\n');
    if (isMultiline) {
        return scoreText.split('\n').map(parseScoreAsInteger).reduce((acc, curr) => acc + curr, 0);
    }

    const withoutSpaces = scoreText.replace(/\s+/g, '');
    if (!withoutSpaces) {
        return -1; // Empty score
    }

    const i = withoutSpaces.indexOf('🟩');
    if (i < 0) {
        return 1000; // Game over indicator
    }

    const beforeGreenSquare = withoutSpaces.substring(0, i);

    const numberOfSquaresBeforeGreen = ['🟨', '🟥', '⬛', '⬜']
        .map(square => (beforeGreenSquare.match(new RegExp(square, 'g')) || []).length)
        .reduce((acc, curr) => acc + curr, 0);

    return numberOfSquaresBeforeGreen + 1;
}

// Initialize stats processing when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeStats();
    });
} else {
    // DOM is already ready
    initializeStats();
}
