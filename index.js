const storage = firebase.storage();
const auth = firebase.auth();
const db = firebase.firestore();

// Auth check
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

// Toast
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

// Logout
function logout() {
  auth.signOut().then(() => {
    showToast("Logged out successfully!");
    setTimeout(() => window.location.href = 'login.html', 1500);
  }).catch(error => {
    showToast("Logout failed: " + error.message);
  });
}

// Report Item
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

  // ✅ New code: Use Firebase Storage instead of base64
  if (photoInput.files.length > 0) {
    const file = photoInput.files[0];
    const storageRef = storage.ref(`images/${Date.now()}_${file.name}`);

    storageRef.put(file)
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(downloadURL => {
        saveItemToFirestore(name, description, color, location, dateTime, downloadURL);
      })
      .catch(error => {
        console.error("Upload failed:", error);
        showToast("Image upload failed.");
      });

  } else {
    saveItemToFirestore(name, description, color, location, dateTime, '');
  }
}


function saveItemToFirestore(name, description, color, location, dateTime, photoUrl) {
  db.collection('lostItems').add({
    name, description, color, location, dateTime,
    photo: photoUrl,
    claimed: false,
    claimedBy: null
  }).then(() => {
    showToast('Item reported successfully!');
    document.getElementById('reportForm').reset();
    document.getElementById('photo-preview').style.display = 'none';
  });
}


// Claim Item
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

// Search Items
function searchItems() {
  const query = document.getElementById('search-query').value.trim().toLowerCase();
  const resultsList = document.getElementById('search-results');
  resultsList.innerHTML = '';

  if (!query) {
    showToast('Please enter a search term');
    return;
  }

  db.collection('lostItems').get().then(snapshot => {
    let found = false;

    snapshot.forEach(doc => {
      const item = doc.data();
      if (!item.claimed && item.name.toLowerCase().includes(query)) {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${item.name}</strong> - ${item.description} (${item.color}, ${item.location})<br>
          <img src="${item.photo}" style="width:150px; margin-top:5px;" /><br>
          <button onclick="claimItem('${doc.id}')">Claim</button>
        `;
        resultsList.appendChild(li);
        found = true;
      }
    });

    if (!found) {
      resultsList.innerHTML = '<li>No matching items found.</li>';
    }
  }).catch(error => {
    console.error('Search error:', error);
    showToast("Search failed. Try again.");
  });
}

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
