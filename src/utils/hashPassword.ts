import bcrypt from 'bcryptjs';

export const hashPassword = (password: string) => {
    if (password.length < 8)
        throw new Error('Password must be at least 8 characters long');

    return bcrypt.hash(password, 10);
}