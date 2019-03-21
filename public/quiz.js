//Initialise firebase
var config = {
    apiKey: "AIzaSyAtuN1ZO2u_p21R8OC7ZZ4acsEGqvdibqQ",
    authDomain: "quiz-beta-development.firebaseapp.com",
    databaseURL: "https://quiz-beta-development.firebaseio.com",
    projectId: "quiz-beta-development",
    storageBucket: "quiz-beta-development.appspot.com",
    messagingSenderId: "246372372773"
  };

firebase.initializeApp(config);
let functions = firebase.functions();
const firestore = firebase.firestore();
let storageRef = firebase.storage().ref();

//Load functions from firebase
const db = new DB(firestore);
let loadNextQuiz = functions.httpsCallable('loadNextQuiz');
let updateQuestion = functions.httpsCallable('updateQuestion');
let updateDebrief = functions.httpsCallable('updateDebrief');
let submitAnswer = functions.httpsCallable('submitAnswer');

let quizNumber, quizTime, sessionTimeout, questionLength, debriefLength; //Values loaded from the active ref.
let questionNumber, questionText, image, answers = []; //Values loaded from the current question ref.
let debriefNumber, correct, debrief, answered = []; //Values loaded from the current debrief ref.
let questionTime; //Whether we're asked a question.

function printQuestion() { //Displays question data on the screen.
    removeSelect();
    document.getElementById("questionText").innerText = questionText;
    for (let index = 0; index < 4; index++)
        document.getElementById("answers" + index).innerText = answers[index];

    document.getElementById("correct").innerText = "";
    document.getElementById("debrief").innerHTML = "";
                    
    if (image != '') {
        let imagePath = 'images/' + image;
        let imageRef = storageRef.child(imagePath);
        imageRef.getDownloadURL().then(url => {
            document.getElementById("image").src = url;
        }).catch(error => console.log(error));
    } else document.getElementById("image").src = '';
}

function printDebrief() { //Displays debrief data on the screen.
    document.getElementById("correct").innerText = "The correct answer is: " + answers[correct];
    if (debrief) document.getElementById("debrief").innerHTML = "<p>Did you know?</p>" + debrief;

    result.reset();
    db.currentAnswerCol(quizNumber).get().then(answersSnap => { //We get answer data to display ratios.
        answersSnap.forEach(user => {
            let answer = user.data()['q' + questionNumber];
            result.answers[answer]++;
        });

        result.calculateRatios();
        for (let index = 0; index < 4; index++)
            document.getElementById("answers" + index).innerText += " (" + result.answers[index].toFixed(2) * 100 + "%)";
    });
}

function getInterval(question) { //Returns the number of the current question (passed true) or debrief (passed false)
    let now = Date.now();
    let interval = questionLength + debriefLength;
    let timeElapsed = now - quizTime;
    if (question === false) {timeElapsed -= questionLength;}
    let currentQuestion = Math.floor(timeElapsed / interval);
    return currentQuestion;
}

function isQuestionCurrent() { //Checks whether the displayed question is current, if not, sends function call to update it.
    let currentQuestion = getInterval(true);
    if (currentQuestion != questionNumber)
        updateQuestion();
}

function isDebriefCurrent() { //As above, but for the debrief.
    let currentDebrief = getInterval(false);
    if (currentDebrief != debriefNumber)
        updateDebrief();
}

db.activeDoc().onSnapshot(activeDoc => { //Sets up a listener that monitors data in the active ref.
    let activeData = activeDoc.data();
    quizNumber = activeData['quizNumber'];
    quizTime = activeData['timeText'];
    sessionTimeout = activeData['sessionTimeout'];
    questionLength = activeData['questionLength'];
    debriefLength = activeData['debriefLength'];
});

db.questionDoc().onSnapshot(questionDoc => { //Sets up a listener that monitors data in the question ref.
    let questionData = questionDoc.data();
    questionNumber = questionData['questionNumber'];
    questionText = questionData['qText'];
    image = questionData['image'];
    for (let index = 0; index < 4; index++)
        answers[index] = questionData['answer' + index];
    if (questionTime === true) printQuestion();
});

db.debriefDoc().onSnapshot(debriefDoc => { //Sets up a listener that monitors data in the debrief ref.
    let debriefData = debriefDoc.data();
    debreifNumber = debriefData['questionNumber'];
    correct = debriefData['correct'];
    debrief = debriefData['debrief'];
    if (questionTime === false) printDebrief();
});
        
//Check for updates every 10 seconds, outputs data depending on the time in relation to the active quiz.
setInterval( () => {
    let now = Date.now();

    if (now < sessionTimeout) {
        if (now > quizTime) { //Quiz is currently occuring.
            //Checks whether we are currently in question or debrief mode.
            let timeElapsed = now - quizTime;
            let interval = questionLength + debriefLength;
            while (timeElapsed > 0) timeElapsed -= interval;
            if (timeElapsed + debriefLength < 0) questionTime = true;
            else questionTime = false;

            if (questionTime === true) isQuestionCurrent();
            else isDebriefCurrent();
        } else { //Quiz occurs in future
            let theDate = new Date(quizTime);
            document.getElementById("questionText").innerText = "The next quiz will start on " + theDate.getDate() + "/" + (theDate.getMonth() + 1) + " at " + theDate.getHours() + ":" + theDate.getMinutes();
        }
    } else { //Quiz occurs in the past.
        loadNextQuiz();                    
        document.getElementById("questionText").innerText = "There are no future quizzes currently scheduled.";
    }
}, 10000);
