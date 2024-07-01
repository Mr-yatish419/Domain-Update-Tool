<!-- GoogleCallback.vue -->
<template>
    <div>
    </div>
  </template>
  
  <script>
  import LoginPage from './LoginPage.vue'; // Import the LoginPage component to access handleOAuthResponse
  import SignupPage from './SignupPage.vue';



  export default {
    async created() {
      await LoginPage.methods.handleOAuthResponse.call(this);
      await SignupPage.methods.handleOAuthResponse.call(this);
    }
  };
  </script>
