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
