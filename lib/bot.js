import slack from 'slack';
import env from 'node-env-file';
import _ from 'lodash';
import exists from 'node-file-exists';
import respondToReactionAdded from './respondToReactionAdded';

if (exists('./.env')) {
  env('./.env');
}

let bot = slack.rtm.client();
let botName = 'gem-me-bot';
let token = process.env.SLACK_TOKEN;
let users = [];

const getUser = (userMap, id) => {
  return users[_.findIndex(userMap, function(o) { return o.id == id; })];
};

bot.started(function(payload) {
  console.log('Gem-bot started!');
  slack.users.list({token}, function(err, data) {
    users = _.map(data.members, function(member) {
      return {
        name: member.name,
        id: member.id
      };
    });
  });
});

const TYPES = [
  {
    name: 'GEM',
    reaction: 'gem',
    channel: '#-gems',
    bot: 'gembot',
    token: process.env.SLACK_TOKEN
  },
  {
    name: 'TIL',
    reaction: 'lightbulb',
    channel: '#til',
    bot: 'til-bot',
    token: process.env.TIL_TOKEN
  }
];

// respond to the `reaction_added` event.
bot.reaction_added(respondToReactionAdded(slack, token, TYPES, _.curry(getUser, users)));

// start listening to the slack team associated to the token
bot.listen({token:token});
