// Initialize Firebase
var config = {
    apiKey: "AIzaSyAtuN1ZO2u_p21R8OC7ZZ4acsEGqvdibqQ",
    authDomain: "quiz-beta-development.firebaseapp.com",
    databaseURL: "https://quiz-beta-development.firebaseio.com",
    projectId: "quiz-beta-development",
    storageBucket: "quiz-beta-development.appspot.com",
    messagingSenderId: "246372372773"
};
firebase.initializeApp(config);
var uploadStatus = document.getElementById("uploadStatus");
var progressBar = document.getElementById("progressBar");
var uploadButton = document.getElementById("uploadButton");
var fileSelector = document.getElementById("fileSelector");
var quizTimeSelector = document.getElementById("quizTime");
var questionLength = document.getElementById("questionLength");
var debriefLength = document.getElementById("debriefLength");
var fileList = document.getElementById("fileList");
var startButton = document.getElementById("startButton");
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
    var questionLengthVal = questionLength.value;
    var debriefLengthVal = debriefLength.value;
    var quizTimeVal = quizTimeSelector.value;
    var quizDateObj = new Date(quizTimeVal);
    var tmpData = { timeText: quizDateObj.getTime(),
        questionLength: questionLengthVal,
        debriefLength: debriefLengthVal };
    return firebase.firestore().collection('ChirpyGamesRoot').doc('QuizGame').collection('tmpDataCol').doc('tmpData')
        .set(tmpData)["catch"](function (e) { return console.log(e); });
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
startButton.onclick = function () {
    var functions = firebase.functions();
    functions.httpsCallable('loadNextQuiz')();
    functions.httpsCallable('updateQuestion')();
    functions.httpsCallable('updateDebrief')();
    functions.httpsCallable('submitAnswer')(undefined);
};
