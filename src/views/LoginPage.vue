<template>
  <div class="main-container">
    <div class="container card login-card">
      <!-- Loading spinner -->
      <div v-if="loading" class="text-center my-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div>
        <div>
          <h3 class="text-center mt-3 label">Log In</h3>
          <hr />
        </div>
        <div class="alert alert-danger" v-if="error">
          {{ error }}
        </div>
        <form @submit.prevent="onLogin()">
          <div class="form-group my-4 mx-4">
            <label class="form-label">Email</label>
            <input
              type="text"
              class="form-control shadow mb-4"
              required
              v-model.trim="email"
            />
            <div class="error" v-if="errors.email">
              {{ errors.email }}
            </div>
          </div>

          <div class="form-group mb-3 mx-4">
            <label class="form-label">Password</label>
            <input type="password" class="form-control shadow" required v-model.trim="password" />
            <div class="error" v-if="errors.password">
              {{ errors.password }}
            </div>
            <div class="forgot-password-link">
              <!-- <router-link to="/ForgotPassword">Forgot password?</router-link> -->
            </div>
            <div class="form-check mt-3 mb-3">
              <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe" />
              <label class="form-check-label" for="rememberMe">Remember Me</label>
            </div>
          </div>

          <div class="text-center mt-5 my-2 mx-5">
            <button type="submit" class="btn btn-primary custom-btn shadow">
              Login
            </button>
          </div>

          <div class="mt-4 text-center position mx-2">
            <p>Don't have an account? <router-link to="/signup">Signup here</router-link>.</p>
          </div>

          <div class="container-row mt-5">
            <div class="row">
              <div class="col-4">
                <hr>
              </div>
              <div class="col-4 text-center">
                <span>or sign in with</span>
              </div>
              <div class="col-4">
                <hr>
              </div>
            </div>

            <div class="row">
                <div class="col-12 d-flex justify-content-center mt-4 mb-5">
                    <a href="#" class="oauth-button google mx-2 shadow" @click.prevent="onGoogleSignIn">
                        <img src="../assets/google.png" alt="Google Icon" class="oauth-logo img-fluid" > Google
                    </a>
                    <!-- Uncomment the following block to include the Facebook button -->
                    <!--
                    <a href="#" class="oauth-button facebook mx-2 shadow">
                        <img src="../assets/facebook.png" alt="Facebook Icon" class="oauth-logo img-fluid" style="max-width: 25px; height: auto;"> Facebook
                    </a>
                    -->
                </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import SignupValidations from '../services/SignupValidations';
// import { jwtDecode } from 'jwt-decode'; 
import axios from 'axios';
import { SET_USER_AUTHENTICATED_MUTATION } from '../store/storeconstants';
import CryptoJS from 'crypto-js'; // Import crypto-js
import Cookies from 'js-cookie'; // Import js-cookie

export default {
  data() {
    return {
      email: '',
      password: '',
      user_id: '',
      rememberMe: false, // Add rememberMe flag
      errors: [],
      error: '',
      loading: false, // Add loading flag
    };
  },
  methods: {
    async onLogin() {
      this.loading = true; // Show loading spinner
      let validations = new SignupValidations(this.email, this.password);
      this.errors = validations.checkValidations();
      if ('email' in this.errors || 'password' in this.errors) {
        this.loading = false;
        return false;
      }

      try {
        let response = await axios.post('http://localhost/sentence-validation/login.php', {
          email: this.email,
          password: this.password,
          user_id: this.user_id
        });
        // console.log(response.data.user_id);
        localStorage.setItem('user_id', response.data.user_id);

        if (response.data && response.data.success) {

          // Save authentication state (e.g., token, user info) in your store
          this.$store.commit(`auth/${SET_USER_AUTHENTICATED_MUTATION}`, true);
          console.log(response.data);
          // Save encrypted user data to localStorage if rememberMe is checked
          if (this.rememberMe) {
            const userData = {
              email: this.email,
              password: this.password,
              user_id: this.user_id
            };
            // console.log(userData.user_id);
            const encryptedUserData = CryptoJS.AES.encrypt(JSON.stringify(userData), 'secret-key').toString();
            localStorage.setItem('user', encryptedUserData);
          //   console.log(userData.user_id);
          // } else {
            localStorage.removeItem('user');
          }

          
          Cookies.set('user_email', this.email, { expires: 7 }); // Cookie expires in 7 days

          this.$router.push('/DomainChange'); // Redirect to PostPage
        } else if (response.data && response.data.error) {
          this.error = response.data.error;
        } else {
          this.error = 'Unexpected error occurred.';
        }
      } catch (error) {
        console.error('Login Error:', error); // Log any errors
        this.error = 'An error occurred during login. Please try again later.';
      } finally {
        this.loading = false; // Hide loading spinner
      }
    },
    async onGoogleSignIn() {
      const clientId = '990740126690-8lrf8ksvaie1fgof3nr4mti2qd6haea3.apps.googleusercontent.com';
      const redirectUri = 'http://localhost:8080/google-callback';
      const scope = 'openid profile email';
      const state = 'state_parameter_passthrough_value';


      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

      window.location.href = authUrl;
    },


    async handleOAuthResponse() {
      console.log("Handling OAuth Response");
      const hash = window.location.hash;
      console.log("URL Fragment:", hash);

      const params = new URLSearchParams(hash.substring(1));
      // const idToken = params.get('id_token');
      const accessToken = params.get('access_token');
      // console.log("ID Token:", idToken);
      // console.log("Access Token:", accessToken);

      if (accessToken) {
        try {
          const Received_response = await axios.post('http://localhost/sentence-validation/google-callback.php', { access_token: accessToken });
          console.log("Backend Response:", Received_response.data);
          if (Received_response.data && Received_response.data.success) {
              const user_id = Received_response.data.user.id;
              const email = Received_response.data.user.email;
              Cookies.set('user_email', email, { expires: 7 });
              localStorage.setItem('user_id', user_id);
              console.log("user_id", user_id);
              this.$store.commit(`auth/${SET_USER_AUTHENTICATED_MUTATION}`, true);
              this.$router.push('/DomainChange');
          } else {
              this.error = Received_response.data.error || 'OAuth login failed.';
          }
        } catch (error) {
          console.error('OAuth Login Error:', error);
          this.error = 'An error occurred during Google login. Please try again later.';
        }
      } else {
        this.error = 'Invalid OAuth response.';
      }
    },
  },
  mounted() {

    // Pre-fill user data if saved in localStorage
    const encryptedUser = localStorage.getItem('user');
    if (encryptedUser) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedUser, 'secret-key');
        const decryptedUserData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        this.email = decryptedUserData.email;
        this.password = decryptedUserData.password;
        this.rememberMe = true;
      } catch (error) {
        console.error('Decryption Error:', error); // Log any decryption errors
      }
    }
  }
};
</script>

