import { requestAdminAuthRegister } from './adminAuth.test';
import { requestAdminQuizCreate, requestAdminQuizRemove } from './adminQuiz.test';
import { requestClear } from './other.test';
import { requestHelper } from './requestHelper';
import HTTPError from 'http-errors';

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;

beforeEach(() => {
  requestClear();
});

export function requestAdminQuizTrash(token: string) {
  return requestHelper('GET', '/v2/admin/quiz/trash', {}, { token });
}

export function requestAdminQuizRestore(token: string, quizId: number) {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/restore`, {}, { token });
}

export function requestAdminQuizEmpty(token: string, quizIdArray: number[]) {
  const quizIds = encodeURIComponent(JSON.stringify(quizIdArray));
  return requestHelper('DELETE', '/v2/admin/quiz/trash/empty', { quizIds }, { token });
}

describe('requestAdminQuizTrash', () => {
  let user: any;
  let quiz: any;
  beforeEach(() => {
    user = requestAdminAuthRegister('hanoof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    quiz = requestAdminQuizCreate(user.token, 'Math Test', 'Tests mental maths');
  });

  test('1. Nothing inside trash', () => {
    expect(requestAdminQuizTrash(user.token)).toStrictEqual({ quizzes: [] });
  });
  test('2. invalid token', () => {
    expect(() => requestAdminQuizTrash(user.token + 'invalid')).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('3. empty token', () => {
    expect(() => requestAdminQuizTrash('')).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('4. Stuff in trash', () => {
    const quiz1 = requestAdminQuizCreate(user.token, 'newQuiz', '');
    const quiz2 = requestAdminQuizCreate(user.token, 'second quiz', 'qwer');
    const quiz3 = requestAdminQuizCreate(user.token, 'hello', 'abcd');
    requestAdminQuizRemove(user.token, quiz.quizId);
    requestAdminQuizRemove(user.token, quiz1.quizId);
    requestAdminQuizRemove(user.token, quiz2.quizId);
    requestAdminQuizRemove(user.token, quiz3.quizId);
    const res = requestAdminQuizTrash(user.token);
    const quizzesSet = new Set(res.quizzes);
    const expected = new Set([
      { quizId: quiz.quizId, name: 'Math Test' },
      { quizId: quiz1.quizId, name: 'newQuiz' },
      { quizId: quiz2.quizId, name: 'second quiz' },
      { quizId: quiz3.quizId, name: 'hello' }
    ]);
    expect(quizzesSet).toStrictEqual(expected);
  });
});

describe('requestAdminQuizRestore', () => {
  let user: any;
  let quiz: any;
  beforeEach(() => {
    user = requestAdminAuthRegister('hanoof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    quiz = requestAdminQuizCreate(user.token, 'newQuiz', 'Tests mental maths');
  });
  test('1. name of the restored quiz is already used by another active quiz', () => {
    requestAdminQuizRemove(user.token, quiz.quizId);
    requestAdminQuizCreate(user.token, 'newQuiz', 'qrqwerqwerwerw');
    expect(() => requestAdminQuizRestore(user.token, quiz.quizId)).toThrowError(HTTPError[BAD_REQUEST]);
  });
  test('2. quiz id refers to quiz that is not currently in the trash', () => {
    expect(() => requestAdminQuizRestore(user.token, quiz.quizId)).toThrowError(HTTPError[BAD_REQUEST]);
  });
  test('3. user does not own quiz', () => {
    const user2 = requestAdminAuthRegister('langkee.hong@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    requestAdminQuizRemove(user.token, quiz.quizId);
    expect(() => requestAdminQuizRestore(user2.token, quiz.quizId)).toThrowError(HTTPError[FORBIDDEN]);
  });
  test('4. token is empty', () => {
    requestAdminQuizRemove(user.token, quiz.quizId);
    expect(() => requestAdminQuizRestore('', quiz.quizId)).toThrowError(HTTPError[UNAUTHORIZED]);
  });
  test('5. token is invalid', () => {
    requestAdminQuizRemove(user.token, quiz.quizId);
    expect(() => requestAdminQuizRestore(user.token + 'invalid', quiz.quizId)).toThrowError(HTTPError[UNAUTHORIZED]);
  });
  test('6. ok', () => {
    requestAdminQuizRemove(user.token, quiz.quizId);
    expect(requestAdminQuizRestore(user.token, quiz.quizId)).toStrictEqual({});
  });
});

describe('requestAdminQuizEmpty', () => {
  let user: any;
  let quiz: any;
  beforeEach(() => {
    user = requestAdminAuthRegister('hanoof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    quiz = requestAdminQuizCreate(user.token, 'Math Test', 'Tests mental maths');
  });
  test('1. not a valid quiz', () => {
    requestAdminQuizRemove(user.token, quiz.quizId);
    expect(() => requestAdminQuizEmpty(user.token, [quiz.quizId + 1])).toThrowError(HTTPError[FORBIDDEN]);
  });
  test('2. not currently in the trash', () => {
    expect(() => requestAdminQuizEmpty(user.token, [quiz.quizId])).toThrowError(HTTPError[BAD_REQUEST]);
  });
  test('3. Invalid Token', () => {
    requestAdminQuizRemove(user.token, quiz.quizId);
    expect(() => requestAdminQuizEmpty(user.token + 'invalid', [quiz.quizId])).toThrowError(HTTPError[UNAUTHORIZED]);
  });
  test('4. user does not own quiz', () => {
    const user2 = requestAdminAuthRegister('langkee.hong@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    expect(() => requestAdminQuizEmpty(user2.token, [quiz.quizId])).toThrowError(HTTPError[FORBIDDEN]);
  });
  test('5. ok', () => {
    requestAdminQuizRemove(user.token, quiz.quizId);
    expect(requestAdminQuizEmpty(user.token, [quiz.quizId])).toStrictEqual({});
  });
  test('6. ok x3', () => {
    requestAdminQuizCreate(user.token, 'newQuiz', '');
    const quiz2 = requestAdminQuizCreate(user.token, 'second quiz', 'qwer');
    const quiz3 = requestAdminQuizCreate(user.token, 'hello', 'abcd');
    requestAdminQuizRemove(user.token, quiz.quizId);
    requestAdminQuizRemove(user.token, quiz2.quizId);
    requestAdminQuizRemove(user.token, quiz3.quizId);
    expect(requestAdminQuizEmpty(user.token, [quiz.quizId, quiz2.quizId, quiz3.quizId])).toStrictEqual({});
  });
});
