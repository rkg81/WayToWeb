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


// // Admin page logic

// // admin.js

// // admin.js

// // Protect Admin Page
// const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
// if (!currentUser || currentUser.role !== 'admin') {
//   window.location.href = 'login.html'; // Not logged in or not admin? Redirect
// }  else {
//   // ✅ Show admin's email on screen
//   document.addEventListener('DOMContentLoaded', () => {
//     document.getElementById('admin-profile').textContent = `Logged in as: ${currentUser.email}`;
//   });
// }


// document.addEventListener('DOMContentLoaded', loadClaims);

// function loadClaims() {
//   const claimsList = document.getElementById('claims-list');
//   const claims = JSON.parse(localStorage.getItem('claims')) || [];
//   const items = JSON.parse(localStorage.getItem('lostItems')) || [];

//   claimsList.innerHTML = '';

//   const pendingClaims = claims.filter(claim => claim.status === 'pending');

//   if (pendingClaims.length === 0) {
//     claimsList.innerHTML = '<li>No pending claims.</li>';
//     return;
//   }

//   pendingClaims.forEach(claim => {
//     const item = items.find(i => i.id === claim.itemId);
//     const li = document.createElement('li');

//     li.innerHTML = `
//       <strong>Item:</strong> ${item ? item.name : 'Unknown'}<br>
//       <strong>Claimed by:</strong> ${claim.userEmail}<br>
//       <strong>Claimed on:</strong> ${formatDate(claim.claimDateTime)}<br>
//       <button onclick="approveClaim('${claim.itemId}', '${claim.userEmail}')">Approve</button>
//       <button onclick="rejectClaim('${claim.itemId}', '${claim.userEmail}')">Reject</button>
//       <hr>
//     `;
//     claimsList.appendChild(li);
//   });
// }

// function approveClaim(itemId, userEmail) {
//   let claims = JSON.parse(localStorage.getItem('claims')) || [];
//   let items = JSON.parse(localStorage.getItem('lostItems')) || [];

//   // Update claim status
//   claims = claims.map(claim => {
//     if (claim.itemId === itemId && claim.userEmail === userEmail) {
//       claim.status = 'approved';
//     }
//     return claim;
//   });

//   // Mark item as claimed
//   items = items.map(item => {
//     if (item.id === itemId) {
//       item.claimed = true;
//       item.claimedBy = userEmail;
//     }
//     return item;
//   });

//   localStorage.setItem('claims', JSON.stringify(claims));
//   localStorage.setItem('lostItems', JSON.stringify(items));

//   alert('Claim approved successfully!');
//   loadClaims();
// }

// function rejectClaim(itemId, userEmail) {
//   let claims = JSON.parse(localStorage.getItem('claims')) || [];

//   // Remove rejected claim
//   claims = claims.filter(claim => !(claim.itemId === itemId && claim.userEmail === userEmail));

//   localStorage.setItem('claims', JSON.stringify(claims));

//   alert('Claim rejected.');
//   loadClaims();
// }

// function logout() {
//   localStorage.removeItem('loggedInUser');
//   window.location.href = 'login.html';
// }

// // Toast Notifications
// function showToast(message, type = 'info') {
//     const toast = document.getElementById('toast');
//     toast.textContent = message;
    
//     if (type === 'success') {
//       toast.style.background = '#4CAF50'; // Green
//     } else if (type === 'error') {
//       toast.style.background = '#f44336'; // Red
//     } else {
//       toast.style.background = '#333'; // Default
//     }
    
//     toast.classList.add('show');
  
//     setTimeout(() => {
//       toast.classList.remove('show');
//     }, 3000); // Hide after 3 seconds
//   }
  

//   // Format ISO date string to readable format
// function formatDate(isoString) {
//     const options = {
//       year: 'numeric', 
//       month: 'long', 
//       day: 'numeric',
//       hour: 'numeric', 
//       minute: '2-digit',
//       hour12: true
//     };
//     const date = new Date(isoString);
//     return date.toLocaleString('en-US', options);
//   }

//   const auth = firebase.auth();

//   function logout() {
//     auth.signOut()
//       .then(() => {
//         window.location.href = "login.html";
//       })
//       .catch(error => {
//         alert("Logout failed: " + error.message);
//       });
//   }
  