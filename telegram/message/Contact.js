function Contact(contact) {
    if (!contact) {
        contact = {};
    }
    this.contact = contact;
    this.phone_number = contact.phone_number;
    this.first_name = contact.first_name;

    if (contact.last_name) {
        this.last_name = contact.last_name;
    }
    if (contact.user_id) {
        this.user_id = contact.user_id;
    }
}

Contact.prototype.getObjectFactory = function() {
    return this.contact;
};