<template>
    <div class="reset-password-container">
      <h1>Reset Password</h1>
      <form @submit.prevent="resetPassword" class="reset-password-form">
        <div class="form-group">
          <label for="password">New Password:</label>
          <input type="password" v-model="password" required class="form-input" />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input type="password" v-model="confirmPassword" required class="form-input" />
        </div>
        <button type="submit" class="submit-button">Reset Password</button>
        <div v-if="message" :class="{'success-message': success, 'error-message': !success}">
          {{ message }}
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        password: '',
        confirmPassword: '',
        token: '',
        message: '',
        success: false
      };
    },
    created() {
      const urlParams = new URLSearchParams(window.location.search);
      this.token = urlParams.get('token');
    },
    methods: {
      async resetPassword() {
        if (this.password !== this.confirmPassword) {
          this.message = 'Passwords do not match.';
          this.success = false;
          return;
        }
  
        try {
          const response = await axios.post('http://localhost/sentence-validation/reset-password.php', {
            token: this.token,
            password: this.password
          });
          if (response.data.success) {
            this.message = 'Password reset successfully.';
            this.success = true;
            setTimeout(() => {
              this.$router.push('/login');
            }, 2000);
          } else {
            this.message = 'Error: ' + response.data.error;
            this.success = false;
          }
        } catch (error) {
          console.error('Error resetting password:', error);
          this.message = 'An error occurred while resetting password.';
          this.success = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .reset-password-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }
  
  h1 {
    font-size: 24px;
    text-align: center;
    color: #333;
  }
  
  .reset-password-form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-top: 15px;
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    color: #555;
  }
  
  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: border-color 0.3s;
  }
  
  .form-input:focus {
    border-color: #007bff;
    outline: none;
  }
  
  .submit-button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .submit-button:hover {
    background-color: #0056b3;
  }
  
  .success-message {
    color: green;
    text-align: center;
    margin-top: 15px;
  }
  
  .error-message {
    color: red;
    text-align: center;
    margin-top: 15px;
  }
  </style>
  