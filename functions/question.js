"use strict";
exports.__esModule = true;
var Question = /** @class */ (function () {
    function Question() {
        this.answers = [];
    }
    Question.prototype.setQText = function (qText) { this.qText = qText; };
    Question.prototype.setImage = function (image) { this.image = image; };
    Question.prototype.setAnswer = function (answerNum, answerText) { this.answers[answerNum] = answerText; };
    Question.prototype.setCorrect = function (correct) { this.correct = correct; };
    Question.prototype.setDebrief = function (debrief) { this.debrief = debrief; };
    Question.prototype.getAsJSON = function () {
        return { qText: this.qText,
            image: this.image,
            answer0: this.answers[0],
            answer1: this.answers[1],
            answer2: this.answers[2],
            answer3: this.answers[3],
            correct: this.correct,
            debrief: this.debrief
        };
    };
    return Question;
}());
exports.Question = Question;
// //TEST CODE
// let myQuestion = new Question();
// myQuestion.setQText("How long is a piece of string?");
// myQuestion.setImage("string.jpg");
// myQuestion.setAnswer(0, "this long");
// myQuestion.setAnswer(1, "that long");
// myQuestion.setAnswer(2, "not long");
// myQuestion.setAnswer(3, "long johns");
// myQuestion.setCorrect(2);
// myQuestion.setDebrief("Sing a song of six pence.");
// console.log(myQuestion.getAsJSON());
