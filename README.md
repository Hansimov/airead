# AIRead
An AI-assisted reading script in browsers.

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
