// handles creating users and storing them into localStorage

// signup.js

document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.querySelector('input[name="role"]:checked').value;
  
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  
    let users = JSON.parse(localStorage.getItem('users')) || [];
  
    if (users.some(user => user.email === email)) {
      alert('Email already registered.');
      return;
    }
  
    const newUser = { email, password, role };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
  
    alert('Signup successful! Please login.');
    window.location.href = 'login.html';
  });
  

  // Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    
    if (type === 'success') {
      toast.style.background = '#4CAF50'; // Green
    } else if (type === 'error') {
      toast.style.background = '#f44336'; // Red
    } else {
      toast.style.background = '#333'; // Default
    }
    
    toast.classList.add('show');
  
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000); // Hide after 3 seconds
  }
  