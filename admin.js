const auth = firebase.auth();
const db = firebase.firestore();

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
          <button onclick="approveClaim('${doc.id}', '${claim.itemId}', '${claim.userEmail}')">Approve</button>
          <button onclick="rejectClaim('${doc.id}')">Reject</button>
          <hr>
        `;
        claimsList.appendChild(li);
      });
    });
  });
}

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
        Location: ${item.location} | Reported on: ${formatDate(item.dateTime)}<hr>
      `;
      itemsList.appendChild(li);
    });
  });
}

function approveClaim(claimId, itemId, userEmail) {
  db.collection('claims').doc(claimId).update({ status: 'approved' });
  db.collection('lostItems').doc(itemId).update({ claimed: true, claimedBy: userEmail });
  alert('Claim approved successfully!');
  loadClaims();
}

function rejectClaim(claimId) {
  db.collection('claims').doc(claimId).delete().then(() => {
    alert('Claim rejected.');
    loadClaims();
  });
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  }).catch(err => {
    alert('Logout failed: ' + err.message);
  });
}

function formatDate(isoString) {
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  };
  return new Date(isoString).toLocaleString('en-US', options);
}
