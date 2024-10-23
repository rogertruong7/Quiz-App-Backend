import { requestAdminAuthRegister } from './adminAuth.test';
import { requestClear } from './other.test';
import { requestHelper } from './requestHelper';
// import { requestPlayerJoin } from './adminSession.test';
import HTTPError from 'http-errors';

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;

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

export interface SubmitAnswerBody {
  answerIds: Array<number>;
}

export interface resultResponse {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

beforeEach(() => {
  requestClear();
});

export function requestAdminQuizInfo(token: string, quizid: number) {
  return requestHelper('GET', `/v2/admin/quiz/${quizid}`, {}, { token });
}

export function requestAdminQuizTransfer(quizId: number, token: string, userEmail: string) {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/transfer`, { userEmail }, { token });
}

export function requestPlayerQuestionInfo(playerid: number, questionposition: number) {
  return requestHelper('GET', `/v1/player/${playerid}/question/${questionposition}`, {}, {});
}

export function requestAdminQuestionDuplicate(quizid: number, questionid: number, token: string) {
  return requestHelper('POST', `/v2/admin/quiz/${quizid}/question/${questionid}/duplicate`, {}, { token });
}

export function requestAdminQuizDecriptionUpdate(token: string, quizid: number, description: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizid}/description`, { description }, { token });
}

export function requestAdminQuestionCreate(token: string, questionBody: QuestionBody, quizid: number) {
  return requestHelper('POST', `/v2/admin/quiz/${quizid}/question`, { questionBody }, { token });
}

export function requestAdminQuestionUpdate(token: string, questionId: number, questionBody: QuestionBody, quizId: number) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}`, { questionBody }, { token });
}

export function requestAdminQuizRemove(token: string, quizId: number) {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, {}, { token });
}

export function requestAdminQuizCreate(token: string, name: string, description: string) {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
}

export function requestAdminQuizList(token: string) {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token });
}

export function requestAdminQuizNameUpdate(token: string, quizid: number, name: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizid}/name`, { name }, { token });
}

export function requestAdminQuestionMove(token: string, questionid: number, quizid: number, newPosition: number) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizid}/question/${questionid}/move`, { newPosition }, { token });
}

export function requestAdminQuestionRemove(token: string, questionid: number, quizid: number) {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizid}/question/${questionid}`, {}, { token });
}

export function requestAdminThumbnailUpdate(imgUrl: string, token: string, quizId: number) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/thumbnail`, { imgUrl }, { token });
}

export function requestAdminStartSession(token: string, quizid: number, autoStartNum: number) {
  return requestHelper('POST', `/v1/admin/quiz/${quizid}/session/start`, { autoStartNum }, { token });
}

export function requestAdminViewSession(token: string, quizid: number) {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/sessions`, {}, { token });
}

export function requestPlayerSubmitAnswer(playerid: number, questionposition: number, answerId: SubmitAnswerBody) {
  return requestHelper('PUT', `/v1/player/${playerid}/question/${questionposition}/answer`, { answerId }, {});
}

export function requestPlayerQuestionResults(playerid: number, questionposition: number) {
  return requestHelper('PUT', `/v1/player/${playerid}/question/${questionposition}/results`, {}, {});
}

// describe('requestPlayerQuestionResults Tests', () => {
//   let testQuestionBody: QuestionBody, token: string, quizId: number, questionId, sessionId: number, actionObject, playerId: number;
//   beforeEach(() => {
//     testQuestionBody = {
//       question: 'Who is the Monarch of England?',
//       duration: 4,
//       points: 5,
//       answers: [
//         {
//           answer: 'Prince Charles',
//           correct: true
//         },
//         {
//           answer: 'Your mom',
//           correct: false
//         }
//       ],
//       thumbnailUrl: 'https://pbs.twimg.com/profile_images/1042019157972320256/STolLU9B_400x400.jpg'
//     };
//     token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body.token;
//     quizId = requestAdminQuizCreate(token, 'CoolQuiz', 'Okay').quizId;
//     questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
//     sessionId = requestAdminStartSession(token, quizId, 1).sessionId;
//     playerId = requestPlayerJoin(sessionId, "Hayden Smith").playerId;
//   });
//   test('1. Successful implementation of requestPlayerQuestionResults', () => {
//     const responseObject: resultResponse = {
//       questionId: expect.any(Number),
//       playersCorrectList: [
//         "Hayden Smith"
//       ],
//       averageAnswerTime: expect.any(Number),
//       percentCorrect: expect.any(Number),
//     };
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "SKIP_COUNTDOWN"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     const answerId = requestAdminQuizInfo(token, quizId).question[0].answer[0].answerId;
//     const submitAnswer: SubmitAnswerBody = {
//       answerIds: [
//         answerId
//       ]
//     }
//     requestPlayerSubmitAnswer(playerId, 1, submitAnswer);
//     actionObject = {
//       action: "GO_TO_ANSWER"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     expect(requestPlayerQuestionResults(playerId, 1)).toStrictEqual(responseObject);
//   });

//   test('2. Player ID does not exist', () => {
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "GO_TO_ANSWER"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     expect(() => expect(requestPlayerQuestionResults(playerId + 1, 1)).toThrow(HTTPError[BAD_REQUEST]));
//   });

//   test('3. question position is not valid for the session this player is in', () => {
//      actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "GO_TO_ANSWER"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     expect(() => expect(requestPlayerQuestionResults(playerId, 300)).toThrow(HTTPError[BAD_REQUEST]));
//   });

//   test('4. session is not currently on this question', () => {
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     testQuestionBody.question = 'goofy goober?'
//     requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "GO_TO_ANSWER"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     expect(() => expect(requestPlayerQuestionInfo(playerId, 1)).toThrow(HTTPError[BAD_REQUEST]));
//   });

//   test('5. Session is not in ANSWER_SHOW state', () => {
//     expect(() => expect(requestPlayerQuestionInfo(playerId, 1)).toThrow(HTTPError[BAD_REQUEST]));
//   });
// });

