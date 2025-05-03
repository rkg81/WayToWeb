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
      } else {
        showToast("User data not found in Firestore.");
      }
    }).catch(err => {
      console.error("Error fetching user data:", err);
    });
  }
});

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 500);
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

// Detect via YOLO
async function reportItem() {
  const photoInput = document.getElementById('item-photo');
  if (!photoInput.files || photoInput.files.length === 0) {
    showToast('Please upload a photo for detection');
    return;
  }

  try {
    const file = photoInput.files[0];

    // Preview the photo
    previewPhoto(file);

    if (file.size > 3 * 1024 * 1024) {
      showToast("Image too large for detection. You can fill manually.", 3000);
      return;
    }

    const compressedBlob = await compressImage(file);
    sendImageToYOLOServer(compressedBlob);

  } catch (err) {
    console.error('Compression failed:', err);
    showToast("Image too large or invalid. Try a smaller one.", 3000);
  }
}

// Submit final report
function submitFinalReport() {
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

// Save to Firestore
function saveItemToFirestore(name, description, color, location, dateTime, photo) {
  db.collection('lostItems').add({
    name, description, color, location, dateTime, photo,
    claimed: false,
    claimedBy: null
  }).then(() => {
    showToast('Item reported successfully!');
    document.getElementById('reportForm').reset();
    document.getElementById('photo-preview').style.display = 'none';
  }).catch(error => {
    showToast("Error reporting item: " + error.message);
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
function previewPhoto(file) {
  const preview = document.getElementById('photo-preview');
  const reader = new FileReader();
  reader.onload = function (e) {
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
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

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// Image compression helper
function compressImage(file, maxWidth = 640, maxHeight = 640, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      } else if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error("Image compression failed"));
      }, 'image/jpeg', quality);
    };

    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Optional YOLO Integration (Uncomment and configure IP)
/*
function sendImageToYOLOServer(file) {
  const formData = new FormData();
  formData.append('image', file);

  fetch('http://<FRIEND-IP>:5000/detect', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.labels?.length) {
      document.getElementById('item-name').value = data.labels[0];
    }
    if (data.colors?.length) {
      document.getElementById('item-color').value = data.colors[0];
    }
    showToast("Object detected and form auto-filled!", 3000);
  })
  .catch(error => {
    console.error('Detection failed:', error);
    showToast("Detection failed. Please try again.", 3000);
  });
}
*/
