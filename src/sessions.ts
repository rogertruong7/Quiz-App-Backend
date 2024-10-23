import { DataStore, getData, Tokens, UserData, getTokens, setTokens, Token } from './dataStore';
import { v4 as uuidv4 } from 'uuid';

const notFound = -1;

/**
 * Creates sessionId and returns it
 *
 * @param {number} userId - unique user identifier
 * @returns {string} - unique session identifier (sessionId)
 */
export function createSession(userId: number): string {
  const data: DataStore = getData();
  const user: UserData = data.users.find((user) => user.userId === userId);
  if (user === undefined) {
    return null;
  }

  const tokens: Tokens = getTokens();
  const sessionId = uuidv4();

  tokens.tokenList.push({
    userId: userId,
    sessionId: sessionId,
    sessions: []
  });

  setTokens(tokens);
  return sessionId;
}

/**
 *Verifies the session and returns user of userId
 *
 * @param {string} sessionId - uuid for user session
 * @returns {{user: UserData}} - user object
 */
export function verifySession(sessionId: string): UserData | null {
  const tokens: Tokens = getTokens();
  const dataStore: DataStore = getData();
  const token: Token = tokens.tokenList.find(t => t.sessionId === sessionId);

  if (token === undefined) {
    return null;
  }

  const user: UserData = dataStore.users.find(u => u.userId === token.userId);

  if (user === undefined) {
    return null;
  }
  return user;
}
/**
 * logs out a user by removing their session.
 *
 * @param {string} sessionId - uuid session identifier.
 * @returns {boolean} - true or false
 */
export function deleteSession(sessionId: string): boolean {
  const tokens: Tokens = getTokens();
  const sessionIndex = tokens.tokenList.findIndex(t => t.sessionId === sessionId);

  if (sessionIndex === notFound) {
    return false;
  }

  tokens.tokenList.splice(sessionIndex, 1);
  setTokens(tokens);
  return true;
}

// made it a boolean for easier testing
