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
var firestore = firebase.firestore();
//GLOBALS START
var gameRootCol = 'ChirpyGamesRoot';
var quizGameDoc = 'QuizGame';
var quizzesCol = 'quizzes';
var quizDataDoc = 'quizData';
var quizCountDoc = 'quizCount';
var tmpDataCol = 'tmpDataCol';
var tmpDataDoc = 'tmpData';
function getQuizGameDoc() { return firestore.collection(gameRootCol).doc(quizGameDoc); }
function getQuizzesCol() { return getQuizGameDoc().collection(quizzesCol); }
function getCurrentQuizDoc(quizNum) { return getQuizzesCol().doc(String(quizNum)); }
function getQuizDataDoc(quizNum) { return getCurrentQuizDoc(quizNum).collection('quiz').doc(quizDataDoc); }
function getCurrentQuizCol(quizNum) { return getCurrentQuizDoc(quizNum).collection('quiz'); }
function getQuizCountDoc() { return getQuizzesCol().doc(quizCountDoc); }
function getTmpDataDoc() { return getQuizGameDoc().collection(tmpDataCol).doc(tmpDataDoc); }
//GLOBALS END
var uploadStatus = document.getElementById("uploadStatus");
var progressBar = document.getElementById("progressBar");
var uploadButton = document.getElementById("uploadButton");
var fileSelector = document.getElementById("fileSelector");
var quizTimeSelector = document.getElementById("quizTime");
var questionLength = document.getElementById("questionLength");
var debriefLength = document.getElementById("debriefLength");
var fileList = document.getElementById("fileList");
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
    var quizTimeVal = quizTimeSelector.value;
    var questionLengthVal = questionLength.value;
    var debriefLengthVal = debriefLength.value;
    var tmpData = { tmpTimeText: quizTimeVal,
        tmpQuestionLength: questionLengthVal,
        tmpDebriefLength: debriefLengthVal };
    return getTmpDataDoc().set(tmpData)["catch"](function (e) { return console.log(e); });
}
function uploadFile(storageRef, file, csvFile) {
    //Upload the file.
    disableUploadButton();
    progressBar.value = 0; //Reset the progress bar
    uploadStatus.innerText = "Uploading: " + file.name;
    if (csvFile == true)
        writeTmpData();
    var task = storageRef.put(file);
    task.on("state_changed", //As the file uploads...
    function progress(snapshot) {
        var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.value = percentage; //we update the progress bar.
    }, function error(err) {
        console.log(err);
        enableUploadButton();
        uploadStatus.innerText = "Upload error";
    }, function complete() {
        enableUploadButton();
        uploadStatus.innerText = "Upload complete";
        fileList.value += file.name + "\n"; //we note completion.
    });
}
fileSelector.onchange = function (event) {
    var file = event.target.files[0];
    var length = file.name.length;
    var suffix = file.name.slice(length - 4, length); //Get the file suffix.
    var filePath;
    var csvFile = false;
    if (suffix == ".csv") {
        filePath = "raw_quiz_data/" + file.name; //Store *.csv files in this directory.
        csvFile = true;
    }
    else
        filePath = "images/" + file.name; //All other files will be images due to the accept property of the file input control.
    var storageRef = firebase.storage().ref().child(filePath); //A reference to the file path in the storage bucket.
    storageRef.getDownloadURL() //We check if the file exists.
        .then(function onResolve(url) {
        uploadStatus.innerText = file.name;
        setTimeout(function () {
            var option = confirm("The file " + file.name + " already exists. Do you want to replace it?");
            if (option == true)
                uploadFile(storageRef, file, csvFile);
            else
                uploadStatus.innerText = "No file chosen";
        }, 10);
    })["catch"](function onReject(error) {
        uploadFile(storageRef, file, csvFile);
    });
    fileSelector.value = ""; //Return the value of the file input control to "" allows the user to select the same file again and still trigger the change event. (May be necessary when changing CSV files.)
};
