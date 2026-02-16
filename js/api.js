console.log('api.js loaded');

// ============================================
// Backend API Wrapper with Auto-Wakeup
// ============================================

let backendAwake = false;
let wakeupInProgress = false;

// Wake up backend (called on app load)
async function wakeUpBackend() {
    if (backendAwake || wakeupInProgress) {
        console.log('Backend already awake or waking up');
        return;
    }

    wakeupInProgress = true;
    console.log('🔔 Waking up backend...');

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/health`, {
            method: 'GET',
        });

        if (response.ok) {
            console.log('✅ Backend is awake');
            backendAwake = true;
        } else {
            console.log('⏳ Backend waking up... (30 seconds)');
        }
    } catch (error) {
        console.log('⏳ Backend waking up... (30 seconds)');
    } finally {
        wakeupInProgress = false;
    }
}

// Show wakeup message to user
function showWakeupMessage() {
    // Remove old message if exists
    $('#wakeup-toast').remove();

    const message = `
        <div id="wakeup-toast" style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 15px 25px; 
            border-radius: 8px; 
            z-index: 9999; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        ">
            <i class="fas fa-coffee fa-spin"></i> 
            <strong>Waking up backend...</strong>
            <br>
            <small>This takes ~30 seconds on free tier</small>
        </div>
        <style>
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        </style>
    `;

    $('body').append(message);

    // Auto-remove after 35 seconds
    setTimeout(() => {
        $('#wakeup-toast').css('animation', 'slideOut 0.3s ease-in');
        setTimeout(() => $('#wakeup-toast').remove(), 300);
    }, 35000);
}

function hideWakeupMessage() {
    $('#wakeup-toast').fadeOut(300, function() { $(this).remove(); });
}

// Improved fetch that handles 503 errors
async function apiCall(endpoint, options = {}) {
    const url = `${window.API_BASE_URL}${endpoint}`;
    console.log(`API Call: ${options.method || 'GET'} ${endpoint}`);

    try {
        const response = await fetch(url, options);

        // Handle 503 (backend sleeping)
        if (response.status === 503) {
            console.log('⚠️ Backend is sleeping (503)');
            showWakeupMessage();

            // Wait 30 seconds
            await new Promise(resolve => setTimeout(resolve, 30000));

            // Retry the request
            console.log('🔄 Retrying request...');
            const retryResponse = await fetch(url, options);
            hideWakeupMessage();

            return retryResponse;
        }

        // Handle other errors
        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response;

    } catch (error) {
        console.error('API Call failed:', error);
        throw error;
    }
}

// Convenience methods for common operations
const API = {
    // GET request
    get: (endpoint, options = {}) => {
        return apiCall(endpoint, {
            ...options,
            method: 'GET',
        });
    },

    // POST request
    post: (endpoint, data, options = {}) => {
        return apiCall(endpoint, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(data),
        });
    },

    // POST with auth token
    postAuth: (endpoint, data, options = {}) => {
        const token = getAuthToken();
        return apiCall(endpoint, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
            body: JSON.stringify(data),
        });
    },

    // GET with auth token
    getAuth: (endpoint, options = {}) => {
        const token = getAuthToken();
        return apiCall(endpoint, {
            ...options,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });
    },

    // DELETE with auth token
    deleteAuth: (endpoint, options = {}) => {
        const token = getAuthToken();
        return apiCall(endpoint, {
            ...options,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });
    },
};

// Export
window.wakeUpBackend = wakeUpBackend;
window.apiCall = apiCall;
window.API = API;

console.log('API helper loaded');