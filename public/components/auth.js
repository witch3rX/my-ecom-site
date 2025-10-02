// components/auth.js - Enhanced Authentication System with Full API Integration

/**
 * Enhanced Authentication System with Full API Integration
 * Fixed for Admin Panel Compatibility
 */
export class AuthSystem {
    
    /**
     * Handles user sign-up by sending data to the server API.
     * The server (server.js) saves the user to users.json.
     * @param {object} userData - { firstName, lastName, email, password, phone }
     * @returns {object} - The registered user object (without password)
     */
    static async signUp(userData) {
        
        // Client-side validation
        if (!userData.firstName || !userData.email || !userData.password) {
            throw new Error('First name, email, and password are required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Please enter a valid email address');
        }

        if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // API CALL FOR SIGN UP
        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed due to a server error.');
            }

            // Registration successful - Store session data in Local Storage
            const sessionUser = {
                id: data.user.id,
                firstName: data.user.firstName,
                lastName: data.user.lastName || '',
                email: data.user.email,
                phone: userData.phone || '',
            };
            
            // Set the current user in local storage for session persistence
            localStorage.setItem('currentUser', JSON.stringify(sessionUser));
            
            return sessionUser;
            
        } catch (error) {
            console.error('Sign up error (API):', error);
            
            // Enhanced error handling
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to server. Please check your connection and try again.');
            }
            throw error;
        }
    }

    /**
     * Handles user sign-in by checking credentials against server API.
     * @param {string} email 
     * @param {string} password 
     * @returns {object} - The logged-in user object
     */
    static async signIn(email, password) {
        // Client-side validation
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Please enter a valid email address');
        }

        // API CALL FOR SIGN IN
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            // Login successful - Store session data in Local Storage
            const sessionUser = {
                id: data.user.id,
                firstName: data.user.firstName,
                lastName: data.user.lastName || '',
                email: data.user.email,
                phone: data.user.phone || '',
            };

            // Set the current user in local storage
            localStorage.setItem('currentUser', JSON.stringify(sessionUser));
            
            console.log('User signed in via API:', sessionUser.email);
            return sessionUser;

        } catch (error) {
            console.error('Sign in error (API):', error);
            
            // Enhanced error handling
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to server. Please check your connection and try again.');
            }
            throw error;
        }
    }

    /**
     * Alternative login method for compatibility with admin.js
     * @param {string} email 
     * @param {string} password 
     * @returns {object} - Result object with success and user properties
     */
    static async login(email, password) {
        try {
            const user = await this.signIn(email, password);
            return { success: true, user };
        } catch (error) {
            return { 
                success: false, 
                message: this.getErrorMessage(error) 
            };
        }
    }

    /**
     * Alternative register method for compatibility
     * @param {object} userData 
     * @returns {object} - Result object with success and user properties
     */
    static async register(userData) {
        try {
            const user = await this.signUp(userData);
            return { success: true, user };
        } catch (error) {
            return { 
                success: false, 
                message: this.getErrorMessage(error) 
            };
        }
    }

    /**
     * Sets the current user in localStorage (for admin panel compatibility)
     * @param {object} user - User object to set as current
     */
    static setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    /**
     * Clears the current user session from local storage.
     */
    static signOut() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            console.log('User signed out:', currentUser.email);
        }
        localStorage.removeItem('currentUser');
        
        // Also clear cart and other user-specific data if needed
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
    }

    /**
     * Retrieves the current user from local storage.
     * @returns {object|null} - Current user object or null if not logged in
     */
    static getCurrentUser() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Checks if a user is currently logged in.
     * @returns {boolean} - True if user is authenticated
     */
    static isAuthenticated() {
        return !!this.getCurrentUser();
    }

    /**
     * Checks if the current user has admin privileges.
     * @returns {boolean} - True if user is admin
     */
    static isAdmin() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;
        
        // Define admin emails - you can expand this list
        const adminEmails = ['admin@ir7.com'];
        return adminEmails.includes(currentUser.email.toLowerCase());
    }

    /**
     * Updates the user profile (for future implementation with server API).
     * Currently updates only local storage for demo purposes.
     * @param {object} updatedData - Updated user data
     * @returns {object} - Updated user object
     */
    static async updateProfile(updatedData) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            // TODO: Implement server API call for profile update
            // For now, we'll just update the local storage
            const updatedSessionUser = { ...currentUser, ...updatedData };
            localStorage.setItem('currentUser', JSON.stringify(updatedSessionUser));

            console.log('Profile updated locally:', updatedSessionUser.email);
            return updatedSessionUser;

        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    /**
     * Validates user session and checks if token is still valid.
     * For future implementation with JWT tokens.
     * @returns {boolean} - True if session is valid
     */
    static validateSession() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        // TODO: Implement proper session validation with server
        // For now, just check if user exists in local storage
        return true;
    }

    /**
     * Gets user orders from server API.
     * @returns {array} - Array of user orders
     */
    static async getUserOrders() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            const response = await fetch(`/api/users/${currentUser.email}/orders`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch user orders');
            }

            const orders = await response.json();
            return orders;

        } catch (error) {
            console.error('Get user orders error:', error);
            throw error;
        }
    }

    /**
     * Demo method to initialize sample admin user for testing.
     * This should be called manually when needed, not automatically.
     */
    static initializeDemoAdmin() {
        // Check if we already have a user
        if (this.getCurrentUser()) {
            console.log('User already logged in, skipping demo admin initialization');
            return;
        }

        // Create demo admin user for testing
        const demoAdmin = {
            id: 'admin-001',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@ir7.com',
            phone: '01629377934',
        };
        
        localStorage.setItem('currentUser', JSON.stringify(demoAdmin));
        console.log('Demo admin user initialized for testing');
        
        // Also create demo admin in users.json via API
        this.createDemoAdminUser();
    }

    /**
     * Creates demo admin user in the backend
     */
    static async createDemoAdminUser() {
        try {
            const adminUserData = {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@ir7.com',
                password: 'admin123',
                phone: '01629377934'
            };

            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adminUserData)
            });

            if (response.ok) {
                console.log('Demo admin user created in backend');
            } else if (response.status === 409) {
                console.log('Demo admin user already exists in backend');
            }
        } catch (error) {
            console.log('Note: Could not create demo admin in backend (server may be offline)');
        }
    }

    /**
     * Enhanced error handler for authentication failures.
     * @param {Error} error - The error object
     * @returns {string} - User-friendly error message
     */
    static getErrorMessage(error) {
        const message = error.message || 'An unexpected error occurred';
        
        // Map common error messages to user-friendly versions
        const errorMap = {
            'Invalid email or password': 'The email or password you entered is incorrect.',
            'User already exists': 'An account with this email already exists.',
            'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
            'Network error': 'Network connection error. Please try again.',
        };

        return errorMap[message] || message;
    }

    /**
     * Check if current user can access admin panel
     * @returns {boolean} - True if user is admin and authenticated
     */
    static canAccessAdmin() {
        return this.isAuthenticated() && this.isAdmin();
    }

    /**
     * Force admin authentication for testing
     * @returns {object} - Demo admin user
     */
    static forceAdminAuth() {
        const demoAdmin = {
            id: 'admin-001',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@ir7.com',
            phone: '01629377934',
        };
        
        this.setCurrentUser(demoAdmin);
        return demoAdmin;
    }

    /**
     * Clear any existing session - useful for testing
     */
    static clearSession() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        console.log('All user sessions cleared');
    }
}

// Export for CommonJS compatibility (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthSystem };
}

// REMOVED: Automatic demo admin initialization
// Now users must explicitly log in through the auth page