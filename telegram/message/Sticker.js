function Sticker(sticker) {
    if (!sticker) {
        sticker = {};
    }
    this.sticker = sticker;
    this.file_id = sticker.file_id;
    this.width = sticker.width;
    this.height = sticker.height;
}

Sticker.prototype.getObjectFactory = function() {
    return this.sticker;
};