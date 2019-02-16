
export class Question {

    private qText : string;
    private image : string;
    private answers : Array<string> = [];
    private correct : number;
    private debrief : string;

    public setQText(qText : string) : void {this.qText = qText;}
    public setImage(image : string) : void {this.image = image;}
    public setAnswer(answerNum : number, answerText : string) : void {this.answers[answerNum] = answerText;}
    public setCorrect(correct : number) : void {this.correct = correct;}
    public setDebrief(debrief : string) : void {this.debrief = debrief;}

    public getAsJSON() : object {
        return {qText: this.qText, 
                image: this.image,
                answer0: this.answers[0],
                answer1: this.answers[1],
                answer2: this.answers[2],
                answer3: this.answers[3],
                correct: this.correct,
                debrief: this.debrief
                };
    }

}

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