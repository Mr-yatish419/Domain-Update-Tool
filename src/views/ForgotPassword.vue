<template>
    <div class="forgot-password-container">
      <h1>Forgot Password</h1>
      <form @submit.prevent="requestPasswordReset" class="forgot-password-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" required class="form-input" />
        </div>
        <button type="submit" class="submit-button">Send Password Reset Link</button>
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
        email: '',
        message: '',
        success: false
      };
    },
    methods: {
      async requestPasswordReset() {
        try {
          const response = await axios.post('http://localhost/sentence-validation/request-password-reset.php', {
            email: this.email
          });
          if (response.data.success) {
            this.message = 'Password reset link sent to your email.';
            this.success = true;
          } else {
            this.message = 'Error: ' + response.data.error;
            console.error('Error :', this.message);
            console.error('Error :', response);
            this.success = false;
          }
        } catch (error) {
          console.error('Error requesting password reset:', error);
          this.message = 'An error occurred while requesting password reset.';
          this.success = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .forgot-password-container {
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
  
  .forgot-password-form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
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
  