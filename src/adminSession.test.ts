import { requestClear } from './other.test';
import { requestHelper } from './requestHelper';
import HTTPError from 'http-errors';
import { requestAdminQuestionCreate, requestAdminQuizCreate, requestAdminStartSession } from './adminQuiz.test';
import { requestAdminAuthRegister } from './adminAuth.test';

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;

export interface AnswerData {
  answerId: number,
  answer: string,
  colour: string,
  correct: boolean,
}
export interface QuestionData {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: AnswerData[];
}

interface QuizMetadata {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: QuestionData[];
  duration: number;
  thumbnailUrl: string;
}

interface SessionBody {
  state: string;
  atQuestion: number;
  players: string[];
  metadata: QuizMetadata;
}

export interface AnswersBody {
  answer: string,
  correct: boolean,
}

export interface QuestionBody {
  question: string,
  duration: number,
  points: number,
  answers: AnswersBody[],
  thumbnailUrl: string,
}

beforeEach(() => {
  requestClear();
});

export function requestSessionStatus(token: string, quizid: number, sessionid: number) {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/session/${sessionid}`, {}, { token });
}

export function requestPlayerJoin(sessionId: number, name: string) {
  return requestHelper('POST', '/v1/player/join', { sessionId, name }, {});
}

export function requestPlayerStatus(playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}`, {}, {});
}

describe('requestSessionStatus Tests', () => {
  let testQuestionBody: QuestionBody, token: string, quizId: number, sessionId: number;
  beforeEach(() => {
    testQuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Your mom',
          correct: false
        }
      ],
      thumbnailUrl: 'https://pbs.twimg.com/profile_images/1042019157972320256/STolLU9B_400x400.jpg'
    };
    token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body.token;
    quizId = requestAdminQuizCreate(token, 'CoolQuiz', 'Okay').quizId;
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    sessionId = requestAdminStartSession(token, quizId, 1).sessionId;
    requestPlayerJoin(sessionId, 'Hayden');
  });
  test('1. Successful implementation of requestSessionStatus', () => {
    const responseObject: SessionBody = {
      state: 'LOBBY',
      atQuestion: 0,
      players: [
        'Hayden'
      ],
      metadata: {
        quizId: expect.any(Number),
        name: 'CoolQuiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Okay',
        numQuestions: 1,
        questions: [
          {
            questionId: expect.any(Number),
            question: 'Who is the Monarch of England?',
            duration: 4,
            thumbnailUrl: 'https://pbs.twimg.com/profile_images/1042019157972320256/STolLU9B_400x400.jpg',
            points: 5,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Prince Charles',
                colour: expect.any(String),
                correct: true,
              },
              {
                answerId: expect.any(Number),
                answer: 'Your mom',
                colour: expect.any(String),
                correct: false,
              }
            ]
          }
        ],
        duration: 4,
        thumbnailUrl: '',
      }
    };
    expect(requestSessionStatus(token, quizId, sessionId)).toStrictEqual(responseObject);
  });

  test('2. Token is not valid', () => {
    expect(() => requestSessionStatus('wrong', quizId, sessionId)).toThrow(HTTPError[UNAUTHORIZED]);
  });

  test('3. Valid token is provided, but user is not an owner of this quiz', () => {
    const newtoken = requestAdminAuthRegister('foonah@gmail.com', 'password1', 'foonah', 'neekkaM').body.token;
    expect(() => requestSessionStatus(newtoken, quizId, sessionId)).toThrow(HTTPError[FORBIDDEN]);
  });
  test('4. Session Id does not refer to a valid session within this quiz', () => {
    expect(() => requestSessionStatus(token, quizId, sessionId + 1)).toThrow(HTTPError[BAD_REQUEST]);
  });
});

describe('/v1/player/join', () => {
  let token: string;
  let quizId: number;
  let autoStartNum: number;
  let testQuestionBody: any;
  let sessionId: number;
  beforeEach(() => {
    token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    testQuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Your mom',
          correct: false
        }
      ],
      thumbnailUrl: 'https://pbs.twimg.com/profile_images/1042019157972320256/STolLU9B_400x400.jpg'
    };
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    sessionId = requestAdminStartSession(token, quizId, autoStartNum).sessionId;
    autoStartNum = 2;
  });
  // test('name entered is an empty string', () => {
  //   const regex: RegExp = /^[a-zA-Z]{5}(?:(?![a-zA-Z0-9]*([0-9])[a-zA-Z0-9]*\1)[a-zA-Z0-9]){3}$/;
  //   const playerId: number = requestPlayerJoin(sessionId, '').playerId;
  //   const players: string[] = requestAdminSessionStatus(quizId, sessionId, token).players;
  //   expect(regex.test(players[0])).toStrictEqual(true);
  // });
  // uncomment when /v1/admin/quiz/{quizid}/session/{sessionid} is completed
  test('successful output of player id', () => {
    expect(requestPlayerJoin(sessionId, 'Hide on bush').playerId).toStrictEqual(expect.any(Number));
  });
  test('Name of user is not unique', () => {
    requestPlayerJoin(sessionId, 'Hide on bush');
    expect(() => requestPlayerJoin(sessionId, 'Hide on bush')).toThrow(HTTPError[BAD_REQUEST]);
  });
  // test('session is not in LOBBY state', () => {
  //   requestPlayerJoin(sessionId, 'Hide on bush');
  //   requestAdminUpdateSessionState();
  //   expect(() => requestPlayerJoin(sessionId, 'Tyler1')).toThrow(HTTPError[BAD_REQUEST]);
  // });
  // uncomment after /v1/admin/quiz/{quizid}/session/{sessionid} is completed
});

describe('/v1/player/{playerId}', () => {
  let token: string;
  let quizId: number;
  let autoStartNum: number;
  let testQuestionBody: any;
  let sessionId: number;
  let playerId: number;
  beforeEach(() => {
    token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    testQuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Your mom',
          correct: false
        }
      ],
      thumbnailUrl: 'https://pbs.twimg.com/profile_images/1042019157972320256/STolLU9B_400x400.jpg'
    };
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    sessionId = requestAdminStartSession(token, quizId, autoStartNum).sessionId;
    playerId = requestPlayerJoin(sessionId, 'Hide on bush').playerId;
    autoStartNum = 2;
  });
  test('successful output of status', () => {
    expect(requestPlayerStatus(playerId)).toStrictEqual({
      state: 'LOBBY',
      numQuestions: 1,
      atQuestion: 0
    });
  });
  test('playerId does not exist', () => {
    expect(() => requestPlayerStatus(playerId + 1)).toThrow(HTTPError[BAD_REQUEST]);
  });
});
