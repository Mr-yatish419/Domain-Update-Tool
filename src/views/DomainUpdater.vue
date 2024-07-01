<template>
  <div>
    <div class="navbar-container">
      <nav class="custom-navbar fixed-top">
        <ul class="nav-links">
          <li class="nav-item">
            <a class="nav-link" href="/login">
              <img src="../assets/user.png" alt="Overview Icon" style="width:16px; height:auto; margin-right: 8px;" />
              login
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/signup">
              <img src="../assets/add-user.png" alt="Specs Icon" class="nav-icon" />
              signup
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/Dashboard">
              <img src="../assets/statisctics.png" alt="Specs Icon" class="nav-icon" />
              Dashboard
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Profile Dropdown -->
    <div class="profile-dropdown fixed-right" @click="toggleDropdown">
      <img src="../assets/account.png" alt="Profile" class="profile-icon" />
      <div v-if="showDropdown" class="dropdown-content">
        <ul>
          <li v-if="userEmail">
            <span>{{ userEmail }}</span>
          </li>
          <li>
            <button @click="logout" class="logout-button">
              <img src="../assets/logout.png" alt="Logout Icon" class="logout-icon" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="container-wrapper">
      <div class="container card col-md-12 ml-sm-2 bg-dark bg-gradient">
        <div class="row card-body">
          <div class="col-md-9 mx-auto">
            <div class="button-container">
              <div class="textbox-container">
                <textarea v-model="currentSentence" rows="12" cols="50" readonly :class="{ 'text-center': !currentSentence }" class="form-control"></textarea>
              </div>
            </div>
            <div class="dropup" v-if="sentencesWithDomains && sentencesWithDomains.length > 0">
              <h3 class="mt-4 associated-text">Associated Domain</h3>
              <span class="form-control col-4" style="text-align: center">{{ sentencesWithDomains[currentSentenceIndex].domain }}</span>
              <div class="image-button-row">
                <img src="../assets/delete.png" @click="toggleDropdownVisibility" class="Wrongimage-button" alt="Wrong Button"/>
                <img src="../assets/check.png" @click="updateDomainInDatabase"
                  :class="{ 'disabled': updateButtonDisabled }" class="Updateimage-button" alt="Update Domain"/>
              </div>
              <select class="dropdown-container form-select col-4 dropup" style="text-align: center" v-if="showDropdownContainer" v-model="selectedDomain" @change="handleDomainChange">
                <option v-for="(domain, index) in predefinedDomains" :key="index">{{ domain }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie';

export default {
  data() {
    return {
      sentencesWithDomains: [],
      currentSentenceIndex: 0,
      currentSentence: '',
      selectedDomain: '',
      selectedId: '',
      updateButtonDisabled: true,
      showDropdown: false,
      showDropdownContainer: false,
      isWrongButtonClicked: false,
      userEmail: '',
      userId: '',
      predefinedDomains: [] // This will be populated from filteredDomains
    };
  },
  methods: {
    async fetchFilesFromBackend() {
      try {
        const response = await fetch('http://localhost/sentence-validation/getfile.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const files = await response.json();
        if (Array.isArray(files) && files.length > 0) {
          this.sentencesWithDomains = files.map(file => ({
            id: file.id,
            sentence: file.Sentence.trim(),
            domain: file.Domain.trim()
          }));
          this.extractDomains();
          this.currentSentenceIndex = 0;
          this.setCurrentSentence();
        } else {
          console.error('No data found or invalid data format.');
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    },

    extractDomains() {
      const domains = new Set(this.sentencesWithDomains.map(item => item.domain));
      this.predefinedDomains = Array.from(domains);
    },
    
    setCurrentSentence() {
      if (this.sentencesWithDomains.length > 0) {
        this.currentSentence = this.sentencesWithDomains[this.currentSentenceIndex].sentence;
        this.selectedDomain = this.sentencesWithDomains[this.currentSentenceIndex].domain;
        this.selectedId = this.sentencesWithDomains[this.currentSentenceIndex].id;
      } else {
        this.currentSentence = '';
        this.selectedDomain = '';
        this.selectedId = '';
      }
    },
    nextSentence() {
      if (this.currentSentenceIndex < this.sentencesWithDomains.length - 1) {
        this.currentSentenceIndex++;
        this.setCurrentSentence();
        this.isWrongButtonClicked = false; // Reset the flag for the next sentence
      }
    },

    handleDomainChange(event) {
      this.selectedDomain = event.target.value;
      this.updateButtonDisabled = !this.selectedDomain;
    },

    async updateDomainInDatabase() {
      try {
        const requestBody = {
          selectedDomain: this.selectedDomain,
          selectedId: this.selectedId,
          user_id: this.userId
        };
        console.log('Request body:', requestBody);

        const response = await fetch('http://localhost/sentence-validation/updateDomain.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (responseData.success) {
          this.sentencesWithDomains[this.currentSentenceIndex].domain = this.selectedDomain;
          this.showMessage('success', responseData.message);
          
          this.disableUpdateButton();
          
          if (response.status === 200) {
            this.nextSentence();
          }

          this.showDropdownContainer = false;
        } else {
          this.showMessage('error', responseData.message);
        }
      } catch (error) {
        console.error('Error updating domain:', error);
        this.showMessage('error', 'An error occurred while updating the domain');
      }
    },

    showMessage(message) {
      console.log('Show message:', message);
    },

    enableUpdateButton() {
      this.updateButtonDisabled = false;
    },

    disableUpdateButton() {
      this.updateButtonDisabled = true;
    },

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    async logout() {
      console.log('Logging out...');
      try {
        const response = await fetch('http://localhost/sentence-validation/logout.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        console.log('Logout response data:', responseData);
        
        if (responseData.success) {
          console.log(responseData);
          this.$store.commit('auth/SET_USER_AUTHENTICATED', false);
          Cookies.remove('user_email');

          window.location.href = '/login';
        } else {
          this.showMessage('error', responseData.message);
        }
      } catch (error) {
        console.error('Error during logout:', error);
        this.showMessage('error', 'An error occurred during logout');
      }
    },

    toggleDropdownVisibility() {
      if (!this.isWrongButtonClicked) {
        this.showDropdownContainer = !this.showDropdownContainer;
        this.isWrongButtonClicked = true; // Set the flag to true after the first click
      }
    }
  },
  async created() {
    console.log('Component created...');
    await this.fetchFilesFromBackend();
    this.disableUpdateButton();

    const userIdLocalStorage = localStorage.getItem('user_id');
    if (userIdLocalStorage) {
      this.userId = userIdLocalStorage;
      console.log('User ID from local storage:', this.userId);
    }

    const userEmailCookie = Cookies.get('user_email');
    if (userEmailCookie) {
      this.userEmail = userEmailCookie;
      console.log('User email from cookie:', this.userEmail);
    }
  }
};
</script>

<style>

body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: linear-gradient(to bottom, #5f4d93, #935d8c, #efa8b0);
}

.custom-navbar {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(248, 241, 246);
  padding: 10px 20px;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  margin-top: 20px;
  margin-right: 20%;
  margin-left: 20%;
}

.nav-links {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 0 15px;
}

.nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #000;
  font-weight: 500;
}

.nav-icon {
  width: 20px;
  height: auto;
  margin-right: 8px;
}

.profile-dropdown {
  position: fixed;
  top: 16px; /* Adjust as needed */
  right: 5rem; /* Adjust as needed */
  display: inline-block;
}

.profile-icon {
  margin-top: 20px;
  width: 40px;
  height: auto;
  cursor: pointer;
}

.Wrongimage-button {
  width: 80px;
  height: auto;
  cursor: pointer;
  margin: 15px;
}

.Updateimage-button {
  width: 80px;
  height: auto;
  cursor: pointer;
  margin: 15px;
}

.dropdown-content {
  border-radius: 10px;
  display: block;
  position: absolute;
  right: 0;
  background-color: #f9f9f9;
  min-width: 180px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dropdown-content li {
  padding: 12px 16px;
  text-align: left;
}

.logout-button {
  background: none;
  border: none;
  padding: 5px;
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.logout-button:hover {
  background-color: #f1f1f1;
}

.logout-icon {
  width: 20px;
  height: auto;
  margin-right: 8px;
}

.associated-text{
  text-align: center;
}

.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px; /* Add padding to the container */
}

.button-container {
  display: flex;
  justify-content: space-around; /* Center and distribute space evenly */
  align-items: center;
}

.textbox-container {
  margin-top: 20px;
  display: flex;
  justify-content: center; /* Horizontally center the content */
  align-items: center; /* Vertically center the content */
}

.textbox-container textarea {
  font-size: medium;
  font-weight: 600;
  width: 90%; /* Set the width of the textarea */
  height: auto; /* Set the height to adjust according to the content */
  min-height: 150px; /* Set a minimum height for the textarea */
}

.mt-4 {
  color: #d36666;
}

.image-button-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
}

/* .image-button {
  width: 100px; 
  height: auto; 
  cursor: pointer; 
} */

.image-button.disabled {
  opacity: 0.5; /* Reduce opacity for disabled state */
  cursor: not-allowed; /* Show not-allowed cursor for disabled state */
}

.button-container button {
  margin-left: 270px; /* Adjust the margin as needed */
}

.button-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
}

.button-row button {
  border-radius: 10%;
  width: 100px; /* Adjust width and height as needed */
}

.right-button {
  margin: 0 10px; /* Adjust margin as needed */
}

.dropdown-container {
  margin-top: 50px;
  margin-bottom: 20px;
}

.container-wrapper {
  border-radius: 20px !important; /* Add border radius */
  margin: 0 auto; /* Center the container horizontally */
  padding: 50px 15px; /* Add padding to the top and bottom */
}

/* Responsive Styles */
@media (max-width: 768px) {
  .custom-navbar {
    flex-direction: column;
    margin: 0 10%;
  }
  .nav-item {
    margin: 5px 0;
  }
  .profile-dropdown {
    right: 1rem;
  }
  .container-wrapper {
    margin-left: 0; 
  }
}

@media (max-width: 576px) {
  .custom-navbar {
    margin: 0 5%;
  }
  .nav-link {
    font-size: 14px;
  }
  .profile-icon {
    width: 30px;
  }
  .container-wrapper {
    margin-left: 0; 
  }
}
</style>
