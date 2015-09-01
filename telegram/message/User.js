/**
 * @link https://core.telegram.org/bots/api#user
 * @param userData
 * @constructor
 */
function User(userData) {
    this.userData = userData;

    this.id = userData.id;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name || '';
    this.username = userData.username || '';
}


/**
 * @param placeholder
 * @return {string} View name
 */
User.prototype.getViewName = function(placeholder) {
    placeholder = placeholder || '%f %l';
    return placeholder
        .replace('%f', this.first_name)
        .replace('%l', this.last_name)
        .trim();
};


/**
 * @return {string} Returns formatted username
 */
User.prototype.getAt = function() {
    return this.username.length ?
        '@' + this.username : '';
};

module.exports = User;