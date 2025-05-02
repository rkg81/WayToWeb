const auth = firebase.auth();
const db = firebase.firestore();

// Handle authentication state
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    db.collection('users').doc(user.uid).get().then(doc => {
      if (doc.exists) {
        document.getElementById('user-profile').textContent = `Logged in as: ${doc.data().email}`;
        document.getElementById('report-section').style.display = 'block';
        document.getElementById('search-section').style.display = 'block';
      }
    });
  }
});

// Show toast message
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

// Logout function
function logout() {
  auth.signOut().then(() => {
    showToast("Logged out successfully!");
    setTimeout(() => window.location.href = 'login.html', 1500);
  }).catch(error => {
    showToast("Logout failed: " + error.message);
  });
}

// Report item
function reportItem() {
  const name = document.getElementById('item-name').value.trim();
  const description = document.getElementById('item-description').value.trim();
  const color = document.getElementById('item-color').value.trim();
  const location = document.getElementById('item-location').value.trim();
  const photoInput = document.getElementById('item-photo');

  if (!name || !description || !color || !location) {
    showToast('Please fill all fields');
    return;
  }

  const dateTime = new Date().toISOString();

  if (photoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      saveItemToFirestore(name, description, color, location, dateTime, e.target.result);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveItemToFirestore(name, description, color, location, dateTime, '');
  }
}

// Save item to Firestore
function saveItemToFirestore(name, description, color, location, dateTime, photo) {
  db.collection('lostItems').add({
    name, description, color, location, dateTime, photo,
    claimed: false,
    claimedBy: null
  }).then(() => {
    showToast('Item reported successfully!');
    document.getElementById('reportForm').reset();
    document.getElementById('photo-preview').style.display = 'none';
  });
}

// Claim item
function claimItem(itemId) {
  const user = auth.currentUser;
  if (!user) return;

  db.collection('claims').add({
    itemId: itemId,
    userEmail: user.email,
    claimDateTime: new Date().toISOString(),
    status: 'pending'
  }).then(() => {
    showToast('Claim request sent!');
  });
}

// Preview photo
function previewPhoto() {
  const fileInput = document.getElementById('item-photo');
  const preview = document.getElementById('photo-preview');

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
}

// Search items
function searchItems() {
  const query = document.getElementById('search-query').value.trim().toLowerCase();
  const resultsList = document.getElementById('search-results');
  resultsList.innerHTML = '';

  db.collection('lostItems').get().then(snapshot => {
    snapshot.forEach(doc => {
      const item = doc.data();
      if (item.name.toLowerCase().includes(query)) {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${item.name}</strong> - ${item.description} (${item.color}, ${item.location})
          <br><img src="${item.photo}" style="width:150px; margin-top:5px;" />
          <br><button onclick="claimItem('${doc.id}')">Claim</button>
        `;
        resultsList.appendChild(li);
      }
    });
    if (!resultsList.hasChildNodes()) {
      showToast("No matching items found");
    }
  });
}

// ✅ Register service worker for PWA support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
