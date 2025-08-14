window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data.type || (event.data.type !== 'GET_NOTE' && event.data.type !== 'SET_NOTE')) {
        return;
    }

    if (event.data.type === 'GET_NOTE') {
        chrome.runtime.sendMessage({
            type: 'CATATAN_STORAGE',
            action: 'GET',
            key: event.data.key
        }, (response) => {
            window.postMessage({ type: 'NOTE_DATA', key: event.data.key, value: response.value }, '*');
        });
    }

    if (event.data.type === 'SET_NOTE') {
        chrome.runtime.sendMessage({
            type: 'CATATAN_STORAGE',
            action: 'SET',
            key: event.data.key,
            value: event.data.value
        }, (response) => {
             window.postMessage({ type: 'NOTE_SAVED_CONFIRMATION', success: response.success }, '*');
        });
    }
}, false);
