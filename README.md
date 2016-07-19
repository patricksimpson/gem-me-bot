# gem-me-bot
A slack bot, looking for #gems

This project uses the https://github.com/smallwins/slack library for slack RTM in node. 

## Install

clone or download, in the unpacked directory, run: `npm install`

### Setup

Create a `.env` file with your slack token.

    SLACK_TOKEN=YOUR_SLACK_TOKEN
    
Change your "gem" channel to the name of your `gems`. (e.g. `#gems`). 
    
## Run

`npm run start` or `babel-node lib/bot.js`

### Requirements

  - node 4+
  - npm 2+
  - babel

### Running forever:

`forever node_modules/babel-cli/bin/babel-node.js lib/bot.js`
