import Cookies from 'js-cookie'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const loadFromCookies = () => {
    try {
        const user = Cookies.get('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            return {
                user: {
                    ...parsedUser,
                    profilePicture: parsedUser.profilePicture || null,
                },
                isAuthenticated: true,
                isAdmin: parsedUser.role === 'admin'
            };
        }
    } catch (error) {
        console.error("Error loading from cookies:", error);
    }
    return { user: null, isAuthenticated: false, isAdmin: false };
};

const initialState = loadFromCookies();

// Async thunk for setting credentials
export const setCredentials = createAsyncThunk(
    'auth/setCredentials',
    async (credentials, { rejectWithValue }) => {
        try {
            const { user } = credentials;

            // Set user in cookie
            if (user) {
                Cookies.set('user', JSON.stringify(user), { 
                    expires: 1, // 1 day
                    secure: true,
                    sameSite: 'None',
                    path: '/',
                });
            }

            return credentials;
        } catch (error) {
            console.error('Error setting credentials:', error);
            return rejectWithValue('Failed to set credentials');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isAdmin = false;

            // Remove user from cookies
            Cookies.remove('user');
            
            // Clear session storage
            sessionStorage.clear();
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setCredentials.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.isAdmin = action.payload.user.role === 'admin';
            })
            .addCase(setCredentials.rejected, (state, action) => {
                // Handle any error state if needed
                console.error('Set credentials rejected:', action.payload);
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
