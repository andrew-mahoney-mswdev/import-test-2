
import { DB } from "./Firestore"; //Use of this class required to access forestore data references

export enum iType {question, debrief} //Enum requried to indicate whether question or debrief numbers are to be calculated by getInterval().

export class QuizMngr { //Class contains functions used by index.js for managing the state of the quiz.
    db : DB; //DB object stored at class level.

    constructor(db : DB) { //DB object is instantiated by index.ts and passed here, to prevent firestore being initialised multiple times.
        this.db = db;
    }

    public getNextQuiz() : Promise<number> { //Finds the next quiz to be run and returns a promise with the id of that quiz.
        let nextQuizId = undefined;
    
        return this.db.quizzesCol().get().then(quizzesSnap => {
            let now = Date.now();
            let endOfNextQuiz = 2000000000000; //This creates a Y2.033K problem, we can't find quizzes after 2032.
    
            quizzesSnap.forEach(quizDoc => {
                let endOfThisQuiz = quizDoc.get('sessionTimeout');
                if (endOfThisQuiz > now && endOfThisQuiz < endOfNextQuiz) { //The next quiz must start after the current time and before any other quiz that's been found.
                    nextQuizId = quizDoc.id;
                    endOfNextQuiz = endOfThisQuiz; //Every iteration of loop compares each quiz to the earliest time found in future quizzes.
                }
            });
    
            if (nextQuizId !== undefined) //If a quiz has been found...
                return Promise.resolve(nextQuizId); //return the id, 
            else
                return Promise.reject(new Error('getNextQuiz() ended with nextQuizId undefined')); //...otherwise, return an error.
        }).catch(error => console.log(error));
    
    }

    public loadQuizData(quizNum : number) { //Method loads quiz data from a specified quiz (ie. the next quiz) to the active quiz document.
        if (quizNum !== undefined) { //Only run if a next quiz has been found.
            this.db.currentQuizDoc(quizNum).get().then(quizDocSnap => {
                let quizDoc = quizDocSnap.data();
                this.db.activeDoc().set(quizDoc);
                return true;
            }).catch(error => console.log(error));
        }
    }

    public getInterval(intervalType : iType) : Promise<JSON> { //Calculates which question or debrief should be displayed, based upon the current time.
        return this.db.activeDoc().get().then(quizDocSnap => {
            let quizDoc = quizDocSnap.data();
            let quizTime = quizDoc['timeText'];
            let sessionTimeout = quizDoc['sessionTimeout'];  //We get the time indexes of the active quiz.
    
            let now = Date.now();
            if (now > quizTime && now < sessionTimeout) { //We check that the quiz is active, if not we return an error as this function should not have been called.
                let quizNumber = quizDoc['quizNumber'];
                let questionLength = quizDoc['questionLength'];
                let debriefLength = quizDoc['debriefLength'];
                
                let interval = questionLength + debriefLength; //The time between questions.
                let startFrom = now;
                if (intervalType === iType.debrief) startFrom -= questionLength; //Debriefs start one full question length after the quiz starts.
                let timeElapsed = startFrom - quizTime; //The time passed since the start of the quiz or first debrief.
                let intervalNumber = Math.floor(timeElapsed / interval);  //Formula determines which question or debrief should be displayed.
    
                return Promise.resolve({quizNumber: quizNumber, intervalNumber: intervalNumber}); //We return the quiz and interval number to the server function so question/debrief data can be loaded.
            } else {return Promise.reject(new Error('getInterval() function call unnecessary'));}
        }).catch(error => {console.log(error);})
    }

    public loadQuestion(quizNum, questionNum) { //Loads relevant question data from the private quizzes collection to the public quizData collection.
        this.db.currentQuestionCol(quizNum).doc('q' + questionNum).get().then(questionDataSnap => {
            let questionData = questionDataSnap.data();
            this.db.questionDoc().set({questionNumber: questionNum,
                qText: questionData['qText'],
                image: questionData['image'],
                answer0: questionData['answer0'],
                answer1: questionData['answer1'],
                answer2: questionData['answer2'],
                answer3: questionData['answer3']});
            return true;
        }).catch(error => console.log(error));
    }

    public loadDebrief(quizNum, questionNum) {//Loads relevant debrief data from the private quizzes collection to the public quizData collection.
        this.db.currentQuestionCol(quizNum).doc('q' + questionNum).get().then(questionDataSnap => {
            let questionData = questionDataSnap.data();
            this.db.debriefDoc().set({questionNumber: questionNum,
                correct: questionData['correct'],
                debrief: questionData['debrief']});
            return true;
        }).catch(error => console.log(error));
    }

    public postAnswer(quizNum : number, uid : string, questionNum : number, answer : number) {
        let data = {};
        data['q' + questionNum] = answer;
        this.db.currentAnswerCol(quizNum).doc(uid).set(data, {merge: true});
    }

}
