# GodMode (working title)

## This is a Django project for a website hosting a collection of apps that help people win (or be more efficient at) playing various online games.

## Specification

- **Multi-Language Support:** The site must support different languages across all apps in the project.

    - The language should be chosen automatically based on the "Accept-Language" header of the user's browser.
    - The user should be able to choose a different language at any time with a language switcher.
    - Each individual app on the site should have its own set of translation files (.po and .mo) for easier scalabilty.

- **Palabra del Dia Solver:** The app helps guess the word of the day provided by a popular third-party application.

    - The app has a reasonably full list of Spanish 5-letter words, including those with diacritics, plus personal names.
    - At each step, it randomly suggests a word from the list based on the user's feedback (if provided).
    - The user is able to provide (manually type in) from 1 to 5 words (with feedback) before asking the app to suggest the next word.
    - The user provides feedback in the same manner as the original application - by color-coding the cells containing the letters of a suggested (or manually typed-in) word. The logic is as follows:
        - **Gray** means the letter mustn't be present in the suggested word.
        - **Orange** means that at least one instance of the letter must be present in the suggested word but it mustn't be in this particular position.
        - **Green** means that the letter must be present in the suggested word in this exact position.
    - Since the words are stored in the list in their original form, i.e. most are **lowercase** but some (personal names) start with a capital letter and some (acronyms) are all capitalized while the app displays the words in **uppercase**, it should handle this part of the logic without errors.
    - Since some of the words contain **diacritic symbols** but the original application ignores them, the app should handle this part of the logic without errors.
    - The efficiency of word-guessing should be increased by giving priority to words that include more frequently occurring letters.
    - The rows should appear one after another, whenever the current one is filled with letters and colored. The focus should be put in the first cell of the newly displayed row.
    - Once the row is filled with words, the cursor, when hovering over its cells, should change to "hand" **and the focus should disappear from the last cell**.
    - Onscreen instructions suggesting the next action to the user must appear under each new row and change accordingly. To draw the user's attention, the instructions should appear as if they're typed. **In case of inactivity for more than 1.5s, the typing behavior should repeat.**
    - **Besides one suggested word, the user should be given an option of seeing other words that satisfy the conditions.**