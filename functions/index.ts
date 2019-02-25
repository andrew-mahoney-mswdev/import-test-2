
import { importQuiz } from "./importQuiz";
import { QuizMngr } from "./QuizMngr";
import { DB } from "./Firestore";
import { iType } from "./QuizMngr";

const admin : any = require('firebase-admin');
const functions : any = require('firebase-functions');
//Firestore is initialised below as a global variable to serve the whole application.

// //LOCAL SERVE ONLY
// const serviceAccount = require('../functions/serviceAccountKey.json');
// admin.initializeApp({credential: admin.credential.cert(serviceAccount)});

//DEPLOY ONLY
admin.initializeApp(functions.config().firebase);

const firestore : any = admin.firestore(); //DB class is instantiated from the global firestore variables.
const db = new DB(firestore); //Other classes are instantiated with the same instance of DB. This prevents firestore from being initialised multiple times.
const quizMngr = new QuizMngr(db);

exports.onStorageUpload = functions.storage.object().onFinalize(object => { //Triggered whenever a file is uploaded to storage...
    let filePath : string = object.name;
    if (filePath.startsWith("raw_quiz_data/")) { //If it is uploaded in the quiz data folder (for csv files)...
        importQuiz(filePath, db); //import the quiz data from the file.
        return true;
    } else return false;

});

//The following functions are called by a client when it determines that the quiz data is out of date.
//The server will confirm if this is the case, before updating data.
//If this is not the case, the function call is unnecessary and an error will be logged.

exports.loadNextQuiz = functions.https.onRequest((request, response) => { //Finds and loads the next quiz.
    //NOTE: This function will not load the next quiz if it is called after the quiz was due to start. Thus, if all users are late to join the quiz session, then the quiz won't run.
    db.quizGameDoc().collection('quizData').doc('active').get().then(quizDocSnap => {
        let quizDoc = quizDocSnap.data();
        let now = Date.now();
        let sessionTimeout = quizDoc['sessionTimeout'];
        if (now > sessionTimeout) { //Check that the current quiz has ended.
            quizMngr.getNextQuiz().then(nextQuiz => { //If so, find the next quiz...
                quizMngr.loadQuizData(nextQuiz); //and load relevant data.
                return true;
            }).catch(error => console.log(error));
        } else console.log('loadNextQuiz() function call unnecessary');

        return true;        
    }).catch(error => console.log(error));
    response.send('loadNextQuiz() done'); //TODO: REMOVE THIS - test code only
});

exports.updateQuestion = functions.https.onRequest(( request, response) => { //Updates the current question.
    quizMngr.getInterval(iType.question).then(data => { //Get the current quiz and question number.
        let quizNumber = data['quizNumber'];
        let intervalNumber = data['intervalNumber'];
        db.quizGameDoc().collection('quizData').doc('question').get().then(activeQuestionSnap => {
            let questionNumber = activeQuestionSnap.data()['questionNumber'];
            if (questionNumber !== intervalNumber) //Confirm that the current question is not current
                quizMngr.loadQuestion(quizNumber, intervalNumber); //load the question.
            else console.log('Error: updateQuestion() function call unnecessary');
            return true;
        }).catch(error => console.log(error));
        return true;
    }).catch(error => console.log(error));
    response.send('updateQuestion() done'); //TODO: REMOVE THIS - test code only
});

exports.updateDebrief = functions.https.onRequest((request, response) => { //Updates the current debrief.
    //This is functionally identical to the method above, but the nested subtle differences make it easier to repeat code than handle repeated code with promises.
    quizMngr.getInterval(iType.debrief).then(data => {
        let quizNumber = data['quizNumber'];
        let intervalNumber = data['intervalNumber'];
        db.quizGameDoc().collection('quizData').doc('debrief').get().then(activeDebriefSnap => {
            let questionNumber = activeDebriefSnap.data()['questionNumber'];
            if (questionNumber !== intervalNumber)
                quizMngr.loadDebrief(quizNumber, intervalNumber);
            else console.log('Error: updateDebrief() function call unnecessary');
            return true;
        }).catch(error => console.log(error));
        return true;
    }).catch(error => console.log(error));
    response.send('updateDebrief() done'); //TODO: REMOVE THIS - test code only
});

export {} //Prevents project-level block-scoped variable errors
