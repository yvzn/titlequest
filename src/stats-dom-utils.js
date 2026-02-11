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

    const numberOfGames = Object.values(scoreData).reduce((sum, count) => sum + count, 0);
    const heading = fieldset.querySelector('h3');
    if (heading) {
      heading.insertAdjacentText('beforeend', `: ${numberOfGames} game${numberOfGames !== 1 ? 's' : ''} `);
    }

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

/**
 * Activity Calendar DOM Management
 */
export const ActivityCalendar = {
  /**
   * Render the complete activity calendar
   * @param {Object} calendarData - Calendar data from calendarService
   */
  render(calendarData) {
    this.renderTable(calendarData);
  },

  /**
   * Render the entire calendar table
   * @param {Object} calendarData - Calendar data with days, months, and weekdays
   */
  renderTable(calendarData) {
    const { days, months, weekdays } = calendarData;
    const totalWeeks = Math.ceil(days.length / 7);
    
    // Render month headers
    this.renderMonthHeaders(months, totalWeeks);
    
    // Render the 7 rows (one per weekday)
    this.renderWeekRows(days, weekdays, totalWeeks);
  },

  /**
   * Render month headers in thead
   * @param {Array<{name: string, column: number}>} months - Month information
   * @param {number} totalWeeks - Total number of weeks to display
   */
  renderMonthHeaders(months, totalWeeks) {
    const headerRow = document.getElementById('calendar-months');
    if (!headerRow) return;

    headerRow.innerHTML = '';
    
    // Add empty th for weekday label column
    const emptyTh = document.createElement('th');
    headerRow.appendChild(emptyTh);
    
    // Add month headers with colspan for each month's weeks
    let currentColumn = 0;
    months.forEach((month, index) => {
      const th = document.createElement('th');
      th.textContent = month.name;
      
      // Calculate colspan: distance to next month or end of calendar
      const nextColumn = index < months.length - 1 ? months[index + 1].column : totalWeeks;
      const colspan = nextColumn - month.column;
      
      if (colspan > 0) {
        th.setAttribute('colspan', String(colspan));
      }
      
      headerRow.appendChild(th);
    });
  },

  /**
   * Render the 7 weekday rows with day cells
   * @param {Array<CalendarDay>} days - Array of calendar day data
   * @param {string[]} weekdays - Array of weekday labels
   * @param {number} totalWeeks - Total number of weeks to display
   */
  renderWeekRows(days, weekdays, totalWeeks) {
    const tbody = document.getElementById('calendar-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Create 7 rows (one for each day of week)
    for (let weekday = 0; weekday < 7; weekday++) {
      const tr = document.createElement('tr');
      
      // Add weekday label as first cell
      const th = document.createElement('th');
      th.textContent = weekdays[weekday];
      th.setAttribute('scope', 'row');
      tr.appendChild(th);
      
      // Add day cells for this weekday across all weeks
      for (let week = 0; week < totalWeeks; week++) {
        const dayIndex = week * 7 + weekday;
        const td = document.createElement('td');
        
        if (dayIndex < days.length) {
          const day = days[dayIndex];
          const dayElement = this.createDayElement(day);
          td.appendChild(dayElement);
        }
        
        tr.appendChild(td);
      }
      
      tbody.appendChild(tr);
    }
  },

  /**
   * Create a single day element
   * @param {CalendarDay} day - Calendar day data
   * @returns {HTMLSpanElement} The day element
   */
  createDayElement(day) {
    const span = document.createElement('span');
    span.className = 'calendar-day';
    span.setAttribute('data-level', String(day.level));
    span.setAttribute('data-date', day.dateKey);
    span.setAttribute('data-tooltip', day.tooltip);
    span.setAttribute('aria-label', day.tooltip);
    span.setAttribute('role', 'gridcell');
    
    return span;
  },

  /**
   * Clear the calendar display
   */
  clear() {
    const headerRow = document.getElementById('calendar-months');
    const tbody = document.getElementById('calendar-body');
    
    if (headerRow) headerRow.innerHTML = '';
    if (tbody) tbody.innerHTML = '';
  }
};