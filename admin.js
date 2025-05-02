// ✅ admin.js
const authAdmin = firebase.auth();
const dbAdmin = firebase.firestore();

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
    });
}

function approveClaim(claimId, itemId, userEmail) {
  dbAdmin.collection('claims').doc(claimId).update({ status: 'approved' });
  dbAdmin.collection('lostItems').doc(itemId).update({ claimed: true, claimedBy: userEmail });
  alert('Claim approved successfully!');
  loadClaims();
}

function rejectClaim(claimId) {
  dbAdmin.collection('claims').doc(claimId).delete()
    .then(() => {
      alert('Claim rejected.');
      loadClaims();
    });
}

function logout() {
  authAdmin.signOut().then(() => {
    window.location.href = 'login.html';
  });
}

function formatDate(isoString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
  return new Date(isoString).toLocaleString('en-US', options);
}
