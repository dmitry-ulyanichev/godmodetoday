let letterFrequency = ['E', 'A', 'O', 'S', 'N', 'R', 'I', 'L', 'D', 'U', 'T', 'C', 'M', 'P', 'B', 'H', 'Q', 'Y', 'V', 'G', 'F', 'J', 'Z', 'Ñ', 'X', 'K', 'W'];
let tries = 0;
let newRowUnhidden = false;
let textAnimationTimeout = null;
const isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;

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
      animateText('none-left', 0, animateRow);
      updateButton();
      document.getElementById('more-options').classList.add('hidden');
    } else {
      let prioritizedWords = validWords;
      if (tries <= 2) {
          prioritizedWords = prioritizeWordsByLetterFrequency(validWords, letterFrequency);
      }
      const randomWord = getRandomWord(prioritizedWords);
      fillRowWithWord(nextIncompleteRow, randomWord);
      updateSuggestButton(true);
      if (nextIncompleteRow.getAttribute('id') != 'row6') {
        resetNewRowUnhidden();

        // Display other options
        if (validWords.length > 1 && validWords.length <= 100) {
          displayWords(validWords, randomWord);
        }

        // Update the words variable with the validWords variable
        words = validWords;
      } else {
        updateButton(); // Game Over. The button changes to "Try Again?"
        document.getElementById('more-options').classList.add('hidden');
      }
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

  // Update the instructions text but first check if it isn't the last row
  let messageID = '';
  if (row.getAttribute('id') != 'row6') {
    messageID = 'color';
  } else {
    messageID = 'game-over';
  }

  // Change the background to green for letters that are in place based on the previous feedback
  prefillGreens(row);

  animateText(messageID, 0, animateRow);

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

function prefillGreens(row) {
  // 1. Select relevant rows as previous siblings to the current row and call handleGreenOrange on them
  const siblingRows = [];

  let siblingRow = row.previousElementSibling;
  while (siblingRow) {
    siblingRows.push(siblingRow);
    siblingRow = siblingRow.previousElementSibling;
  }
  const greenLettersAndPositions = handleGreenOrange('green', siblingRows);

  // 2. Check if the letters in the new row are placed correctly and change their background to green
  const cells = row.querySelectorAll('.cell');
  for (let i = 0; i < cells.length; i++) {
    const letter = removeDiacritics(cells[i].value).toUpperCase();
    if (greenLettersAndPositions[letter] && greenLettersAndPositions[letter].includes(i)) {
      cells[i].style.backgroundColor = 'green';
      cells[i].style.color = 'white';
    }
  }
}
  
function moveFocusToNextCell(event) {
  const currentCell = event.target;
  currentCell.value = currentCell.value.toUpperCase(); // Convert the input value to uppercase

  const nextCell = currentCell.parentElement.querySelector('.cell:not([disabled])' + ':nth-child(' + (Array.from(currentCell.parentElement.children).indexOf(currentCell) + 2) + ')');

  if (nextCell) {
    nextCell.focus();
  } else {
    currentCell.blur(); // Removes focus from the last cell
    const row = currentCell.parentElement;
    if (isRowFilled(row)) {
      row.querySelectorAll('.cell').forEach((cell) => {
        cell.classList.add('filled'); // Add the 'filled' class to the cell
      });

      // Change the background to green for letters that are in place based on the previous feedback
      prefillGreens(row);

      // Disable the "Suggest a Word button"
      updateSuggestButton(true);

      // Update the instructions text
      animateText('color', 0, animateRow);

    }
  }
}

function unhideNextRow() {
  const rows = document.querySelectorAll('.row');
  for (const row of rows) {
    if (row.classList.contains('hidden')) {
      // Show instructions for the unhidden row
      animateText('type', 0, animateRow);

      row.classList.remove('hidden');
      row.classList.add('visible');

      // Set focus on the first cell of the revealed row (not on mobile phones)
      const firstCell = row.querySelector('.cell:not([disabled])');
      if (!isMobile) {
        firstCell.focus();
      }

      // Enable the "Suggest a Word" button
      updateSuggestButton(false);

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
        resetNewRowUnhidden();
      }
    });
    cell.addEventListener('click', cycleCellColor);
  });

  // Set focus on the first cell of the first row when the page is loaded
  const firstCell = document.querySelector('.row:not(.hidden) .cell:not([disabled])');
    if (firstCell && !isMobile) {
      firstCell.focus();
    }

  // Fill the last row with the selected option
  const wordSelect = document.getElementById('wordSelect');
  wordSelect.addEventListener("change", function() {
    const selectedValue = this.value;
    const row = document.querySelector(".row.visible:not([data-processed='true'])");
    fillRowWithWord(row, selectedValue);
  });
  
  // Animate the instructions text
  animateText('type', 0, animateRow);

  // Repeat onscreen instructions if the user is ianctive for more than 3 seconds
  let userLastInteractionTime = null;
  const gameDiv = document.getElementById("game");
  gameDiv.addEventListener("click", updateUserLastInteractionTime);
  gameDiv.addEventListener("keypress", updateUserLastInteractionTime);

  function updateUserLastInteractionTime() {
    userLastInteractionTime = new Date().getTime();
  }
  const INACTIVITY_THRESHOLD = 3000;

  function checkUserInactivity() {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - userLastInteractionTime;

    if (timeDifference >= INACTIVITY_THRESHOLD) {
      // Call your desired function here for user inactivity

      animateText("most-recent-instruction", 0, animateRow);
    }
  }

  setInterval(checkUserInactivity, 3000);

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
    
    cell.style.color = "white";
    
    cell.blur();

    // Check if all cells in the row are colored and a new row has not been unhidden yet
    if (isRowColored(row) && !newRowUnhidden) {
      row.dataset.processed = true;
      // Remove instructions from the previous row
      row.nextElementSibling.classList.add('hidden');
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
          if (!isMobile) {
            firstCell.focus();
          }
        }
      }, 10);
    }
  }
}

