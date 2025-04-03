const getIP = (req) => {
    const xForwardedFor = req.headers["x-forwarded-for"];
    return xForwardedFor ? xForwardedFor.split(",")[0].trim() : req.connection.remoteAddress;
};

module.exports = { getIP };