// describe('PlayerSubmitAnswer Tests', () => {
//   let testQuestionBody: QuestionBody, token: string, quizId: number, questionId, sessionId: number, actionObject, playerId: number;
//   beforeEach(() => {
//     testQuestionBody = {
//       question: 'Who is the Monarch of England?',
//       duration: 10,
//       points: 5,
//       answers: [
//         {
//           answer: 'Prince Charles',
//           correct: true
//         },
//         {
//           answer: 'Your mom',
//           correct: false
//         }
//       ],
//       thumbnailUrl: 'https://pbs.twimg.com/profile_images/1042019157972320256/STolLU9B_400x400.jpg'
//     };
//     token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body.token;
//     quizId = requestAdminQuizCreate(token, 'CoolQuiz', 'Okay').quizId;
//     questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
//     sessionId = requestAdminStartSession(token, quizId, 1).sessionId;
//     playerId = requestPlayerJoin(sessionId, "Hayden Smith").playerId;
//   });
//   test('1. Successful implementation of requestPlayerSubmitAnswer', () => {
//     const responseObject = {};
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "SKIP_COUNTDOWN"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);

//     const answerId = requestAdminQuizInfo(token, quizId).question[0].answer[0].answerId;
//     const submitAnswer: SubmitAnswerBody = {
//       answerIds: [
//         answerId
//       ]
//     }

//     expect(requestPlayerSubmitAnswer(playerId, 1, submitAnswer)).toStrictEqual(responseObject);
//     actionObject = {
//       action: "GO_TO_ANSWER"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     expect(requestPlayerQuestionResults(playerId, 1).playersCorrectList[0]).toStrictEqual("Hayden Smith");
//   });

//   test('2. Player ID does not exist', () => {
//      actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "SKIP_COUNTDOWN"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     const answerId = requestAdminQuizInfo(token, quizId).question[0].answer[0].answerId;
//     const submitAnswer: SubmitAnswerBody = {
//       answerIds: [
//         answerId
//       ]
//     }
//     expect(() => expect(requestPlayerSubmitAnswer(playerId + 1, 1, submitAnswer)).toThrow(HTTPError[BAD_REQUEST]));
//   });

//   test('3. question position is not valid for the session this player is in', () => {
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "SKIP_COUNTDOWN"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     const answerId = requestAdminQuizInfo(token, quizId).question[0].answer[0].answerId;
//     const submitAnswer: SubmitAnswerBody = {
//       answerIds: [
//         answerId
//       ]
//     }
//     expect(() => expect(requestPlayerSubmitAnswer(playerId, 400, submitAnswer)).toThrow(HTTPError[BAD_REQUEST]));
//   });

//   test('4. session is not yet up to this question', () => {
//     testQuestionBody.question = 'goofy goober?';
//     requestAdminQuestionCreate(token, testQuestionBody, quizId);

//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "SKIP_COUNTDOWN"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);

//     // we are on first question
//     // submitting into 2nd question answer
//     const answerId = requestAdminQuizInfo(token, quizId).question[1].answer[0].answerId;
//     const submitAnswer: SubmitAnswerBody = {
//       answerIds: [
//         answerId
//       ]
//     }
//     expect(() => expect(requestPlayerSubmitAnswer(playerId, 2, submitAnswer)).toThrow(HTTPError[BAD_REQUEST]));
//   });

//   test('5. Session is in QUESTION_OPEN state', () => {
//     // in lobby
//     const answerId = requestAdminQuizInfo(token, quizId).question[0].answer[0].answerId;
//     const submitAnswer: SubmitAnswerBody = {
//       answerIds: [
//         answerId
//       ]
//     }
//     expect(() => expect(requestPlayerSubmitAnswer(playerId, 1, submitAnswer)).toThrow(HTTPError[BAD_REQUEST]));
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     // in countdown
//     expect(() => expect(requestPlayerSubmitAnswer(playerId, 1, submitAnswer)).toThrow(HTTPError[BAD_REQUEST]));
//   });
//   test('6. Answer IDs are not valid for this particular question', () => {
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "SKIP_COUNTDOWN"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     const answerId = 1000000000000000000;
//     const submitAnswer: SubmitAnswerBody = {
//       answerIds: [
//         answerId
//       ]
//     }
//     expect(() => expect(requestPlayerSubmitAnswer(playerId, 1, submitAnswer)).toThrow(HTTPError[BAD_REQUEST]));
//   });
//   test('7. There are duplicate answer IDs provided', () => {
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "SKIP_COUNTDOWN"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     const answerId = requestAdminQuizInfo(token, quizId).question[0].answer[0].answerId;

//     const submitAnswer: SubmitAnswerBody = {
//       answerIds: [
//         answerId,
//         answerId,
//       ]
//     }
//     expect(() => expect(requestPlayerSubmitAnswer(playerId, 1, submitAnswer)).toThrow(HTTPError[BAD_REQUEST]));
//   });
//   test('8. Less than 1 answer ID was submitted', () => {
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     actionObject = {
//       action: "SKIP_COUNTDOWN"
//     };
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);

//     const submitAnswer: {
//          answerIds: []
//      };
//     requestPlayerSubmitAnswer(playerId, 1, submitAnswer);
//     expect(() => expect(requestPlayerSubmitAnswer(playerId, 1, submitAnswer)).toThrow(HTTPError[BAD_REQUEST]));
//   });
// });

