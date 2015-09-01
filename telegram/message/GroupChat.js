/**
 * @link https://core.telegram.org/bots/api#groupchat
 * @param group
 * @constructor
 */
function GroupChat(group) {
    this.groupData = group;

    this.id = group.id;
    this.title = group.title;
}

module.exports = GroupChat;