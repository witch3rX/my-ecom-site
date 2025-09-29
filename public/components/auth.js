// Enhanced Authentication System
export class AuthSystem {
    static signUp(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Validate required fields
            if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.phone) {
                throw new Error('All fields are required');
            }

            // Check if user already exists
            const existingUser = users.find(user => user.email.toLowerCase() === userData.email.toLowerCase());
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Validate password length
            if (userData.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Check if user is admin
            const adminEmails = ['admin@ir7.com'];
            const isAdmin = adminEmails.includes(userData.email.toLowerCase());

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                firstName: userData.firstName.trim(),
                lastName: userData.lastName.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                phone: userData.phone.trim(),
                isAdmin: isAdmin,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            console.log('User signed up successfully:', newUser.email, 'Admin:', isAdmin);
            return newUser;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    static signIn(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === password
            );
            
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Check if user is admin
            const adminEmails = ['admin@ir7.com'];
            const isAdmin = adminEmails.includes(user.email.toLowerCase());

            // Update user data in case of changes
            const updatedUser = {
                ...user,
                isAdmin: isAdmin,
                lastLogin: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            console.log('User signed in successfully:', user.email, 'Admin:', isAdmin);
            return updatedUser;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    static signOut() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            console.log('User signed out:', currentUser.email);
        }
        localStorage.removeItem('currentUser');
    }

    static getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    static isAuthenticated() {
        return !!this.getCurrentUser();
    }

    // Check if current user is admin
    static isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser ? currentUser.isAdmin : false;
    }

    // Additional method to update user profile
    static updateProfile(updatedData) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }

            // Update user data
            users[userIndex] = { ...users[userIndex], ...updatedData };
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));

            return users[userIndex];
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }
}