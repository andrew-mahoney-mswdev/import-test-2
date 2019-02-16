//Class reads separate values from a CSV file.
//Class is instantiated with a string that contains all characters in the CSV file.
//Calling getNextValue will return the next value from the CSV file.

//CSV FILE RULES:
//Separate values always terminated with the two \r\n characters.
//Separate values can also be terminated with one , character unless...
//the value begins with a " character, in which case it is terminated with one " quotation character, unless...
//the one " character is followed by another " character, which appears to be the CSV equivalent of the \" character.

export class Readcsv { //Class is instantiated with a string that contains the characters in the CSV file.
    private csvString : string;
    private index : number; //The index value that we have counted too.
    private hasCommas : boolean; //Whether a value contains commas (i.e. a value with commas will be terminated with a single " - not a comma)

    constructor(csvString : string) {
        this.csvString = csvString;
        this.index = 0;
        this.hasCommas = false;
    }

    private skipChar() : void { //This is used where two characters denote a value (e.g. \r\n or ""), we will identify the value and skip the second charater.
        this.index++;
    }

    private atTerminationChar(checkChar : string) { //Here, we look for a value that will terminate the string.
        if (checkChar === ',') return true; //Commas usually terminate
        else if (checkChar === '\r') { //r terminates...
            this.skipChar(); //and is usually followed by /n, so we skip this.
            return true;
        }
        else return false;
    }

    private atEndChar() : boolean { //Here, we check whether we are at the end of a value.
        let current : string = this.csvString[this.index]; //We get the current and next values in the string.
        let next : string = this.csvString[this.index+1];

        if (this.hasCommas === false) return this.atTerminationChar(current); //Only check for a terminated value if there are not commas within the value.
        else if (current === '"') { //Otherwise, apply a special case if we find a "
            if (next === '"') this.skipChar(); //If the next char is also a ", this denotes the \" char, so we skip to the next " to allow this to be included.
            else if (this.atTerminationChar(next)) { //Otherwise, the next char may be a legit termination char, so we can check for this.
                this.skipChar(); //Skips over the termination char, which will be , or /r
                return true;
            }
        }
        return false;
    }

    public eof() { //Detects whether we have reached the end of the "file", i.e. the _csvString.
        if (this.index >= this.csvString.length) return true;
        else return false;
    }

    public skipToNextLine() { //Allows us to skip to the next line. For example, so that header lines can be missed.
        for (; this.csvString[this.index] !== '\n'; this.index++);
        this.index++;
    }

    public getNextValue() {
        this.hasCommas = false;
        let firstChar : boolean = true; //Whether we are checking the first charater in the value.   
        let value : string = '';
       
        if (this.eof()) return undefined; //If we have exceeded the length of the string, return nothing.

        var thisLoopBreaksInternally : boolean = true;
        do {
            let current = this.csvString[this.index]; //Get the first char in the value;

            if (firstChar === true && current === '"') { //If we start with a quote, there will be commas within the value.
                this.hasCommas = true;
                this.skipChar(); //Skip that " - which doesn't form part of the value itself.
                continue; //Go to the next character.
            }

            if (this.atEndChar()) { //If we're at the end of the value.
                this.skipChar(); //Skip the termination character
                break; //Leave the loop to return the value.
            }

            value += current; //Update the value with a valid charater.

            this.index++; //Go the the next character.
            firstChar = false; //We are no longer check the first char.
        } while (thisLoopBreaksInternally); //Firebase requires the appearance of a finite loop.

        return value;
    }
}

// // TEST CODE
// const fs = require('fs');
// let data : any = fs.readFileSync('Quiz_7.csv');
// let csvString : string = data.toString();
// let readcsv : Readcsv = new Readcsv(csvString);
// readcsv.skipToNextLine();

// while (readcsv.eof() == false) {
//     console.log(readcsv.getNextValue());
// }
