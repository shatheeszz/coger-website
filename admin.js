// Authentication check - redirect to login if not authenticated
(function() {
  // Check if user is logged in
  const authToken = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  if (!authToken || !userData) {
    // User is not logged in, redirect to login page
    console.log('No authentication token found, redirecting to login...');
    window.location.href = '/login.html';
  } else {
    // User is logged in, display user data
    console.log('User authenticated:', JSON.parse(userData));
  }
})();

// Add logout functionality
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = '/login.html';
}