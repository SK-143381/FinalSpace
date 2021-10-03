//Importing auth functions
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

var db = getFirestore();
const auth = getAuth();
var project_list = []; 


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
    unsubscribe(); 
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
    project_list = docSnap.get("Project_title"); 
    loadLogs();
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

//function to load logs
function loadLogs(){
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(collection(db, 'LOGS'), where("project-title", "in", project_list));
  
  //listen to query 
  onSnapshot(recentMessagesQuery, (querySnapshot) => {
    const listLogs = [];
    console.log(querySnapshot);
    querySnapshot.forEach((doc) => {
        listLogs.push(doc.data());
    });
    console.log(listLogs);
    setConsoleTableAfterTimeSort(listLogs);
  });
}


//on log loaded/ updated build console table. 
async function setConsoleTable(listLogs){
  var table = document.getElementById('consoleTable');

  listLogs.forEach(function (item, index) {
    console.log(item, index);    
    var newRow = table.insertRow(0);
    var cell1 = newRow.insertCell(0);
    cell1.innerHTML =  item["project-title"] + "> " + Date(item.time).toString() + item.author + " : " + item.text; 
  });
}

//TODO: BUILD HERE 
//Time Osrt setConsole table
function setConsoleTableAfterTimeSort(listLogs){
  setConsoleTable(listLogs);
}





//File upload

//Unpin logs 