function resetNewRowUnhidden() {
  const rows = document.querySelectorAll('.row');
  let currentRow = getNextIncompleteRow(rows);
  if (currentRow) {
    newRowUnhidden = false;
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

function animateText(messageID, index, callback) {
  const instructionsElement = document.getElementById("instructions");
  const delay = 50;

  if (index === 0) { // Save the message as the most recent instruction and clear the old one when the function is first called
    const mostRecentInstructionElement = document.getElementById("most-recent-instruction");
    mostRecentInstructionElement.textContent = document.getElementById(messageID).textContent;
    instructionsElement.textContent = '';
  }
  const messageElementTextContent = document.getElementById(messageID).textContent;
  if (textAnimationTimeout) {
    clearTimeout(textAnimationTimeout);
  }

  if (index < messageElementTextContent.length) {
    instructionsElement.textContent += messageElementTextContent.charAt(index);
    index++;
    textAnimationTimeout = setTimeout(() => animateText(messageID, index, callback), delay);
  } else {
    // Check the message ID before calling the callback function
    if (callback && messageID != 'none-left' && messageID != 'game-over') {
      callback();
    }
  }
}

function animateRow() {
  const rows = document.querySelectorAll(".row.visible");
  const lastRow = rows[rows.length - 1];
  const cells = lastRow.querySelectorAll(".cell");

  cells.forEach((cell, index) => {
    setTimeout(() => {
      cell.classList.add("animate-on-action");
    }, index * 100); // Set a delay of 100ms between each cell
  });

  setTimeout(() => {
    cells.forEach((cell) => {
      cell.classList.remove("animate-on-action");
    });
  }, 1200); // Remove the animate-on-action class from all cells after 1.2 sec
}

function updateSuggestButton(isEnabled) {
  const suggestButton = document.getElementById("suggestButton");

  if (isEnabled) {
    suggestButton.classList.add("disabled-button");
    suggestButton.removeEventListener("click", suggestWord);
  } else {
    suggestButton.classList.remove("disabled-button");
    suggestButton.addEventListener("click", suggestWord);
  }
}

function updateButton() {
  const suggestButton = document.getElementById("suggestButton");
  suggestButton.textContent = document.getElementById('try-again').textContent;
  suggestButton.classList.remove("disabled-button");
  suggestButton.onclick = reloadPage;
}

function reloadPage() {
  location.reload();
}

function displayWords(words, wordToExclude) {
  document.getElementById('more-options').classList.remove('hidden');
  const wordSelect = document.getElementById("wordSelect");
  wordSelect.setAttribute("size", Math.min(Math.max(words.length-1, 2), 8));
  wordSelect.innerHTML = "";

  words.forEach((word) => {
    if (word != wordToExclude) {
      const option = document.createElement("option");
      const uppercasedWord = word.toUpperCase();
      option.value = uppercasedWord;
      option.textContent = uppercasedWord;

      wordSelect.appendChild(option);
    }
  });
}