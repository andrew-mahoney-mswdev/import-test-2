
import { DB } from "./Firestore";
import { Question } from "./Question";
import { Readcsv } from "./Readcsv";

const {Storage} = require('@google-cloud/storage');
const storageBucket = 'import-test-2-32c53.appspot.com';

function loadQuestion(readcsv) { //Loads question data from one line in a CSV file.
    let question : Question = new Question();

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

export function importQuiz(csvFilePath : string, db : DB) { //Imports all quiz data from the csv file into firestore
    const storage : Storage = new Storage();
    const bucket : any = storage.bucket(storageBucket);

    bucket.file(csvFilePath).download( (error, contents) => { //Get the csv from storage
        if (error) {console.log(error);} //Log any errors
        else { //If successfully retrieve file...

            const csvString : string = contents.toString(); //Put the raw csv file text into a string.
            let readcsv : Readcsv = new Readcsv(csvString); //Initialise a Readcsv object to read the string.
            readcsv.skipToNextLine(); //Skip the first line, which only has heading information.

            db.quizCountDoc().get().then(quizCountDoc => { //Get the number of the next quiz.
                let quizNum = quizCountDoc.data()['counter'];
                let nextNum = quizNum + 1;
                db.quizCountDoc().set({counter: nextNum}); //Increment and write the next value

                for (var index = 0; !readcsv.eof(); index++) { //Until the end of the csv string...
                    let question : Question = loadQuestion(readcsv); //load a question,
                    db.currentQuizCol(quizNum).doc('q' + index).set(question.getAsJSON()); //and write it to the appropriate question number.
                }

                db.tmpDataDoc().get().then(snapshot => { //Get the relevant quiz data saved by the client
                    let questionCount = index;
                    let quizTime : number = snapshot.data()['timeText'];
                    let questionLength : number = snapshot.data()['questionLength'] * 1000;
                    let debriefLength : number = snapshot.data()['debriefLength'] * 1000;
                    let sessionTimeout : number = ((questionLength + debriefLength) * questionCount) + quizTime; //Calculate when question session will end.

                    db.currentQuizDoc(quizNum).set({quizNumber: quizNum,
                                                    timeText: quizTime, //Set activity data relevant to this quiz.
                                                    questionLength: questionLength,
                                                    debriefLength: debriefLength,
                                                    questionCount: questionCount,
                                                    sessionTimeout: sessionTimeout});
                    
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