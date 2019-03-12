declare const firebase : any;

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAEGKP2WfYOKxD8_PSRhNGD9__eb3T2YA4",
    authDomain: "import-test-2-32c53.firebaseapp.com",
    databaseURL: "https://import-test-2-32c53.firebaseio.com",
    projectId: "import-test-2-32c53",
    storageBucket: "import-test-2-32c53.appspot.com",
    messagingSenderId: "261167122833"
};

firebase.initializeApp(config);

const uploadStatus : HTMLElement = document.getElementById("uploadStatus");
const progressBar : HTMLProgressElement = document.getElementById("progressBar") as HTMLProgressElement;
const uploadButton : HTMLButtonElement = document.getElementById("uploadButton") as HTMLButtonElement;
const fileSelector : HTMLInputElement = document.getElementById("fileSelector") as HTMLInputElement;
const quizTimeSelector : HTMLInputElement = document.getElementById("quizTime") as HTMLInputElement;
const questionLength : HTMLInputElement = document.getElementById("questionLength") as HTMLInputElement;
const debriefLength : HTMLInputElement = document.getElementById("debriefLength") as HTMLInputElement;
const fileList : HTMLTextAreaElement = document.getElementById("fileList") as HTMLTextAreaElement;

function disableUploadButton() {
    //Prevents the upload button from being used during an upload.
    uploadButton.disabled = true;
    uploadButton.innerText = "Please wait...";
}

function enableUploadButton() {
    //Restores the upload button to the usable state after the upload.
    uploadButton.disabled = false;
    uploadButton.innerText = "Upload file";
}

function writeTmpData() {
    //Writes data relevant to the quiz session to a public document, for processing server side.
    let questionLengthVal : string = questionLength.value;
    let debriefLengthVal : string = debriefLength.value;
    let quizTimeVal : any = quizTimeSelector.value;
    let quizDateObj : Date = new Date(quizTimeVal);
    
    let tmpData = {timeText: quizDateObj.getTime(),
                  questionLength: questionLengthVal,
                  debriefLength: debriefLengthVal};
   
    return firebase.firestore().collection('ChirpyGamesRoot').doc('QuizGame').collection('tmpDataCol').doc('tmpData')
            .set(tmpData)
            .catch(e => console.log(e));
}

function uploadFile(storageRef : any, file : any, csvFile : boolean) {
    //Upload the file.
    disableUploadButton();
    progressBar.value = 0; //Reset the progress bar
    uploadStatus.innerText = "Uploading: " + file.name;

    if (csvFile == true) writeTmpData();

    let task : any = storageRef.put(file);
    task.on("state_changed", //As the file uploads...
        function progress (snapshot) {
            let percentage : number = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.value = percentage; //we update the progress bar.
        },
        
        function error(err) {
            console.log(err);
            enableUploadButton();
            uploadStatus.innerText = "Upload error";
        },

        function complete() { //When the upload completes...
            enableUploadButton();
            uploadStatus.innerText = "Upload complete";
            fileList.value += file.name + "\n"; //we note completion.
        }
    );
}

fileSelector.onchange = (event : Event) => {
    let file : any = (<HTMLInputElement>event.target).files[0];

    let length : number = file.name.length;
    let suffix : string = file.name.slice(length - 4, length); //Get the file suffix.
    
    let filePath : string;
    let csvFile : boolean = false;
    if (suffix == ".csv") {
        filePath = "raw_quiz_data/" + file.name; //Store *.csv files in this directory.
        csvFile = true;
    } else filePath = "images/" + file.name; //All other files will be images due to the accept property of the file input control.

    let storageRef : any = firebase.storage().ref().child(filePath); //A reference to the file path in the storage bucket.
    storageRef.getDownloadURL() //We check if the file exists.
    .then(
        function onResolve(url) { //If so, the user is warned before uploading proceeds.
            uploadStatus.innerText = file.name;
            setTimeout( () => { //This is required to ensure that the uploadStatus box changes before this code runs.
                var option = confirm("The file " + file.name + " already exists. Do you want to replace it?");
                if (option == true) uploadFile(storageRef, file, csvFile);
                else uploadStatus.innerText = "No file chosen";
            }, 10);
        }
    )
    .catch(
        function onReject (error) { //If not, we upload the file.
            uploadFile(storageRef, file, csvFile);
        }
    );
    
    fileSelector.value = ""; //Return the value of the file input control to "" allows the user to select the same file again and still trigger the change event. (May be necessary when changing CSV files.)
}
