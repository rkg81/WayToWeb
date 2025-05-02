// index.js

// Load reported items


// index.js

// Protect User Page
document.addEventListener('DOMContentLoaded', () => {
    // Protect User Page
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!currentUser) {
      window.location.href = 'login.html'; // Not logged in? Kick back to login
    } else {
      // ✅ Now safely show the sections after page is fully loaded
      document.getElementById('report-section').style.display = 'block';
      document.getElementById('search-section').style.display = 'block';
      // ✅ Show logged-in user's email on screen
      document.getElementById('user-profile').textContent = `Logged in as: ${currentUser.email}`;
    }
  });
  

let items = JSON.parse(localStorage.getItem('lostItems')) || [];

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

  const id = generateUniqueId();
  const dateTime = new Date().toISOString();
  
  let photo = '';
  if (photoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      photo = e.target.result;
      saveItem({ id, name, description, color, location, dateTime, photo, claimed: false });
    }
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveItem({ id, name, description, color, location, dateTime, photo: '', claimed: false });
  }
}

function saveItem(item) {
  items.push(item);
  localStorage.setItem('lostItems', JSON.stringify(items));
  alert('Item reported successfully!');
  document.getElementById('item-name').value = '';
  document.getElementById('item-description').value = '';
  document.getElementById('item-color').value = '';
  document.getElementById('item-location').value = '';
  document.getElementById('item-photo').value = '';
}

function generateUniqueId() {
  return Math.random().toString().slice(2, 18).padEnd(16, '0');
}

function searchItems() {
  const query = document.getElementById('search-query').value.toLowerCase();
  const resultsList = document.getElementById('search-results');
  resultsList.innerHTML = '';

  const results = items.filter(item => item.name.toLowerCase().includes(query));
  
  if (results.length > 0) {
    results.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${item.name}</strong><br>
        Description: ${item.description}<br>
        Color: ${item.color}<br>
        Found at: ${item.location}<br>
        Reported on: ${formatDate(item.dateTime)}<br>
        <button onclick="claimItem('${item.id}')">Claim</button>
      `;

      resultsList.appendChild(li);
    });
  } else {
    resultsList.innerHTML = '<li>No items found</li>';
  }
}

function claimItem(itemId) {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    alert('You must be logged in to claim an item.');
    return;
  }

  let claims = JSON.parse(localStorage.getItem('claims')) || [];
  claims.push({
    itemId: itemId,
    userEmail: loggedInUser.email,
    claimDateTime: new Date().toISOString(),
    status: "pending"
  });
  localStorage.setItem('claims', JSON.stringify(claims));

  alert('Claim request sent!');
}


// index.js

function previewPhoto() {
    const photoInput = document.getElementById('item-photo');
    const preview = document.getElementById('photo-preview');
  
    if (photoInput.files && photoInput.files[0]) {
      const reader = new FileReader();
  
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
  
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      preview.src = '';
      preview.style.display = 'none';
    }
  }
  

  // Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    
    if (type === 'success') {
      toast.style.background = '#4CAF50'; // Green
    } else if (type === 'error') {
      toast.style.background = '#f44336'; // Red
    } else {
      toast.style.background = '#333'; // Default
    }
    
    toast.classList.add('show');
  
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000); // Hide after 3 seconds
  }
  

  // Format ISO date string to readable format
function formatDate(isoString) {
    const options = {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    };
    const date = new Date(isoString);
    return date.toLocaleString('en-US', options);
  }

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}
  
  