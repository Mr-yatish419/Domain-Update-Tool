import axios from 'axios';
import {
    AUTH_ACTION,
    LOGIN_ACTION,
    AUTO_LOGIN_ACTION,
    LOGOUT_ACTION,
    SET_USER_TOKEN_DATA_MUTATION,
    SIGNUP_ACTION,
    AUTO_LOGOUT_ACTION,
    SET_AUTO_LOGOUT_MUTATION,
} from '../../storeconstants';

let timer = '';
export default {
    [LOGOUT_ACTION](context) {
        context.commit(SET_USER_TOKEN_DATA_MUTATION, {
            email: null,
            token: null,
            expiresIn: null,
            refreshToken: null,
            userId: null,
        });
        localStorage.removeItem('userData');
        if (timer) {
            clearTimeout(timer);
        }
    },

    [AUTO_LOGOUT_ACTION](context) {
        context.dispatch(LOGOUT_ACTION);
        context.commit(SET_AUTO_LOGOUT_MUTATION);
    },

    async [LOGIN_ACTION](context, payload) {
        try {
            const response = await axios.post('http://localhost/sentence-validation/login.php', {
                email: payload.email,
                password: payload.password
            });
            context.commit(SET_USER_TOKEN_DATA_MUTATION, response.data);
            localStorage.setItem('userData', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            // throw error.response.data.error;
            console.error('Error fetching posts:', error);
        }
    },

    async [SIGNUP_ACTION](context, payload) {
        try {
            const response = await axios.post('http://localhost/sentence-validation/signup.php', {
                email: payload.email,
                password: payload.password
            });
            context.commit(SET_USER_TOKEN_DATA_MUTATION, response.data);
            localStorage.setItem('userData', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            // throw error.response.data.error;
            console.error('Error fetching posts:', error);
        }
    },

    [AUTO_LOGIN_ACTION](context) {
        const userDataString = localStorage.getItem('userData');

        if (userDataString) {
            const userData = JSON.parse(userDataString);
            context.commit(SET_USER_TOKEN_DATA_MUTATION, userData);

            // Add logic to check expiration time and handle auto logout if needed
        }
    },

    async [AUTH_ACTION](context, payload) {
        try {
            const response = await axios.post(payload.url, {
                email: payload.email,
                password: payload.password,
            });
            context.commit(SET_USER_TOKEN_DATA_MUTATION, response.data);
            localStorage.setItem('userData', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            // throw error.response.data.error;
            console.error('Error fetching posts:', error);
        }
    },
};
