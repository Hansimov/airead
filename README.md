# AIRead
An AI-assisted reading script in browsers.

## For Users

For most users, click and install is all you need:

- [<code>airead.stable.user.js</code>](https://github.com/Hansimov/airead/raw/main/airead.stable.user.js)

As this script would request cross-origin resources (fetch js modules and post request to LLM endpoint), you need to grant the permission:

- Click "Always allow all domains"
- Click "OK"

![](./assets/install.png)

## For Developers

For developers, you might care about what these files do:

- <code>airead.<b>stable</b>.user.js</code>
  - stable release

- <code>airead_module.<b>stable</b>.user.js</code>
  - module script for stable version
  - released with stable version together

- <code>airead.<b>dev</b>.user.js</code>
  - dev version
  - used in development
- <code>airead_module.<b>dev</b>.user.js</code>
  - dev version of module script
  - used in development
