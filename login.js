// ✅ login.js
const auth = firebase.auth();
const db = firebase.firestore();

// Toast message function
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 500);
  }, duration);
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showToast('Please fill in all fields');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;

      // Get user role from Firestore
      db.collection('users').doc(user.uid).get()
        .then(doc => {
          if (doc.exists) {
            const role = doc.data().role;
            showToast('Login successful! Redirecting...');
            setTimeout(() => {
              if (role === 'admin') {
                window.location.href = 'admin.html';
              } else {
                window.location.href = 'index.html';
              }
            }, 1500);
          } else {
            showToast('User data not found in database.');
          }
        })
        .catch(error => {
          showToast('Error fetching user data: ' + error.message);
        });
    })
    .catch(error => {
      showToast('Login failed: ' + error.message);
    });
});