describe('AdminQuizNameUpdate Tests', () => {
  test('1. Successful Name Update', () => {
    const token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const quiz = requestAdminQuizCreate(token.token, 'CoolQuiz', 'Okay');
    requestAdminQuizNameUpdate(token.token, quiz.quizId, 'FahimBhuiyan');
    expect(requestAdminQuizInfo(token.token, quiz.quizId).name).toStrictEqual('FahimBhuiyan');
  });

  test('2. Name contains invalid characters ', () => {
    const token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const quiz = requestAdminQuizCreate(token.token, 'CoolQuiz', 'Okay');

    expect(() => requestAdminQuizNameUpdate(token.token, quiz.quizId, '*#@$*(@#$(*%')).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('3. Name is less than 3 characters ', () => {
    const token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const quiz = requestAdminQuizCreate(token.token, 'CoolQuiz', 'Okay');

    expect(() => requestAdminQuizNameUpdate(token.token, quiz.quizId, 'ok')).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('4. Name is more than 30 characters ', () => {
    const token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const quiz = requestAdminQuizCreate(token.token, 'CoolQuiz', 'Okay');

    expect(() => requestAdminQuizNameUpdate(token.token, quiz.quizId, 'm'.repeat(31))).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('5. Name is already used by the current logged in user for another quiz ', () => {
    const token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const quiz = requestAdminQuizCreate(token.token, 'CoolQuiz', 'Okay');

    const usedname = requestAdminQuizCreate(token.token, 'alreadyusedquiz', 'Okay2');
    if (usedname !== quiz.name) {
      expect(() => requestAdminQuizNameUpdate(token.token, quiz.quizId, 'alreadyusedquiz')).toThrow(HTTPError[BAD_REQUEST]);
    }
  });

  test('6. Token is not valid', () => {
    const token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const quiz = requestAdminQuizCreate(token.token, 'CoolQuiz', 'Okay');

    expect(() => requestAdminQuizNameUpdate(token.token + 1, quiz.quizId, 'blah')).toThrow(HTTPError[UNAUTHORIZED]);
  });

  test('7. Valid token is provided, but user is not an owner of this quiz', () => {
    const token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const thief = requestAdminAuthRegister('foonah@gmail.com', 'password1', 'foonah', 'neekkaM').body;
    const quiz = requestAdminQuizCreate(token.token, 'MathTest', 'Tests mental maths');

    expect(() => requestAdminQuizNameUpdate(thief.token, quiz.quizId, 'blah')).toThrow(HTTPError[FORBIDDEN]);
  });
});

// describe('PlayerQuestionInfo Tests', () => {
//   let testQuestionBody: QuestionBody, token: string, quizId: number, questionId, sessionId: number, actionObject, playerId: number;
//   beforeEach(() => {
//     testQuestionBody = {
//       question: 'Who is the Monarch of England?',
//       duration: 4,
//       points: 5,
//       answers: [
//         {
//           answer: 'Prince Charles',
//           correct: true
//         },
//         {
//           answer: 'Your mom',
//           correct: false
//         }
//       ],
//       thumbnailUrl: 'https://pbs.twimg.com/profile_images/1042019157972320256/STolLU9B_400x400.jpg'
//     };
//     token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body.token;
//     quizId = requestAdminQuizCreate(token, 'CoolQuiz', 'Okay').quizId;
//     questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
//     sessionId = requestAdminStartSession(token, quizId, 1).sessionId;
//     playerId = requestPlayerJoin(sessionId, "Hayden Smith").playerId;
//   });
//   test('1. Successful implementation of requestPlayerQuestionInfo', () => {
//     const responseObject = {
//       questionId: expect.any(Number),
//       question: "Who is the Monarch of England?",
//       duration: 4,
//       thumbnailUrl: "https://pbs.twimg.com/profile_images/1042019157972320256/STolLU9B_400x400.jpg",
//       points: 5,
//       answers: [
//         {
//           answerId: expect.any(Number),
//           answer: "Prince Charles",
//           colour: expect.any(String),
//         },
//         {
//           answerId: expect.any(Number),
//           answer: "Your mom",
//           colour: expect.any(String),
//         }
//       ]
//     };
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//   requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     expect(requestPlayerQuestionInfo(playerId, 1)).toStrictEqual(responseObject);
//   });

//   test('2. Player ID does not exist', () => {
//     expect(() => expect(requestPlayerQuestionInfo(playerId + 1, 1)).toThrow(HTTPError[BAD_REQUEST]));
//   });

//   test('3. question position is not valid for the session this player is in', () => {
//     expect(() => expect(requestPlayerQuestionInfo(playerId, 2)).toThrow(HTTPError[BAD_REQUEST]));
//   });

//   test('4. session is not currently on this question', () => {
//     actionObject = {
//       action: "NEXT_QUESTION"
//     };
//     testQuestionBody.question = 'goofy goober?'
//     requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     requestAdminSessionUpdate(token, quizId, sessionId, actionObject);
//     expect(() => expect(requestPlayerQuestionInfo(playerId, 1)).toThrow(HTTPError[BAD_REQUEST]));
//   });

//   test('5. Session is in LOBBY or END state', () => {
//     expect(() => expect(requestPlayerQuestionInfo(playerId, 1)).toThrow(HTTPError[BAD_REQUEST]));
//   });
// });

describe('Tests for requestAdminQuestionMove', () => {
  let testQuestionBody: QuestionBody;
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
  });
  test('1. Successful move and return of questions', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId0 = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    testQuestionBody.question = '1Who is the best?';
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    testQuestionBody.question = '2Who is not the best?';
    const questionId2 = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    testQuestionBody.question = '3What is not the best?';
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    // 0 1 2 3
    // 0 1 2 3
    const response = requestAdminQuestionMove(token, questionId2, quizId, 0);
    expect(response).toStrictEqual({});
    const info = requestAdminQuizInfo(token, quizId);
    expect(info.questions[0].question).toStrictEqual('2Who is not the best?');
    expect(info.questions[1].question).toStrictEqual('Who is the Monarch of England?');
    expect(info.questions[2].question).toStrictEqual('1Who is the best?');
    expect(info.questions[3].question).toStrictEqual('3What is not the best?');
    // 0 1 2 3
    // 2 0 1 3
    const response1 = requestAdminQuestionMove(token, questionId0, quizId, 2);
    expect(response1).toStrictEqual({});
    const info1 = requestAdminQuizInfo(token, quizId);
    expect(info1.questions[0].question).toStrictEqual('2Who is not the best?');
    expect(info1.questions[1].question).toStrictEqual('1Who is the best?');
    expect(info1.questions[2].question).toStrictEqual('Who is the Monarch of England?');
    expect(info1.questions[3].question).toStrictEqual('3What is not the best?');
    // 0 1 2 3
    // 2 1 0 3
    const response2 = requestAdminQuestionMove(token, questionId2, quizId, 3);
    expect(response2).toStrictEqual({});
    const info2 = requestAdminQuizInfo(token, quizId);
    expect(info2.questions[0].question).toStrictEqual('1Who is the best?');
    expect(info2.questions[1].question).toStrictEqual('Who is the Monarch of England?');
    expect(info2.questions[2].question).toStrictEqual('3What is not the best?');
    expect(info2.questions[3].question).toStrictEqual('2Who is not the best?');
    // 0 1 2 3
    // 1 0 3 2
  });
  test('2. Question Id does not refer to a valid question within this quiz', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    testQuestionBody.question = 'Who is the best?';
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    expect(() => requestAdminQuestionMove(token, 10001, quizId, 1).toThrow(HTTPError[BAD_REQUEST]));
  });
  test('3. NewPosition is less than 0', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    testQuestionBody.question = 'Who is the best?';
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    expect(() => requestAdminQuestionMove(token, questionId, quizId, -1).toThrow(HTTPError[BAD_REQUEST]));
  });
  test('4. NewPosition is greater than n-1 where n is the number of questions', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    testQuestionBody.question = 'Who is the best?';
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    // Number of questions is 2
    expect(() => requestAdminQuestionMove(token, questionId, quizId, 2).toThrow(HTTPError[BAD_REQUEST]));
  });
  test('5. NewPosition is the position of the current question', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId0 = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    testQuestionBody.question = 'Who is the best?';
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    expect(() => requestAdminQuestionMove(token, questionId0, quizId, 0).toThrow(HTTPError[BAD_REQUEST]));
  });
  test('6. Valid token is provided, but user is not an owner of this quiz', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const secondToken = requestAdminAuthRegister('steven@gmail.com', 'passwo2rd', 'steve', 'mAKKEEN').body.token;
    const questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    testQuestionBody.question = 'Who is the best?';
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    expect(() => requestAdminQuestionMove(secondToken, questionId, quizId, 1).toThrow(HTTPError[FORBIDDEN]));
  });
  test('7. token does not exist', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    expect(() => requestAdminQuestionMove('1', questionId, quizId, 1).toThrow(HTTPError[UNAUTHORIZED]));
  });
});