<style >
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900&display=swap');

body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: url('../assets/Abstract-Gradient-Background.jpg') no-repeat center center fixed;
  background-size: cover;
}

.label{
  font-family: "system-ui", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "sans-serif";
  font-size: 30px;
  font-weight: 700;
  line-height: 1.8;

}


.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  margin: 0 auto; /* Center horizontally */
}

.login-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  width: 26rem;
  margin-top: -50px;
  padding: 20px;
}

.custom-btn {
  width: 100%;
  max-width: 200px;
  margin: 0 auto; /* Center horizontally */
}

/*auth button*/ 
.oauth-button {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  width: 140px;
  justify-content: center;
  background-color: white;
  text-decoration: none;
  color: inherit;
}

.oauth-button img.oauth-logo {
  width: 25px;
  height:auto;
  margin-right: 10px;
}

.oauth-button.google {
  border-color: #131212;
  color: #131212;
}

.oauth-button.facebook {
  border-color: #3b5998;
  color: #3b5998;
}

.oauth-button.google:hover {
  background-color: #f5f5f5;
}

.oauth-button.facebook:hover {
  background-color: #f5f5f5;
}

.shadow {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.forgot-password-link {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}

.forgot-password-link a {
  text-decoration: none;
}

.forgot-password-link a:hover {
  text-decoration: underline;
}

.position a {
  text-decoration: none;
}

.position a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {

  .login-card {
    padding: 15px;
    margin: 0 auto;
  }

  .form-label {
    font-size: 14px;
  }

  .form-control {
    font-size: 14px;
  }
}

</style>

<!-- working css -->

<!-- <style >
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Full viewport height */
  padding: 20px;
  box-sizing: border-box;
  background: url('../assets/Abstract-Gradient-Background.jpg') no-repeat center center fixed; /* Adjust the path as needed */
  background-size: cover;
}

.login-card {
  /* background: #95af62; */
  background:rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.custom-btn {
  width: 100%;
  max-width: 200px;
}


/*auth button*/ 
.oauth-button {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    width: 140px;
    justify-content: center;
    background-color: white;
    text-decoration: none;
    color: inherit;
}

.oauth-button img.oauth-logo {
    width: 25px;
    height:auto;
    margin-right: 10px;
}

.oauth-button.google {
    border-color: #131212;
    color: #131212;
}

.oauth-button.facebook {
    border-color: #3b5998;
    color: #3b5998;
}

.oauth-button.google:hover {
    background-color: #f5f5f5;
}

.oauth-button.facebook:hover {
    background-color: #f5f5f5;
}

.shadow {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.forgot-password-link {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}

.forgot-password-link a {
  text-decoration: none;
}

.forgot-password-link a:hover {
  text-decoration: underline;
}

.position a {
  text-decoration: none;
}

.position a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-card {
    padding: 15px;
  }

  .form-label {
    font-size: 14px;
  }

  .form-control {
    font-size: 14px;
  }
}
</style> -->
