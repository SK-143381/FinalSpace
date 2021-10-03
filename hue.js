//Importing auth functions
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";

const auth = getAuth();

//Tracking login status
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    document.getElementById('auth').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
  } else {
    document.getElementById('auth').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
  }
});

const login = document.getElementById('login');

login.addEventListener('click', () => {
  //Accessing user email and password
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // const user = userCredential.user; 

    console.log(userCredential);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;

    window.alert(error.message);
  });
})

//Firebase Auth signout
var logout = document.getElementById('logout');

logout.addEventListener('click', () => {
  signOut(auth).then(() => {
  }).catch((error) => {
    console.log(error.message);
  });
})

//File upload


//Unpin logs 
