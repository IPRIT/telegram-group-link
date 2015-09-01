function Document(document) {
    if (!document) {
        document = {};
    }
    this.document = document;
    this.file_id = document.file_id;
}

Document.prototype.getObjectFactory = function() {
    return {
        file_id: this.file_id
    };
};