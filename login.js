// handles login checking and redirect based on removeEventListener


// login.js

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
  
    const users = JSON.parse(localStorage.getItem('users')) || [];
  
    const matchedUser = users.find(user => user.email === email && user.password === password);
  
    if (!matchedUser) {
      alert('Invalid email or password!');
      return;
    }
  
    // Save the logged-in user session
    localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
  
    if (matchedUser.role === 'admin') {
      window.location.href = 'admin.html';  // Redirect to Admin Panel
    } else {
      window.location.href = 'index.html';  // Redirect to User Home
    }
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

// // Toast Notifications
// function showToast(message, type = 'info') {
//     const toast = document.getElementById('toast');
//     toast.textContent = message;
    
//     if (type === 'success') {
//       toast.style.background = '#4CAF50'; // Green
//     } else if (type === 'error') {
//       toast.style.background = '#f44336'; // Red
//     } else {
//       toast.style.background = '#333'; // Default
//     }
    
//     toast.classList.add('show');
  
//     setTimeout(() => {
//       toast.classList.remove('show');
//     }, 3000); // Hide after 3 seconds
//   }
  
