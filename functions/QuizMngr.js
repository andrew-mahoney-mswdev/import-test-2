"use strict";
exports.__esModule = true;
var iType;
(function (iType) {
    iType[iType["question"] = 0] = "question";
    iType[iType["debrief"] = 1] = "debrief";
})(iType = exports.iType || (exports.iType = {})); //Enum requried to indicate whether question or debrief numbers are to be calculated by getInterval().
var QuizMngr = /** @class */ (function () {
    function QuizMngr(db) {
        this.db = db;
    }
    QuizMngr.prototype.getNextQuiz = function () {
        var nextQuizId = undefined;
        return this.db.quizzesCol().get().then(function (quizzesSnap) {
            var now = Date.now();
            var timeOfNextQuiz = 2000000000000; //This creates a Y2.033K problem, we can't find quizzes after 2032.
            quizzesSnap.forEach(function (quizDoc) {
                var timeOfThisQuiz = quizDoc.get('timeText');
                if (timeOfThisQuiz > now && timeOfThisQuiz < timeOfNextQuiz) { //The next quiz must start after the current time and before any other quiz that's been found.
                    nextQuizId = quizDoc.id;
                    timeOfNextQuiz = timeOfThisQuiz; //Every iteration of loop compares each quiz to the earliest time found in future quizzes.
                }
            });
            if (nextQuizId !== undefined) //If a quiz has been found...
                return Promise.resolve(nextQuizId); //return the id, 
            else
                return Promise.reject(new Error('getNextQuiz() ended with nextQuizId undefined')); //...otherwise, return an error.
        })["catch"](function (error) { return console.log(error); });
    };
    QuizMngr.prototype.loadQuizData = function (quizNum) {
        var _this = this;
        if (quizNum !== undefined) { //Only run if a next quiz has been found.
            this.db.currentQuizDoc(quizNum).get().then(function (quizDocSnap) {
                var quizDoc = quizDocSnap.data();
                _this.db.activeDoc().set(quizDoc);
                return true;
            })["catch"](function (error) { return console.log(error); });
        }
    };
    QuizMngr.prototype.getInterval = function (intervalType) {
        return this.db.activeDoc().get().then(function (quizDocSnap) {
            var quizDoc = quizDocSnap.data();
            var quizTime = quizDoc['timeText'];
            var sessionTimeout = quizDoc['sessionTimeout']; //We get the time indexes of the active quiz.
            var now = Date.now();
            if (now > quizTime && now < sessionTimeout) { //We check that the quiz is active, if not we return an error as this function should not have been called.
                var quizNumber = quizDoc['quizNumber'];
                var questionLength = quizDoc['questionLength'];
                var debriefLength = quizDoc['debriefLength'];
                var interval = questionLength + debriefLength; //The time between questions.
                var startFrom = now;
                if (intervalType === iType.debrief)
                    startFrom -= questionLength; //Debriefs start one full question length after the quiz starts.
                var timeElapsed = startFrom - quizTime; //The time passed since the start of the quiz or first debrief.
                var intervalNumber = Math.floor(timeElapsed / interval); //Formula determines which question or debrief should be displayed.
                return Promise.resolve({ quizNumber: quizNumber, intervalNumber: intervalNumber }); //We return the quiz and interval number to the server function so question/debrief data can be loaded.
            }
            else {
                return Promise.reject(new Error('getInterval() function call unnecessary'));
            }
        })["catch"](function (error) { console.log(error); });
    };
    QuizMngr.prototype.loadQuestion = function (quizNum, questionNum) {
        var _this = this;
        this.db.currentQuizCol(quizNum).doc('q' + questionNum).get().then(function (questionDataSnap) {
            var questionData = questionDataSnap.data();
            _this.db.questionDoc().set({ questionNumber: questionNum,
                qText: questionData['qText'],
                image: questionData['image'],
                answer0: questionData['answer0'],
                answer1: questionData['answer1'],
                answer2: questionData['answer2'],
                answer3: questionData['answer3'] });
            return true;
        })["catch"](function (error) { return console.log(error); });
    };
    QuizMngr.prototype.loadDebrief = function (quizNum, questionNum) {
        var _this = this;
        this.db.currentQuizCol(quizNum).doc('q' + questionNum).get().then(function (questionDataSnap) {
            var questionData = questionDataSnap.data();
            _this.db.debriefDoc().set({ questionNumber: questionNum,
                correct: questionData['correct'],
                debrief: questionData['debrief'] });
            return true;
        })["catch"](function (error) { return console.log(error); });
    };
    return QuizMngr;
}());
exports.QuizMngr = QuizMngr;
