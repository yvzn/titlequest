/**
 * Stats Export/Import Module
 * 
 * Handles exporting and importing game statistics using dexie-export-import
 */

import { exportDB, peakImportFile, importInto } from 'dexie-export-import';
import { dbService } from './db-service.js';
import { StatsDOMUtils } from './stats-dom-utils.js';

import './style.css';
import './stats-export.css';

// ============================================================================
// DOM UTILITIES
// ============================================================================

/**
 * Export UI element getters and utilities
 */
const ExportUI = {
  /**
   * Get the export button element
   * @returns {HTMLButtonElement|null}
   */
  getExportButton() {
    return document.getElementById('exportBtn');
  },

  /**
   * Get the export status element
   * @returns {HTMLElement|null}
   */
  getExportStatus() {
    return document.getElementById('exportStatus');
  },

  /**
   * Set export button state
   * @param {boolean} enabled - Whether the button should be enabled
   */
  setButtonState(enabled) {
    const button = this.getExportButton();
    if (button) {
      button.disabled = !enabled;
    }
  },

  /**
   * Show export status message
   * @param {string} message - Status message to display
   * @param {'info'|'success'|'error'} type - Status type
   */
  showStatus(message, type = 'info') {
    const statusElement = this.getExportStatus();
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-${type}`;
    }
  }
};

/**
 * Import UI element getters and utilities
 */
const ImportUI = {
  /**
   * Get the import button element
   * @returns {HTMLButtonElement|null}
   */
  getImportButton() {
    return document.getElementById('importBtn');
  },

  /**
   * Get the file input element
   * @returns {HTMLInputElement|null}
   */
  getFileInput() {
    return document.getElementById('importFile');
  },

  /**
   * Get the import metadata display element
   * @returns {HTMLElement|null}
   */
  getMetadataDisplay() {
    return document.getElementById('importMetadata');
  },

  /**
   * Get the confirm import button element
   * @returns {HTMLButtonElement|null}
   */
  getConfirmButton() {
    return document.getElementById('confirmImportBtn');
  },

  /**
   * Get the import status element
   * @returns {HTMLElement|null}
   */
  getImportStatus() {
    return document.getElementById('importStatus');
  },

  /**
   * Set confirm button state
   * @param {boolean} enabled - Whether the button should be enabled
   */
  setConfirmButtonState(enabled) {
    const button = this.getConfirmButton();
    if (button) {
      button.disabled = !enabled;
    }
  },

  /**
   * Show or hide the confirm button
   * @param {boolean} visible - Whether the button should be visible
   */
  setConfirmButtonVisibility(visible) {
    const button = this.getConfirmButton();
    if (button) {
      if (visible) {
        button.classList.remove('hidden');
        button.style.display = '';
      } else {
        button.classList.add('hidden');
        button.style.display = 'none';
      }
    }
  },

  /**
   * Show import status message
   * @param {string} message - Status message to display
   * @param {'info'|'success'|'error'|'warning'} type - Status type
   */
  showStatus(message, type = 'info') {
    const statusElement = this.getImportStatus();
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-${type}`;
    }
  },

  /**
   * Clear import status message
   */
  clearStatus() {
    const statusElement = this.getImportStatus();
    if (statusElement) {
      statusElement.textContent = '';
    }
  },

  /**
   * Display import metadata
   * @param {string} htmlContent - HTML content to display
   */
  showMetadata(htmlContent) {
    const metadataElement = this.getMetadataDisplay();
    if (metadataElement) {
      metadataElement.innerHTML = htmlContent;
    }
  },

  /**
   * Clear import metadata display
   */
  clearMetadata() {
    const metadataElement = this.getMetadataDisplay();
    if (metadataElement) {
      metadataElement.textContent = '';
    }
  },

  /**
   * Clear the file input
   */
  clearFileInput() {
    const fileInput = this.getFileInput();
    if (fileInput) {
      fileInput.value = '';
    }
  },

  /**
   * Open the file picker
   */
  openFilePicker() {
    const fileInput = this.getFileInput();
    if (fileInput) {
      fileInput.click();
    }
  },

  /**
   * Get the selected file
   * @returns {File|null}
   */
  getSelectedFile() {
    const fileInput = this.getFileInput();
    return fileInput?.files[0] || null;
  }
};

/**
 * File download utilities
 */
