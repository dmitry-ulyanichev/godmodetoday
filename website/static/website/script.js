document.addEventListener('DOMContentLoaded', function() {
    var languageForm = document.getElementById('language-form');
    var languageSelect = document.getElementById('language-select');

    // Update the action URL when the language is changed
    languageSelect.addEventListener('change', function() {
        var formData = new FormData(languageForm);

        fetch(languageForm.action, {
            method: 'POST',
            body: formData
        }).then(function(response) {
            if (response.ok) {
                // Reload the page to apply the language change
                window.location.reload();
            } else {
                console.error('Error switching language:', response.statusText);
            }
        }).catch(function(error) {
            console.error('Error switching language:', error);
        });
    });
});