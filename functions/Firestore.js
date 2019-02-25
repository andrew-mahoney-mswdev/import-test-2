"use strict";
exports.__esModule = true;
var DB = /** @class */ (function () {
    function DB(firestore) {
        this.firestore = firestore;
    }
    //ChirpyGamesRoot ref
    DB.prototype.quizGameDoc = function () { return this.firestore.collection('ChirpyGamesRoot').doc('QuizGame'); };
    DB.prototype.quizDataCol = function () { return this.quizGameDoc().collection('quizData'); };
    DB.prototype.activeDoc = function () { return this.quizDataCol().doc('active'); };
    DB.prototype.questionDoc = function () { return this.quizDataCol().doc('question'); };
    DB.prototype.debriefDoc = function () { return this.quizDataCol().doc('debrief'); };
    DB.prototype.quizCountDoc = function () { return this.quizDataCol().doc('quizCount'); };
    DB.prototype.quizzesCol = function () { return this.quizGameDoc().collection('quizzes'); };
    DB.prototype.currentQuizDoc = function (quizNum) { return this.quizzesCol().doc(String(quizNum)); };
    DB.prototype.currentQuizCol = function (quizNum) { return this.currentQuizDoc(quizNum).collection('questions'); }; //TODO: Change to 'questions'
    //tmpDataCol ref
    DB.prototype.tmpDataDoc = function () { return this.quizGameDoc().collection('tmpDataCol').doc('tmpData'); };
    return DB;
}());
exports.DB = DB;
