const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res,next)).cstch(next);

module.exports = asyncHandler;