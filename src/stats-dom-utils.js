/**
 * Stats DOM Utilities Module
 * 
 * Contains DOM manipulation functions specific to the stats page.
 * Handles progress indicators, score displays, and UI state management.
 */

/**
 * Progress UI elements and their management
 */
export const ProgressUI = {
  /**
   * Show the processing indicator and initialize progress bar
   * @param {number} maxValue - Maximum value for the progress bar
   */
  show(maxValue) {
    const processingElement = this.getProcessingElement();
    const progressElement = this.getProgressElement();
    
    if (processingElement) {
      processingElement.hidden = false;
    }
    
    if (progressElement) {
      progressElement.max = maxValue;
      progressElement.value = 0;
    }
  },

  /**
   * Update the progress bar value
   * @param {number} value - Current progress value
   */
  updateProgress(value) {
    const progressElement = this.getProgressElement();
    if (progressElement) {
      progressElement.value = value;
    }
  },

  /**
   * Hide the processing indicator
   */
  hide() {
    const processingElement = this.getProcessingElement();
    if (processingElement) {
      processingElement.hidden = true;
    }
  },

  /**
   * Get the processing indicator element
   * @returns {HTMLElement|null}
   */
  getProcessingElement() {
    return document.getElementById('stats-processing');
  },

  /**
   * Get the progress bar element
   * @returns {HTMLProgressElement|null}
   */
  getProgressElement() {
    return document.getElementById('stats-progress');
  }
};

/**
 * Stats display management
 */
export const StatsDisplay = {
  /**
   * Show the "no data" message
   */
  showNoDataMessage() {
    const noDataElement = document.getElementById('stats-no-data');
    if (noDataElement) {
      noDataElement.hidden = false;
    }
  },

  /**
   * Hide the "no data" message
   */
  hideNoDataMessage() {
    const noDataElement = document.getElementById('stats-no-data');
    if (noDataElement) {
      noDataElement.hidden = true;
    }
  },

  /**
   * Get the fieldset element for a specific game
   * @param {string} gameId - The game identifier
   * @returns {HTMLFieldSetElement|null}
   */
  getGameFieldset(gameId) {
    return document.getElementById(gameId);
  },

  /**
   * Show scores for a specific game
   * @param {string} gameId - The game identifier
   * @param {Object} scoreData - Object containing score counts by round
   */
  displayGameScores(gameId, scoreData) {
    const fieldset = this.getGameFieldset(gameId);
    if (!fieldset) {
      console.warn(`No fieldset found for game: ${gameId}`);
      return false;
    }

    // Show the fieldset
    fieldset.style.display = 'block';

    // Calculate maximum score for scaling
    const maxScore = Math.max(...Object.values(scoreData));
    if (maxScore === 0) {
      return false;
    }

    // Update each score bar
    const listItems = fieldset.querySelectorAll('li');
    listItems.forEach(listItem => {
      this.updateScoreBar(listItem, scoreData, maxScore);
    });

    return true;
  },

  /**
   * Update a single score bar element
   * @param {HTMLLIElement} listItem - The list item element
   * @param {Object} scoreData - Score data object
   * @param {number} maxScore - Maximum score for scaling
   */
  updateScoreBar(listItem, scoreData, maxScore) {
    const round = listItem.getAttribute('data-round');
    const span = listItem.querySelector('span');
    const count = scoreData[round] || 0;

    if (count > 0) {
      // Set width as percentage of maximum
      const widthPercentage = (count / maxScore) * 100;
      listItem.style.width = `${widthPercentage}%`;
      
      // Update count display
      if (span) {
        span.innerText = String(count);
      }
    }
  }
};

/**
 * General DOM utilities for stats page
 */
export const StatsDOMUtils = {
  /**
   * Check if the DOM is ready
   * @returns {boolean} True if DOM is ready
   */
  isDOMReady() {
    return document.readyState !== 'loading';
  },

  /**
   * Execute a function when DOM is ready
   * @param {Function} callback - Function to execute
   */
  onDOMReady(callback) {
    if (this.isDOMReady()) {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }
};