import request from 'sync-request-curl';
import config from './config.json';

const port = config.port;
const url = config.url;

const SERVER_URL = `${url}:${port}`;

//  const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

export function requestClear() {
  const res = request('DELETE', SERVER_URL + '/v1/clear');
  return JSON.parse(res.body.toString());
}

describe('/v1/clear', () => {
  test('1. returns {}', () => {
    expect(requestClear()).toStrictEqual({});
  });
});
