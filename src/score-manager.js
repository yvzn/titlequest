/**
 * Score Management Module
 * 
 * Handles all score-related operations including formatting, display, and aggregation.
 */

import { hasScoreFormatter, getScoreFormatter } from './game-config.js';

/**
 * Format a raw score text for a specific game
 * @param {string} gameId - The game identifier
 * @param {string} rawText - The raw score text from user input
 * @returns {string} The formatted score
 */
export function formatScore(gameId, rawText) {
  // Normalize and clean the text by removing common characters
  let formattedScore = rawText
    .normalize("NFD")
    .replaceAll(/[\w\s#:\-/.\(\)%]/g, "");

  // Apply game-specific formatting if available and text is not empty
  if (formattedScore && hasScoreFormatter(gameId)) {
    const formatter = getScoreFormatter(gameId);
    formattedScore = formatter(formattedScore);
  }

  return formattedScore;
}

/**
 * Update the score display for a specific textarea
 * @param {HTMLTextAreaElement} textarea - The textarea element
 * @param {HTMLElement} scoreDisplay - The score display element
 */
export function updateScoreDisplay(textarea, scoreDisplay) {
  const formattedScore = formatScore(textarea.id, textarea.value);
  scoreDisplay.innerText = formattedScore;
}

/**
 * Aggregate all scores from multiple textareas
 * @param {HTMLTextAreaElement[]} textareas - Array of textarea elements
 * @returns {string} Aggregated scores as a formatted string
 */
export function aggregateScores(textareas) {
  const scores = textareas
    .map(textarea => formatScore(textarea.id, textarea.value))
    .filter(Boolean); // Remove empty scores

  return scores.join('\n');
}

/**
 * Update the main results display with aggregated scores
 * @param {HTMLTextAreaElement[]} textareas - Array of all textarea elements
 * @param {HTMLElement} resultsElement - The element to display results in
 */
export function updateResultsDisplay(textareas, resultsElement) {
  const aggregatedScores = aggregateScores(textareas);
  resultsElement.innerText = aggregatedScores;
}