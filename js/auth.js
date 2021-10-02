console.log('Linked');

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    // location.href = 'Dashboard.html';
    // ...
  } else {
    // User is signed out
    // ...
  }
});

const login = document.getElementById('login');

login.addEventListener('click', () => {
  console.log('Clicked');

  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    location.href = 'Dashboard.html';
    console.log('Logged in!');
    
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
})