const FileUtils = {
  /**
   * Trigger a file download
   * @param {Blob} blob - The file blob to download
   * @param {string} filename - The filename for the download
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Generate a timestamp-based filename
   * @param {string} prefix - Filename prefix
   * @param {string} extension - File extension (without dot)
   * @returns {string} Generated filename
   */
  generateTimestampedFilename(prefix, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}-${timestamp}.${extension}`;
  }
};

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Set up event listeners for export functionality
 */
function setupExportListeners() {
  const exportBtn = ExportUI.getExportButton();
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExport);
  }
}

/**
 * Set up event listeners for import functionality
 */
function setupImportListeners() {
  const importBtn = ImportUI.getImportButton();
  const fileInput = ImportUI.getFileInput();
  const confirmBtn = ImportUI.getConfirmButton();

  if (importBtn) {
    importBtn.addEventListener('click', () => {
      ImportUI.openFilePicker();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleImport);
  }
}

/**
 * Handle the export process
 */
async function handleExport() {
    try {
        // Disable button and show status
        ExportUI.setButtonState(false);
        ExportUI.showStatus('Exporting...', 'info');

        // Get the database instance
        const db = dbService.getDatabase();

        // Export database to blob
        const blob = await exportDB(db);

        // Create filename with timestamp
        const filename = FileUtils.generateTimestampedFilename('titlequest-stats', 'json');

        // Trigger download
        FileUtils.downloadBlob(blob, filename);

        // Show success message
        ExportUI.showStatus(`✅ Stats exported successfully to ${filename}`, 'success');

    } catch (error) {
        console.error('Export failed:', error);
        ExportUI.showStatus(`❌ Export failed: ${error.message}`, 'error');
    } finally {
        // Re-enable button
        ExportUI.setButtonState(true);
    }
}

/**
 * Handle file selection and display metadata
 */
async function handleFileSelect() {
    const file = ImportUI.getSelectedFile();
    
    if (!file) {
        return;
    }

    try {
        // Clear previous messages
        ImportUI.clearStatus();
        ImportUI.clearMetadata();
        ImportUI.setConfirmButtonVisibility(false);

        // Peek at the file metadata
        ImportUI.showStatus('Reading file...', 'info');

        const importMeta = await peakImportFile(file);

        // Validate format
        if (importMeta.formatName !== 'dexie') {
            throw new Error('Invalid file format. Please try again.');
        }

        // Build metadata display
        const tables = importMeta.data.tables || [];
        const tableInfo = tables.map(t => `${t.name} (${t.rowCount} rows)`).join(', ');
        
        const metadataHTML = `
            <div class="import-metadata-box">
                <strong>Database:</strong> ${importMeta.data.databaseName || 'Unknown'}<br>
                <strong>Version:</strong> ${importMeta.data.databaseVersion || 'Unknown'}<br>
                <strong>Tables:</strong> ${tableInfo || 'None'}<br>
                <strong>Format:</strong> ${importMeta.formatName} v${importMeta.formatVersion}
            </div>
        `;

        // Display metadata
        ImportUI.showMetadata(metadataHTML);

        // Show confirmation button
        ImportUI.setConfirmButtonVisibility(true);
        ImportUI.showStatus('⚠️ Ready to import. This will overwrite existing data.', 'warning');

    } catch (error) {
        console.error('Failed to read file metadata:', error);
        ImportUI.clearMetadata();
        ImportUI.setConfirmButtonVisibility(false);
        ImportUI.showStatus(`❌ Failed to read file: ${error.message}`, 'error');
    }
}

/**
 * Handle the import process
 */
async function handleImport() {
    const file = ImportUI.getSelectedFile();
    
    if (!file) {
        ImportUI.showStatus('❌ No file selected', 'error');
        return;
    }

    try {
        // Disable button and show status
        ImportUI.setConfirmButtonState(false);
        ImportUI.showStatus('Importing data...', 'info');

        // Get the database instance
        const db = dbService.getDatabase();

        // Import with all options set to true
        await importInto(db, file, {
            acceptMissingTables: true,
            acceptVersionDiff: true,
            acceptNameDiff: true,
            acceptChangedPrimaryKey: true,
            overwriteValues: true,
            clearTablesBeforeImport: true
        });

        // Show success message
        ImportUI.showStatus(`✅ Stats imported successfully from ${file.name}`, 'success');

        // Clear the file input and metadata
        ImportUI.clearFileInput();
        ImportUI.clearMetadata();
        ImportUI.setConfirmButtonVisibility(false);

    } catch (error) {
        console.error('Import failed:', error);
        ImportUI.showStatus(`❌ Import failed: ${error.message}`, 'error');
    } finally {
        // Re-enable button
        ImportUI.setConfirmButtonState(true);
    }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initialize the stats export/import application
 */
async function initializeExportApplication() {
    // Initialize database connection
    await dbService.connect();

    // Set up event listeners
    setupExportListeners();
    setupImportListeners();
}

// ============================================================================
// APPLICATION STARTUP
// ============================================================================

// Initialize the application when DOM is ready
StatsDOMUtils.onDOMReady(initializeExportApplication);

