import { DataStore, getData, setData, UserData } from './dataStore';
import { createSession, deleteSession, verifySession } from './sessions';
import validator from 'validator';
import HTTPError from 'http-errors';
import crypto from 'crypto';

const minNameLength = 2;
const maxNameLength = 20;
const minPasswordLength = 8;
const minSuccessfulLogins = 1;
const minFailedPasswordsSinceLastLogin = 0;
const UNAUTHORIZED = 401;
const BAD_REQUEST = 400;

export interface ErrorReturn {
  error: string;
}

export interface UserDetailsResponse {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };
}

export interface AuthUserId {
  authUserId: number;
}

/**
 * Given an admin user's authUserId,
 * return details about the user.
 * "name" is the first and last name concatenated
 * with a single space between them.
 *
 * @param {number} authUserId
 * @returns {
 *      userId: number,
 *      name: string,
 *      email: string,
 *      numSucessfulLogins: number,
 *      numFailedPasswordsSinceLastLogin: number
 * }
 */
export function adminUserDetails(authUserId: number): UserDetailsResponse | ErrorReturn {
  const data: DataStore = getData();
  const user: UserData = data.users.find((user) => user.userId === authUserId);
  if (user === undefined) {
    throw HTTPError(UNAUTHORIZED, 'Invalid Token');
  }
  return {
    user: {
      userId: user.userId,
      name: user.nameFirst + ' ' + user.nameLast,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    },
  };
}

export function adminUpdateUserDetails(
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): UserDetailsResponse | Record<string, never> {
  const data: DataStore = getData();
  const objects = verifySession(token);
  if (objects === null) {
    throw HTTPError(UNAUTHORIZED, 'Invalid Token');
  }
  if (validEmail(email) === false ||
      validName(nameFirst) === false ||
      validName(nameLast) === false ||
      data.users.some((user) => user.email === email && user.userId !== objects.userId) === true) {
    throw HTTPError(BAD_REQUEST, 'Does not meet the naming convention policies');
  }
  const user: UserData = data.users.find((user) => user.userId === objects.userId);
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);
  return {};
}

export function adminUpdateUserPassword(token: string, oldPassword: string, newPassword: string): Record<string, never> {
  const data: DataStore = getData();
  const objects = verifySession(token);
  if (objects === null) {
    throw HTTPError(UNAUTHORIZED, 'Invalid Token');
  }
  // need to also check / store old passords
  const hashedOldPassword = hashPlaintext(oldPassword); // hashed_password, how to compare to other hashed_passwords
  if (
    objects.password !== hashedOldPassword ||
    oldPassword === newPassword ||
    passwordPolicy(newPassword) === false
  ) {
    throw HTTPError(BAD_REQUEST, 'Bad password');
  }
  const hashedNewPassword = hashPlaintext(newPassword);
  const user: UserData = data.users.find((user) => user.userId === objects.userId);
  if (user.past_password.some(p => p.password === hashedNewPassword) === true) {
    throw HTTPError(BAD_REQUEST, 'password has been used before');
  }
  user.past_password.push({
    password: hashedNewPassword
  });

  user.password = hashedNewPassword;
  setData(data);
  return {};
}

/**
 * This function when given a registered user's email and password returns their
 * authUserId value.
 *
 * @param {string} email - registered email address
 * @param {string} password - valid password
 * @returns {{authUserId: number}}
 */
export function adminAuthLogin(email: string, password: string): AuthUserId | ErrorReturn {
  const dataStore: DataStore = getData();
  const hashedPassword = hashPlaintext(password);
  for (const users of dataStore.users) {
    if (users.email === email) {
      if (users.password === hashedPassword) {
        users.numSuccessfulLogins++;
        users.numFailedPasswordsSinceLastLogin = minFailedPasswordsSinceLastLogin;
        setData(dataStore);
        return {
          authUserId: users.userId,
        };
      } else {
        users.numFailedPasswordsSinceLastLogin++;
        setData(dataStore);
      }
    }
  }

  return {
    error: 'error'
  };
}

/**
 * This function registers a user with an email, password, first name, last name
 * ,and then returns their authUserId value.
 *
 * @param {string} email - email address to be registered
 * @param {string} password - password to be used for the registered email
 * @param {string} nameFirst - first name
 * @param {string} nameLast - last name
 * @returns {{authUserId: number}}
 */
export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): AuthUserId | ErrorReturn {
  const dataStore: DataStore = getData();

  if (
    duplicateEmail(dataStore, email) === true ||
    validEmail(email) === false ||
    validName(nameFirst) === false ||
    validName(nameLast) === false ||
    passwordPolicy(password) === false
  ) {
    return { error: 'An error has occured whilst trying to register a user' };
  }

  let id = 0;
  // checking if id already exists
  while (dataStore.users.some(user => user.userId === id)) {
    id++;
  }
  const hashedPassword = hashPlaintext(password);
  dataStore.users.push({
    userId: id,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: hashedPassword,
    numSuccessfulLogins: minSuccessfulLogins,
    numFailedPasswordsSinceLastLogin: minFailedPasswordsSinceLastLogin,
    past_password: [{
      password: hashedPassword
    }]
  });

  createSession(id);
  setData(dataStore);
  return {
    authUserId: id,
  };
}
/**
 * Logs out user by deleting token session
 *
 * @param {string} token - sessionId
 * @returns {{}} - empty object
 */
export function adminAuthLogout(token: string): Record<string, never> {
  if (deleteSession(token)) {
    return {};
  }
  throw HTTPError(UNAUTHORIZED, 'Invalid Token');
}
/**
 * Checks if email that is going to be registered already exists in the
 * dataStore
 *
 * @param {object} dataStore - data store object
 * @param {string} email - email address
 * @returns {{boolean}}
 */
function duplicateEmail(dataStore: DataStore, email: string): boolean {
  return dataStore.users.some(user => user.email === email);
}

/**
 * Checks if email meets the email policy criteria
 *
 * @param {string} email - email address
 * @returns {{boolean}}
 */
function validEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Checks if first name or the last name meets the naming policy criteria
 *
 * @param {string} name - first name or the last name
 * @returns {{boolean}}
 */
function validName(name: string): boolean {
  const pattern = /^([ \u00c0-\u01ffa-zA-Z'])+$/;
  return pattern.test(name) && (name.length >= minNameLength) && (name.length <= maxNameLength);
}

/**
 * Checks if the password meets the password policy
 *
 * @param {string} password - first name or the last name
 * @returns {{boolean}}
 */
function passwordPolicy(password: string): boolean {
  const pattern = /^(?=.*[a-zA-Z])(?=.*\d).+/;
  return pattern.test(password) && (password.length >= minPasswordLength);
}

/**
 * Fetches a user by their user ID.
 * @param {number} userId - The user's ID.
 * @returns {UserData} - UserData.
 */
export function getUserById(userId: number): UserData {
  const dataStore: DataStore = getData();
  return dataStore.users.find(user => user.userId === userId);
}

/**
 * Hashes a string with sha256 encryption
 * @param {string} plaintext - The user's ID.
 * @returns {hashed_text} - UserData.
 */
export function hashPlaintext(plaintext: string): string {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}
