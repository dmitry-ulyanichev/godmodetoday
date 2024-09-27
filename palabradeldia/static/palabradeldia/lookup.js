function addDictionaryButton(row, word) {
  // Remove any existing dictionary buttons
  const existingButtons = document.querySelectorAll('.dictionary-button');
  existingButtons.forEach(button => button.remove());

  // Create the dictionary button
  const dictionaryButton = document.createElement('button');
  dictionaryButton.innerHTML = '<i class="fas fa-search"></i>';
  dictionaryButton.classList.add('dictionary-button');

  // Position the button dynamically based on the width of the row
  row.style.position = 'relative';
  const rowWidth = row.offsetWidth;
  const lastCell = row.querySelector('.cell:last-child');
  const lastCellRight = lastCell ? lastCell.getBoundingClientRect().right : 0;
  const rowLeft = row.getBoundingClientRect().left;

  // Calculate the position of the button a little to the right of the last cell
  const buttonPosition = lastCellRight - rowLeft + 10; // 10px gap after the last cell

  dictionaryButton.style.position = 'absolute';
  dictionaryButton.style.left = `${buttonPosition}px`;
  dictionaryButton.style.top = '50%';
  dictionaryButton.style.transform = 'translateY(-50%)';

  // Add click event listener
  dictionaryButton.addEventListener('click', () => {
      showDictionarySection(row, word);
      dictionaryButton.style.display = 'none';
  });

  // Append the button to the row
  row.appendChild(dictionaryButton);

  dictionaryButton.classList.add('visible');
}

async function showDictionarySection(row, word) {
  const dictionarySection = document.createElement('div');
  dictionarySection.classList.add('dictionary-section');

  const closeButton = document.createElement('button');
  closeButton.textContent = 'X';
  closeButton.classList.add('close-button');
  closeButton.addEventListener('click', () => {
      dictionarySection.classList.remove('visible');
      setTimeout(() => {
          dictionarySection.remove();
          const dictionaryButton = row.querySelector('.dictionary-button');
          if (dictionaryButton) {
              dictionaryButton.style.display = 'block';
          }
      }, 300);
  });
  dictionarySection.appendChild(closeButton);

  const content = document.createElement('p');
  content.textContent = 'Loading dictionary content...';
  dictionarySection.appendChild(content);

  const rowsDiv = document.getElementById('rows');
  rowsDiv.parentNode.insertBefore(dictionarySection, rowsDiv.nextSibling);

  setTimeout(() => {
      dictionarySection.classList.add('visible');
  }, 10);

  try {
      const response = await fetch('/palabradeldia/api/dictionary/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken // Add the CSRF token here
          },
          body: JSON.stringify({ word: word })
      });

      if (response.ok) {
          const data = await response.json();
          content.innerHTML = data.content;  // Use innerHTML to render HTML content
      } else {
          content.textContent = 'Failed to load dictionary content. Please try again later.';
      }
  } catch (error) {
      content.textContent = 'An error occurred. Please try again later.';
  }
}

function removeDictionarySection() {
    const dictionarySection = document.querySelector('.dictionary-section');
    if (dictionarySection) {
        dictionarySection.classList.remove('visible');
        
        setTimeout(() => {
            dictionarySection.remove();
            
            // Make the dictionary button visible again
            const row = document.getElementById('rows');
            const dictionaryButton = row.querySelector('.dictionary-button');
            if (dictionaryButton) {
                dictionaryButton.style.display = 'block';
            }
        }, 300); // Match the transition duration
    }
}
