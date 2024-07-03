<template>
    <div class="row main-container">
      <div class="container card signup-card col-md-4 col-sm-5 col-xs-12 mx-auto">
        <div>
          <h3 class="text-center mt-3 label">Sign Up</h3>
          <hr />
        </div>
        <div class="alert alert-danger" v-if="error">
          {{ error }}
        </div>
        <form @submit.prevent="onSignup()">
          <div class="mb-3 mx-4">
            <div class="form-group">
              <label class="mb-2">User Name</label>
              <input type="text" class="form-control shadow" required="required" v-model.trim="username" />
            </div>
          </div>
          <div class="mb-3 mx-4">
            <div class="form-group">
              <label class="mb-2">Email</label>
              <input type="text" class="form-control shadow" required="required" v-model.trim="email" />
              <div class="error" v-if="errors.email">{{ errors.email }}</div>
              <!-- <p class="validation-hint gl-field-hint text-secondary form-message" :hidden="!showValidationHint">We recommend a work email address.</p> -->
            </div>
          </div>

          <div class="mb-3 mx-4">
            <div class="form-group">
              <label class="mb-2">Password</label>
              <input type="password" class="form-control shadow" required="required" v-model.trim="password" />
              <div class="error" v-if="errors.password">{{ errors.password }}</div>
              <p class="gl-field-hint-valid text-secondary form-message" :hidden="!showValidationHint">Minimum length is 6 characters.</p>
            </div>
            <div class="form-check mb-3">
              <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe" />
              <label class="form-check-label" for="rememberMe">Remember Me</label>
            </div>
          </div>
          
          <div class="text-center mt-5 my-4 mx-5">
            <button type="submit" class="btn btn-primary custom-btn shadow">Signup</button>
          </div>
          <div class="text-center mt-3 position mx-2">
            <p>Already have an account? <router-link to="./login">Login here</router-link></p>
          </div>
          <div class="container-row mt-5">
            <div class="row">
              <div class="col-4">
                <hr>
              </div>
              <div class="col-4 text-center">
                <span>or sign up with</span>
              </div>
              <div class="col-4">
                <hr>
              </div>
            </div>
          </div>

          <div class="row">
                <div class="col-12 d-flex justify-content-center mt-4 mb-5">
                    <a href="#" class="oauth-button google mx-2 shadow" @click.prevent="onGoogleSignUp">
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



          <!-- <div class="row">
            <div class="col-12 d-flex justify-content-center mt-1 mb-4">
              <a href="#" class="btn btn-light mx-2 shadow"  @click.prevent="onGoogleSignUp">
                <img src="../assets/google.png" alt="Google Icon" class="img-fluid" style="max-width: 25px; height: auto;">
              </a>
              <a href="#" class="btn btn-light mx-2 shadow">
                <img src="../assets/facebook.png" alt="Facebook Icon" class="img-fluid" style="max-width: 25px; height: auto;">
              </a>
            </div>
          </div> -->
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import SignupValidations from '../services/SignupValidations';
  import { SET_USER_AUTHENTICATED_MUTATION } from '../store/storeconstants';
  import axios from 'axios';
  import CryptoJS from 'crypto-js'; // Import crypto-js
  import Cookies from 'js-cookie';
  
  export default {
    data() {
      return {
        username: '',
        email: '',
        password: '',
        rememberMe: false, // Add rememberMe flag
        errors: [],
        error: '',
        showValidationHint: true // Initially set to true to show the validation hint
      };
    },
    methods: {
      async onSignup() {
        let validations = new SignupValidations(this.email, this.password);
        this.errors = validations.checkValidations();
        if ('email' in this.errors || 'password' in this.errors) {
          this.showValidationHint = false; // Hide the validation hint if there are errors
          return false;
        }
        
        try {
          let response = await axios.post('http://localhost/sentence-validation/signup.php', {
            username: this.username,
            email: this.email,
            password: this.password, //needs to be addead
            user_id: this.user_id
          });

          // console.log(response.data.user_id);
          localStorage.setItem('user_id', response.data.user_id);


          if (response.data && response.data.error) {
            this.error = response.data.error;
          } else {
            // Save encrypted user data to localStorage if rememberMe is checked
            if (this.rememberMe) {
              const userData = {
                username: this.username,
                email: this.email,
                password: this.password,
                user_id: this.user_id
              };
              const encryptedUserData = CryptoJS.AES.encrypt(JSON.stringify(userData), 'secret-key').toString();
              localStorage.setItem('user', encryptedUserData);
            } else {
              localStorage.removeItem('user');
            }

            Cookies.set('user_email', this.email, { expires: 7 }); // Cookie expires in 7 days

            this.$router.push('/DomainChange'); // Redirect to PostPage
          }
        } catch (error) {
          console.error('Signup error:', error);
          this.error = 'An error occurred during signup. Please try again later.';
        }
      },

    async onGoogleSignUp() {
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
          const response = await axios.post('http://localhost/sentence-validation/google-callback.php', { access_token: accessToken });
          // console.log("Backend Response:", response.data);
          if (response.data && response.data.success) {
            this.$store.commit(`auth/${SET_USER_AUTHENTICATED_MUTATION}`, true);
            this.$router.push('/DomainChange');
          } else {
            this.error = response.data.error || 'OAuth login failed.';
          }
        } catch (error) {
          console.error('OAuth Login Error:', error);
          this.error = 'An error occurred during Google login. Please try again later.';
        }
      } else {
        this.error = 'Invalid OAuth response.';
        this.$router.push('/login');
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
          this.username = decryptedUserData.username;
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
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
  
  body {
    height: 100%;
    margin: 0;
    padding: 0;
    background: url('../assets/Abstract-Gradient-Background.jpg') no-repeat center center fixed;
    background-size: cover;
  }

  .label {
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
    margin: 0 auto; 
  }
  
  .form-message {
    font-size: 14px; 
    color: #6c757d; 
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
/*auth button*/ 
  
  .shadow {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .signup-card {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    width: 26rem;
    margin-top: -50px;
    padding: 20px;
  }
  
  .custom-btn {
    width: 100%;
    max-width: 200px;
    transition: transform 0.4s ease;
    cursor: pointer;
  }

  .custom-btn:hover {
   transform: translateY(-6px);
 }
  
  .position a {
    text-decoration: none;
  }
  
  .position a:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 15px;
    }
  
    .mb-3.mx-5 {
      margin-left: 10px !important;
      margin-right: 10px !important;
    }

    .custom-btn {
      transition: transform 0.4s ease;
      -webkit-transition: transform 0.4s ease; /* For Safari */
      -moz-transition: transform 0.4s ease; /* For Firefox */
      -o-transition: transform 0.4s ease; /* For Opera */
    }

    .custom-btn:hover {
      transform: translateY(-6px);
      -webkit-transform: translateY(-6px); /* For Safari */
      -moz-transform: translateY(-6px); /* For Firefox */
      -o-transform: translateY(-6px); /* For Opera */
    }
    
  }
  


  @media (max-width: 576px) {
    .container {
      padding: 10px;
    }
  
    .mb-3.mx-5 {
      margin-left: 5px !important;
      margin-right: 5px !important;
    }
  
    .main-container {
      padding: 10px;
    }

    .custom-btn {
      transition: transform 0.4s ease;
      -webkit-transition: transform 0.4s ease; /* For Safari */
      -moz-transition: transform 0.4s ease; /* For Firefox */
      -o-transition: transform 0.4s ease; /* For Opera */
    }

    .custom-btn:hover {
      transform: translateY(-6px);
      -webkit-transform: translateY(-6px); /* For Safari */
      -moz-transform: translateY(-6px); /* For Firefox */
      -o-transform: translateY(-6px); /* For Opera */
    }
  }
  </style>
  