class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode;
    }
}

module.exports = ErrorResponse;