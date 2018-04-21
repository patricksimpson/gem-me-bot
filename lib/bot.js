import slack from 'slack';
import env from 'node-env-file';
import _ from 'lodash';
import exists from 'node-file-exists';

if (exists('./.env')) {
  env('./.env');
}

let bot = slack.rtm.client();
let token = process.env.SLACK_TOKEN;
let botName = 'gem-me-bot';
var users = [];

function _getUser(userMap, id) {
  return users[_.findIndex(userMap, function(o) { return o.id == id; })];
}

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
    bot: 'gem-me-bot'
  },
  {
    name: 'TIL',
    reaction: 'lightbulb',
    channel: '#til',
    bot: 'til-bot'
  }
];

// respond to the `reaction_added` event.
bot.reaction_added(function(e) {
  var channel = '',
      gemUserId = '',
      minerUserId = '',
      ts = '',
      gemUser = null,
      minerUser = null;

  if (e.item.type === 'message') {

    const details = {channel: e.item.channel, ts: e.item.ts, gemUserId: e.item_user, minerUserId: e.user};
    const which = TYPES.find( type => { return type.reaction === e.reaction });
    console.log(which);
    if (which) {
      gemMessage(which, details);
    }

    function gemMessage(type, { channel, ts, gemUserId, minerUserId }) {
      gemUser = _getUser(users, gemUserId);
      minerUser = _getUser(users, minerUserId);
      console.log(`A ${type.name} was found!`);

      slack.channels.history({token, channel}, function (err, data) {
        _.forEach(data, function(messages) {
          _.forEach(messages, function(message) {
            var text = '',
                count = 0;
            if (message.reactions) {
              for(var i= 0; i < message.reactions.length; i++) {
                if (message.reactions[i].name === type.reaction) {
                  count = message.reactions[i].count; // How many times?
                }
              }
              if (message.ts == ts && message.user == gemUserId && gemUser.name !== 'gem-me-bot' && count === 1) {
                text = `${minerUser.name}: "${message.text}" \n- @${gemUser.name}`
                slack.chat.postMessage({token: token, channel: type.channel, text: text, as_user: true, username: type.bot}, function(err, data) {
                  console.log(`sent a ${type.name} message to ${type.channel} channel.`);
                });
              }
            }
          });
        });
      });
    }

  }
});

// start listening to the slack team associated to the token
bot.listen({token:token});
