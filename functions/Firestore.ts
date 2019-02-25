
export class DB { //Class methods return all required references in the forestore database.
    firestore : any;

    constructor(firestore) { //Database object instantiated by index.js, but passed here.
        this.firestore = firestore;
    }

//ChirpyGamesRoot ref
    quizGameDoc() {return this.firestore.collection('ChirpyGamesRoot').doc('QuizGame');}
        quizDataCol() {return this.quizGameDoc().collection('quizData');}
            activeDoc() {return this.quizDataCol().doc('active');}
            questionDoc() {return this.quizDataCol().doc('question');}
            debriefDoc() {return this.quizDataCol().doc('debrief');}
            quizCountDoc() {return this.quizDataCol().doc('quizCount');}
        quizzesCol() {return this.quizGameDoc().collection('quizzes');}
            currentQuizDoc(quizNum: number) {return this.quizzesCol().doc(String(quizNum));}
                currentQuizCol(quizNum : number) {return this.currentQuizDoc(quizNum).collection('questions');} //TODO: Change to 'questions'
        //tmpDataCol ref
            tmpDataDoc() {return this.quizGameDoc().collection('tmpDataCol').doc('tmpData');}

//Above methods call the previous reference from an earlier method.
}
