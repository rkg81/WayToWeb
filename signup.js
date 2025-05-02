// ✅ signup.js
const authSignup = firebase.auth();
const dbSignup = firebase.firestore();

document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const adminCode = document.getElementById('adminCode').value.trim();

  const role = (adminCode === 'Rocky') ? 'admin' : 'user';

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  authSignup.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      return dbSignup.collection('users').doc(user.uid).set({
        email: user.email,
        role: role
      });
    })
    .then(() => {
      alert('Signup successful! Please login.');
      window.location.href = 'login.html';
    })
    .catch(error => {
      alert(error.message);
    });
});



// // handles creating users and storing them into localStorage

// // signup.js

// document.getElementById('signupForm').addEventListener('submit', function(event) {
//     event.preventDefault();
  
//     const email = document.getElementById('email').value.trim();
//     const password = document.getElementById('password').value;
//     const confirmPassword = document.getElementById('confirmPassword').value;
//     const adminCode = document.getElementById("adminCode").value.trim();
//     // Secret code logic
//     const role = (adminCode === "Rocky") ? "admin" : "user";

  
//     if (password !== confirmPassword) {
//       alert('Passwords do not match!');
//       return;
//     }
  
//     const auth = firebase.auth();
//     auth.createUserWithEmailAndPassword(email, password)
//     .then(userCredential => {
//       alert("Signup successful!");
//       window.location.href = "login.html";
//     })
//     .catch(error => {
//       alert(error.message);
//     });

  

//   // Toast Notifications
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
  