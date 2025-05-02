// ✅ login.js
const auth = firebase.auth();
const db = firebase.firestore();

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;

      // 🔍 Fetch role from Firestore
      db.collection('users').doc(user.uid).get()
        .then(doc => {
          if (doc.exists) {
            const role = doc.data().role;
            if (role === 'admin') {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'index.html';
            }
          } else {
            alert('User data not found in database.');
          }
        });
    })
    .catch(error => {
      alert('Login failed: ' + error.message);
    });
});



// // handles login checking and redirect based on removeEventListener


// // login.js

// document.getElementById('loginForm').addEventListener('submit', function(event) {
//     event.preventDefault();
  
//     const email = document.getElementById('email').value.trim();
//     const password = document.getElementById('password').value;
  
//     const users = JSON.parse(localStorage.getItem('users')) || [];
  
//     const matchedUser = users.find(user => user.email === email && user.password === password);
  
//     if (!matchedUser) {
//       alert('Invalid email or password!');
//       return;
//     }
  
//     // using firebase 
//     auth.signInWithEmailAndPassword(email, password)
//     .then(userCredential => {
//       // User logged in
//       const user = userCredential.user;
//       window.location.href = "index.html"; // or admin.html
//     })
//     .catch(error => {
//       alert("Login failed: " + error.message);
//     });

  

// // Toast Notifications
// function showToast(message, type = 'info') {
//   const toast = document.getElementById('toast');
//   toast.textContent = message;
  
//   if (type === 'success') {
//     toast.style.background = '#4CAF50'; // Green
//   } else if (type === 'error') {
//     toast.style.background = '#f44336'; // Red
//   } else {
//     toast.style.background = '#333'; // Default
//   }
  
//   toast.classList.add('show');

//   setTimeout(() => {
//     toast.classList.remove('show');
//   }, 3000); // Hide after 3 seconds
// }

