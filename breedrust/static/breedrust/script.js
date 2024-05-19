let rowsUnhidden = 3;
let textAnimationTimeout = null;
const isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;

document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');

    cells.forEach(cell => {
        cell.addEventListener('input', event => {
            moveFocusToNextCell(event);
        });

        // Attach the click event listener to each cell
        cell.addEventListener('click', event => {
            // Check if the cell has the class 'filled' before calling cycleLetters
            if (event.target.classList.contains('filled')) {
                cycleLetters(event);
            }
        });
    });
  
    // Set focus on the first cell of the first row when the page is loaded
    setFocusOnFirstUnfilledCell();
    
    // Animate the instructions text
    animateText('type', 0, animateUnfilledRows);
  
    // Repeat onscreen instructions if the user is ianctive for more than 3 seconds
    let userLastInteractionTime = null;
    const simDiv = document.getElementById("simulator");
    simDiv.addEventListener("click", updateUserLastInteractionTime);
    simDiv.addEventListener("keypress", updateUserLastInteractionTime);
  
    function updateUserLastInteractionTime() {
      userLastInteractionTime = new Date().getTime();
    }
    const INACTIVITY_THRESHOLD = 3000;
  
    function checkUserInactivity() {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - userLastInteractionTime;
  
      if (timeDifference >= INACTIVITY_THRESHOLD) {
        // Call your desired function here for user inactivity
  
        animateText("most-recent-instruction", 0, animateUnfilledRows);
      }
    }
  
    setInterval(checkUserInactivity, 3000);
  
});

