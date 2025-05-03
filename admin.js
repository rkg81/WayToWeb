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
          <div class="mb-4 p-4 border rounded-lg shadow-sm bg-gray-50">
            <strong>Item:</strong> ${item?.name || 'Unknown'}<br>
            <strong>Claimed by:</strong> ${claim.userEmail}<br>
            <strong>Claimed on:</strong> ${formatDate(claim.claimDateTime)}<br>
            <div class="mt-2 flex gap-3">
              <button onclick="approveClaim('${doc.id}', '${claim.itemId}', '${claim.userEmail}')"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md">✅ Approve</button>
              <button onclick="rejectClaim('${doc.id}')"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md">❌ Reject</button>
            </div>
          </div>
        `;
        claimsList.appendChild(li);
      });
    });
  });
}

// Approve claim — update item + claim record
async function approveClaim(claimId, itemId, userEmail) {
  try {
    await db.collection('claims').doc(claimId).update({ status: 'approved' });
    await db.collection('lostItems').doc(itemId).update({
      claimed: true,
      claimedBy: userEmail
    });
    alert('Claim approved successfully!');
    loadClaims();
    loadItems();
  } catch (error) {
    alert("Approval failed: " + error.message);
  }
}

// Reject claim — just delete the claim
async function rejectClaim(claimId) {
  try {
    await db.collection('claims').doc(claimId).delete();
    alert('Claim rejected.');
    loadClaims();
  } catch (error) {
    alert("Rejection failed: " + error.message);
  }
}

// Load all reported items for admin view
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
        <div class="mb-4 p-4 border rounded-lg shadow-sm bg-white">
          <strong>${item.name}</strong> - ${item.description}<br>
          Location: ${item.location}<br>
          Reported on: ${formatDate(item.dateTime)}<br>
          Claimed: ${item.claimed ? "✅ Yes (by " + item.claimedBy + ")" : "❌ No"}<br>
          ${!item.claimed ? `
            <button onclick="deleteItem('${doc.id}')" 
              class="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md">🗑️ Delete</button>` : ''}
        </div>
      `;
      itemsList.appendChild(li);
    });
  });
}

// Delete unclaimed item only
async function deleteItem(itemId) {
  if (confirm("Are you sure you want to permanently delete this item?")) {
    try {
      await db.collection('lostItems').doc(itemId).delete();
      alert("Item deleted successfully.");
      loadItems();
    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
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
