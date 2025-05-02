<!-- ✅ signup.js -->
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
