//Importing auth functions
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { getFirestore, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

var db = getFirestore();
const auth = getAuth();


//Tracking login status
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    document.getElementById('auth').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    //set project table on side
    setProjectTable(user.uid); 
    
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
  clearTable();
})

function clearTable(){
  var table = document.getElementById('projectTableItem');
  var rowCount = table.rows.length;
  for (var x=rowCount-1; x>=0; x--) {
   table.deleteRow(x);
  }
}

//Function to return the list of projects contained by a user. 
async function returnProjectList(uid) { 
  const docRef = doc(db, "USERS", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.get("Project_title");
  } else {
  console.log("No such document!"); 
  return []; 
  }
}
//Function to set project table 
async function setProjectTable(uid){
  var proj_list = await returnProjectList(uid); 
  console.log(proj_list[0]);

  var table = document.getElementById('projectTableItem');
  proj_list.forEach(function (item, index) {
    console.log(item, index);    
    var newRow = table.insertRow(0);
    var cell1 = newRow.insertCell(0);
    cell1.innerHTML = item; 

    rowSelectorProjectTable(); 
  });
}

//function to define rowCLicks
function rowSelectorProjectTable(){
  var rIndex,table = document.getElementById("projectTableItem");

  for(var i=0; i<table.rows.length; i++ ){
      table.rows[i].onclick = function(){
      rIndex = this.rowIndex;

      //TODO: IMPLEMENT WHAT GOES HERE
      console.log(this.cells[0].innerHTML); 
    };
  }
}



//File upload

//Unpin logs 
