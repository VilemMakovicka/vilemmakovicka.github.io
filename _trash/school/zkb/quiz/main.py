import re
jsoncontent="[\n"

with open("zkouska.md", "r") as file:
    questiontitle=""
    correctanswer=""
    falseanswers=[]

    for line in file:
        char1=line[0]
        line=line.rstrip()
        if char1=="#": # question   
            if(questiontitle != ""):      
                jsoncontent+="{\n"
                jsoncontent+="    \"type\":\"select_single\",\n"
                jsoncontent+="    \"text\":\"" + questiontitle + "\",\n"
                jsoncontent+="    \"answers_correct\":[\"" + correctanswer + "\"],\n"
                jsoncontent+="    \"answers_false\":" + str(falseanswers).replace("\'", "\"") + "\n"
                jsoncontent+="},\n"

            questiontitle=re.sub(r"^\#\# \d+\. ", "", line).replace("**", "")
            correctanswer=""
            falseanswers=[]

        elif char1=="*": # correct
            answer=line.replace("*", "")
            correctanswer=answer[3:]
        elif char1 in ["A", "B", "C", "D"]: # false
            answer=line
            falseanswers.append(answer[3:])

jsoncontent+="]"

with open("zkouska_zpracovano.json", "w", encoding="utf-8") as file:
    file.write(jsoncontent)