describe('Tests for requestAdminQuestionRemove', () => {
  let testQuestionBody: QuestionBody;
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
  });
  test('1. Successful return of question', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    const response = requestAdminQuestionRemove(token, questionId, quizId);
    expect(response).toStrictEqual({});
  });
  test('2. Successful deletion of question', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    const response = requestAdminQuestionRemove(token, questionId, quizId);
    const questionBody = requestAdminQuizInfo(token, quizId);
    expect(questionBody.questions).toStrictEqual([]);
    expect(response).toStrictEqual({});
  });
  test('3. QuestionId does not refer to a valid question', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    expect(() => requestAdminQuestionRemove(token, questionId + 1, quizId)).toThrowError(HTTPError[BAD_REQUEST]);
  });
  test('4. Valid token is provided, but user is not an owner of this quiz', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const secondToken = requestAdminAuthRegister('steven@gmail.com', 'passwo2rd', 'steve', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    expect(() => requestAdminQuestionRemove(secondToken, questionId, quizId)).toThrowError(HTTPError[FORBIDDEN]);
  });
  test('5. token does not exist', () => {
    const token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    const quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    const questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    expect(() => requestAdminQuestionRemove('1', questionId, quizId)).toThrowError(HTTPError[UNAUTHORIZED]);
  });
});

describe('AdminQuizDescriptionUpdate Tests', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body.token;
    quizId = requestAdminQuizCreate(token, 'CoolQuiz', 'Okay').quizId;
  });
  test('1. Successful Description Update', () => {
    const response = requestAdminQuizDecriptionUpdate(token, quizId, 'LMAO');
    expect(response).toStrictEqual({});
    expect(requestAdminQuizInfo(token, quizId).description).toStrictEqual('LMAO');
  });
  test('2. Description too long', () => {
    expect(() => requestAdminQuizDecriptionUpdate(token, quizId, 'blah'.repeat(26)).toThrow(HTTPError[BAD_REQUEST]));
  });
  test('3. Token is not valid', () => {
    expect(() => requestAdminQuizDecriptionUpdate('1', quizId, 'blah').toThrow(HTTPError[UNAUTHORIZED]));
  });
  test('4. Quiz ID does not refer to a valid quiz', () => {
    expect(() => requestAdminQuizDecriptionUpdate(token, quizId + 1, 'blah').toThrow(HTTPError[BAD_REQUEST]));
  });
  test('5. Quiz ID does not refer to a quiz that this user owns', () => {
    const secondToken = requestAdminAuthRegister('haydensmith@gmail.com', 'iluvcomp1531', 'hayden', 'smith').body.token;
    expect(() => requestAdminQuizDecriptionUpdate(secondToken, quizId, 'blah').toThrow(HTTPError[FORBIDDEN]));
  });
});

