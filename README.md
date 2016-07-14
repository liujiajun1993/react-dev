# react-dev
react development process
**A tool to build react project with less, gulp and webpack**

##　Command Line Usage
    $ npm install
### gulp dev
development environment, a nodeJS server will run and listen on 127.0.0.1:80. Any change in .less or .js file will trigger a auto-refresh in the browser.

### gulp deploy
deploy environment, the environment variable 'NODE_ENV' is set to 'production', leading a production react lib file. A nodeJS server will run and listen on 127.0.0.1:80.