// ✅ index.js (User Dashboard)
const authIndex = firebase.auth();
const dbIndex = firebase.firestore();

authIndex.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    dbIndex.collection('users').doc(user.uid).get().then(doc => {
      if (doc.exists) {
        document.getElementById('report-section').style.display = 'block';
        document.getElementById('search-section').style.display = 'block';
        document.getElementById('user-profile').textContent = `Logged in as: ${doc.data().email}`;
      }
    });
  }
});

function reportItem() {
  const name = document.getElementById('item-name').value.trim();
  const description = document.getElementById('item-description').value.trim();
  const color = document.getElementById('item-color').value.trim();
  const location = document.getElementById('item-location').value.trim();
  const photoInput = document.getElementById('item-photo');

  if (!name || !description || !color || !location) {
    alert('Please fill all fields');
    return;
  }

  const dateTime = new Date().toISOString();

  if (photoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      saveItemToFirestore(name, description, color, location, dateTime, e.target.result);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveItemToFirestore(name, description, color, location, dateTime, '');
  }
}

function saveItemToFirestore(name, description, color, location, dateTime, photo) {
  dbIndex.collection('lostItems').add({
    name, description, color, location, dateTime,
    photo,
    claimed: false,
    claimedBy: null
  }).then(() => {
    alert('Item reported successfully!');
    document.getElementById('reportForm').reset();
    document.getElementById('photo-preview').style.display = 'none';
  });
}

function claimItem(itemId) {
  const user = authIndex.currentUser;
  if (!user) return;

  dbIndex.collection('claims').add({
    itemId: itemId,
    userEmail: user.email,
    claimDateTime: new Date().toISOString(),
    status: 'pending'
  }).then(() => {
    alert('Claim request sent!');
  });
}