describe('AdminQuizInfo Tests', () => {
  test('1. Successful implementation of adminQuizInfo', () => {
    const token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const quiz = requestAdminQuizCreate(token.token, 'CoolQuiz', 'Okay');
    const responseObject = {
      quizId: 1,
      name: 'CoolQuiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Okay',
      numQuestions: 0,
      questions: [] as QuestionData[],
      duration: 0,
      thumbnailUrl: '',
    };
    expect(requestAdminQuizInfo(token.token, quiz.quizId)).toStrictEqual(responseObject);
  });

  test('2. Token is not valid', () => {
    const token = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const quiz = requestAdminQuizCreate(token.token, 'CoolQuiz', 'Okay');

    expect(() => requestAdminQuizInfo('wrong', quiz.quizId)).toThrow(HTTPError[UNAUTHORIZED]);
  });

  test('3. Valid token is provided, but user is not an owner of this quiz', () => {
    const user = requestAdminAuthRegister('jigmeydorjee@gmail.com', 'iluvcomp1531', 'Jigmey', 'Dorjee').body;
    const thief = requestAdminAuthRegister('foonah@gmail.com', 'password1', 'foonah', 'neekkaM').body;
    const quiz = requestAdminQuizCreate(user.token, 'MathTest', 'Tests mental maths');

    expect(() => requestAdminQuizInfo(thief.token, quiz.quizId)).toThrow(HTTPError[FORBIDDEN]);
  });
});
// reference
describe('Tests for requestAdminQuestionCreate', () => {
  let testQuestionBody: QuestionBody;
  let token: string;
  let quizId: number;
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
    token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
  });
  test('1. Successful return of question', () => {
    const response = requestAdminQuestionCreate(token, testQuestionBody, quizId);
    expect(response.questionId).toStrictEqual(expect.any(Number));
  });
  test('2. Successful input of question', () => {
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    const quizInfo = requestAdminQuizInfo(token, quizId);
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'description',
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
    });
  });
  test('3. Question string is less than 5 characters in length', () => {
    testQuestionBody.question = 'Sad';
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('4. Question string is greater than 50 characters in length', () => {
    const questionString = 'Sad';
    testQuestionBody.question = questionString.repeat(20);
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('5. The question has more than 6 answers', () => {
    testQuestionBody.answers.push(
      {
        answer: 'Your mother',
        correct: false
      },
      {
        answer: 'Your dad',
        correct: false
      },
      {
        answer: 'Your sister',
        correct: false
      },
      {
        answer: 'Your brother',
        correct: false
      },
      {
        answer: 'Your dog',
        correct: false
      }
    );
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('6. The question has less than 2 answers', () => {
    testQuestionBody.answers.pop();
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('7. The question duration is not a positive number', () => {
    testQuestionBody.duration = -1;
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('8. The sum of the question durations in the quiz exceeds 3 minutes', () => {
    requestAdminQuestionCreate(token, testQuestionBody, quizId);
    testQuestionBody.question = 'What is the name of this course?';
    testQuestionBody.duration = 177;
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('9. The points awarded for the question are less than 1', () => {
    testQuestionBody.points = 0;
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('10. The points awarded for the question are greater than 10', () => {
    testQuestionBody.points = 11;
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('12. The length of any answer is shorter than 1 character long', () => {
    testQuestionBody.answers[1].answer = '';
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('13. The length of any answer is longer than 30 characters long', () => {
    const answerString = 'Hello';
    testQuestionBody.answers[1].answer = answerString.repeat(7);
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('14. Any answer strings are duplicates of one another (within the same question)', () => {
    testQuestionBody.answers[1].answer = 'Prince Charles';
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('15. There are no correct answers', () => {
    testQuestionBody.answers[0].correct = false;
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('16. Token is empty or invalid', () => {
    expect(() => requestAdminQuestionCreate('goofy', testQuestionBody, quizId)).toThrow(HTTPError[UNAUTHORIZED]);
  });

  test('17. Valid token is provided, but the user is not the owner of this quiz', () => {
    const newToken = requestAdminAuthRegister('okayy@gmail.com', 'password111', 'Steve', 'Jobs').body.token;
    expect(() => requestAdminQuestionCreate(newToken, testQuestionBody, quizId)).toThrow(HTTPError[FORBIDDEN]);
  });
  test('18. The thumbnailUrl is an empty string', () => {
    testQuestionBody.thumbnailUrl = '';
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('19. The thumbnailUrl does not return to a valid file', () => {
    testQuestionBody.thumbnailUrl = 'http://nonexistentfile.jpg';
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('20. The thumbnailUrl, when fetched, is not a JPG or PNg file type', () => {
    testQuestionBody.thumbnailUrl = 'goofy.bananas';
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
});

describe('requestAdminQuizCreate', () => {
  test('1. successful creation of quiz', () => {
    const user = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body;
    const response = requestAdminQuizCreate(user.token, 'Math Test', 'Tests mental maths');
    expect(response).toStrictEqual({ quizId: expect.any(Number) });
  });
  test('2. successful creation of quiz - description is empty', () => {
    const user = requestAdminAuthRegister('rdd@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body;
    const response = requestAdminQuizCreate(user.token, 'Math Test', '');
    expect(response).toStrictEqual({ quizId: expect.any(Number) });
  });
  test('3. Token is not valid - in this specific test case there are no users', () => {
    expect(() => requestAdminQuizCreate('e', 'Math Test', '')).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('4. Name contains non-alphanumeric characters - @', () => {
    const user = requestAdminAuthRegister('rdd@gmail.com', 'passw2ord', 'Hannoof', 'mAKKEEN').body;
    expect(() => requestAdminQuizCreate(user.token, 'Math@Test', 'Tests mental maths')).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('5. Name contains non-alphanumeric characters - all punctuation', () => {
    const user = requestAdminAuthRegister('rdd@gmail.com', 'passw2ord', 'Hannoof', 'mAKKEEN').body;
    expect(() => requestAdminQuizCreate(user.token, '@#$%^&*()', 'Tests mental maths')).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('6. Name is less than three characters long', () => {
    const user = requestAdminAuthRegister('rdd@gmail.com', 'pass2word', 'Hannoof', 'mAKKEEN').body;
    expect(() => requestAdminQuizCreate(user.token, 'he', 'Tests mental maths')).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('7. Name is more than thirty characters long', () => {
    const user = requestAdminAuthRegister('rdd@gmail.com', 'passw2ord', 'Hannoof', 'mAKKEEN').body;
    expect(() => requestAdminQuizCreate(user.token, '1234567891234567891234567891234', 'Tests mental maths')).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('8. Name has already been used', () => {
    const user = requestAdminAuthRegister('rdd@gmail.com', 'passwo22rd', 'Hannoof', 'mAKKEEN').body;
    requestAdminQuizCreate(user.token, 'MathTrest', 'Tests mental maths');
    expect(() => requestAdminQuizCreate(user.token, 'MathTrest', 'Tests mental maths')).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('9. Description is more than 100 characters long', () => {
    const user = requestAdminAuthRegister('rdd@gmail.com', 'passw2ord', 'Hannoof', 'mAKKEEN').body;
    const description = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean me';
    expect(() => requestAdminQuizCreate(user.token, 'LongDescription', description)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('10. Name contains alphanumeric characters and spaces', () => {
    const user = requestAdminAuthRegister('rd2d@gmail.com', 'passw2ord', 'Hannoof', 'mAKKEEN').body;
    const response = requestAdminQuizCreate(user.token, 'MathBest', 'Tests mental maths');
    expect(response).toStrictEqual({ quizId: expect.any(Number) });
  });
});

describe('adminQuizRemove', () => {
  let user: any;
  beforeEach(() => {
    user = requestAdminAuthRegister('hanoof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
  });

  test('1. successful output from removal of quiz - only tests for output', () => {
    const quiz = requestAdminQuizCreate(user.token, 'MathTest', 'Tests mental maths');
    expect(requestAdminQuizRemove(user.token, quiz.quizId)).toStrictEqual({});
  });
  test('2. quizId does not refer to a valid quiz - in this case no quizzes were created beforehand', () => {
    expect(() => requestAdminQuizRemove(user.token, 12)).toThrow(HTTPError[FORBIDDEN]);
  });
  test('3. user is trying to access quiz not owned by them', () => {
    const thief = requestAdminAuthRegister('foonah@gmail.com', 'password1', 'foonah', 'neekkaM').body;
    const quiz = requestAdminQuizCreate(user.token, 'MathTest', 'Tests mental maths');
    expect(() => requestAdminQuizRemove(thief.token, quiz.quizId)).toThrow(HTTPError[FORBIDDEN]);
  });
  test('4. successful removal of quiz', () => {
    const quiz = requestAdminQuizCreate(user.token, 'Mat hTest', 'Tests mental maths');
    requestAdminQuizRemove(user.token, quiz.quizId);
    const response = requestAdminQuizCreate(user.token, 'Mat hTest', 'Tests mental maths');
    expect(response).toStrictEqual({ quizId: expect.any(Number) });
  });
  test('5. token does not exist', () => {
    const quiz = requestAdminQuizCreate(user.token, 'Mat hTest', 'Tests mental maths');
    expect(() => requestAdminQuizRemove('52', quiz.quizId)).toThrow(HTTPError[UNAUTHORIZED]);
  });
});

describe('adminQuizTransfer', () => {
  let user: any;
  let quiz: any;
  beforeEach(() => {
    user = requestAdminAuthRegister('hanoof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    quiz = requestAdminQuizCreate(user.token, 'MathTest', 'Tests mental maths');
  });
  test('1. successful output from transferral', () => {
    requestAdminAuthRegister('haenoof@gmail.com', 'passw2eord2', 'Hannoof', 'mAKEEN');
    const response = requestAdminQuizTransfer(quiz.quizId, user.token, 'haenoof@gmail.com');
    expect(response).toStrictEqual({});
  });
  test('2. successful transferral', () => {
    const receiver = requestAdminAuthRegister('haenoof@gmail.com', 'passw2eord2', 'Hannoof', 'mAKEEN').body;
    requestAdminQuizTransfer(quiz.quizId, user.token, 'haenoof@gmail.com');
    // adminquizcreate is called for its error checking capabilities in terms of duplicate name
    const response = requestAdminQuizCreate(user.token, 'MathTest', 'Tests mental maths');
    // will succeed because the quiz is gone
    expect(response).toStrictEqual({ quizId: expect.any(Number) });
    // adminquizcreate is then called and will  return an error since the quiz exists with receivers userid.
    expect(() => requestAdminQuizCreate(receiver.token, 'MathTest', 'Tests mental maths')).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('3. userEmail is not a real user', () => {
    expect(() => requestAdminQuizTransfer(quiz.quizId, user.token, 'fakemail@gmail.com')).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('4. userEmail is the currently logged in user', () => {
    expect(() => requestAdminQuizTransfer(quiz.quizId, user.token, 'hanoof@gmail.com')).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('5. quizId refers to a quiz that has a name already used by target user', () => {
    const receiver = requestAdminAuthRegister('haenoof@gmail.com', 'passw2eord2', 'Hannoof', 'mAKEEN').body;
    requestAdminQuizCreate(receiver.token, 'MathTest', 'Tests mental maths');
    expect(() => requestAdminQuizTransfer(quiz.quizId, user.token, 'haenoof@gmail.com')).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('6. invalid token', () => {
    expect(() => requestAdminQuizTransfer(quiz.quizId, '', 'email@gmail.com')).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('5. valid token but user does not own the quiz', () => {
    const thief = requestAdminAuthRegister('handoroof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    expect(() => requestAdminQuizTransfer(quiz.quizId, thief.token, 'haenoof@gmail.com')).toThrow(HTTPError[FORBIDDEN]);
  });
});

describe('/v2/admin/quiz/list', () => {
  let user: any;
  let quiz: any;
  beforeEach(() => {
    user = requestAdminAuthRegister('hanoof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    quiz = requestAdminQuizCreate(user.token, 'Math Test', 'Tests mental maths');
  });
  test('1. invalid token', () => {
    expect(() => requestAdminQuizList(user.token + 'invalid')).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('2. empty token', () => {
    expect(() => requestAdminQuizList('')).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('4. one quiz', () => {
    expect(requestAdminQuizList(user.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Math Test'
        }
      ]
    });
  });
  test('5. multiple quizzes', () => {
    const quiz1 = requestAdminQuizCreate(user.token, 'newQuiz', '');
    const quiz2 = requestAdminQuizCreate(user.token, 'second quiz', 'qwer');
    const quiz3 = requestAdminQuizCreate(user.token, 'hello', 'abcd');
    const expected = new Set([
      { quizId: quiz.quizId, name: 'Math Test' },
      { quizId: quiz1.quizId, name: 'newQuiz' },
      { quizId: quiz2.quizId, name: 'second quiz' },
      { quizId: quiz3.quizId, name: 'hello' }
    ]);
    const quizList = new Set(requestAdminQuizList(user.token).quizzes);
    expect(quizList).toStrictEqual(expected);
  });
});

describe('adminQuestionDuplicate', () => {
  let user: any;
  let quiz: any;
  let testQuestionBody: any;
  beforeEach(() => {
    user = requestAdminAuthRegister('hanoof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    quiz = requestAdminQuizCreate(user.token, 'MathTest', 'Tests mental maths');
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
  });
  test('1. successful output difference i.e. testing different questionIds', () => {
    const OGQuestionID = requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    const response = requestAdminQuestionDuplicate(quiz.quizId, OGQuestionID.questionId, user.token);

    expect(OGQuestionID.questionId).not.toBe(response.body);
    expect(response).toStrictEqual({ questionId: expect.any(Number) });
  });
  // requires adminQuestionMove
  test('2. successful duplication - tests immediate position', () => {
    const OGQuestionID = requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    const duplicateId = requestAdminQuestionDuplicate(quiz.quizId, OGQuestionID.questionId, user.token);
    // checks that duplicate is at position 1 i.e. next to immediate original
    // error returned because of position

    expect(() => requestAdminQuestionMove(user.token, duplicateId.questionId, quiz.quizId, 1)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('3. Invalid token', () => {
    const OGQuestionID = requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    expect(() => requestAdminQuestionDuplicate(quiz.quizId, OGQuestionID.questionId, 'b')).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('4. VALID TOKEN but not owner', () => {
    const OGQuestionID = requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    const thief = requestAdminAuthRegister('handoroof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;

    expect(() => requestAdminQuestionDuplicate(quiz.quizId, OGQuestionID.questionId, thief.token)).toThrow(HTTPError[FORBIDDEN]);
  });

  test('5. questionID does not refer to valid quiz', () => {
    requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    expect(() => requestAdminQuestionDuplicate(quiz.quizId, 200000, user.token)).toThrow(HTTPError[BAD_REQUEST]);
  });
});
// reference
describe('requestAdminQuestionUpdate', () => {
  let testQuestionBody: QuestionBody;
  let token: string;
  let quizId: number;
  let questionId: number;
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
    token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    questionId = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
  });

  test('1. Successful return of question', () => {
    const response = requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId);
    expect(response).toStrictEqual({});
  });
  test('2. Successful input of question', () => {
    testQuestionBody.question = 'Where did my teammate go?';
    requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId);
    const quizInfo = requestAdminQuizInfo(token, quizId);
    expect(quizInfo).toStrictEqual({
      quizId: quizId,
      name: 'name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'description',
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Where did my teammate go?',
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
    });
  });
  test('3. Question string is less than 5 characters in length', () => {
    testQuestionBody.question = 'bruh';
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('4. Question string is greater than 50 characters in length', () => {
    const questionString = 'Sad';
    testQuestionBody.question = questionString.repeat(20);
    expect(() => requestAdminQuestionCreate(token, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('5. The question has more than 6 answers', () => {
    testQuestionBody.answers.push(
      {
        answer: 'Your mother',
        correct: false
      },
      {
        answer: 'Your dad',
        correct: false
      },
      {
        answer: 'Your sister',
        correct: false
      },
      {
        answer: 'Your brother',
        correct: false
      },
      {
        answer: 'Your dog',
        correct: false
      }
    );
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('6. The question has less than 2 answers', () => {
    testQuestionBody.answers.pop();
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('7. The question duration is not a positive number', () => {
    testQuestionBody.duration = -1;
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('8. The sum of the question durations in the quiz exceeds 3 minutes', () => {
    const questionId1 = requestAdminQuestionCreate(token, testQuestionBody, quizId).questionId;
    testQuestionBody.question = 'What is the name of this course?';
    testQuestionBody.duration = 177;
    expect(() => requestAdminQuestionUpdate(token, questionId1, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('9. The points awarded for the question are less than 1', () => {
    testQuestionBody.points = 0;
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('10. The points awarded for the question are greater than 10', () => {
    testQuestionBody.points = 11;
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('11. Question Id invalid', () => {
    expect(() => requestAdminQuestionUpdate(token, questionId + 1, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('12. The length of any answer is shorter than 1 character long', () => {
    testQuestionBody.answers[1].answer = '';
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('13. The length of any answer is longer than 30 characters long', () => {
    const answerString = 'Hello';
    testQuestionBody.answers[1].answer = answerString.repeat(7);
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('14. Any answer strings are duplicates of one another (within the same question)', () => {
    testQuestionBody.answers[1].answer = 'Prince Charles';
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('15. There are no correct answers', () => {
    testQuestionBody.answers[0].correct = false;
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });

  test('16. Token is empty or invalid', () => {
    expect(() => requestAdminQuestionUpdate(token + 'invalid', questionId, testQuestionBody, quizId)).toThrow(HTTPError[UNAUTHORIZED]);
  });

  test('17. Valid token is provided, but the user is not the owner of this quiz', () => {
    const newToken = requestAdminAuthRegister('okayy@gmail.com', 'password111', 'Steve', 'Jobs').body.token;
    expect(() => requestAdminQuestionUpdate(newToken, questionId, testQuestionBody, quizId)).toThrow(HTTPError[FORBIDDEN]);
  });
  test('18. The thumbnailUrl is an empty string', () => {
    testQuestionBody.thumbnailUrl = '';
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('19. The thumbnailUrl does not return to a valid file', () => {
    testQuestionBody.thumbnailUrl = 'http://nonexistentfile1.jpg';
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('20. The thumbnailUrl, when fetched, is not a JPG or PNg file type', () => {
    testQuestionBody.thumbnailUrl = 'goofy1.bananas';
    expect(() => requestAdminQuestionUpdate(token, questionId, testQuestionBody, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
});

describe('adminQuestionDuplicate', () => {
  let user: any;
  let quiz: any;
  let testQuestionBody: any;
  beforeEach(() => {
    user = requestAdminAuthRegister('hanoof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;
    quiz = requestAdminQuizCreate(user.token, 'MathTest', 'Tests mental maths');
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
  });
  test('1. successful output difference i.e. testing different questionIds', () => {
    const OGQuestionID = requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    const response = requestAdminQuestionDuplicate(quiz.quizId, OGQuestionID.questionId, user.token);

    expect(OGQuestionID.questionId).not.toBe(response.body);
    expect(response).toStrictEqual({ questionId: expect.any(Number) });
  });
  // requires adminQuestionMove
  test('2. successful duplication - tests immediate position', () => {
    const OGQuestionID = requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    const duplicateId = requestAdminQuestionDuplicate(quiz.quizId, OGQuestionID.questionId, user.token);
    // checks that duplicate is at position 1 i.e. next to immediate original
    // error returned because of position

    expect(() => requestAdminQuestionMove(user.token, duplicateId.questionId, quiz.quizId, 1)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('3. Invalid token', () => {
    const OGQuestionID = requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    expect(() => requestAdminQuestionDuplicate(quiz.quizId, OGQuestionID.questionId, 'b')).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('4. VALID TOKEN but not owner', () => {
    const OGQuestionID = requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    const thief = requestAdminAuthRegister('handoroof@gmail.com', 'password2', 'Hannoof', 'mAKKEEN').body;

    expect(() => requestAdminQuestionDuplicate(quiz.quizId, OGQuestionID.questionId, thief.token)).toThrow(HTTPError[FORBIDDEN]);
  });

  test('5. questionID does not refer to valid quiz', () => {
    requestAdminQuestionCreate(user.token, testQuestionBody, quiz.quizId);
    expect(() => requestAdminQuestionDuplicate(quiz.quizId, 200000, user.token)).toThrow(HTTPError[BAD_REQUEST]);
  });
});

describe('Requestadminthumbnail', () => {
  let token: string;
  let quizId: number;
  let validUrl: string;
  beforeEach(() => {
    token = requestAdminAuthRegister('hanoof@gmail.com', 'passwo2rd', 'Hannoof', 'mAKKEEN').body.token;
    quizId = requestAdminQuizCreate(token, 'name', 'description').quizId;
    validUrl = 'https://pbs.twimg.com/profile_images/1042019157972320256/STolLU9B_400x400.jpg';
  });
  test('1. Successful updating of thumbnail and output', () => {
    const returnUrl = requestAdminThumbnailUpdate(validUrl, token, quizId);
    const newThumbnail = requestAdminQuizInfo(token, quizId).thumbnailUrl;
    expect(newThumbnail).toBe(validUrl);
    expect(returnUrl.imgUrl).toBe(validUrl);
  });
  test('2. Token is empty or invalid', () => {
    expect(() => requestAdminThumbnailUpdate(validUrl, token + 'invalid', quizId)).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('3. Valid token is provided, but the user is not the owner of this quiz', () => {
    const newToken = requestAdminAuthRegister('okayy@gmail.com', 'password111', 'Steve', 'Jobs').body.token;
    expect(() => requestAdminThumbnailUpdate(validUrl, newToken, quizId)).toThrow(HTTPError[FORBIDDEN]);
  });
  test('4. The thumbnailUrl does not return to a valid file', () => {
    const invalidUrl = 'http://nonexistentfile1.jpg';
    expect(() => requestAdminThumbnailUpdate(invalidUrl, token, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('5. The thumbnailUrl, when fetched, is not a JPG or PNg file type', () => {
    const invalidUrl = 'shepard';
    expect(() => requestAdminThumbnailUpdate(invalidUrl, token, quizId)).toThrow(HTTPError[BAD_REQUEST]);
  });
});

describe('ADMINSTARTSESSION', () => {
  let token: string;
  let quizId: number;
  let autoStartNum: number;
  let testQuestionBody: any;
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
    autoStartNum = 1;
  });
  test('1. Successful session creation output', () => {
    const response = requestAdminStartSession(token, quizId, autoStartNum);
    expect(response).toStrictEqual({ sessionId: expect.any(Number) });
  });
  test('2. Token is empty or invalid', () => {
    expect(() => requestAdminStartSession(token + 'invalid', quizId, autoStartNum)).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('3. Valid token is provided, but the user is not the owner of this quiz', () => {
    const newToken = requestAdminAuthRegister('okayy@gmail.com', 'password111', 'Steve', 'Jobs').body.token;
    expect(() => requestAdminStartSession(newToken, quizId, autoStartNum)).toThrow(HTTPError[FORBIDDEN]);
  });
  test('4. AutoStartNum is greater than 50', () => {
    const errorAutoStartNum = 51;
    expect(() => requestAdminStartSession(token, quizId, errorAutoStartNum)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('5. already ten sessions - also tests session creation', () => {
    for (let i = 0; i < 10; i++) {
      requestAdminStartSession(token, quizId, autoStartNum);
    }
    requestAdminViewSession(token, quizId);
    expect(() => requestAdminStartSession(token, quizId, autoStartNum)).toThrow(HTTPError[BAD_REQUEST]);
  });
  test('6. quiz has no questions', () => {
    const newQuizId = requestAdminQuizCreate(token, 'quiz', 'description').quizId;
    expect(() => requestAdminStartSession(token, newQuizId, autoStartNum)).toThrow(HTTPError[BAD_REQUEST]);
  });
});

describe('adminviewsession', () => {
  let token: string;
  let testQuestionBody: any;
  let quizId: number;
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
  });
  test('1. Successful view session - test whether id is in active session array', () => {
    const response = requestAdminStartSession(token, quizId, 1).sessionId;
    expect(requestAdminViewSession(token, quizId).activeSessions[0]).toBe(response);
  });
  test('2. Token is empty or invalid', () => {
    expect(() => requestAdminViewSession(token + 'invalid', quizId)).toThrow(HTTPError[UNAUTHORIZED]);
  });
  test('3. Valid token is provided, but the user is not the owner of this quiz', () => {
    const newToken = requestAdminAuthRegister('okayy@gmail.com', 'password111', 'Steve', 'Jobs').body.token;
    expect(() => requestAdminViewSession(newToken, quizId)).toThrow(HTTPError[FORBIDDEN]);
  });
  /* test('4. testing inactive sessions', () => {
    const errorAutoStartNum = 51;
    expect(() => requestAdminStartSession(token, quizId, errorAutoStartNum)).toThrow(HTTPError[BAD_REQUEST]);
  }); - will be uncommented when adminUpdateStatus is done. kinda redundant so i'll work on the function itselfnow */
  test('5. testing length of viewsession arrays', () => {
    for (let i = 0; i < 10; i++) {
      requestAdminStartSession(token, quizId, 1);
    }
    const activeSessionLength = requestAdminViewSession(token, quizId).activeSessions.length;
    const inactiveSessionLength = requestAdminViewSession(token, quizId).inactiveSessions.length;
    expect(activeSessionLength).toBe(10);
    expect(inactiveSessionLength).toBe(0);
  });
  test('6. invalid quiz', () => {
    let fakeQuizId = 0;
    // blackbox testing
    if (fakeQuizId === quizId) {
      fakeQuizId++;
    }
    expect(() => requestAdminViewSession(token, fakeQuizId)).toThrow(HTTPError[FORBIDDEN]);
  });
});
