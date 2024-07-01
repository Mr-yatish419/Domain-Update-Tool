import mutations from './mutations';
import actions from './actions';
import getters from './getters';

export default {
    namespaced: true, // Ensure this line is included
    state() {
        return {
            token: '',
            email: '',
            userId: '',
            refreshToken: '',
            expiresIn: 'sdsds',
            autoLogout: false,
        };
    },
    mutations,
    getters,
    actions,
};