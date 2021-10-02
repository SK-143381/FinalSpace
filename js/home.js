//Firebase Auth signout
import { getAuth, signOut} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";

const auth = getAuth();

var logout = document.getElementById('logout');

logout.addEventListener('click', () => {
  signOut(auth).then(() => {
    location.href = 'Auth.html';
  }).catch((error) => {
    console.log(error.message);
  });
})

//File upload


//Unpin logs 