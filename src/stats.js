import { dbService } from './db-service.js'
import { GAMES } from './game-config.js';
import { formatScore } from './score-manager.js';

import './stats.css'

function initializeDatabaseFeatures() {
    return dbService.connect();
}

async function processIncompleteScores() {
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

async function displayScores() {
    /** @type {Promise<boolean>[]} */
    const results = await Promise.all(GAMES.keys().map(displayScoresForGame));
    const success = results.some(result => result);

    const statsNoData = document.getElementById('stats-no-data');
    if (!success) {
        statsNoData.hidden = false;
    }
}

/**
 * Display scores for a specific game
 * @param {*} gameId - The game identifier
 * @returns {Promise<boolean>} True if scores were displayed, false otherwise
 */
async function displayScoresForGame(gameId) {
    const scoresByRound = await dbService.getScoresForGame(gameId);
    if (Object.keys(scoresByRound).length === 0) {
        console.log(`No scores found for game: ${gameId}`);
        return false;
    }

    const scoresByRoundOrGameOver = Object.entries(scoresByRound)
        .reduce((acc, [round, count]) => {
            if (round >= 1000) {
                acc['gameOver'] = (acc['gameOver'] || 0) + count;
            } else {
                acc[round] = count;
            }
            return acc;
        }, {});

    const maxScore = Math.max(...Object.values(scoresByRoundOrGameOver));

    const fieldset = document.getElementById(gameId);
    fieldset.style.display = 'block';

    const listItems = [...fieldset.querySelectorAll('li')];
    for (const listItem of listItems) {
        const round = listItem.getAttribute('data-round');
        const span = listItem.querySelector('span');
        const count = scoresByRoundOrGameOver[round] || 0;

        if (count > 0) {
            listItem.style.width = `${(count / maxScore) * 100}%`;
            span.innerText = String(count);
        }
    }

    return true;
}

// Initialize stats processing when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await initializeDatabaseFeatures();
        await processIncompleteScores();
        await displayScores();
    });
} else {
    // DOM is already ready
    initializeDatabaseFeatures()
        .then(processIncompleteScores)
        .then(displayScores);
}
