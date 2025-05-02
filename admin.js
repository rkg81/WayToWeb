// ✅ admin.js
const authAdmin = firebase.auth();
const dbAdmin = firebase.firestore();

// Show toast notification
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

// Auth check
authAdmin.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    dbAdmin.collection('users').doc(user.uid).get().then(doc => {
      if (!doc.exists || doc.data().role !== 'admin') {
        window.location.href = 'login.html';
      } else {
        document.getElementById('admin-profile').textContent = `Logged in as: ${doc.data().email}`;
        loadClaims();
      }
    });
  }
});

// Load pending claims
function loadClaims() {
  const claimsList = document.getElementById('claims-list');
  claimsList.innerHTML = '';

  dbAdmin.collection('claims').where('status', '==', 'pending').get()
    .then(snapshot => {
      if (snapshot.empty) {
        claimsList.innerHTML = '<li>No pending claims.</li>';
        return;
      }

      snapshot.forEach(doc => {
        const claim = doc.data();
        dbAdmin.collection('lostItems').doc(claim.itemId).get()
          .then(itemDoc => {
            const item = itemDoc.data();
            const li = document.createElement('li');
            li.innerHTML = `
              <strong>Item:</strong> ${item?.name || 'Unknown'}<br>
              <strong>Claimed by:</strong> ${claim.userEmail}<br>
              <strong>Claimed on:</strong> ${formatDate(claim.claimDateTime)}<br>
              <button onclick="approveClaim('${doc.id}', '${claim.itemId}', '${claim.userEmail}')">Approve</button>
              <button onclick="rejectClaim('${doc.id}')">Reject</button>
              <hr>`;
            claimsList.appendChild(li);
          });
      });
    })
    .catch(error => {
      showToast("Error loading claims: " + error.message);
    });
}

// Approve claim
function approveClaim(claimId, itemId, userEmail) {
  dbAdmin.collection('claims').doc(claimId).update({ status: 'approved' });
  dbAdmin.collection('lostItems').doc(itemId).update({ claimed: true, claimedBy: userEmail });
  showToast('Claim approved successfully!');
  loadClaims();
}

// Reject claim
function rejectClaim(claimId) {
  dbAdmin.collection('claims').doc(claimId).delete()
    .then(() => {
      showToast('Claim rejected.');
      loadClaims();
    })
    .catch(error => {
      showToast("Error rejecting claim: " + error.message);
    });
}

// Logout
function logout() {
  authAdmin.signOut().then(() => {
    showToast("Logged out successfully!");
    setTimeout(() => window.location.href = 'login.html', 1500);
  }).catch(error => {
    showToast("Logout failed: " + error.message);
  });
}

// Format ISO date to readable
function formatDate(isoString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
  return new Date(isoString).toLocaleString('en-US', options);
}
