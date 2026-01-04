/*
*
* Config
*
*/

question_files = [];
config = [];

async function loadConfig(){
    const response = await fetch("config/quiz.json");
    config = await response.json();
    console.log("[ GLOBAL ] config loaded.");
}

/*
*
* Program
*
*/

class Question{
    constructor(Title) {
        this.title = Title;
    }
    static getQuestionsFromJson(json){
        return json;
    }
    createShowAnswersButton(){

    }
    generateHTML(){
        
    }
    static generateNoQuestionsErrorHTML(){
        let questionContainer = createDiv("", "questionContainer", "", document.body);
        createElement("h3", "Žádné otázky nebyly nalezeny!", "questionTitle", "", questionContainer);
        let button = createElement("button", "Refresh", "nextQuestionButton", "", questionContainer);
        button.addEventListener("click", () => { nextQuestion(); });
    }
}

class Question_Options extends Question{
    constructor(Title, FalseOptions, CorrectOptions) {
        super(Title);
        this.falseOptions = FalseOptions;
        this.correctOptions = CorrectOptions;
    }
    createCheckBoxes(parent){
        for(let answers_correct of this.correctOptions){
            let element = createElement("button", answers_correct, "option_button", "", parent);
            element.addEventListener("click", () => { toggleSelected(element); })
        }
        for(let answers_false of this.falseOptions){
            let element = createElement("button", answers_false, "option_button", "", parent);
            element.addEventListener("click", () => { toggleSelected(element); })
        }
    }
    checkAnswer(Answer){
        let isSelectedByUser = Answer["selected"]
        let shouldBeSelectedByUser = this.correctOptions.includes(Answer["value"]);

        if(isSelectedByUser == shouldBeSelectedByUser)
            return true;
        else
            return false;
    }
    checkAnswersAndColorizeThem(optionElements){
        for(let optionElement of optionElements){
            let isSelected = optionElement.classList.contains("selected");
            let isCorrect = this.checkAnswer({
                "value": optionElement.innerHTML,
                "selected":  isSelected
            });

            if(isCorrect){
                if(isSelected) optionElement.style.backgroundColor = "#45ff45";
                else optionElement.style.backgroundColor = "#ffffffff";
                optionElement.style.color = "#389238ff";
                optionElement.style.borderColor = "#195e23ff";
            }
            else{
                if(isSelected) optionElement.style.backgroundColor = "#ff4545";
                else optionElement.style.backgroundColor = "#ffffffff";
                optionElement.style.color = "#923838ff";
                optionElement.style.borderColor = "#5e1919ff";
            }
        }
    }
    getCorrectOptionsAsString(){
        let value = "";

        let addComma = false;
        for(let correctOption of this.correctOptions){
            if (addComma) value += ", ";
            value += correctOption;
            addComma = true;
        }

        return value;
    }
    createShowAnswerButton(parent){
        element = createElement("button", config["button_answer"], "questionAnswerButton", "", parent);

        element.addEventListener("click", () => {
            let answerBox = parent.querySelector(".answers");
            if (!answerBox) { 
                answerBox = createElement("div",  interpolateFromConfig("response_text_answer", [{"key": "answer", "value": this.getCorrectOptionsAsString()}]), "", "", parent);
                answerBox.style.color = "#4545ff";
            }
        });

        return element;
    }
    createCheckAnswerButton(parent){
        element = document.createElement("button");
        element.className = "questionCheckButton";
        element.innerHTML = config["button_check"];

        element.addEventListener("click", () => { 
            let optionElements = document.getElementsByClassName("option_button");
            this.checkAnswersAndColorizeThem(optionElements); 
        });

        parent.appendChild(element);
        return element;
    }
    generateHTML(){
        let questionContainer = createDiv("", "questionContainer", "", document.body);
        createQuestionTitle(question.title, questionContainer);
        this.createCheckBoxes(questionContainer);
        endLine(questionContainer);
        this.createShowAnswerButton(questionContainer);
        this.createCheckAnswerButton(questionContainer);
        createNextQuestionButton(questionContainer);
    }
}

class Question_Text extends Question{
    constructor(Title, Answer) {
        super(Title);
        this.answer = Answer;
    }
    generateHTML(){
        let questionContainer = createDiv("", "questionContainer", "", document.body);
        createQuestionTitle(this.title, questionContainer);
        let inputbox = createInputBox("...", "inputbox", questionContainer);
        let question = this;
        inputbox.addEventListener("keydown", function(event) { if (event.key === "Enter") checkTextQuestion(questionContainer, question); }); 
        inputbox.focus();
        endLine(questionContainer);
        createQuestionAnswersButton_Text(questionContainer, this);
        createQuestionCheckButton_Text(questionContainer, this);
        createNextQuestionButton(questionContainer);
    }
}

function toggleSelected(element){
    element.classList.toggle("selected");
}

//Research later
function interpolateFromConfig(configValueName, internalValues){
    tempValue = config[configValueName];
    console.log(tempValue);
    for(internalValue of internalValues){
        tempValue = tempValue.replace(
            "{{" + internalValue["key"] + "}}", 
            internalValue["value"]
        );
    }
    return tempValue;
};

function createElement(type, innerHtml, _class, _id, parent){
    element = document.createElement(type);
    element.innerHTML += innerHtml;
    element.className = _class;
    element.id = _id;
    parent.appendChild(element);
    return element;
}

function createDiv(content, _class, _id, parent){
    return createElement("div", content, _class, _id, parent);
}

function createH3(content, _class, _id, parent){
    return createElement("h3", content, _class, _id, parent);
}

