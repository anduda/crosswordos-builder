let Solver = {
    render: async () => 
    {
        return `<nav>
        <a href="#/Solver">Create new</a>
        <div class="search-container">
          <form id="find-form">
            <input type="text" placeholder="Find crosswords..">
            <button type="submit">Find</button>
          </form>
        </div>
        <a href="#/login" id="logout">Log out</a>
    </nav>

    <main>
        <div class="crossword">
        <table>
            
        </table>
        <div class="clues-window">
            <div class="clue">
                <h1 class="clue-header">Across</h1>
                <ol class="questions" id="across">
                </ol>
            </div>
            <div id = "right" class="clue">
                <h1 class="clue-header">Down</h1>
                <ol class="questions" id="down">
                    
                </ol>
            </div>    
        </div>
    </div>
    <button class="save-button">Check</button>`
    },

    lenTR: 10,
    lenTD: 10,
    crosswordArray: [],
    solvingCrossword: [],
    currentNumber: 1,
    acrossQuestions: [],
    downQuestions: [],
    bdLoadEvent: new Event('loaded'),


    renderQuestion: (isDown, number, question) =>{
        if(isDown)
            document.getElementById("down").appendChild(Solver.generateQuestionField(number, question));
        else
            document.getElementById("across").appendChild(Solver.generateQuestionField(number, question));
    },

    generateQuestionField: (number, question) =>{
        let field = document.createElement('div');
        field.setAttribute('class', 'question');
        field.innerHTML = `<span>${number}</span><p>${question}</p>`
        return field;
    },

    renderTable: () => {
        console.log(Solver.lenTR);
        let markup = ``;
        for(let i = 0; i < Solver.lenTR; i++) {
            markup += Solver.renderTR(i);
        }
        document.querySelector("table").innerHTML = markup;
        console.log(Solver.crosswordArray);
        for(let i = 0; i < Solver.lenTR; i++)
        {
            Solver.solvingCrossword[i] = [];
            for(let j = 0; j < Solver.lenTD; j++)
            {
                Solver.solvingCrossword[i][j] = 0;
                if(!Solver.crosswordArray[i][j].letter)
                {
                    document.getElementById(i + "-" + j ).parentNode.style.background = "#000000";
                    document.getElementById(i + "-" + j ).disabled = true;
                }
                if(Solver.crosswordArray[i][j].number)
                {
                    document.getElementById(i + "-" + j ).previousSibling.textContent = Solver.crosswordArray[i][j].number;
                }
            }
        }
        if(Solver.acrossQuestions)
        for(let question of Solver.acrossQuestions)
        {
            Solver.renderQuestion(false, question.number, question.text);
        }
        if(Solver.downQuestions)
        for(let question of Solver.downQuestions)
        {
            Solver.renderQuestion(true, question.number, question.text);
        }

        
    },

    renderTR: (i) => {
        let markup = ``;
        for(let j = 0; j < Solver.lenTD; j++) {
            markup += Solver.renderTD(i, j);
        }
        return `
        <tr>${markup}</tr>
        `
    },

    renderTD: (i, j) => {
        return `
        <td class="puzzle_cell"><b></b><input id="${i}-${j}" type="text" class="puzzle_cell_input" maxlength="1"></td>
        `
    },

    getFromDb: (id) =>
    {
        console.log(id);
        firebase.database().ref(id).once('value', function(snapshot){
            Solver.crosswordArray = snapshot.val().crossword;
            Solver.acrossQuestions = snapshot.val().across;
            Solver.downQuestions = snapshot.val().down;
            console.log(Solver.acrossQuestions);
            console.log(Solver.downQuestions);
            Solver.lenTR = Solver.crosswordArray.length;
            Solver.lenTD = Solver.crosswordArray[0].length;
            document.getElementsByTagName("main")[0].dispatchEvent(Solver.bdLoadEvent);
        });
    },

    isLetter: (c) =>{
        console.log(c);
        c = String(c);
        return c.toLowerCase() != c.toUpperCase();
    },

    isVertical: false,

    goNextCell: (i, j) =>
    {
        if(!Solver.isVertical)
        {
            j += 1;
            let cell = document.getElementById(i + "-" + j);
            if(cell)
                cell.focus();
        }
        else
        {
            i += 1;
            let cell = document.getElementById(i + "-" + j);
            if(cell)
                cell.focus();
        }
    },

    goBackSell: (i, j) =>
    {
        if(!Solver.isVertical)
        {
            j -= 1;
            let cell = document.getElementById(i + "-" + j);
            if(cell)
                cell.focus();
        }
        else
        {
            i -= 1;
            let cell = document.getElementById(i + "-" + j);
            if(cell)
                cell.focus();
        }
    },

    emptyFlag: false,
    symbolFlag: false,

    addEventsOnCells: () =>{
        document.querySelectorAll(".puzzle_cell_input").forEach(elem =>{
            elem.parentElement.style.height = elem.parentElement.offsetWidth + 'px';
            elem.addEventListener("keyup", (e)=>
            {
                if(e.code == "Space")
                {
                    Solver.isVertical = !Solver.isVertical;
                    e.target.value = "";
                    return;
                }
                let indexes = e.target.id.split('-');
                indexes[0] = Number(indexes[0]);
                indexes[1] = Number(indexes[1]);
                if(!Solver.symbolFlag)
                {
                    return;
                }
                if(!Solver.emptyFlag)
                {
                    Solver.goNextCell(indexes[0], indexes[1]);
                    return;
                }
                if(!Solver.isLetter(e.target.value))
                {
                    e.target.value = "";
                    return;
                }
                e.target.value = e.target.value[0];
                Solver.solvingCrossword[indexes[0]][indexes[1]] = e.target.value;
                Solver.goNextCell(indexes[0], indexes[1]);
                });
                elem.addEventListener("keydown", (e)=>{
                    Solver.emptyFlag = false;
                    Solver.symbolFlag = false;
                    let indexes = e.target.id.split('-');
                    indexes[0] = Number(indexes[0]);
                    indexes[1] = Number(indexes[1]);
                    if(e.keyCode == 39)
                    {
                        while(true)
                        {
                            indexes[1]++;
                            if(indexes[1] == Solver.lenTD)
                                return;
                            if(!document.getElementById(indexes[0] + "-" + indexes[1]).disabled)
                                break;
                        }
                        let cell = document.getElementById(indexes[0] + "-" + indexes[1]);
                        if(cell)
                            cell.focus();
                    }
                    else if(e.keyCode == 40)
                    {
                        while(true)
                        {
                            indexes[0]++;
                            if(indexes[0] == Solver.lenTR)
                                return;
                            if(!document.getElementById(indexes[0] + "-" + indexes[1]).disabled)
                                break;
                        }
                        let cell = document.getElementById(indexes[0] + "-" + indexes[1]);
                        if(cell)
                            cell.focus();
                    }
                    else if(e.keyCode == 37)
                    {
                        while(true)
                        {
                            indexes[1]--;
                            if(indexes[1] < 0)
                                return;
                            if(!document.getElementById(indexes[0] + "-" + indexes[1]).disabled)
                                break;
                        }
                        let cell = document.getElementById(indexes[0] + "-" + indexes[1]);
                        if(cell)
                            cell.focus();
                    }
                    else if(e.keyCode == 38)
                    {
                        while(true)
                        {
                            indexes[0]--;
                            if(indexes[0] < 0)
                                return;
                            if(!document.getElementById(indexes[0] + "-" + indexes[1]).disabled)
                                break;
                        }
                        let cell = document.getElementById(indexes[0] + "-" + indexes[1]);
                        if(cell)
                            cell.focus();
                    }
                    else if(e.keyCode == 8)
                    {
                        if(e.target.value.length == 0)
                            Solver.goBackSell(indexes[0], indexes[1]);
                        e.target.value = "";
                        Solver.solvingCrossword[indexes[0]][indexes[1]] = 0;
                    }
                    else
                    {
                        Solver.symbolFlag = true;
                        Solver.emptyFlag = e.target.value.length == 0
                    }});
        });
    },

    addEventsOnQuestion: () =>{
        document.querySelectorAll("ol p").forEach(elem =>{
            elem.addEventListener("click", () =>
            {
                var number = elem.previousSibling.textContent;
                console.log(number);
                let i1 = 0, j1 = 0;
                for(let i = 0; i < Solver.lenTR; i++)
                {
                    for(let j = 0; j < Solver.lenTD; j++)
                    {
                        var cell = document.getElementById(i + "-" + j);
                        console.log(cell.previousSibling.textContent);
                        if(cell.previousSibling.textContent + "." == number)
                        {
                            document.getElementById(i + "-" + j).focus();
                            return;
                        }

                    }
                }
            });
        });
    },

    after_render: async (id) =>
    {
        document.getElementsByTagName("main")[0].addEventListener('loaded', () =>{
            Solver.renderTable();
            document.getElementById("logout").addEventListener('click', () =>
            {
                firebase.auth().signOut();
            });
            Solver.addEventsOnCells();
            document.querySelector(".save-button").addEventListener("click", () =>
            {
                let flag = true;
                for(let i = 0; i < Solver.lenTR; i++)
                {
                    for(let j = 0; j < Solver.lenTD; j++)
                    {
                        if(Solver.isLetter(Solver.crosswordArray[i][j].letter))
                        {
                            var cell = document.getElementById(i + "-" + j);
                            if(Solver.crosswordArray[i][j].letter != Solver.solvingCrossword[i][j])
                            {
                                cell.value = Solver.crosswordArray[i][j].letter;
                                cell.style.color = "#FF0000"
                                cell.disabled = true;
                            }
                            else
                            {
                                cell.style.color = "#00FF00"
                                cell.disabled = true;
                            }
                        }
                    }
                }
            });
            Solver.addEventsOnQuestion();
        });
        Solver.getFromDb(id);
        
    }
};


export default Solver;