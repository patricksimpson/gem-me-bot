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
let gemsChannel = '#gems';
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

// respond to the `reaction_added` event.
bot.reaction_added(function(e) {
  var channel = '',
      gemUserId = '',
      minerUserId = '',
      ts = '',
      gemUser = null,
      minerUser = null;

  if (e.reaction === 'gem' && e.item.type === 'message') {

    channel = e.item.channel;
    ts = e.item.ts;
    gemUserId = e.item_user;
    minerUserId = e.user;

    gemUser = _getUser(users, gemUserId);
    minerUser = _getUser(users, minerUserId);

    console.log('A gem was spotted...');

    slack.channels.history({token, channel}, function (err, data) {
      _.forEach(data, function(messages) {
        _.forEach(messages, function(message) {
          var text = '';
          if (message.ts == ts && message.user == gemUserId) {
            text = minerUser.name + ': "' +  message.text + '" \n- @' + gemUser.name;
            slack.chat.postMessage({token: token, channel: gemsChannel, text: text, as_user: true, username: botName}, function(err, data) {
              console.log('sent gem message to ' + gemsChannel + ' channel.');
            });
          }
        });
      });
    });
  }
});

// start listening to the slack team associated to the token
bot.listen({token:token});
