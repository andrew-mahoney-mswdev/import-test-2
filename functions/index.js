"use strict";
exports.__esModule = true;
var question_1 = require("./question");
var readcsv_1 = require("./readcsv");
var admin = require('firebase-admin');
var functions = require('firebase-functions');
var Storage = require('@google-cloud/storage').Storage;
var storageBucket = 'import-test-2-32c53.appspot.com';
// //LOCAL SERVE ONLY
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
//DEPLOY ONLY
admin.initializeApp(functions.config().firebase);
var firestore = admin.firestore();
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
function loadQuestion(readcsv) {
    var question = new question_1.Question();
    question.setQText(readcsv.getNextValue());
    question.setImage(readcsv.getNextValue());
    question.setAnswer(0, readcsv.getNextValue());
    question.setAnswer(1, readcsv.getNextValue());
    question.setAnswer(2, readcsv.getNextValue());
    question.setAnswer(3, readcsv.getNextValue());
    question.setCorrect(readcsv.getNextValue());
    question.setDebrief(readcsv.getNextValue());
    return question;
}
function importQuiz(csvFilePath) {
    var storage = new Storage();
    var bucket = storage.bucket(storageBucket);
    bucket.file(csvFilePath).download(function (error, contents) {
        if (error) {
            console.log(error);
        } //Log any errors
        else { //If successfully retrieve file...
            var csvString = contents.toString(); //Put the raw csv file text into a string.
            var readcsv_2 = new readcsv_1.Readcsv(csvString); //Initialise a Readcsv object to read the string.
            readcsv_2.skipToNextLine(); //Skip the first line, which only has heading information.
            getQuizCountDoc().get().then(function (quizCountDoc) {
                var quizNum = quizCountDoc.data()['counter'];
                var nextNum = quizNum + 1;
                getQuizCountDoc().set({ counter: nextNum }); //Increment and write the next value
                for (var index = 0; !readcsv_2.eof(); index++) { //Until the end of the csv string...
                    var question = loadQuestion(readcsv_2); //load a question,
                    getCurrentQuizCol(quizNum).doc('q' + index).set(question.getAsJSON()); //and write it to the appropriate question number.
                }
                getTmpDataDoc().get().then(function (snapshot) {
                    getQuizDataDoc(quizNum).set(snapshot.data()); //Save this against the quiz number
                    return true;
                })["catch"](function (error) { return console.log(error); });
                return true;
            })["catch"](function (error) { return console.log(error); });
        }
        return true;
    });
}
exports.onStorageUpload = functions.storage.object().onFinalize(function (object) {
    var filePath = object.name;
    if (filePath.startsWith("raw_quiz_data/")) { //If it is uploaded in the quiz data folder (for csv files)...
        importQuiz(filePath); //import the quiz data from the file.
        return true;
    }
    else
        return false;
});
