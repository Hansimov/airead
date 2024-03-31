# AIRead

An AI-assisted reading script in browsers.

![](https://img.shields.io/github/v/release/hansimov/airead?label=AIRead&color=blue&cacheSeconds=60)

## Demos

Latest updates and demos would be posted on Bilibili:

- v0.1 (2024-03-22):
  - https://www.bilibili.com/video/BV1DA4m1P741
  - First working version
- v0.3 (2024-03-24):
  - https://www.bilibili.com/video/BV1LC411t7LK
  - Extract equations and references in paragraphs of ar5iv HTML
- v0.4 (2024-03-29):
  - https://www.bilibili.com/video/BV1Fm411C74T
  - Auto select longer and more relevant contexts by the hierarchy of doc tree nodes
- v0.5 (2024-03-31):
  - https://www.bilibili.com/video/BV1eJ4m1L7z9
  - Render Markdown and LaTeX formulas

## For Users

For most users, click and install is all you need:

- [<code>stable/airead.user.js</code>](https://github.com/Hansimov/airead/raw/main/stable/airead.user.js)

As this script would request cross-origin resources (fetch js modules and post request to LLM endpoint), you need to grant the permission:

- Click "Always allow all domains"
- Click "OK"

![](./assets/install.png)

## For Developers

For developers, you might care about what these files do:

- <code><b>stable</b>/airead.user.js</code>
  - stable release

- <code><b>stable</b>/airead_module.user.js</code>
  - module script for stable version
  - released with stable version together

- <code><b>dev</b>/airead.user.js</code>
  - dev version
  - used in development
- <code><b>dev</b>/airead_module.user.js</code>
  - dev version of module script
  - used in development
