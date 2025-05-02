// ✅ signup.js
const authSignup = firebase.auth();
const dbSignup = firebase.firestore();

// Show toast
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

document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const adminCode = document.getElementById('adminCode').value.trim();

  const role = (adminCode === 'Rocky') ? 'admin' : 'user';

  if (!email || !password || !confirmPassword) {
    showToast('All fields are required!');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match!');
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
      showToast('Signup successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    })
    .catch(error => {
      showToast('Signup failed: ' + error.message);
    });
});
