console.log("Home.js");

import { getAuth, signOut} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";

const auth = getAuth();

var logout = document.getElementById('logout');

console.log(logout);

logout.addEventListener('click', () => {
  signOut(auth).then(() => {
    // Sign-out successful.
    location.href = 'Auth.html';
  }).catch((error) => {
    // An error happened.
    console.log(error.message);
  });
})
