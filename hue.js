//Importing auth functions
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { Timestamp, getFirestore, addDoc, doc, getDoc, collection, query, where, orderBy, onSnapshot} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import { getStorage, ref , getDownloadURL, uploadBytes , uploadBytesResumable} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-storage.js";

var db = getFirestore();
const auth = getAuth();
const storage = getStorage();
var project_list = []; 
var selected_project_title = ""; 

var user_name; 

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

function clearConsole(){
  var table = document.getElementById('consoleTable');
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
    user_name = docSnap.get("Name"); 
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

      var color_changeRows = document.getElementById("projectTableItem").getElementsByTagName("td");
      
      console.log(color_changeRows);
      for(var j = 0; j <color_changeRows.length; j++){
         color_changeRows[j].style.backgroundColor = "#050624"; 
      }
         
      //TODO: IMPLEMENT WHAT GOES HERE
      console.log(this.cells[0].innerHTML); 
      this.cells[0].style.backgroundColor = "#ff8ce0";
      selected_project_title = this.cells[0].innerHTML; 
    };
  }
}

//function to load logs
function loadLogs(){
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(collection(db, 'LOGS'), where("project_title", "in", project_list), orderBy("time", "desc"));
  
  //listen to query 
  onSnapshot(recentMessagesQuery, (querySnapshot) => {
    clearConsole(); 
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
    var newRow = table.insertRow(0);
    var cell1 = newRow.insertCell(0);
    cell1.innerHTML =  item["project_title"] + "> " + item.time.toDate() + item.author + " : " + item.text; 
  });
}

//TODO: BUILD HERE 
//Time Osrt setConsole table
function setConsoleTableAfterTimeSort(listLogs){
  console.log('List logs' + listLogs);
  setConsoleTable(listLogs);
}



//onSubmit 
var submit = document.getElementById('submit');

submit.addEventListener('click', ()=>{
  var textField = document.getElementById('log');
  
  if(textField != null){
    console.log(textField.value);
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    if(selected_project_title != ""){
      const project = selected_project_title; 
      const author = user_name; 
      var isLink = false; 
      const textVal = textField.value; 

      //GOES TO FIREBASE FROM HERE       
      addDoc(collection(db, "LOGS"), {
        author: author,
        project_title: project,  
        isLink: isLink, 
        text: textVal, 
        time: Timestamp.fromDate(new Date())
      });


    }else{
      window.alert("SELECT A PROJECT");
      return; 
    }

    textField.value = '';
  }

})


//media upload
var uploadMedia = document.getElementById('uploadMedia'); 
uploadMedia.addEventListener('click', () => {

  if(selected_project_title != ""){

  const file = document.querySelector("#media").files[0];
  const name = +new Date() + "-" + file.name;
  console.log(file);
  const metadata = {
    contentType: file.type
  };
  const mediaRef = ref(storage, name);

  const uploadTask = uploadBytesResumable(mediaRef, file);
  
  uploadTask.on('state_changed', 
  (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // Handle unsuccessful uploads
  }, 
  () => {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      console.log('File available at', downloadURL);

      //download url to the stoarge 
      var textField = document.getElementById('log');
      textField.value = downloadURL; 
      
      //to firebase
      const project = selected_project_title; 
      const author = user_name; 
      var isLink = true; 
      const textVal = textField.value; 


      //GOES TO FIREBASE FROM HERE       
      addDoc(collection(db, "LOGS"), {
        author: author,
        project_title: project,  
        isLink: isLink, 
        text: textVal, 
        time: Timestamp.fromDate(new Date())
      });

      textField.value = '';

    });
  }
);
  }else{
    window.alert("SELECT A PROJECT");
    return; 
  }
})




//Unpin logs 
