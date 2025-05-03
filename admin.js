const auth = firebase.auth();
const db = firebase.firestore();

// Protect admin access
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  db.collection('users').doc(user.uid).get().then(doc => {
    if (!doc.exists || doc.data().role !== 'admin') {
      window.location.href = 'index.html';
    } else {
      document.getElementById('admin-profile').textContent = `Logged in as: ${doc.data().email}`;
      loadClaims();
      loadItems();
    }
  });
});

// Load all pending claims
function loadClaims() {
  const claimsList = document.getElementById('claims-list');
  claimsList.innerHTML = '';

  db.collection('claims').where('status', '==', 'pending').get().then(snapshot => {
    if (snapshot.empty) {
      claimsList.innerHTML = '<li>No pending claims.</li>';
      return;
    }

    snapshot.forEach(doc => {
      const claim = doc.data();
      db.collection('lostItems').doc(claim.itemId).get().then(itemDoc => {
        const item = itemDoc.data();
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>Item:</strong> ${item?.name || 'Unknown'}<br>
          <strong>Claimed by:</strong> ${claim.userEmail}<br>
          <strong>Claimed on:</strong> ${formatDate(claim.claimDateTime)}<br>
          <button onclick="approveClaim('${doc.id}', '${claim.itemId}', '${claim.userEmail}')">✅ Approve</button>
          <button onclick="rejectClaim('${doc.id}')">❌ Reject</button>
          <hr>
        `;
        claimsList.appendChild(li);
      });
    });
  });
}

// Approve claim — update item + claim record
function approveClaim(claimId, itemId, userEmail) {
  // 1. Mark the claim as approved
  db.collection('claims').doc(claimId).update({ status: 'approved' });

  // 2. Update the item as claimed
  db.collection('lostItems').doc(itemId).update({
    claimed: true,
    claimedBy: userEmail
  });

  alert('Claim approved successfully!');
  loadClaims();
  loadItems(); // Refresh items view so it's hidden to users
}

// Reject claim — just delete the claim
function rejectClaim(claimId) {
  db.collection('claims').doc(claimId).delete().then(() => {
    alert('Claim rejected.');
    loadClaims();
  });
}

// Show all reported items in admin view
function loadItems() {
  const itemsList = document.getElementById('items-list');
  itemsList.innerHTML = '';

  db.collection('lostItems').get().then(snapshot => {
    if (snapshot.empty) {
      itemsList.innerHTML = '<li>No lost items found.</li>';
      return;
    }

    snapshot.forEach(doc => {
      const item = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${item.name}</strong> - ${item.description}<br>
        Location: ${item.location} | Reported on: ${formatDate(item.dateTime)}<br>
        Claimed: ${item.claimed ? "✅ Yes (by " + item.claimedBy + ")" : "❌ No"}<br>
        ${!item.claimed ? `<button onclick="deleteItem('${doc.id}')">🗑️ Delete</button>` : ''}
        <hr>
      `;
      itemsList.appendChild(li);
    });
  });
}

// Delete unclaimed item only
function deleteItem(itemId) {
  if (confirm("Are you sure you want to permanently delete this item?")) {
    db.collection('lostItems').doc(itemId).delete().then(() => {
      alert("Item deleted successfully.");
      loadItems();
    });
  }
}

// Logout
function logout() {
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  }).catch(err => {
    alert('Logout failed: ' + err.message);
  });
}

// Format dates
function formatDate(isoString) {
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  };
  return new Date(isoString).toLocaleString('en-US', options);
}
