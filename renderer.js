window.addEventListener('DOMContentLoaded', async () => {
    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');
    const statusEl = document.getElementById('save_status');
    const saveAsBtn = document.getElementById('save-as');
    const newNoteBtn = document.getElementById('new-note');
    const openFileBtn = document.getElementById('open-file');

    // Load saved note on startup
    const savedNote = await window.electronAPI.loadNote();
    textarea.value = savedNote;

    // Track initial saved content
    let lastSavedText = textarea.value;
    let debounceTimer;

    // Manual Save
    saveBtn.addEventListener('click', async () => {
        try {
           const result = await window.electronAPI.smartSave(textarea.value, currentFilePath);
           lastSavedText = textarea.value;
           currentFilePath = result.filePath;
           statusEl.textContent = `Saved to: ${result.filePath}`;
        } catch (err) {
            console.error('Save Failed: ', err);
            statusEl.textContent = 'Save Failed!!!';
        }
    });
    saveAsBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.saveAs(textarea.value);
        if (result.success) {
            lastSavedText = textarea.value;
            currentFilePath= result.filePath;
            statusEl.textContent = `Saved to: ${result.filePath}`;
        } else {
            statusEl.textContent = 'Save As cancelled';
        }
    });
    newNoteBtn.addEventListener('click', async ()=>{
        if (textarea.value === lastSavedText){
            textarea.value= '';
            lastSavedText = '';
            statusEl.textContent = 'New note started.';
            return;
        }

        const result = await window.electronAPI.newNote();
        if (result.confirmed){
            textarea.value =  '';
            lastSavedText = '';
            statusEl.textContent = 'New note started';
        }else {
            statusEl.textContent = 'New note canceled.';
        }
    });

    openFileBtn.addEventListener('click', async ()=>{
        const result = await window.electronAPI.openFile();
        if (result.success){
            textarea.value = result.content;
            lastSavedText = result.content;
            currentFilePath = result.filePath;
            statusEl.textContent = `Opened: ${result.filePath}`;
        }else{
            statusEl.textContent= 'Open canceled';
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