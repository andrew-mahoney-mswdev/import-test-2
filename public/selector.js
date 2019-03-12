let selectedAnswer = undefined; //The answer that the user has selected.

function removeSelect() { //Removes the user's selected answer from the screen
    if (selectedAnswer != undefined) document.getElementById("answers" + selectedAnswer).classList.remove("stamped");
    selectedAnswer = undefined;
}
   
function answerSelect(answer) { //Selects the user's answer on the screen.
    if (questionTime === true) {
        removeSelect();
        document.getElementById("answers" + answer).classList.add("stamped");
        selectedAnswer = answer;
        submitAnswer({quiz: quizNumber, question: questionNumber, answer: answer});
    }
}

function Result() { //Stores the number of user's answers and calculates answer percentages.
    this.answers = []; //The number of users that given each answer. This public variable is set within alpha.js
    this.reset = function() { //Resets all array values to 0 so they can be recounted.
        for(let index = 0; index < 4; index++) this.answers[index] = 0;
    }
    this.calculateRatios = function() { //Calculates the percentage of users who have given each answer and stores this in the answers array.
        let total = 0;
        for (let index = 0; index < 4; index++) total += this.answers[index];
        for (let index = 0; index < 4; index++) this.answers[index] = this.answers[index] / total;
    }
    this.reset();
}

let result = new Result();