function setFocusOnFirstUnfilledCell() {
    const firstVisibleRow = document.querySelector(".row.visible:not(.row-filled)");
    const firstUnfilledCell = firstVisibleRow ? firstVisibleRow.querySelector(".cell:not(.filled):not([disabled])") : null;
  
    if (firstUnfilledCell && !isMobile) {
      firstUnfilledCell.focus();
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

function moveFocusToNextCell(event) {
    const currentCell = event.target;
    const inputValue = currentCell.value.toUpperCase();
    const allowedChars = /^[XWYGH]$/;
  
    // Add the animation class if the input value is not one of the allowed characters
    if (!allowedChars.test(inputValue)) {
      currentCell.classList.add("flash-red");
      setTimeout(() => {
        currentCell.classList.remove("flash-red");
      }, 300); // Remove the animation class after 300ms
      currentCell.value = "";
    } else {
      currentCell.value = inputValue;
      currentCell.classList.add('filled');
    }
  
    // Check if the current row is filled and mark the cells as filled
    const row = currentCell.parentElement;
    if (isRowFilled(row)) {
      row.classList.add("row-filled"); // Add the 'row-filled' class to the row
  
      // Enable the "Run Simulation" button if three rows are filled
      const filledRows = document.querySelectorAll(".row.visible.row-filled").length;
      if (filledRows >= 3) {
        const runSimButton = document.getElementById("runSimButton");
        runSimButton.classList.remove("disabled-button");
        runSimButton.addEventListener("click", runSimulation);
      }
  
      // Check and unhide the next row if necessary
      checkAndUnhideNextRow(row);
    }
  
    const nextCell = currentCell.parentElement.querySelector(
      ".cell:not([disabled])" + ":nth-child(" + (Array.from(currentCell.parentElement.children).indexOf(currentCell) + 2) + ")"
    );
  
    if (allowedChars.test(inputValue) && nextCell && !nextCell.value) {
    nextCell.focus();
  } else if (allowedChars.test(inputValue)) {
    // Set focus on the first cell of the next visible row if there's no next cell and the input value is valid
    setFocusOnFirstUnfilledCell();
  }
  }
  
  function checkAndUnhideNextRow(currentRow) {
    const lastVisibleRow = getLastVisibleRow();
  
    // If the last visible row is filled and there are still hidden rows, unhide the next row
    if (isRowFilled(lastVisibleRow) && rowsUnhidden < 30) {
      unhideNextRow(lastVisibleRow);
    } else {
        animateText('run', 0, animateUnfilledRows);
    }
  }
  
  function getLastVisibleRow() {
    const visibleRows = document.querySelectorAll(".row.visible");
    return visibleRows[visibleRows.length - 1];
  }
  

function unhideNextRow(currentRow) {
    const nextRow = currentRow.nextElementSibling;
    if (nextRow.classList.contains('hidden')) {
        // Show instructions for the unhidden row
        animateText('add-or-run', 0, animateUnfilledRows);

        nextRow.classList.remove('hidden');
        nextRow.classList.add('visible');

        rowsUnhidden++; // Increment the number of unhidden rows
    }

    // Set focus on the first cell of the revealed row (not on mobile phones)
    setFocusOnFirstUnfilledCell();
}

function getRowValues(row) {
    return Array.from(row.querySelectorAll('.cell')).map(cell => cell.value.toUpperCase());
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
      if (callback && messageID != 'none-left' && messageID != 'game-over' && messageID != 'one-word-left') {
        callback();
      }
    }
}

function animateUnfilledRows() {
    const rows = document.querySelectorAll(".row.visible");
  
    rows.forEach((row) => {
      if (!isRowFilled(row)) {
        const cells = row.querySelectorAll(".cell");
  
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
    });
}

function cycleLetters(event) {
    const cell = event.target;
    const row = cell.parentElement;
  
    // Check if the cell is not disabled
    if (!cell.disabled) {
        // Define a sequence of possible letters
        const letters = ['X', 'W', 'Y', 'G', 'H'];

        // Get the current value of the cell
        let currentValue = cell.value;

        // Find the index of the current value in the letters array
        const currentIndex = letters.indexOf(currentValue);

        // Calculate the index of the next letter in the sequence
        const nextIndex = (currentIndex + 1) % letters.length;

        // Set the next letter as the new value of the cell
        cell.value = letters[nextIndex];
        cell.classList.add("change-letter");
        setTimeout(() => {
            cell.classList.remove("change-letter");
        }, 300); // Remove the animation class after 300ms

        // Remove focus from the cell
        cell.blur();

        // If a new row has been unhidden and the clicked cell is in the previous row,
        // refocus on the first cell of the new row after a short delay
        if (!row.classList.contains('hidden')) {
            setTimeout(() => {
                setFocusOnFirstUnfilledCell();
            }, 10);
        }
    }
}

function runSimulation() {
  // Collect the form data
  var data = {};
  var rows = document.querySelectorAll('.row-filled');
  for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var cells = row.querySelectorAll('.cell');
      var sequence = '';
      for (var j = 0; j < cells.length; j++) {
          sequence += cells[j].value;
      }
      data[(i + 1).toString().padStart(2, '0')] = sequence;
  }

  // Send the data to the backend
  fetch(processGenesUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {

    // Extract the values (genes) from the data.results object
    const genes = data.results;
    console.log("Stringified object values: " + JSON.stringify(genes));

    const numGenes = Math.min(10, genes.length);
    const numGenesElement = document.getElementById('num-of-genes');
    numGenesElement.innerHTML = numGenes;

    // Display the result
    var resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');

    for (var i = 0; i < numGenes; i++) {
        var result = document.getElementById(`result${i}`);
        result.classList.remove('hidden');
        var gene = document.getElementById(`gene${i}`);
        
        // Clear previous content
        gene.innerHTML = '';
        
        for (var j = 0; j < genes[i].length; j++) {
            var charSpan = document.createElement('span');
            charSpan.innerHTML = genes[i][j];
            charSpan.classList.add('result-letter');
            
            // Apply class based on character
            if (['X', 'W', '*'].includes(genes[i][j])) {
                charSpan.classList.add('red');
            } else if (['Y', 'G', 'H'].includes(genes[i][j])) {
                charSpan.classList.add('green');
            }
            
            gene.appendChild(charSpan);
            
            // Add a dash after each character except the last one
            if (j < genes[i].length - 1) {
                var dashSpan = document.createElement('span');
                dashSpan.innerHTML = '-';
                gene.appendChild(dashSpan);
            }
        }
        
        var link = document.getElementById(`instructions-link-${i}`);
        link.setAttribute('href', `get_provenance/${genes[i]}`);
    }
  });
}

function getProvenance(gene) {
  const url = `get_provenance/${gene}`;

  fetch(url, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
      },
  })
  .then(response => response.json())
  .then(data => {
      // Display the provenance record in the console
      console.log(`Provenance for gene ${gene}:`, data.provenance);
  });
}
