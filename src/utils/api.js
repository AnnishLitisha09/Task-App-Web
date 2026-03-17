const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        ...options.headers,
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    // If body is an object, stringify it
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const response = await fetch(`${normalizedBase}${normalizedEndpoint}`, config);

    if (!response.ok) {
        // If the server says the session is invalid/logged out, clear everything and redirect to login
        if (response.status === 401) {
            localStorage.clear();
            // Use replace so the user can't go "back" to the authenticated page
            window.location.replace('/');
            return; // Stop execution — the page is navigating away
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
};

export default api;
