import { createRouter, createWebHistory } from 'vue-router';
import store from './store/store';
import { IS_USER_AUTHENTICATE_GETTER } from './store/storeconstants';

const Login = () => import('./views/LoginPage.vue');
const Signup = () => import('./views/SignupPage.vue');
const DomainChange = () => import('./views/DomainUpdater.vue');
const Dashboard = () => import('./views/DashboardPage.vue');
const GoogleCallback = () => import('./views/GoogleCallback.vue'); // Import GoogleCallback component
const ForgotPassword = () => import('./views/ForgotPassword.vue'); 
const ResetPassword= () => import('./views/ResetPassword.vue'); 




const routes = [
    { path: '', component: Login },
    { path: '/login', component: Login, meta: { auth: false } },
    { path: '/signup', component: Signup, meta: { auth: false } },
    { path: '/DomainChange', component: DomainChange, meta: { auth: false } },
    { path:'/Dashboard', component:Dashboard},
    { path: '/google-callback', component: GoogleCallback, meta: { auth: false } }, // Add this route
    { path: '/ForgotPassword', component: ForgotPassword, },
    { path: '/ResetPassword', component: ResetPassword, }

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {


    if (
        'auth' in to.meta &&
        to.meta.auth &&
        !store.getters[`auth/${IS_USER_AUTHENTICATE_GETTER}`]
    ) {
        console.log('User not authenticated. Redirecting to login.');
        next('/login');
    } else if (
        'auth' in to.meta &&
        !to.meta.auth &&
        store.getters[`auth/${IS_USER_AUTHENTICATE_GETTER}`]
    ) {
        console.log('User authenticated and trying to access non-auth page. Redirecting to posts.');
        next('/DomainChange');
    } else {
        next();
    }
});

export default router;
