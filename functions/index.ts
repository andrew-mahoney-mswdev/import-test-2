import { Question } from "./question";
import { Readcsv } from "./readcsv";

const admin : any = require('firebase-admin');
const functions : any = require('firebase-functions');
const {Storage} = require('@google-cloud/storage');
const storageBucket = 'import-test-2-32c53.appspot.com';

// //LOCAL SERVE ONLY
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({credential: admin.credential.cert(serviceAccount)});

//DEPLOY ONLY
admin.initializeApp(functions.config().firebase);

const firestore : any = admin.firestore();

//GLOBALS START
const gameRootCol : string = 'ChirpyGamesRoot';
    const quizGameDoc : string = 'QuizGame';
        const quizzesCol : string = 'quizzes';
            const quizDataDoc : string = 'quizData';
            const quizCountDoc : string = 'quizCount';
        const tmpDataCol : string = 'tmpDataCol';
            const tmpDataDoc : string = 'tmpData';

function getQuizGameDoc() {return firestore.collection(gameRootCol).doc(quizGameDoc);}
function getQuizzesCol() {return getQuizGameDoc().collection(quizzesCol);}
function getCurrentQuizDoc(quizNum: number) {return getQuizzesCol().doc(String(quizNum));}
function getQuizDataDoc(quizNum : number) {return getCurrentQuizDoc(quizNum).collection('quiz').doc(quizDataDoc);}
function getCurrentQuizCol(quizNum : number) {return getCurrentQuizDoc(quizNum).collection('quiz');}
function getQuizCountDoc() {return getQuizzesCol().doc(quizCountDoc);}
function getTmpDataDoc() {return getQuizGameDoc().collection(tmpDataCol).doc(tmpDataDoc);}
//GLOBALS END

function loadQuestion(readcsv) { //Loads question data from one line in a CSV file.
    let question : Question = new Question();

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

function importQuiz(csvFilePath : string) { //Imports all quiz data from the csv file into firestore
    const storage : Storage = new Storage();
    const bucket : any = storage.bucket(storageBucket);

    bucket.file(csvFilePath).download( (error, contents) => { //Get the csv from storage
        if (error) {console.log(error);} //Log any errors
        else { //If successfully retrieve file...

            const csvString : string = contents.toString(); //Put the raw csv file text into a string.
            let readcsv : Readcsv = new Readcsv(csvString); //Initialise a Readcsv object to read the string.
            readcsv.skipToNextLine(); //Skip the first line, which only has heading information.

            getQuizCountDoc().get().then(quizCountDoc => { //Get the number of the next quiz.
                let quizNum = quizCountDoc.data()['counter'];
                let nextNum = quizNum + 1;
                getQuizCountDoc().set({counter: nextNum}); //Increment and write the next value

                for (var index = 0; !readcsv.eof(); index++) { //Until the end of the csv string...
                    let question : Question = loadQuestion(readcsv); //load a question,
                    getCurrentQuizCol(quizNum).doc('q' + index).set(question.getAsJSON()); //and write it to the appropriate question number.
                }

                getTmpDataDoc().get().then(snapshot => { //Get the relevant quiz data saved by the client
                    getQuizDataDoc(quizNum).set(snapshot.data()); //Save this against the quiz number
                    return true;
                })
                .catch(error => console.log(error));
                return true;
            })
            .catch(error => console.log(error));
        }
        return true;
    });

}

exports.onStorageUpload = functions.storage.object().onFinalize(object => { //Triggered whenever a file is uploaded to storage...
    let filePath : string = object.name;
    if (filePath.startsWith("raw_quiz_data/")) { //If it is uploaded in the quiz data folder (for csv files)...
        importQuiz(filePath); //import the quiz data from the file.
        return true;
    } else return false;

});

export {} //Prevents project-level block-scoped variable errors
