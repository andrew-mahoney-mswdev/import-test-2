"use strict";
exports.__esModule = true;
var Question_1 = require("./Question");
var Readcsv_1 = require("./Readcsv");
var Storage = require('@google-cloud/storage').Storage;
var storageBucket = 'import-test-2-32c53.appspot.com';
function loadQuestion(readcsv) {
    var question = new Question_1.Question();
    question.setQText(readcsv.getNextValue());
    question.setImage(readcsv.getNextValue());
    question.setAnswer(0, readcsv.getNextValue());
    question.setAnswer(1, readcsv.getNextValue());
    question.setAnswer(2, readcsv.getNextValue());
    question.setAnswer(3, readcsv.getNextValue());
    question.setCorrect(readcsv.getNextValue() - 1); //Convert question number to array index.
    question.setDebrief(readcsv.getNextValue());
    return question;
}
function importQuiz(csvFilePath, db) {
    var storage = new Storage();
    var bucket = storage.bucket(storageBucket);
    bucket.file(csvFilePath).download(function (error, contents) {
        if (error) {
            console.log(error);
        } //Log any errors
        else { //If successfully retrieve file...
            var csvString = contents.toString(); //Put the raw csv file text into a string.
            var readcsv_1 = new Readcsv_1.Readcsv(csvString); //Initialise a Readcsv object to read the string.
            readcsv_1.skipToNextLine(); //Skip the first line, which only has heading information.
            db.quizCountDoc().get().then(function (quizCountDoc) {
                var quizNum = quizCountDoc.data()['counter'];
                var nextNum = quizNum + 1;
                db.quizCountDoc().set({ counter: nextNum }); //Increment and write the next value
                for (var index = 0; !readcsv_1.eof(); index++) { //Until the end of the csv string...
                    var question = loadQuestion(readcsv_1); //load a question,
                    db.currentQuizCol(quizNum).doc('q' + index).set(question.getAsJSON()); //and write it to the appropriate question number.
                }
                db.tmpDataDoc().get().then(function (snapshot) {
                    var questionCount = index;
                    var quizTime = snapshot.data()['timeText'];
                    var questionLength = snapshot.data()['questionLength'] * 1000;
                    var debriefLength = snapshot.data()['debriefLength'] * 1000;
                    var sessionTimeout = ((questionLength + debriefLength) * questionCount) + quizTime; //Calculate when question session will end.
                    db.currentQuizDoc(quizNum).set({ quizNumber: quizNum,
                        timeText: quizTime,
                        questionLength: questionLength,
                        debriefLength: debriefLength,
                        questionCount: questionCount,
                        sessionTimeout: sessionTimeout });
                    return true;
                })["catch"](function (error) { return console.log(error); });
                return true;
            })["catch"](function (error) { return console.log(error); });
        }
        return true;
    });
}
exports.importQuiz = importQuiz;
