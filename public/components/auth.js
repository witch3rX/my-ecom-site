// Simple Authentication System
export class AuthSystem {
    static signUp(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Check if user already exists
            const existingUser = users.find(user => user.email === userData.email);
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                ...userData,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            console.log('User signed up:', newUser);
            return newUser;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    static signIn(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Invalid email or password');
            }

            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('User signed in:', user);
            return user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    static signOut() {
        localStorage.removeItem('currentUser');
        console.log('User signed out');
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
}