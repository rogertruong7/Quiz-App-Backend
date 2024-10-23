// Resets the state of the application backs to the start
// no parameters
import { setData, setTokens, setTrash } from './dataStore';

export function clear(): Record<string, never> {
  setData({
    users: [],
    quizzes: [],
  });
  setTrash({ quizzes: [] });
  setTokens({ tokenList: [] });
  return {};
}
