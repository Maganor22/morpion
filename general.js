let player = [
  {
    name: "",
    symbol: "",
    color: "green",
    turn: false,
    win: false,
  },
];

let playerIa = [
  {
    name: "Ordinateur",
    symbol: "",
    color: "red",
    turn: false,
    win: false,
  },
];

let difficulty = 'facile'; // Niveau de difficulté par défaut

let boardGame = [];

let symbols = ["O", "X"];

let cellsPlayed = [];

const messageTitle = document.getElementById("messageTitle");
const divInitiateGame = document.getElementById("initiateGame");
const resetBtn = document.getElementById("resetBtn");

function initiateGame() {
  // Initialisation du jeu
  let username = document.getElementById("username").value;
  difficulty = document.getElementById("difficulty").value;
  if (username != "") {
    player[0].name = username;
    player[0].symbol = randomChoice();
    playerIa[0].symbol = randomChoice();
    console.log(
      player[0].name +
        " " +
        player[0].symbol +
        " " +
        playerIa[0].name +
        " " +
        playerIa[0].symbol
    );

    // Choix du premier joueur
    if (player[0].symbol == "O") {
      player[0].turn = true;
    } else {
      playerIa[0].turn = true;
    }

    createBoardGame();
    createHTMLBoard();
    checkPlayerTurn();
    divInitiateGame.style.display = "none";
  } else {
    alert("Veuillez entrer un pseudo");
  }
}

function randomChoice() {
  // Choix aléatoire du symbole
  let symbolPick = symbols[Math.floor(Math.random() * symbols.length)];
  symbols.splice(symbols.indexOf(symbolPick), 1);
  return symbolPick;
}

function createBoardGame() {
  // Création du tableau de jeu
  for (let i = 0; i < 3; i++) {
    let row = [];

    for (let j = 0; j < 3; j++) {
      row.push({
        symbol: "",
        player: "",
      });
    }

    boardGame.push(row);
  }

  // Initialisation des cellules jouées
  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
      cellsPlayed.push(`Cell${rowIndex + 1},Column${columnIndex + 1}`);
    }
  }
}

document.addEventListener("click", function (e) {
  const cell = e.target.closest(".cell");
  let freeCases = getFreeCases();
  // Si l'utilisateur clique sur une case et que c'est son tour
  if (cell && player[0].turn == true) {
    const divCell = cell.querySelector(".divCell");
    const childDiv = divCell.getAttribute("id");
    // Si la case est libre
    if (freeCases.includes(childDiv)) {
      player[0].turn = false;
      playerIa[0].turn = true;

      updateCell(childDiv, player[0].symbol, player[0].name);
      if (checkWin(player) == true) {
        removeMessageColors();
        resetBtn.style.display = "block";
        messageTitle.classList.add("green");
        messageTitle.textContent = "Félicitations, vous avez gagné!";
        return;
      } else {
        checkPlayerTurn();
      }
    }
  }
});

function iaPlay() {
  if (playerIa[0].turn == true) {
    playerIa[0].turn = false;
    player[0].turn = true;
    let chosenCell;

    if (difficulty === 'facile') {
      // Niveau Facile : choix aléatoire
      chosenCell = getRandomCell();
    } else if (difficulty === 'normal') {
      // Niveau Normal : stratégie basique
      chosenCell = getStrategicCell();
    } else if (difficulty === 'difficile') {
      // Niveau Difficile : algorithme Minimax
      chosenCell = getBestMove();
    }

    updateCell(chosenCell, playerIa[0].symbol, playerIa[0].name);
    if (checkWin(playerIa)) {
      resetBtn.style.display = "block";
      removeMessageColors();
      messageTitle.classList.add("red");
      messageTitle.textContent = "Dommage, vous avez perdu!";
      return;
    }
    checkPlayerTurn();
  }
}


function getStrategicCell() {
  // Récupère les cases libres
  let freeCases = getFreeCases();

  // Niveau Normal : l'IA joue de manière semi-aléatoire
  // Vérifie si l'IA peut gagner au prochain coup
  for (let cell of freeCases) {
    if (isWinningMove(cell, playerIa[0].symbol)) {
      return cell;
    }
  }

  // Vérifie si le joueur peut gagner au prochain coup et bloque-le
  for (let cell of freeCases) {
    if (isWinningMove(cell, player[0].symbol)) {
      return cell;
    }
  }

  // Sinon, joue aléatoirement
  let randomIndex = Math.floor(Math.random() * freeCases.length);
  return freeCases[randomIndex];
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      // Vérifie si la case est libre
      if (boardGame[i][j].symbol === '') {
        // Joue temporairement le coup
        boardGame[i][j].symbol = playerIa[0].symbol;
        let score = minimax(boardGame, 0, false);
        // Annule le coup
        boardGame[i][j].symbol = '';
        if (score > bestScore) {
          bestScore = score;
          move = `Cell${i + 1},Column${j + 1}`;
        }
      }
    }
  }
  return move;
}

