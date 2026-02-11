/**
 * Stats Export/Import Module
 * 
 * Handles exporting and importing game statistics using dexie-export-import
 */

import { exportDB, peakImportFile, importInto } from 'dexie-export-import';
import { dbService } from './db-service.js';

import './style.css';
import './stats-export.css';

/**
 * Initialize the page and set up event listeners
 */
async function init() {
    // Initialize database connection
    await dbService.connect();

    // Set up export button
    const exportBtn = document.getElementById('exportBtn');
    const exportStatus = document.getElementById('exportStatus');

    exportBtn.addEventListener('click', async () => {
        await handleExport(exportBtn, exportStatus);
    });

    // Set up import elements
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const importMetadata = document.getElementById('importMetadata');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    const importStatus = document.getElementById('importStatus');

    // Open file picker when import button is clicked
    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    // Handle file selection
    importFile.addEventListener('change', async () => {
        await handleFileSelect(importFile, importMetadata, confirmImportBtn, importStatus);
    });

    // Handle import confirmation
    confirmImportBtn.addEventListener('click', async () => {
        await handleImport(importFile, confirmImportBtn, importStatus, importMetadata);
    });
}

/**
 * Handle the export process
 * @param {HTMLButtonElement} exportBtn - The export button element
 * @param {HTMLElement} exportStatus - The status display element
 */
async function handleExport(exportBtn, exportStatus) {
    try {
        // Disable button and show status
        exportBtn.disabled = true;
        exportStatus.textContent = 'Exporting...';
        exportStatus.className = 'status-info';

        // Get the database instance
        const db = dbService.getDatabase();

        // Export database to blob
        const blob = await exportDB(db);

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `titlequest-stats-${timestamp}.json`;

        // Create download link and trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success message
        exportStatus.textContent = `✅ Stats exported successfully to ${filename}`;
        exportStatus.className = 'status-success';

    } catch (error) {
        console.error('Export failed:', error);
        exportStatus.textContent = `❌ Export failed: ${error.message}`;
        exportStatus.className = 'status-error';
    } finally {
        // Re-enable button
        exportBtn.disabled = false;
    }
}

/**
 * Handle file selection and display metadata
 * @param {HTMLInputElement} importFile - The file input element
 * @param {HTMLElement} importMetadata - The metadata display element
 * @param {HTMLButtonElement} confirmImportBtn - The confirm import button
 * @param {HTMLElement} importStatus - The status display element
 */
async function handleFileSelect(importFile, importMetadata, confirmImportBtn, importStatus) {
    const file = importFile.files[0];
    
    if (!file) {
        return;
    }

    try {
        // Clear previous messages
        importStatus.textContent = '';
        importMetadata.textContent = '';
        confirmImportBtn.classList.add('hidden');

        // Peek at the file metadata
        importStatus.textContent = 'Reading file...';
        importStatus.className = 'status-info';

        const importMeta = await peakImportFile(file);

        // Validate format
        if (importMeta.formatName !== 'dexie') {
            throw new Error('Invalid file format. Please try again.');
        }

        // Display metadata
        const tables = importMeta.data.tables || [];
        const tableInfo = tables.map(t => `${t.name} (${t.rowCount} rows)`).join(', ');
        
        importMetadata.innerHTML = `
            <div class="import-metadata-box">
                <strong>Database:</strong> ${importMeta.data.databaseName || 'Unknown'}<br>
                <strong>Version:</strong> ${importMeta.data.databaseVersion || 'Unknown'}<br>
                <strong>Tables:</strong> ${tableInfo || 'None'}<br>
                <strong>Format:</strong> ${importMeta.formatName} v${importMeta.formatVersion}
            </div>
        `;

        // Show confirmation button
        confirmImportBtn.classList.remove('hidden');
        importStatus.textContent = '⚠️ Ready to import. This will overwrite existing data.';
        importStatus.className = 'status-warning';

    } catch (error) {
        console.error('Failed to read file metadata:', error);
        importMetadata.textContent = '';
        confirmImportBtn.classList.add('hidden');
        importStatus.textContent = `❌ Failed to read file: ${error.message}`;
        importStatus.className = 'status-error';
    }
}

/**
 * Handle the import process
 * @param {HTMLInputElement} importFile - The file input element
 * @param {HTMLButtonElement} confirmImportBtn - The confirm import button
 * @param {HTMLElement} importStatus - The status display element
 * @param {HTMLElement} importMetadata - The metadata display element
 */
async function handleImport(importFile, confirmImportBtn, importStatus, importMetadata) {
    const file = importFile.files[0];
    
    if (!file) {
        importStatus.textContent = '❌ No file selected';
        importStatus.className = 'status-error';
        return;
    }

    try {
        // Disable button and show status
        confirmImportBtn.disabled = true;
        importStatus.textContent = 'Importing data...';
        importStatus.className = 'status-info';

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
        importStatus.textContent = `✅ Stats imported successfully from ${file.name}`;
        importStatus.className = 'status-success';

        // Clear the file input and metadata
        importFile.value = '';
        importMetadata.textContent = '';
        confirmImportBtn.classList.add('hidden');

    } catch (error) {
        console.error('Import failed:', error);
        importStatus.textContent = `❌ Import failed: ${error.message}`;
        importStatus.className = 'status-error';
    } finally {
        // Re-enable button
        confirmImportBtn.disabled = false;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
