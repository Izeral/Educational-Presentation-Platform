// Author: Tiancheng Yang
function redirectToPage() {
    const username = document.getElementById('username').value.trim();

    if (username.startsWith("student")) {
        window.location.href = "index.html";
    } else if (username.startsWith("teacher")) {
        window.location.href = "teacher.html";
    } else {
        alert("Invalid user. Please enter a valid username.");
        return false;
    }
    
    return false;
}
