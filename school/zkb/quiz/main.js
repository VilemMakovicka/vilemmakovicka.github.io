/*
*
* Config
*
*/

question_files = [];
config = [];

async function loadConfig(){
    let response;
    response = await fetch("config/quiz.json");
    if(response["ok"] == false){
        response = await fetch("https://cdn.jsdelivr.net/gh/VilemMakovicka/simple-html-quiz-creator@main/config/quiz.json");
        console.log("[ GLOBAL ] Internal config wasn't found. Backup config loaded.");
    }
    else{
        console.log("[ GLOBAL ] Internal config loaded.");
    }
    config = await response.json();
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
    createCheckBoxes(parent){//rework maybe
        let allOptions = [
            ...this.correctOptions.map(opt => ({ text: opt, isCorrect: true  })),
            ...this.falseOptions  .map(opt => ({ text: opt, isCorrect: false }))
        ];

        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]]; 
        }

        for (let option of allOptions) {
            let element = createElement("button", option.text, "option_button", "", parent);

            element.addEventListener("click", () => { 
                toggleSelected(element); 
                let optionElements = document.getElementsByClassName("option_button");
                this.checkAnswersAndColorizeThem(optionElements); 
            });
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
                if(isSelected){
                    optionElement.style.backgroundColor = "#45ff45";
                    optionElement.style.color = "#389238ff";
                    optionElement.style.borderColor = "#195e23ff";
                }
            }
            else{
                if(isSelected) {
                    optionElement.style.backgroundColor = "#ff4545";
                    optionElement.style.color = "#923838ff";
                    optionElement.style.borderColor = "#5e1919ff";
                }
                else if(this.correctOptions.includes(optionElement.innerHTML)) {
                    optionElement.style.color = "#923838ff";
                    optionElement.style.borderColor = "#5e1919ff";
                }
            }
        }
        setTimeout( function() { nextQuestion(); }, 1000);
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
        element = createElement("button", config["uielements"]["showanswer"]["textcontent"], "questionAnswerButton", "", parent);

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
        element.innerHTML = config["uielements"]["checkanswer"]["textcontent"];

        element.addEventListener("click", () => { 
            let optionElements = document.getElementsByClassName("option_button");
            this.checkAnswersAndColorizeThem(optionElements); 
        });

        parent.appendChild(element);
        return element;
    }
    generateHTML(){
        let questionContainer = createDiv("", "questionContainer", "", document.body);
        createQuestionStatisticBar(questionContainer);
        createQuestionTitle(question.title, questionContainer);
        this.createCheckBoxes(questionContainer);
        endLine(questionContainer);
        if(config["uielements"]["showanswer"]["show"])
            this.createShowAnswerButton(questionContainer);

        if(config["uielements"]["checkanswer"]["show"])
            this.createCheckAnswerButton(questionContainer);

        if(config["uielements"]["nextquestion"]["show"])
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
        createQuestionStatisticBar(questionContainer);
        createQuestionTitle(this.title, questionContainer);
        let inputbox = createInputBox("...", "inputbox", questionContainer);
        let question = this;
        inputbox.addEventListener("keydown", function(event) { if (event.key === "Enter") checkTextQuestion(questionContainer, question); }); 
        inputbox.focus();
        endLine(questionContainer);
        if(config["uielements"]["showanswer"]["show"])
            createQuestionAnswersButton_Text(questionContainer, this);

        if(config["uielements"]["checkanswer"]["show"])
            createQuestionCheckButton_Text(questionContainer, this);
        
        if(config["uielements"]["nextquestion"]["show"])
            createNextQuestionButton(questionContainer);
    }
}

function toggleSelected(element){
    element.classList.toggle("selected");
}

//Research later
function interpolateFromConfig(configValue, internalValues){
    tempValue = configValue;
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

function createQuestionStatisticBar(container){
    console.log("bar created");
    let bar = createElement("span", "", "questionStatisticBar", "", container);
    createElement("span", "", "questionStatisticBar-completed", "", bar).style.width = "0%";
    createElement("span", "", "questionStatisticBar-uncovered", "", bar).style.width = "0%";
    return bar
}

function createQuestionCheckButton_Text(parent, question){
    element = document.createElement("button");
    element.className = "questionCheckButton";
    element.innerHTML = config["uielements"]["checkanswer"]["textcontent"];

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
    element = createElement("button", config["uielements"]["showanswer"]["textcontent"], "questionAnswerButton", "", parent);

    element.addEventListener("click", () => {
        const answer = question.answer[0];

        let answerBox = parent.querySelector(".answers");
        if (!answerBox) { 
            answerBox = createElement("div",  interpolateFromConfig(config["response_text_answer"], [{"key": "answer", "value": answer}]), "", "", parent);
            answerBox.style.color = "#4545ff";
        }
    });

    return element;
}

function createNextQuestionButton(parent){
    button = createElement("button", config["uielements"]["nextquestion"]["textcontent"], "nextQuestionButton", "", parent);
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

async function createCategoryPanel(question_files){
    let filterContainer = createElement("div", "", "filterContainer", "", document.body);
    createElement("a", "Show questions from:", "filterHeader", "", filterContainer);
    endLine(filterContainer);

    for (const fileName of question_files) {
        let _questions = await getQuestions(fileName);
        let filterName = fileName.replace(/.json/gi, "");
        filterName = filterName.replace(/_/gi, " ");

        createFilterButton(
            interpolateFromConfig(config["uielements"]["categories"]["format"], [{"key": "category", "value": filterName}, {"key": "amount", "value": _questions.length}]),
            "Filter_" + fileName,
            filterContainer
        );
    }
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

    if(config["uielements"]["categories"]["show"]) 
        await createCategoryPanel(question_files);
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