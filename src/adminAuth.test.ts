import request from 'sync-request-curl';
import { port, url } from './config.json';
import { requestClear } from './other.test';
import { requestAdminQuizCreate } from './adminQuiz.test';
import HTTPError from 'http-errors';
import { requestHelper } from './requestHelper';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };
const OK = 200;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;

beforeEach(() => {
  requestClear();
});

export function requestAdminAuthLogout(token: string) {
  return requestHelper('POST', '/v2/admin/auth/logout', {}, { token });
}

export function requestAdminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      }
    }
  );
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString()),
  };
}

export function requestAdminUpdateDetail(token: string, email: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/v2/admin/user/details', { email, nameFirst, nameLast }, { token });
}

export function requestAdminAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/login',
    {
      json: {
        email,
        password
      }
    }
  );
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString()),
  };
}

export function requestgetAdminUserDetails(token: string) {
  return requestHelper('GET', '/v2/admin/user/details', {}, { token });
}

export function requestAdminUpdatePassword(token: string, oldPassword: string, newPassword: string) {
  return requestHelper('PUT', '/v2/admin/user/password', { oldPassword, newPassword }, { token });
}

/* Usage would be response = requestAdminAuthRegister then expect(response.statusCode).toEqual(400)
and response.body to be equal authuserid */

