//Project info 
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyD7J-Jqb_Sdm2e6b75LzdwDJq05Q69gVe0",
    authDomain: "finalspaceconsole-71458.firebaseapp.com",
    projectId: "finalspaceconsole-71458",
    storageBucket: "finalspaceconsole-71458.appspot.com",
    messagingSenderId: "310229284180",
    appId: "1:310229284180:web:e48d6ad83fb98b857bc4c1",
    measurementId: "G-L5SKJJZN3H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Importing auth functions
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";

const auth = getAuth();

//Tracking login status
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     const uid = user.uid;
//   } else {
//   }
// });

const login = document.getElementById('login');

login.addEventListener('click', () => {

  //Accessing user email and password
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    location.href = 'Dashboard.html';    
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
})