function isBoardFull() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (boardGame[i][j].symbol === "") {
        return false;
      }
    }
  }
  return true;
}


function isWinningMove(cell, symbol) {
  let [cellPart, columnPart] = cell.split(',');
  let rowIndex = parseInt(cellPart.slice(4)) - 1;
  let columnIndex = parseInt(columnPart.slice(6)) - 1;

  // Joue temporairement le coup
  boardGame[rowIndex][columnIndex].symbol = symbol;

  // Vérifie si ce coup mène à une victoire
  let isWin = checkWinner() === symbol;

  // Annule le coup
  boardGame[rowIndex][columnIndex].symbol = '';

  return isWin;
}

function minimax(board, depth, isMaximizing) {
  let scores = {
    [playerIa[0].symbol]: 1,
    [player[0].symbol]: -1,
    tie: 0
  };

  let result = checkWinner();
  if (result !== null) {
    return scores[result];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j].symbol === '') {
          board[i][j].symbol = playerIa[0].symbol;
          let score = minimax(board, depth + 1, false);
          board[i][j].symbol = '';
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j].symbol === '') {
          board[i][j].symbol = player[0].symbol;
          let score = minimax(board, depth + 1, true);
          board[i][j].symbol = '';
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
}

function checkWinner() {
  // Vérifie les lignes
  for (let i = 0; i < 3; i++) {
    if (boardGame[i][0].symbol === boardGame[i][1].symbol &&
        boardGame[i][1].symbol === boardGame[i][2].symbol &&
        boardGame[i][0].symbol !== '') {
      return boardGame[i][0].symbol;
    }
  }

  // Vérifie les colonnes
  for (let j = 0; j < 3; j++) {
    if (boardGame[0][j].symbol === boardGame[1][j].symbol &&
        boardGame[1][j].symbol === boardGame[2][j].symbol &&
        boardGame[0][j].symbol !== '') {
      return boardGame[0][j].symbol;
    }
  }

  // Vérifie les diagonales
  if (boardGame[0][0].symbol === boardGame[1][1].symbol &&
      boardGame[1][1].symbol === boardGame[2][2].symbol &&
      boardGame[0][0].symbol !== '') {
    return boardGame[0][0].symbol;
  }

  if (boardGame[0][2].symbol === boardGame[1][1].symbol &&
      boardGame[1][1].symbol === boardGame[2][0].symbol &&
      boardGame[0][2].symbol !== '') {
    return boardGame[0][2].symbol;
  }

  // Vérifie s'il y a une égalité
  let openSpots = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (boardGame[i][j].symbol === '') {
        openSpots++;
      }
    }
  }

  if (openSpots === 0) {
    return 'tie';
  }

  return null;
}

