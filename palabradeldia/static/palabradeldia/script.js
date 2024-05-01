let letterFrequency = ['E', 'A', 'O', 'S', 'N', 'R', 'I', 'L', 'D', 'U', 'T', 'C', 'M', 'P', 'B', 'H', 'Q', 'Y', 'V', 'G', 'F', 'J', 'Z', 'Ñ', 'X', 'K', 'W'];
let tries = 0;
let newRowUnhidden = false;
const wordToGuess = "elfas";

function suggestWord() {
    const rows = document.querySelectorAll('.row');
    const nextIncompleteRow = getNextIncompleteRow(rows);
  
    if (nextIncompleteRow) {
      const grayLetters = handleGray(rows);
      const orangeLettersAndPositions = handleGreenOrange('orange', rows);
      const greenLettersAndPositions = handleGreenOrange('green', rows);

      // Remove gray letters from the letterFrequency array
      letterFrequency = letterFrequency.filter(letter => !grayLetters.includes(letter));

      // Remove orange letters from the letterFrequency array
      for (const letter in orangeLettersAndPositions) {
        letterFrequency = letterFrequency.filter(freqLetter => freqLetter !== letter);
      }

      // Remove green letters from the letterFrequency array
      for (const letter in greenLettersAndPositions) {
        letterFrequency = letterFrequency.filter(freqLetter => freqLetter !== letter);
      }
  
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
        let prioritizedWords = validWords;
        if (tries <= 2) {
            prioritizedWords = prioritizeWordsByLetterFrequency(validWords, letterFrequency);
        }
        const randomWord = getRandomWord(prioritizedWords);
        fillRowWithWord(nextIncompleteRow, randomWord);
        focusFirstCellOfTopIncompleteRow();
        // console.log("Valid words: " + JSON.stringify(validWords));
        if (validWords.includes(wordToGuess)) {
          console.log(wordToGuess + " is present.")
        }

        // Update the words variable with the validWords variable
        words = validWords;
      }
      tries++;
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

function isRowColored(row) {
  return Array.from(row.querySelectorAll('.cell')).every(cell => cell.style.backgroundColor !== '');
}

function getRandomWord(words) {
    return words[Math.floor(Math.random() * words.length)];
}

function fillRowWithWord(row, word) {
  const cells = row.querySelectorAll('.cell');
  for (let i = 0; i < cells.length; i++) {
    cells[i].value = word[i].toUpperCase();
    cells[i].classList.add('filled');
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
  } else {
    const row = currentCell.parentElement;
    if (isRowFilled(row)) {
      console.log("We have filled the row.")
      row.querySelectorAll('.cell').forEach((cell) => {
        cell.classList.add('filled'); // Add the 'filled' class to the cell
      });
    }
  }
}

function unhideNextRow() {
  const rows = document.querySelectorAll('.row');
  for (const row of rows) {
    if (row.classList.contains('hidden')) {
      row.classList.remove('hidden');

      // Set focus on the first cell of the revealed row
      const firstCell = row.querySelector('.cell:not([disabled])');
      firstCell.focus();

      break;
    }
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
  });

  // Set focus on the first cell of the first row when the page is loaded
  setTimeout(() => {
    const firstCell = document.querySelector('.row:not(.hidden) .cell:not([disabled])');
    if (firstCell) {
      firstCell.focus();
    }
  }, 10);

});
  
function cycleCellColor(event) {
  const cell = event.target;
  const row = cell.parentElement;

  // Check if the row is complete and the cell is not disabled
  if (isRowFilled(row) && !cell.disabled) {
    const currentColor = cell.style.backgroundColor;
    let newColor;

    // Cycle through the colors based on the current color
    if (currentColor === '') {
      newColor = 'gray';
    } else if (currentColor === 'gray') {
      newColor = 'orange';
    } else if (currentColor === 'orange') {
      newColor = 'green';
    } else {
      newColor = 'gray';
    }

    cell.style.backgroundColor = newColor;

    // Check if all cells in the row are colored and a new row has not been unhidden yet
    if (isRowColored(row) && !newRowUnhidden) {
      row.dataset.processed = true;
      unhideNextRow();
      newRowUnhidden = true;
    }

    // If a new row has been unhidden and the clicked cell is in the previous row,
    // refocus on the first cell of the new row after a short delay
    if (newRowUnhidden && !row.classList.contains('hidden')) {
      setTimeout(() => {
        const newRow = document.querySelector('.row:not(.hidden):not([data-processed])');
        if (newRow) {
          const firstCell = newRow.querySelector('.cell:not([disabled])');
          firstCell.focus();
        }
      }, 10);
    }
  }
}

function focusFirstCellOfTopIncompleteRow() {
  const rows = document.querySelectorAll('.row');
  let currentRow = getNextIncompleteRow(rows);

  if (currentRow) {
    const firstCell = currentRow.querySelector('.cell:not([disabled])');
    firstCell.focus();
    newRowUnhidden = false; // Reset the flag when focusing on the first cell of the new row
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

function prioritizeWordsByLetterFrequency(words, letterFrequency) {
    let filteredWords = [...words];

    for (let letter of letterFrequency) {
        let wordsWithLetter = filteredWords.filter(word => {
            let lowerWord = word.toLowerCase();
            for (let char of lowerWord) {
                let noDiacriticChar = removeDiacritics(char);
                if (noDiacriticChar === letter.toLowerCase()) {
                    return true;
                }
            }
            return false;
        });

        if (wordsWithLetter.length === 1) {
            return wordsWithLetter;
        } else if (wordsWithLetter.length > 0) {
            filteredWords = wordsWithLetter;
        }
    }

    return filteredWords;
}

function showNextRow() {
  const rows = document.querySelectorAll('.row');
  for (const row of rows) {
    if (row.classList.contains('hidden')) {
      row.classList.remove('hidden');
      break;
    }
  }
}