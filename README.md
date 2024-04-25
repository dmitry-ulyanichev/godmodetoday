# GodMode (working title)

## This is a Django project for a website hosting a collection of apps that help people win (or be more efficient at) playing various online games.

## Specification

- **Multi-Language Support:** The site must support different languages across all apps in the project.

    - The language should be chosen automatically based on the "Accept-Language" header of the user's browser.
    - The user should be able to choose a different language at any time with a language switcher.
    - Each app should have its own set of translation files (.po and .mo) for easier scalabilty.
