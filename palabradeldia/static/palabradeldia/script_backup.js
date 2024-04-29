function suggestWord() {
  const rows = document.querySelectorAll('.row');
  const nextIncompleteRow = getNextIncompleteRow(rows);

  if (nextIncompleteRow) {
    const uniqueLetters = getUniqueLettersInCompletedRows(rows);
    const orangeLettersAndPositions = handleGreenOrange('orange', rows);
    const greenLettersAndPositions = handleGreenOrange('green', rows);

    const validWords = words.filter(word => {
      // Filter out words containing gray letters
      for (const letter of word) {
        if (uniqueLetters.includes(letter.toUpperCase())) {
          return false;
        }
      }
      // Filter out words not satisfying green letter conditions
      let greenLetterConditionMet = true;
      for (const [letter, positions] of Object.entries(greenLettersAndPositions)) {
        if (!positions.some(position => word[position] === letter.toLowerCase())) {
          greenLetterConditionMet = false;
          break;
        }
      }

      if (!greenLetterConditionMet) {
        return false;
      }        

      // Filter out words not satisfying orange letter conditions
      let orangeLetterConditionMet = true;
      for (const [letter, positions] of Object.entries(orangeLettersAndPositions)) {
        if (!word.includes(letter.toLowerCase())) {
          orangeLetterConditionMet = false;
          break;
        }

        const wordPositions = [...Array(word.length).keys()].filter(i => word[i] === letter.toLowerCase());
        const invalidPositions = positions.filter(pos => wordPositions.includes(pos));

        if (invalidPositions.length === wordPositions.length) {
          orangeLetterConditionMet = false;
          break;
        }
      }

      if (!orangeLetterConditionMet) {
        return false;
      }

      return true;
    });

    if (validWords.length === 0) {
      console.log("No words left that satisfy the conditions");
    } else {
      const randomWord = getRandomWord(validWords);
      fillRowWithWord(nextIncompleteRow, randomWord);
      focusFirstCellOfTopIncompleteRow();
    }
  }
}     

function getNextIncompleteRow(rows) {
  for (const row of rows) {
    if (!isRowFilled(row)) {
      return row;
    }
  }
  return null;
}

function isRowFilled(row) {
return Array.from(row.querySelectorAll('.cell')).every(cell => cell.value.length > 0);
}

function getRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}

function fillRowWithWord(row, word) {
  const cells = row.querySelectorAll('.cell');
  for (let i = 0; i < cells.length; i++) {
    cells[i].value = word[i].toUpperCase();
  }
}

function getUniqueLettersInCompletedRows(rows) {
  const uniqueLetters = new Set();

  for (const row of rows) {
    if (isRowFilled(row)) {
      const rowValues = getRowValues(row);
      rowValues.forEach((value, index) => {
        const cell = row.querySelectorAll('.cell')[index];
        if (cell.style.backgroundColor === 'gray') {
          uniqueLetters.add(value);
        }
      });
    }
  }

  return Array.from(uniqueLetters);
}

function handleGreenOrange(color, rows) {
  const lettersAndPositions = {};

  for (const row of rows) {
    if (isRowFilled(row)) {
      const rowValues = getRowValues(row);
      rowValues.forEach((value, index) => {
        const cell = row.querySelectorAll('.cell')[index];
        if (cell.style.backgroundColor === color) {
          if (!lettersAndPositions.hasOwnProperty(value)) {
            lettersAndPositions[value] = [];
          }
          lettersAndPositions[value].push(index);
        }
      });
    }
  }

  return lettersAndPositions;
} 

function moveFocusToNextCell(event) {
  const currentCell = event.target;
  currentCell.value = currentCell.value.toUpperCase(); // Convert the input value to uppercase

  const nextCell = currentCell.parentElement.querySelector('.cell:not([disabled])' + ':nth-child(' + (Array.from(currentCell.parentElement.children).indexOf(currentCell) + 2) + ')');

  if (nextCell) {
    nextCell.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
      cell.addEventListener('input', event => {
          moveFocusToNextCell(event);
    
          const row = event.target.parentElement;
          if (isRowFilled(row)) {
            focusFirstCellOfTopIncompleteRow();
          }
      });
    cell.addEventListener('click', cycleCellColor);
    focusFirstCellOfTopIncompleteRow();
  });
});

function cycleCellColor(event) {
  const cell = event.target;
  const row = cell.parentElement;

  // Check if the row is complete and the cell is not disabled
  if (isRowFilled(row) && !cell.disabled) {
    const currentColor = cell.style.backgroundColor;
    let newColor;

    // Cycle through the colors based on the current color
    if (currentColor === '' || currentColor === 'white') {
      newColor = 'gray';
    } else if (currentColor === 'gray') {
      newColor = 'orange';
    } else if (currentColor === 'orange') {
      newColor = 'green';
    } else if (currentColor === 'green') {
      newColor = 'white';
    } else {
      newColor = 'gray';
    }

    cell.style.backgroundColor = newColor;
  }
}

function focusFirstCellOfTopIncompleteRow() {
  const rows = document.querySelectorAll('.row');
  const nextIncompleteRow = getNextIncompleteRow(rows);

  if (nextIncompleteRow) {
    const firstCell = nextIncompleteRow.querySelector('.cell:not([disabled])');
    firstCell.focus();
  }
}

function getRowValues(row) {
  return Array.from(row.querySelectorAll('.cell')).map(cell => cell.value.toUpperCase());
}