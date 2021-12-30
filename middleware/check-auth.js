const jwt = require('jsonwebtoken');

const autorizacion = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Autorization: 'bearer TOKEN'
    if (!token) {
      throw new Error('Authentication error')
    }
    decodedTOKEN = jwt.verify(token, process.env.SECRET_KEY);
    req.userData = {
      userId: decodedTOKEN.userId
    };
    next();
  } catch (err) {
    const error = new Error('Authentication error');
    error.code = 401;
    return next(error);
  }
}

module.exports = autorizacion;