function createInputBox(placeholder, _id, parent){
    element = createElement("input", "", "questionInputTextBox", _id, parent);
    element.type = "text";
    element.placeholder = placeholder;
    return element;
}

function endLine(parent){
    element = document.createElement("br");
    parent.appendChild(element);
}

function createQuestionContainer(){
    return createDiv("", "questionContainer", "", document.body);
}

function createQuestionTitle(text, container){
    return createH3(text, "questionTitle", "", container);
}

function createQuestionCheckButton_Text(parent, question){
    element = document.createElement("button");
    element.className = "questionCheckButton";
    element.innerHTML = config["button_check"];

    element.addEventListener("click", () => { checkTextQuestion(parent, question); });

    parent.appendChild(element);
    return element;
}

//vytvořeno pomocí AI
function checkTextQuestion(parent, question){
    // Find the related input box
    const inputBox = parent.querySelector(".questionInputTextBox");
    const userAnswer = inputBox.value.trim().toLowerCase();

    // Check if it matches any of the correct answers
    let correct = false;

    // question.answer can be a string or an array
    if (Array.isArray(question.answer)) {
        correct = question.answer.some(ans => ans.trim().toLowerCase() === userAnswer);
    } else {
        correct = question.answer.trim().toLowerCase() === userAnswer;
    }

    // Create or update result feedback
    let feedback = parent.querySelector(".feedback");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "feedback";
        parent.appendChild(feedback);
    }

    if (correct) {
        feedback.textContent = config["response_text_correct"];
        inputBox.style.backgroundColor = "#45ff45";
        feedback.style.color = "#45ff45";
        setTimeout( function() { nextQuestion(); }, 1000);
    } else {
        feedback.textContent = config["response_text_wrong"];
        inputBox.style.backgroundColor = "#ff4545";
        feedback.style.color = "#ff4545";
    }
}

function createQuestionAnswersButton_Text(parent, question){
    element = createElement("button", config["button_answer"], "questionAnswerButton", "", parent);

    element.addEventListener("click", () => {
        const answer = question.answer[0];

        let answerBox = parent.querySelector(".answers");
        if (!answerBox) { 
            answerBox = createElement("div",  interpolateFromConfig("response_text_answer", [{"key": "answer", "value": answer}]), "", "", parent);
            answerBox.style.color = "#4545ff";
        }
    });

    return element;
}

function createNextQuestionButton(parent){
    button = createElement("button", config["button_next"], "nextQuestionButton", "", parent);
    button.addEventListener("click", () => { nextQuestion(); });
    return button;
}

function nextQuestion(){
    deleteQuestionContainer();
    ShowNewQuestion();
}

function deleteQuestionContainer(){
    const container = document.querySelector('.questionContainer');
    container.remove();
}

async function getQuestionsAsJSON(id){
    const response = await fetch("questions/" + id);
    console.log("[ GLOBAL ] Json " + id + " loaded.");
    return await response.json();
}

async function getQuestions(id) {
    const questions = await getQuestionsAsJSON(id);
    const questionArray = [];

    questions.forEach(q => {
        if (q.answers != null) {
            questionArray.push(
                new Question_Text(q.text, q.answers)
            );
        } else if (q.answers_correct || q.answers_false) {
            questionArray.push(
                new Question_Options(
                    q.text,
                    q.answers_false ?? [],
                    q.answers_correct ?? []
                )
            );
        }
    });

    return questionArray;
}


function getFilterButtonState(buttonID){
    if(document.getElementById(buttonID))
        return document.getElementById(buttonID).classList.contains("activeFilterButton");
    else
        return true;
}

lastQuestionID = null;

function selectQuestion(){
    let questions = [];

    for (const questionList of questionCategories) {
        if(getFilterButtonState("Filter_" + questionList["key"])) 
            questions.push.apply(questions, questionList["value"]);
    }

    if(questions.length < 1) return null;
    if(questions.length == 1) return questions[0];

    selectedQuestion = null;
    selectedQuestionID = lastQuestionID
    while(selectedQuestionID == lastQuestionID){
        selectedQuestionID = Math.floor(Math.random() * questions.length);
    }
    lastQuestionID = selectedQuestionID;
    return questions[selectedQuestionID];
}

function createFilterButton(innerHtml, id, parent){
    button = createElement("button", innerHtml, "filterButton", id, parent);
    button.classList.toggle("activeFilterButton");
    button.addEventListener("click", () => { 
        document.getElementById(id).classList.toggle("activeFilterButton");
    });
}
/*
*
* MAIN
*
*/

questionCategories = [];

async function start(){
    await loadConfig();

    question_files = config["question_file_names"];

    for (const fileName of question_files) {
        let _questions = await getQuestions(fileName);

        questionCategories.push({
            key: fileName,
            value: _questions
        })
    }

    if(config["show_categories"]) await createCategoryPanel(question_files);
}

async function createCategoryPanel(question_files){
    let filterContainer = createElement("div", "", "filterContainer", "", document.body);
    createElement("a", "Show questions from:", "filterHeader", "", filterContainer);
    endLine(filterContainer);

    for (const fileName of question_files) {
        let _questions = await getQuestions(fileName);
        let filterName = fileName.replace(/.json/gi, "");
        filterName = filterName.replace(/_/gi, " ");

        createFilterButton(
            filterName + " (" + _questions.length + ")",
            "Filter_" + fileName,
            filterContainer
        );
    }
}

function ShowNewQuestion(){
    question = selectQuestion();
    if(question) question.generateHTML();
    else Question.generateNoQuestionsErrorHTML();
}

async function init(){
    await start();
    ShowNewQuestion();
}

init();