describe('Testing adminAuthRegister', () => {
  test('1. Testing successful base url', () => {
    const request = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    expect(request.statusCode).toBe(OK);
    expect(request.body).toStrictEqual({ token: expect.any(String) });
  });

  test('2. Testing successful base url', () => {
    const request = requestAdminAuthRegister('tessa@outlook.com', 'ahjiggHi1345', 'Tessa', 'Mentis');
    expect(request.statusCode).toBe(OK);
    expect(request.body).toStrictEqual({ token: expect.any(String) });
  });

  test('1. Email address is used by another user', () => {
    requestAdminAuthRegister('tessa@outlook.com', 'ahhdjdJ12x', 'Teresa', 'Mentis');
    const request = requestAdminAuthRegister('tessa@outlook.com', 'ahjiggHi1345', 'Mechel', 'Mentis');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('2. Email address is used by another user', () => {
    requestAdminAuthRegister('jigmey@gmail.com', 'ahhxdjdJ12x', 'JIgmey', 'Dorjee');
    const request = requestAdminAuthRegister('jigmey@gmail.com', 'ahjiggHi1345', 'Tenzin', 'Dorjee');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('1. Email address does not satisfy the validator criteria, contains no @', () => {
    const request = requestAdminAuthRegister('jigmeygmail.com', 'ahjiggHi1345', 'Tenzin', 'Dorjee');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('1. First Name does not meet criteria, contains a $', () => {
    const request = requestAdminAuthRegister('jigmey@gmail.com', 'ahjiggHi1345', 'Te$nzin', 'Dorjee');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('1. Last name does not meet critera, contains a number', () => {
    const request = requestAdminAuthRegister('jigmey@gmail.com', 'ahjiggHi1345', 'Tenzin', 'Dorjee1');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('1. Password does not meet policy, less than 8 letters', () => {
    const request = requestAdminAuthRegister('jigmey@gmail.com', 'ahjigg', 'Tenzin', 'Dorjee1');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });
});

describe('Testing adminAuthLogin', () => {
  test('1. Testing successful login', () => {
    requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    const request = requestAdminAuthLogin('jigmeydorjee1169@outlook.com', 'ahjiHi1345');
    expect(request.statusCode).toBe(OK);
    expect(request.body).toStrictEqual({ token: expect.any(String) });
  });

  test('2. Testing successful login', () => {
    requestAdminAuthRegister('langkeehong@outlook.com', 'mourning123!', 'langkee', 'hong');
    const request = requestAdminAuthLogin('langkeehong@outlook.com', 'mourning123!');
    expect(request.statusCode).toBe(OK);
    expect(request.body).toStrictEqual({ token: expect.any(String) });
  });

  test('1. Testing Non-existant email to login', () => {
    requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    const request = requestAdminAuthLogin('george@outlook.com', 'ahjiHi1345');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('1. Testing wrong password to login', () => {
    requestAdminAuthRegister('takenking@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    const request = requestAdminAuthLogin('takenking@outlook.com', 'ccferrF1');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });
});

describe('Testing adminAuthRegister', () => {
  test('1. Testing successful base url', () => {
    const request = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    expect(request.statusCode).toBe(OK);
    expect(request.body).toStrictEqual({ token: expect.any(String) });
  });

  test('2. Testing successful base url', () => {
    const request = requestAdminAuthRegister('tessa@outlook.com', 'ahjiggHi1345', 'Tessa', 'Mentis');
    expect(request.statusCode).toBe(OK);
    expect(request.body).toStrictEqual({ token: expect.any(String) });
  });

  test('1. Email address is used by another user', () => {
    requestAdminAuthRegister('tessa@outlook.com', 'ahhdjdJ12x', 'Teresa', 'Mentis');
    const request = requestAdminAuthRegister('tessa@outlook.com', 'ahjiggHi1345', 'Mechel', 'Mentis');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('2. Email address is used by another user', () => {
    requestAdminAuthRegister('jigmey@gmail.com', 'ahhxdjdJ12x', 'JIgmey', 'Dorjee');
    const email = 'jigmey@gmail.com';
    const password = 'ahjiggHi1345';
    const nameFirst = 'Tenzin';
    const nameLast = 'Dorjee';
    const request = requestAdminAuthRegister(email, password, nameFirst, nameLast);
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('1. Email address does not satisfy the validator criteria, contains no @', () => {
    const request = requestAdminAuthRegister('jigmeygmail.com', 'ahjiggHi1345', 'Tenzin', 'Dorjee');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('1. First Name does not meet criteria, contains a $', () => {
    const request = requestAdminAuthRegister('jigmey@gmail.com', 'ahjiggHi1345', 'Te$nzin', 'Dorjee');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('1. Last name does not meet critera, contains a number', () => {
    const request = requestAdminAuthRegister('jigmey@gmail.com', 'ahjiggHi1345', 'Tenzin', 'Dorjee1');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });

  test('1. Password does not meet policy, less than 8 letters', () => {
    const request = requestAdminAuthRegister('jigmey@gmail.com', 'ahjigg', 'Tenzin', 'Dorjee1');
    expect(request.statusCode).toBe(BAD_REQUEST);
    expect(request.body).toStrictEqual(ERROR);
  });
});

describe('Testing /v1/admin/user/details', () => {
  test('1. Testing a successful update of properties for the logged in admin user', () => {
    // reuest automatically logs in
    const loggedIn = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    // login contains the token get it using logged_in.body.token
    expect(loggedIn.body).toStrictEqual({ token: expect.any(String) });
    const changedDetails = requestAdminUpdateDetail(loggedIn.body.token, 'jigmeydorjee1169@outlook.com', 'jake', 'dorjee');
    expect(changedDetails).toStrictEqual({});
    const userDetails = requestgetAdminUserDetails(loggedIn.body.token);
    expect(userDetails).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'jake dorjee',
        email: 'jigmeydorjee1169@outlook.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number)
      }

    });
    // call admin user detail endpoint
    // call expect on the output to check and status
  });

  test('2. Testing another successful update of  properties', () => {
    // reuest automatically logs in
    const loggedIn = requestAdminAuthRegister('langkeehong1@outlook.com', 'ahjiHi1345', 'langkee', 'hong');
    // login contains the token get it using logged_in.body.token
    expect(loggedIn.body).toStrictEqual({ token: expect.any(String) });
    const changedDetails = requestAdminUpdateDetail(loggedIn.body.token, 'mohitahmed@outlook.com', 'mohit', 'hong');
    expect(changedDetails).toStrictEqual({});
    const userDetails = requestgetAdminUserDetails(loggedIn.body.token);
    expect(userDetails).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'mohit hong',
        email: 'mohitahmed@outlook.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number)
      }

    });
    // call admin user detail endpoint
    // call expect on the output to check and status
  });

  test('1. Testing email is currently used by another user (excluding current authorized user', () => {
    // reuest automatically logs in
    const loggedIn = requestAdminAuthRegister('langkeehong1@outlook.com', 'ahjiHi1345', 'langkee', 'hong');
    requestAdminAuthRegister('jdorjee1@outlook.com', 'ahjiHi1345', 'Jigmey', 'Dorjee');
    // login contains the token get it using logged_in.body.token
    expect(loggedIn.body).toStrictEqual({ token: expect.any(String) });
    expect(() => requestAdminUpdateDetail(loggedIn.body.token, 'jdorjee1@outlook.com', 'langkee', 'hong')).toThrowError(HTTPError[BAD_REQUEST]);
  });

  test('1. email does not satisfy the validator package', () => {
    // reuest automatically logs in
    const loggedIn = requestAdminAuthRegister('langkeehong1@outlook.com', 'ahjiHi1345', 'langkee', 'hong');
    // login contains the token get it using logged_in.body.token
    expect(loggedIn.body).toStrictEqual({ token: expect.any(String) });
    expect(() => requestAdminUpdateDetail(loggedIn.body.token, 'langkeeoutlook.com', 'langkee', 'hong')).toThrowError(HTTPError[BAD_REQUEST]);
  });

  test('1. NameFirst is less than 2 characters or more than 20 characters', () => {
    // reuest automatically logs in
    const loggedIn = requestAdminAuthRegister('langkeehong1@outlook.com', 'ahjiHi1345', 'langkee', 'hong');
    // login contains the token get it using logged_in.body.token
    expect(loggedIn.body).toStrictEqual({ token: expect.any(String) });
    expect(() => requestAdminUpdateDetail(loggedIn.body.token, 'langkeeoutlook.com', 'l', 'hong')).toThrowError(HTTPError[BAD_REQUEST]);
  });

  test('1. Token is invalid', () => {
    // reuest automatically logs in
    const loggedIn = requestAdminAuthRegister('langkeehong1@outlook.com', 'ahjiHi1345', 'langkee', 'hong');
    // login contains the token get it using logged_in.body.token
    expect(loggedIn.body).toStrictEqual({ token: expect.any(String) });
    expect(() => requestAdminUpdateDetail('12313131313131', 'langkeehong1@outlook.com', 'langkee', 'hong')).toThrowError(HTTPError[UNAUTHORIZED]);
  });

  test('2. Token is empty', () => {
    // reuest automatically logs in
    const loggedIn = requestAdminAuthRegister('langkeehong1@outlook.com', 'ahjiHi1345', 'langkee', 'hong');
    // login contains the token get it using logged_in.body.token
    expect(loggedIn.body).toStrictEqual({ token: expect.any(String) });
    expect(() => requestAdminUpdateDetail('', 'langkeehong1@outlook.com', 'langkee', 'hong')).toThrowError(HTTPError[UNAUTHORIZED]);
  });
});

describe('Testing get admin user details', () => {
  test('1. Testing successful get admin user details', () => {
    const request = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    const token = request.body.token;
    const userDetails = requestgetAdminUserDetails(token);
    expect(userDetails).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'jigmey dorjee',
        email: 'jigmeydorjee1169@outlook.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('2. Testing successful get admin user details', () => {
    requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    const request = requestAdminAuthRegister('langkeehong@outlook.com', 'ahjiHi1345', 'langkee', 'hong');
    const token = request.body.token;
    const userDetails = requestgetAdminUserDetails(token);
    expect(userDetails).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'langkee hong',
        email: 'langkeehong@outlook.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('1. Testing invalid token', () => {
    requestAdminAuthRegister('langkeehong@outlook.com', 'ahjiHi1345', 'langkee', 'hong');
    expect(() => requestgetAdminUserDetails('1231232133132321331212')).toThrowError(HTTPError[UNAUTHORIZED]);
  });
});

describe('Testing adminAuthLogout', () => {
  test('1. Testing successful logout - removal of session', () => {
    const user = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee').body;
    requestAdminAuthLogout(user.token);
    expect(() => requestAdminQuizCreate(user.token, 'name', 'description')).toThrowError(HTTPError[UNAUTHORIZED]);
  });

  test('2. Testing successful logout - output', () => {
    const user = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee').body;
    const response = requestAdminAuthLogout(user.token);
    expect(response).toStrictEqual({});
  });

  test('3. Testing non-existent token', () => {
    expect(() => requestAdminAuthLogout('q')).toThrowError(HTTPError[UNAUTHORIZED]);
  });
});

describe('Testing admin update password', () => {
  test('1. Testing successful update of password', () => {
    const user = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    requestAdminUpdatePassword(user.body.token, 'ahjiHi1345', 'muhdaddy1!');
    requestAdminAuthLogout(user.body.token);
    const request = requestAdminAuthLogin('jigmeydorjee1169@outlook.com', 'muhdaddy1!');
    expect(request.statusCode).toBe(OK);
    expect(request.body).toStrictEqual({ token: expect.any(String) });
    const response = requestAdminAuthLogin('jigmeydorjee1169@outlook.com', 'ahjiHi1345!');
    expect(response.statusCode).toBe(BAD_REQUEST);
    expect(response.body).toStrictEqual(ERROR);
  });

  test('1. Old Password is not the correct old password', () => {
    const user = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    expect(() => requestAdminUpdatePassword(user.body.token, 'inorrecpassrr1231', 'muhdaddy1!')).toThrowError(HTTPError[BAD_REQUEST]);
  });

  test('2. Old Password and New Password match exactly', () => {
    const user = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345!', 'jigmey', 'dorjee');
    expect(() => requestAdminUpdatePassword(user.body.token, 'ahjiHi1345!', 'ahjiHi1345!')).toThrowError(HTTPError[BAD_REQUEST]);
  });

  test('3. New Password has already been used before by this user', () => {
    const user = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    requestAdminUpdatePassword(user.body.token, 'ahjiHi1345', 'vero123x!');
    expect(() => requestAdminUpdatePassword(user.body.token, 'vero123x!', 'ahjiHi1345')).toThrowError(HTTPError[BAD_REQUEST]);
  });

  test('4. New Password has already been used before by this user', () => {
    const user = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    requestAdminUpdatePassword(user.body.token, 'ahjiHi1345', 'vero123x!');
    requestAdminUpdatePassword(user.body.token, 'vero123x!', 'muther123!!');
    expect(() => requestAdminUpdatePassword(user.body.token, 'muther123!!', 'ahjiHi1345')).toThrowError(HTTPError[BAD_REQUEST]);
  });

  test('5. New Password does not contain at least one number and at least one letter ', () => {
    const user = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    expect(() => requestAdminUpdatePassword(user.body.token, 'ahjiHi1345', 'veroggjjsfjsdsfdx')).toThrowError(HTTPError[BAD_REQUEST]);
  });

  test('6. New Password is less than 8 characters', () => {
    const user = requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    expect(() => requestAdminUpdatePassword(user.body.token, 'ahjiHi1345', 'verog')).toThrowError(HTTPError[BAD_REQUEST]);
  });

  test('7. token is invalid', () => {
    requestAdminAuthRegister('jigmeydorjee1169@outlook.com', 'ahjiHi1345', 'jigmey', 'dorjee');
    expect(() => requestAdminUpdatePassword('1231323192491293123', 'ahjiHi1345', 'verog123!g')).toThrowError(HTTPError[UNAUTHORIZED]);
  });
});
