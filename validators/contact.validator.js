function validateContact(data) {
    if (!data.name || data.name.length < 2) {
        return "Name is required";
    }

    if (!data.email || !data.email.includes("@")) {
        return "Valid email required";
    }

    if (!data.message || data.message.length < 5) {
        return "Message must be at least 5 characters";
    }

    return null;
}

module.exports = { validateContact };