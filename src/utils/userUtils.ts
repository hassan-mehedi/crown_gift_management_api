/**
 * Remove sensitive information from user object
 * @param user User object with sensitive information
 * @returns User object without sensitive information
 */
export const removeSensitiveInfo = <T extends { password?: string }>(user: T): Omit<T, "password"> => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
