//Importing auth functions
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { Timestamp, getFirestore,getDocs, addDoc, doc, getDoc, collection, query, where, orderBy, deleteDoc, onSnapshot} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import { getStorage, ref , getDownloadURL, uploadBytes , uploadBytesResumable} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-storage.js";

var db = getFirestore();
const auth = getAuth();
const storage = getStorage();
var project_list = []; 
var selected_project_title = ""; 

var user_name;
var user_id;

//Tracking login status
onAuthStateChanged(auth, (user) => {
  if (user) {
    user_id = user.uid;
    document.getElementById('auth').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    //set project table on side
    setProjectTable(user.uid); 
    getPins();
    
  } else {
    document.getElementById('auth').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    //unsubscribe(); 
  }
});

const login = document.getElementById('login');

login.addEventListener('click', () => {
  //Accessing user email and password
  var email = document.getElementById('email');
  var password = document.getElementById('password');

  signInWithEmailAndPassword(auth, email.value, password.value)
  .then((userCredential) => {
    // const user = userCredential.user; 
    email.value = '';
    password.value = '';
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

  var table = document.getElementById('projectTableItem');
  proj_list.forEach(function (item, index) {
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
    querySnapshot.forEach((doc) => {
        listLogs.push(doc.data());
    });
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
  setConsoleTable(listLogs);
}

//onSubmit 
var submit = document.getElementById('submit');

submit.addEventListener('click', ()=>{
  var textField = document.getElementById('log');
  
  if(textField != null){
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

//Filter pins 
// import { getFirestore, getDocs, collection, query, where, Timestamp, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

var filterPin = document.getElementById('filterPin');

filterPin.addEventListener('click', async () => {
  var topic = document.getElementById('topic').value;
  var author = document.getElementById('author').value;
  var date = document.getElementById('date').value;
  const myTimeStamp = Timestamp.fromDate(new Date(date));
  const myTimeStamp2 = Timestamp.fromDate(new Date(myTimeStamp.toDate().getTime() + 24 * 60 * 60 * 1000));


  var filterList = [];
  const pinFilter = collection(db, 'LOGS');

  const q = query(pinFilter, where("author", "==", `${author}`), where("project_title", "==", `${topic}`), where("time", ">=", myTimeStamp), where("time", "<=", myTimeStamp2));

  // Filtering the logs
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(element => {
    filterList.push(element.data());
  });

  //Displaying the modal of filtered logs 
  openModal(filterList);
});

//Pinning logs
async function addPin(user_name, project_title, text, timestamp) {
  const docRef = doc(db, "USERS", user_id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    addDoc(collection(db, "USERS", user_id, "PINNED"), {
      author: user_name,
      time: timestamp,
      project_title: project_title,
      text: text
    });  
  }
  else {
    console.log("No such document!");
    return [];
  }
}

//Loading pins
async function getPins() {
  var mapPinId = new Map();
  var listPin = [];
  const docRef = doc(db, "USERS", user_id);
  
  const querySnapshot = await getDocs(collection(db, "USERS", user_id, "PINNED"));

  querySnapshot.forEach((doc) => {
    var id = doc.id;
    var data = doc.data();
    listPin.push(Object.assign({id, data}));
  });

  pinCards(listPin);
}

//Function to dynamically add pin card to the UI  
function pinCards(listPin) {
  var dynamic = document.querySelector('.pinnedLogs');
  for (var i = 0; i < listPin.length; i++) {
    const myCard = document.createElement('div');
    myCard.classList.add('cards');

    //Creating the close pin element 
    const closePinBtn = document.createElement('span');
    closePinBtn.innerHTML = `&times;`;
    closePinBtn.classList.add('delPinClose');
    closePinBtn.classList.add('close');
    closePinBtn.id = `${listPin[i].id}`;
    
    //Rendering pinned logs information
    const logInfo = document.createElement('p');
    logInfo.innerHTML = `${listPin[i].data.project_title}>${listPin[i].data.time} > ${listPin[i].data.author}: ${listPin[i].data.text}`;

    //Injecting into card
    myCard.appendChild(closePinBtn);    
    myCard.appendChild(logInfo);

    //Injecting into html
    dynamic.appendChild(myCard);

    //Handling close pin event
    closePinBtn.addEventListener('click', (event)=>{
      deletePin(event.target.id);
    });
  }
}

//Function to delete the pin from the firestore database
async function deletePin(id){
  await deleteDoc(doc(db, "USERS", user_id, "PINNED", id));
  window.alert('Deleted!');
  location.reload();
}

//Modal
// Get DOM Elements
const modal = document.querySelector('#my-modal');
const modalBtn = document.querySelector('#filterPin');
const closeBtn = document.querySelector('.close');

// Events
modalBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', outsideClick);

// Open
//Pop up rendering filtered logs
function openModal(filterPin) {
  modal.style.display = 'block';
  var dynamic = document.querySelector('.modal-body');
  
  for (var i = 0; i < filterPin.length; i++) {
    var fetch = document.querySelector('.modal-body').innerHTML;
    dynamic.innerHTML = `<div>
    <p class="modal-body">${filterPin[i].author} ${filterPin[i].time.toDate()} ${filterPin[i].project_title} : ${filterPin[i].text}</p>
    </div>` + fetch;
  }

  const pinThese = document.querySelector('#pinLog');
  pinLog.addEventListener('click', ()=>{
    for(i=0; i<filterPin.length; i++){
      addPin(`${filterPin[i].author}`, `${filterPin[i].project_title}`,`${filterPin[i].time.toDate()}`, `${filterPin[i].text}`);
    }
    location.reload();
  });
  
 
}

// Close Modal 
function closeModal() {
  modal.style.display = 'none';
}

// Close If Outside Click
function outsideClick(e) {
  if (e.target == modal) {
    modal.style.display = 'none';
  }
}

