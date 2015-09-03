function Location(location) {
    if (!location) {
        location = {};
    }
    this.location = location;
    this.longitude = location.longitude;
    this.latitude = location.latitude;
}

Location.prototype.getObjectFactory = function() {
    return this.location;
};

module.exports = Location;