function suggestWord() {
    const rows = document.querySelectorAll('.row');
    const nextIncompleteRow = getNextIncompleteRow(rows);
  
    if (nextIncompleteRow) {
      const grayLetters = handleGray(rows);
      const orangeLettersAndPositions = handleGreenOrange('orange', rows);
      console.log("Orange letters: " + JSON.stringify(orangeLettersAndPositions));
      const greenLettersAndPositions = handleGreenOrange('green', rows);
    //   console.log("Green letters: " + JSON.stringify(greenLettersAndPositions));
  
      const validWords = words.filter(word => {
        const normalizedWord = word.split('').map(letter => removeDiacritics(letter.toLowerCase())).join('').toUpperCase(); // Create a normalized version of the word and capitalize it
    
        // Filter out words containing gray letters
        for (const letter of normalizedWord) {
            if (grayLetters.includes(letter)) {
                return false;
            }
        }
    
        // Filter out words not satisfying orange letter conditions
        let orangeLetterConditionMet = true;
        for (const [letter, positions] of Object.entries(orangeLettersAndPositions)) {
            if (!normalizedWord.includes(letter)) {
                orangeLetterConditionMet = false;
                break;
            }

            for (const pos of positions) {
                if (normalizedWord[pos] === letter) {
                    orangeLetterConditionMet = false;
                    break;
                }
            }
        }
    
        if (!orangeLetterConditionMet) {
            return false;
        }
    
        // Filter out words not satisfying green letter conditions
        let greenLetterConditionMet = true;
        for (const [letter, positions] of Object.entries(greenLettersAndPositions)) {
            if (!positions.every(position => normalizedWord[position] === letter)) {
                greenLetterConditionMet = false;
                break;
            }
        }
    
        if (!greenLetterConditionMet) {
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

        // Update the words variable with the validWords variable
        words = validWords;

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

function handleGray(rows) {
    const grayLetters = new Set();
  
    for (const row of rows) {
      if (isRowFilled(row)) {
        const rowValues = getRowValues(row);
        rowValues.forEach((value, index) => {
          const cell = row.querySelectorAll('.cell')[index];
          if (cell.style.backgroundColor === 'gray') {
            const modifiedValue = removeDiacritics(value.toLowerCase()).toUpperCase();
            grayLetters.add(modifiedValue);
          }
        });
      }
    }
  
    return Array.from(grayLetters);
}

function handleGreenOrange(color, rows) {
    const lettersAndPositions = {};

    for (const row of rows) {
        if (isRowFilled(row)) {
            const rowValues = getRowValues(row);
            rowValues.forEach((value, index) => {
                const cell = row.querySelectorAll('.cell')[index];
                if (cell.style.backgroundColor === color) {
                    // Handle diacritics here
                    const modifiedValue = removeDiacritics(value.toLowerCase()).toUpperCase();

                    // Store modified value in the lettersAndPositions object
                    if (!lettersAndPositions.hasOwnProperty(modifiedValue)) {
                        lettersAndPositions[modifiedValue] = [];
                    }
                    // Check if the index already exists for this letter
                    if (!lettersAndPositions[modifiedValue].includes(index)) {
                        lettersAndPositions[modifiedValue].push(index);
                    }
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

function removeDiacritics(letter) {
    switch (letter) {
        case 'á':
            return 'a';
        case 'é':
            return 'e';
        case 'í':
            return 'i';
        case 'ó':
            return 'o';
        case 'ú':
            return 'u';
        case 'ü':
            return 'u';
        default:
            return letter;
    }
}