// Author: Tiancheng Yang
document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form');
    var modal = document.getElementById('modal');
    var overlay = document.getElementById('overlay');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        var searchTerm = document.querySelector('input[type="text"]').value.toLowerCase();
        var commentBoxes = document.querySelectorAll('.comment-box');
        var found = false;

        commentBoxes.forEach(function(box) {
            if (searchTerm && box.textContent.toLowerCase().includes(searchTerm)) {
                box.style.display = '';
                found = true;
            } else {
                box.style.display = 'none';
            }
        });

        if (!found && searchTerm) {
            modal.style.display = 'block';
            overlay.style.display = 'block';
        } else if (!searchTerm) {
            resetSearch();
        }
    });

    document.getElementById('close-modal').addEventListener('click', function() {
        modal.style.display = 'none';
        overlay.style.display = 'none';
        resetSearch();
    });

    function resetSearch() {
        document.querySelector('input[type="text"]').value = '';
        document.querySelectorAll('.comment-box').forEach(function(box) {
            box.style.display = '';
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
var returnButton = document.getElementById('returnButton');
returnButton.addEventListener('click', function() {
    window.location.href = '/login';
});
});