function checkWin(currentPlayer) {
  const playerSymbol = currentPlayer[0].symbol;
  let win = false;

  // Vérification des lignes
  for (let i = 0; i < 3; i++) {
    if (
      boardGame[i][0].symbol === playerSymbol &&
      boardGame[i][1].symbol === playerSymbol &&
      boardGame[i][2].symbol === playerSymbol
    ) {
      document
        .getElementById("Cell" + (i + 1) + ",Column" + 1)
        .querySelector(".symbol")
        .classList.add(currentPlayer[0].color);
      document
        .getElementById("Cell" + (i + 1) + ",Column" + 2)
        .querySelector(".symbol")
        .classList.add(currentPlayer[0].color);
      document
        .getElementById("Cell" + (i + 1) + ",Column" + 3)
        .querySelector(".symbol")
        .classList.add(currentPlayer[0].color);
      win = true;
      break;
    }
  }

  // Vérification des colonnes
  if (!win) {
    for (let j = 0; j < 3; j++) {
      if (
        boardGame[0][j].symbol === playerSymbol &&
        boardGame[1][j].symbol === playerSymbol &&
        boardGame[2][j].symbol === playerSymbol
      ) {
        document
          .getElementById("Cell" + 1 + ",Column" + (j + 1))
          .querySelector(".symbol")
          .classList.add(currentPlayer[0].color);
        document
          .getElementById("Cell" + 2 + ",Column" + (j + 1))
          .querySelector(".symbol")
          .classList.add(currentPlayer[0].color);
        document
          .getElementById("Cell" + 3 + ",Column" + (j + 1))
          .querySelector(".symbol")
          .classList.add(currentPlayer[0].color);
        win = true;
        break;
      }
    }
  }

  // Vérification des diagonales
  if (!win) {
    if (
      boardGame[0][0].symbol === playerSymbol &&
      boardGame[1][1].symbol === playerSymbol &&
      boardGame[2][2].symbol === playerSymbol
    ) {
      document
        .getElementById("Cell" + 1 + ",Column" + 1)
        .querySelector(".symbol")
        .classList.add(currentPlayer[0].color);
      document
        .getElementById("Cell" + 2 + ",Column" + 2)
        .querySelector(".symbol")
        .classList.add(currentPlayer[0].color);
      document
        .getElementById("Cell" + 3 + ",Column" + 3)
        .querySelector(".symbol")
        .classList.add(currentPlayer[0].color);
      win = true;
    } else if (
      boardGame[0][2].symbol === playerSymbol &&
      boardGame[1][1].symbol === playerSymbol &&
      boardGame[2][0].symbol === playerSymbol
    ) {
      document
        .getElementById("Cell" + 1 + ",Column" + 3)
        .querySelector(".symbol")
        .classList.add(currentPlayer[0].color);
      document
        .getElementById("Cell" + 2 + ",Column" + 2)
        .querySelector(".symbol")
        .classList.add(currentPlayer[0].color);
      document
        .getElementById("Cell" + 3 + ",Column" + 1)
        .querySelector(".symbol")
        .classList.add(currentPlayer[0].color);
      win = true;
    }
  }

  currentPlayer[0].win = win;
  return win;
}


function checkPlayerTurn() {
  removeMessageColors();
  if (isBoardFull()) {
    messageTitle.classList.add("yellow");
    messageTitle.textContent = "Match nul !";
    resetBtn.style.display = "block";
    return;
  }
  if (player[0].turn == true) {
    messageTitle.classList.add("green");
    messageTitle.textContent = `C'est à vous de jouer ${player[0].name} !`;
  } else {
    messageTitle.classList.add("orange");
    messageTitle.textContent = "C'est au tour de l'ordinateur de jouer!";
    setTimeout(() => {
      iaPlay();
    }, 1000);
  }
}



function getRandomCell() {
  let freeCases = getFreeCases();
  let randomIndex = Math.floor(Math.random() * freeCases.length);
  let randomCell = freeCases[randomIndex];
  return randomCell;
}

function getFreeCases() {
  let freeCases = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (boardGame[i][j].symbol == "") {
        freeCases.push(`Cell${i + 1},Column${j + 1}`);
      }
    }
  }
  return freeCases;
}

function updateCell(cellId, symbol, playerName) {
  let cellElement = document.getElementById(cellId);
  console.log(cellElement);

  // Update la cellule avec le symbole du joueur
  cellElement.innerHTML = '<div class="symbol">' + symbol + "</div>";

  // Update du boardGame
  let cellParts = cellId.split(",");
  let rowIndex = parseInt(cellParts[0].slice(4)) - 1;
  let columnIndex = parseInt(cellParts[1].slice(6)) - 1;
  boardGame[rowIndex][columnIndex].symbol = symbol;
  boardGame[rowIndex][columnIndex].player = playerName;
}

function createHTMLBoard() {
  // Create the table elements
  let body = document.querySelector("body");
  let boardTable = document.createElement("table");
  let boardTableBody = document.createElement("tbody");
  boardTableBody.classList.add("boardTableBody");
  let count = 0;

  // Create and append table rows
  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    let boardRow = document.createElement("tr");

    // Create and append table cells for each row
    for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
      let playerCell = document.createElement("td");
      playerCell.classList.add("cell");
      playerCell.innerHTML =
        '<div class="divCell" id="Cell' +
        (rowIndex + 1) +
        ",Column" +
        (columnIndex + 1) +
        '"></div>';

      boardRow.appendChild(playerCell);
      count++;
    }

    boardTableBody.appendChild(boardRow);
    boardTable.appendChild(boardTableBody);
    body.appendChild(boardTable);
  }
}

function removeMessageColors() {
  // Supprime les classes de couleurs du message
  messageTitle.classList.remove("green");
  messageTitle.classList.remove("yellow");
  messageTitle.classList.remove("orange");
}

function resetGame() {
  location.reload();
}
