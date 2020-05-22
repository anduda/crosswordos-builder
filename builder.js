let Builder = {
    render: async () => 
    {
        return `<nav>
        <a href="#/builder">Create new</a>
        <div class="search-container">
          <form id="find-form">
            <input type="text" placeholder="Find crosswords.." id="find-input">
            <button type="submit">Find</button>
          </form>
        </div>
        <a href="#/login" id="logout">Log out</a>
    </nav>

    <main>
        <div class="sizes">
            <div>
                <label for="across">Across:</label>
                <input type="range" id="across-size" name="across" value="10" min="10" max="20" step="1">
            </div>
            <div><label for="down">Down:</label>
                <input type="range" id="down-size" name="down" value="10" min="10" max="20" step="1">
            </div>
        </div>
        <div class="crossword">
            <table id="crossword">
                ${Builder.renderTable()}
            </table>
            <div class="clues-window">
                <div class="clue">
                    <h1 class="clue-header">Across</h1>
                    <ol id="across" class="questions">
                    </ol>
                </div>
                <div id="right" class="clue">
                    <h1 class="clue-header">Down</h1>
                    <ol id="down" class="questions">
                    </ol>
                </div>    
            </div>
        </div>
        <button class="save-button">Save</button>
    </main>`
    },

    lenTR: 10,
    lenTD: 10,
    crosswordArray: [],
    currentNumber: 1,
    acrossQuestions: [],
    downQuestions: [],

    refreshCrossword: () =>{
        Builder.currentNumber = 1;
        document.getElementById("across").innerHTML = "";
        document.getElementById("down").innerHTML = "";
        Builder.addEventsOnCells();
        Builder.generateCrosswordArray();
    },

    generateCrosswordArray: () =>
    {
        Builder.crosswordArray = []
        for(let i = 0; i < Builder.lenTR; i++)
        {
            Builder.crosswordArray[i] = []
            for(let j = 0; j < Builder.lenTD; j++)
            {
                Builder.crosswordArray[i][j] = new Object();
                Builder.crosswordArray[i][j].number = 0;
                Builder.crosswordArray[i][j].letter = 0;
            }
        }
    },

    renderQuestion: (isDown, number) =>{
        if(isDown)
            document.getElementById("down").appendChild(Builder.generateQuestionField(number, "d"));
        else
            document.getElementById("across").appendChild(Builder.generateQuestionField(number, "a"));
        Builder.autoResizeTextArea();
    },

    deleteQuestion: (number) =>
    {
        let across = document.getElementById('a-' + number);
        let down = document.getElementById('d-' + number);
        if(across)
            across.parentNode.removeChild(across);
        if(down)
            down.parentNode.removeChild(down);
    },

    generateQuestionField: (number, orientation) =>{
        let field = document.createElement('div');
        field.setAttribute('class', 'question');
        field.setAttribute('id', orientation + "-" + number);
        field.innerHTML = `<span>${number}.</span><textarea data-autoresize></textarea>`
        return field;
    },

    renderTable: () => {
        let markup = ``;
        for(let i = 0; i < Builder.lenTR; i++) {
            markup += Builder.renderTR(i);
        }
        return markup;
    },

    renderTR: (i) => {
        let markup = ``;
        for(let j = 0; j < Builder.lenTD; j++) {
            markup += Builder.renderTD(i, j);
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

    autoResizeTextArea: () => {
        document.querySelectorAll('[data-autoresize]').forEach(function (element) {
          element.style.boxSizing = 'border-box';
          var offset = element.offsetHeight - element.clientHeight;
          element.addEventListener('input', function (event) {
            event.target.style.height = 'auto';
            event.target.style.height = event.target.scrollHeight + offset + 'px';
          });
          element.removeAttribute('data-autoresize');
        });
    },

    isLetter: (c) =>{
        return c.toLowerCase() != c.toUpperCase();
    },

    getB: (i, j) =>
    {
        return document.getElementById(i + "-" + j ).previousSibling;
    },

    checkNumbers: () =>{
        for(let i = 0; i < Builder.lenTR; i++)
        {
            for(let j = 0; j < Builder.lenTD; j++)
            {
                let b = Builder.getB(i, j);
                if(Builder.crosswordArray[i][j].number == 0 && b.value != "")
                {
                    b.innerHTML = "";
                }
                else if(Builder.crosswordArray[i][j].number)
                {
                    b.innerHTML = Builder.crosswordArray[i][j].number;
                }
            }
        }
    },

    addNumber: (i, j) =>{
        let isDown = false;
        let isAcross = false;
        let iDown = -1, jDown = -1, iAcross = -1, jAcross = -1;
        if(j == 0 || !Builder.crosswordArray[i][j - 1].letter)
        {
            if(j + 1 < Builder.lenTD && Builder.crosswordArray[i][j + 1].letter)
            {
                isAcross = true;
                iAcross = i;
                jAcross = j;
            }
        }
        else if(Builder.crosswordArray[i][j - 1].number || j - 2 < 0 || !Builder.crosswordArray[i][j-2].letter)
        {
            isAcross = true;
            iAcross = i;
            jAcross = j - 1;
        }
        if(i == 0 || !Builder.crosswordArray[i-1][j].letter)
        {
            if(i + 1 < Builder.lenTR && Builder.crosswordArray[i+1][j].letter)
            {
                isDown = true;
                iDown = i;
                jDown = j;
            }
        }
        else if(Builder.crosswordArray[i-1][j].number || i - 2 < 0 || !Builder.crosswordArray[i-2][j].letter)
        {
            isDown = true;
            iDown = i - 1;
            jDown = j;
        }

        if(isAcross)
        {
            if(Builder.crosswordArray[iAcross][jAcross].number)
            {
                Builder.renderQuestion(false, Builder.crosswordArray[iAcross][jAcross].number);
            }
            else
            {
                Builder.renderQuestion(false, Builder.currentNumber);
                Builder.crosswordArray[iAcross][jAcross].number = Builder.currentNumber;
                Builder.currentNumber += 1;
            }
        }
        if(isDown)
        {
            if(Builder.crosswordArray[iDown][jDown].number)
            {
                Builder.renderQuestion(true, Builder.crosswordArray[iDown][jDown].number);
            }
            else
            {
                Builder.renderQuestion(true, Builder.currentNumber);
                Builder.crosswordArray[iDown][jDown].number = Builder.currentNumber;
                Builder.currentNumber += 1;
            }
        }
        Builder.checkNumbers();
    },

    deleteNumber: (i, j) =>{
        Builder.crosswordArray[i][j].letter = 0;
        if(Builder.crosswordArray[i][j].number)
        {
            Builder.crosswordArray[i][j].number = 0;
        }

        if(i - 1 >= 0 && Builder.crosswordArray[i-1][j].number)
        {
            if(j + 1 == Builder.lenTD || (j + 1 < Builder.lenTD && !Builder.crosswordArray[i-1][j+1].letter))
            {
                Builder.deleteQuestion(Builder.crosswordArray[i-1][j].number);
                Builder.getB(i - 1, j).innerHTML = "";
                Builder.crosswordArray[i-1][j].number = 0;
            }
        }

        if(j - 1 >= 0 && Builder.crosswordArray[i][j-1].number)
        {
            if(i + 1 == Builder.lenTD || (i + 1 < Builder.lenTR && !Builder.crosswordArray[i+1][j-1].letter))
            {
                Builder.deleteQuestion(Builder.crosswordArray[i][j-1].number);
                Builder.getB(i, j-1).innerHTML = "";
                Builder.crosswordArray[i][j-1].number = 0;
            }
        }
    },
    emptyFlag: false,
    symbolFlag: false,
    isVertical: false,

    goNextCell: (i, j) =>
    {
        if(!Builder.isVertical)
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
        if(!Builder.isVertical)
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

    addEventsOnCells: () =>{
        document.querySelectorAll(".puzzle_cell_input").forEach(elem =>{
            elem.addEventListener("keyup", (e)=>
            {
                if(e.code == "Space")
                {
                    Builder.isVertical = !Builder.isVertical;
                    e.target.value = "";
                    return;
                }
                let indexes = e.target.id.split('-');
                indexes[0] = Number(indexes[0]);
                indexes[1] = Number(indexes[1]);
                if(!Builder.symbolFlag)
                {
                    return;
                }
                if(!Builder.emptyFlag)
                {
                    Builder.goNextCell(indexes[0], indexes[1]);
                    return;
                }
                if(!Builder.isLetter(e.target.value))
                {
                    e.target.value = "";
                    return;
                }
                e.target.value = e.target.value[0];
                Builder.crosswordArray[indexes[0]][indexes[1]].letter = e.target.value;
                Builder.addNumber(indexes[0], indexes[1]);
                Builder.goNextCell(indexes[0], indexes[1]);
            });
            elem.addEventListener("keydown", (e)=>{
                Builder.symbolFlag = false;
                Builder.emptyFlag = false;
                let indexes = e.target.id.split('-');
                indexes[0] = Number(indexes[0]);
                indexes[1] = Number(indexes[1]);
                if(e.keyCode == 39)
                {
                    indexes[1] += 1;
                    let cell = document.getElementById(indexes[0] + "-" + indexes[1]);
                    if(cell)
                        cell.focus();
                }
                else if(e.keyCode == 40)
                {
                    indexes[0] += 1;
                    let cell = document.getElementById(indexes[0] + "-" + indexes[1]);
                    if(cell)
                        cell.focus();
                }
                else if(e.keyCode == 37)
                {
                    indexes[1] -= 1;
                    let cell = document.getElementById(indexes[0] + "-" + indexes[1]);
                    if(cell)
                        cell.focus();
                }
                else if(e.keyCode == 38)
                {
                    indexes[0] -= 1;
                    let cell = document.getElementById(indexes[0] + "-" + indexes[1]);
                    if(cell)
                        cell.focus();
                }
                else if(e.keyCode == 8)
                {
                    Builder.charFlag = true;
                    if(e.target.value.length == 0)
                        Builder.goBackSell(indexes[0], indexes[1]);
                    e.target.value = "";
                    Builder.deleteQuestion(Number(Builder.getB(indexes[0], indexes[1]).textContent));
                    Builder.getB(indexes[0], indexes[1]).innerHTML = "";
                    Builder.deleteNumber(indexes[0], indexes[1]);
                }
                else
                {
                    Builder.symbolFlag = true;
                    Builder.emptyFlag = e.target.value.length == 0
                }
            });
        });
    },

    getQuestionsForDb: () =>
    {
        document.getElementById("across").childNodes.forEach(elem =>
            {
                Builder.acrossQuestions.push({
                    number : elem.firstChild.textContent,
                    text: elem.lastChild.value

                });
            });
        document.getElementById("down").childNodes.forEach(elem =>
            {
                Builder.downQuestions.push({
                    number : elem.firstChild.textContent,
                    text: elem.lastChild.value

                });
            });
    },

    saveToDb: () =>
    {
        Builder.getQuestionsForDb();
        alert("Crossword id is " + (firebase.database().ref().push({
                    across: Builder.acrossQuestions,
                    down: Builder.downQuestions,
                    crossword: Builder.crosswordArray
            })).key);
    },

    findCrossword: (e) =>
    {
        e.preventDefault();
        window.location.hash = "/solver/" + document.getElementById("find-input").value;    
    },

    deleteEmptyRowsAndColumns: ()=>
    {
        while(true)
        {
            let isNotEmpty = false;
            for(let i = 0; i < Builder.lenTD; i++)
            {
                if(Builder.crosswordArray[0][i].letter != 0)
                {
                    isNotEmpty = true;
                    break;
                }
            }
            if(!isNotEmpty)
            {
                Builder.lenTR--;
                Builder.crosswordArray.shift();   
            }
            else
            {
                break;
            }
        }
        while(true)
        {
            let isNotEmpty = false;
            for(let i = 0; i < Builder.lenTD; i++)
            {
                if(Builder.crosswordArray[Builder.crosswordArray.length-1][i].letter != 0)
                {
                    isNotEmpty = true;
                    break;
                }
            }
            if(!isNotEmpty)
            {
                Builder.lenTR--;
                Builder.crosswordArray.pop();   
            }
            else
            {
                break;
            }
        }

        while(true)
        {
            let isNotEmpty = false;
            for(let i = 0; i < Builder.lenTR; i++)
            {
                if(Builder.crosswordArray[i][0].letter != 0)
                {
                    isNotEmpty = true;
                    break;
                }
            }
            if(!isNotEmpty)
            {
                for(let i = 0; i < Builder.lenTR; i++)
                {
                    Builder.crosswordArray[i].shift();
                }      
                Builder.lenTD--;
            }
            else
            {
                break;
            }
        }
        while(true)
        {
            let isNotEmpty = false;
            for(let i = 0; i < Builder.lenTR; i++)
            {
                if(Builder.crosswordArray[i][Builder.crosswordArray[i].length - 1].letter != 0)
                {
                    isNotEmpty = true;
                    break;
                }
            }
            if(!isNotEmpty)
            {
                for(let i = 0; i < Builder.lenTR; i++)
                {
                    Builder.crosswordArray[i].pop();
                }
                Builder.lenTD--;      
            }
            else
            {
                break;
            }
        }
    },

    after_render: async () =>
    {
        Builder.refreshCrossword();
        document.getElementById("across-size").addEventListener("input", (e) =>{
            Builder.lenTD = e.target.value;
            document.querySelector("table").innerHTML = Builder.renderTable();
            Builder.refreshCrossword();
            
        });

        document.getElementById("down-size").addEventListener("input", (e) =>{
            Builder.lenTR = e.target.value;
            document.querySelector("table").innerHTML = Builder.renderTable();
            Builder.refreshCrossword();
        });

        document.querySelector(".save-button").addEventListener("click", () =>
        {
            Builder.deleteEmptyRowsAndColumns();
            Builder.saveToDb();
        });

        document.querySelector("#find-form").addEventListener("submit", Builder.findCrossword);

    }
};

export default Builder;