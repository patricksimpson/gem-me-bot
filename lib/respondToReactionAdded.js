import _ from 'lodash';

export default (slack, token, types, getUser) =>
  e => {
    var channel = '',
      gemUserId = '',
      minerUserId = '',
      ts = '',
      gemUser = null,
      minerUser = null;

    if (e.item.type === 'message') {

      const details = {channel: e.item.channel, ts: e.item.ts, gemUserId: e.item_user, minerUserId: e.user};
      const which = types.find( type => { return type.reaction === e.reaction; });
      if (which) {
        gemMessage(which, details);
      }

      function gemMessage(type, { channel, ts, gemUserId, minerUserId }) {
        gemUser = getUser(gemUserId);
        minerUser = getUser(minerUserId);
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
                  slack.chat.postMessage({token: type.token, channel: type.channel, text: text, as_user: true, username: type.bot}, function(err, data) {
                    console.log(`sent a ${type.name} message to ${type.channel} channel.`);
                  });
                }
              }
            });
          });
        });
      }

    }

  }

