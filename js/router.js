const routes = {
    '/': '/pages/home.html',
    '/register': '/pages/register.html',
    '/login': '/pages/login.html',
    '/dashboard': '/pages/dashboard.html',
    '/hotels': '/pages/hotels.html',
    '/flights': '/pages/flights.html',
};

// Function to load content into the `#app` div
const loadPage = async (path) => {
    const appDiv = document.getElementById('app');
    const response = await fetch(routes[path] || routes['/']);
    const content = await response.text();
    appDiv.innerHTML = content;
};

// Event listener for navigating between pages
window.addEventListener('popstate', () => {
    loadPage(location.pathname);
});

// Navigate programmatically
const navigateTo = (path) => {
    history.pushState({}, path, window.location.origin + path);
    loadPage(path);
};
