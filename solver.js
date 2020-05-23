let Solver = {
    render: async () => 
    {
        return `<nav>
        <a href="#/builder">Create new</a>
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
            document.getElementById("down").appendChild(Solver.generateQuestionField(isDown, number, question));
        else
            document.getElementById("across").appendChild(Solver.generateQuestionField(isDown, number, question));
    },

    generateQuestionField: (isDown, number, question) =>{
        let field = document.createElement('div');
        field.setAttribute('class', 'question');
        if(isDown)
            field.innerHTML = `<span >${number}</span><p data-number="${number.split('.')[0]}" data-orientation="down">${question}</p>`
        else
        field.innerHTML = `<span >${number}</span><p data-number="${number.split('.')[0]}" data-orientation="across">${question}</p>`
        return field;
    },

    getQuestionCells: (number, orientation) => {
        let startCell = document.getElementsByName(number)[0];
        console.log(startCell);
        let cells = [];
        if(startCell.disabled)
            return cells;
        cells.push(startCell.parentNode);
        let indexes = startCell.id.split('-');
        indexes[0] = Number(indexes[0]);
        indexes[1] = Number(indexes[1]);
        while(true)
        {
            if(orientation == "down")
            {
                indexes[0] += 1;
                if(indexes[0] < Solver.lenTR)
                {
                    console.log(indexes);
                    let cell = document.getElementById(indexes[0] + '-' + indexes[1]);
                    if(!cell.disabled)
                    {
                        cells.push(cell.parentNode);
                    }
                    else
                    {
                        break;
                    }
                }
                else
                {
                    break;
                }
            }
            if(orientation == "across")
            {
                indexes[1] += 1;
                if(indexes[1] < Solver.lenTD)
                {

                    let cell = document.getElementById(indexes[0] + '-' + indexes[1]);
                    console.log(cell);
                    if(!cell.disabled)
                    {
                        cells.push(cell.parentNode);
                    }
                    else
                    {
                        break;
                    }
                }
                else
                {
                    break;
                }
            }
        }
        return cells;
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
                    document.getElementById(i + "-" + j ).parentNode.classList.add("emptyCell");
                    document.getElementById(i + "-" + j ).disabled = true;
                }
                if(Solver.crosswordArray[i][j].number)
                {
                    document.getElementById(i + "-" + j ).previousSibling.textContent = Solver.crosswordArray[i][j].number;
                    document.getElementById(i + "-" + j).name = Solver.crosswordArray[i][j].number;
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
        <td class="puzzle_cell"><b></b><input id="${i}-${j}" type="text" maxlength="1"></td>
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
    previousLetter: "",
    addEventsOnCells: () =>{
        document.querySelectorAll(".puzzle_cell input").forEach(elem =>{
            elem.parentElement.style.height = elem.parentElement.offsetWidth + 'px';
            elem.addEventListener("keyup", (e)=>
            {
                if(e.code == "Space")
                {
                    e.target.value = Solver.previousLetter;
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
                        Solver.emptyFlag = e.target.value.length == 0;
                        Solver.previousLetter = e.target.value;
                    }});
        });
    },

    addEventsOnQuestion: () =>{
        document.querySelectorAll("ol p").forEach(elem =>{
            elem.addEventListener("click", () =>
            {
                var number = elem.dataset.number;
                var orientation = elem.dataset.orientation;
                let cells = Solver.getQuestionCells(number, orientation);
                for(let i = 0; i < cells.length; i++)
                {
                    cells[i].classList.add("findQuestion");
                }
                Solver.sleep(1000).then(() =>{
                for(let i = 0; i < cells.length; i++)
                {
                    cells[i].classList.remove("findQuestion");
                }});
                
            });
        });
    },

    sleep: (time) => {
        return new Promise((resolve) => setTimeout(resolve, time));
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
                            if(!Solver.crosswordArray[i][j].letter.length || !Solver.solvingCrossword[i][j].length || Solver.crosswordArray[i][j].letter.toLowerCase() != Solver.solvingCrossword[i][j].toLowerCase())
                            {
                                console.log(cell);
                                cell.classList.add("wrongLetter");
                                cell.value = Solver.crosswordArray[i][j].letter;
                                //console.log(cell.classList);
                                cell.disabled = true;
                            }
                            else
                            {
                                console.log(cell.classList);
                                cell.classList.add("notWrongLetter");
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