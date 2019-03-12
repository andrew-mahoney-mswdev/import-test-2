"use strict";
exports.__esModule = true;
var importQuiz_1 = require("./importQuiz");
var QuizMngr_1 = require("./QuizMngr");
var Firestore_1 = require("./Firestore");
var QuizMngr_2 = require("./QuizMngr");
var admin = require('firebase-admin');
var functions = require('firebase-functions');
//Firestore is initialised below as a global variable to serve the whole application.
// //LOCAL SERVE ONLY
// const serviceAccount = require('../functions/serviceAccountKey.json');
// admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
//DEPLOY ONLY
admin.initializeApp(functions.config().firebase);
var firestore = admin.firestore(); //DB class is instantiated from the global firestore variables.
var db = new Firestore_1.DB(firestore); //Other classes are instantiated with the same instance of DB. This prevents firestore from being initialised multiple times.
var quizMngr = new QuizMngr_1.QuizMngr(db);
exports.onStorageUpload = functions.storage.object().onFinalize(function (object) {
    var filePath = object.name;
    if (filePath.startsWith("raw_quiz_data/")) { //If it is uploaded in the quiz data folder (for csv files)...
        importQuiz_1.importQuiz(filePath, db); //import the quiz data from the file.
        return true;
    }
    else
        return false;
});
//The following functions are called by a client when it determines that the quiz data is out of date.
//The server will confirm if this is the case, before updating data.
//If this is not the case, the function call is unnecessary and an error will be logged.
exports.loadNextQuiz = functions.https.onCall(function (data, context) {
    db.quizGameDoc().collection('quizData').doc('active').get().then(function (quizDocSnap) {
        var quizDoc = quizDocSnap.data();
        var now = Date.now();
        var sessionTimeout = quizDoc['sessionTimeout'];
        if (now > sessionTimeout) { //Check that the current quiz has ended.
            quizMngr.getNextQuiz().then(function (nextQuiz) {
                quizMngr.loadQuizData(nextQuiz); //and load relevant data.
                return true;
            })["catch"](function (error) { return console.log(error); });
        }
        else
            console.log('loadNextQuiz() function call unnecessary');
        return true;
    })["catch"](function (error) { return console.log(error); });
});
exports.updateQuestion = functions.https.onCall(function (data, context) {
    quizMngr.getInterval(QuizMngr_2.iType.question).then(function (data) {
        var quizNumber = data['quizNumber'];
        var intervalNumber = data['intervalNumber'];
        db.quizGameDoc().collection('quizData').doc('question').get().then(function (activeQuestionSnap) {
            var questionNumber = activeQuestionSnap.data()['questionNumber'];
            if (questionNumber !== intervalNumber) //Confirm that the current question is not current
                quizMngr.loadQuestion(quizNumber, intervalNumber); //load the question.
            else
                console.log('Error: updateQuestion() function call unnecessary');
            return true;
        })["catch"](function (error) { return console.log(error); });
        return true;
    })["catch"](function (error) { return console.log(error); });
});
exports.updateDebrief = functions.https.onCall(function (data, context) {
    //This is functionally identical to the method above, but the nested subtle differences make it easier to repeat code than handle repeated code with promises.
    quizMngr.getInterval(QuizMngr_2.iType.debrief).then(function (data) {
        var quizNumber = data['quizNumber'];
        var intervalNumber = data['intervalNumber'];
        db.quizGameDoc().collection('quizData').doc('debrief').get().then(function (activeDebriefSnap) {
            var questionNumber = activeDebriefSnap.data()['questionNumber'];
            if (questionNumber !== intervalNumber)
                quizMngr.loadDebrief(quizNumber, intervalNumber);
            else
                console.log('Error: updateDebrief() function call unnecessary');
            return true;
        })["catch"](function (error) { return console.log(error); });
        return true;
    })["catch"](function (error) { return console.log(error); });
});
exports.submitAnswer = functions.https.onCall(function (data, context) {
    var quizNum = data['quiz'];
    var questionNum = data['question'];
    var answer = data['answer'];
    if (context.auth) {
        var uid_1 = context.auth.uid;
        var questionPromise = quizMngr.getInterval(QuizMngr_2.iType.question);
        var debriefPromise_1 = quizMngr.getInterval(QuizMngr_2.iType.debrief);
        questionPromise.then(function (questionInterval) {
            debriefPromise_1.then(function (debriefInterval) {
                if (questionInterval['quizNumber'] === quizNum &&
                    questionInterval['intervalNumber'] === questionNum &&
                    debriefInterval['intervalNumber'] !== questionNum) {
                    quizMngr.postAnswer(quizNum, uid_1, questionNum, answer);
                }
                else
                    console.log('Error: submitAnswer() function call invalid');
                return true;
            })["catch"](function (error) { return console.log(error); });
            return true;
        })["catch"](function (error) { return console.log(error); });
    }
    else
        console.log('Error: submitAnswer() - context.auth is undefined');
});
