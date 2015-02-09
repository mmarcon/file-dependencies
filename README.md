#fileDependencies support for package.json

This module extends `package.json` with an additional property: `fileDependencies`.

With `fileDependencies` it is possible to express project dependencies based on files located somewhere else in the filesystem or avalaible somewhere on the internet.

If a node projects requires some additional libraries or binaries that do not come from NPM – maybe they are developed in other languages it is possible to fetch them as file dependencies.

#Example

    {
      "name": "file-dependencies",
      "version": "1.0.0",
      "author": "Massimiliano Marcon <me@marcon.me> (http://marcon.me)",
      "license": "MIT",
      "dependencies": {
        "q": "^1.1.2",
        "request": "^2.53.0",
        "file-dependencies": "1.0.0"
      },
      "fileDependencies": {
        "selenium-server-standalone.jar": "http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar",
      }
    }

With this `package.json` NPM will fetch the `file-dependencies` module, and then `selenium-server-standalone-2.43.1.jar` will be downloaded from the Selenium website and copied in `node_modules/file_dependencies`. The downloaded file will be named `selenium-server-standalone.jar`.

From the application it will be possible to use child process to instantiate the selenium server.