import jwt from 'jsonwebtoken';

export const generateToken = (userId: number) => jwt.sign({
    userId
}, 'thisisasecret', {
    expiresIn: '7 days'
});
