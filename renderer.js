window.addEventListener('DOMContentLoaded', async () => {
    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');
    const statusEl = document.getElementById('save_status');
    const saveAsBtn = document.getElementById('save-as');

    // Load saved note on startup
    const savedNote = await window.electronAPI.loadNote();
    textarea.value = savedNote;

    // Track initial saved content
    let lastSavedText = textarea.value;
    let debounceTimer;

    // Manual Save
    saveBtn.addEventListener('click', async () => {
        try {
            await window.electronAPI.saveNote(textarea.value);
            alert('Note Saved Successfully!!!');
            if (statusEl) statusEl.textContent = 'Manually Saved!';
            lastSavedText = textarea.value;
        } catch (err) {
            console.error('Manual save failed!!', err);
            if (statusEl) statusEl.textContent = 'Save Failed - check console';
        }
    });
    saveAsBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.saveAs(textarea.value);
        if (result.success) {
            lastSavedText = textarea.value;
            statusEl.textContent = `Saved to: ${result.filePath}`;
        } else {
            statusEl.textContent = 'Save As cancelled';
        }
    });


    // Auto Save function
    async function autoSave() {
        const currentText = textarea.value;
        if (currentText === lastSavedText) {
            if (statusEl) statusEl.textContent = 'No changes - already saved';
            return;
        }
        try {
            await window.electronAPI.saveNote(currentText);
            lastSavedText = currentText;
            const now = new Date().toLocaleTimeString();
            if (statusEl) statusEl.textContent = `Auto-saved at ${now}`;
        } catch (err) {
            console.error('Auto-save FAILED:', err);
            if (statusEl) statusEl.textContent = 'Auto-save error - check console';
        }
    }

    // Debounce: save 5 sec after user stops typing
    textarea.addEventListener('input', () => {
        if (statusEl) statusEl.textContent = 'Changes detected - auto save in 5s...';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(autoSave, 5000);
    });
});