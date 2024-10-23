import { verifySession } from './sessions';
import HTTPError from 'http-errors';
import {
  setData,
  getTokens,
  getData,
  UserData,
  QuizData,
  QuestionData,
  AnswerData,
  DataStore,
  getTrash,
  Trash,
  setTrash,
  Token,
  recycle,
  SessionsData,
  setTokens,
  Player,
  QuestionResults,
} from './dataStore';
import request from 'sync-request-curl';

const minNameLength = 3;
const maxNameLength = 30;
const maxDescriptionLength = 100;
const notFound = -1;
const minQuestionLength = 5;
const maxQuestionLength = 50;
const minAnswersAmount = 2;
const maxAnswersAmount = 6;
const maxTotalDuration = 180;
const minQuestionPoints = 1;
const maxQuestionPoints = 10;
const minDuration = 0;
const minAnswerLength = 1;
const maxAnswerLength = 30;
const colourArray = [
  'red', 'blue', 'green', 'yellow', 'orange', 'purple'
];
const maxAutoStartNum = 50;
const maxSessions = 9;
const noQuestions = 0;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;

interface ErrorObject {
  error: string;
}

interface SessionId {
  sessionId: number;
}

interface QuizId {
  quizId: number;
}

interface QuestionId {
  questionId: number;
}

interface QuizListItem {
  quizId: number;
  name: string;
}

interface ThumbnailResponse {
  imgUrl: string;
}

interface QuizListResponse {
  quizzes: QuizListItem[];
}

interface QuizInfoResponse {
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

interface InfoAnswerResponse {
  answerId: number;
  answer: string;
  colour: string;
}

export interface sessionInfoQuestion {
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
  questions: sessionInfoQuestion[];
  duration: number;
  thumbnailUrl: string;
}

interface SessionResponse {
  state: string;
  atQuestion: number;
  players: string[];
  metadata: QuizMetadata;
}

interface QuestionInfoResponse {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: InfoAnswerResponse[];
}

interface QuizTrash {
  quizzes: QuizListItem[];
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
  thumbnailUrl: string
}

interface PlayerResponse {
  state: string,
  numQuestions: number,
  atQuestion: number
}

export interface resultResponse {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

function hasDuplicates(array: number[]): boolean {
  return new Set(array).size !== array.length;
}

function isJpegOrPng(url: string) {
  if (!url) {
    throw new Error('empty string.');
  }
  try {
    const response = request('GET', url);
    if (response.statusCode !== 200) {
      throw new Error('didn\'t get a 200 status code.');
    }
    const contentType = response.headers['content-type'].toLowerCase();
    if (contentType === 'image/jpeg' || contentType === 'image/png') {
      return true;
    } else {
      throw new Error('JPEG or PNG image only');
    }
  } catch (error) {
    throw new Error('thumbnail NOT valid' + error.message);
  }
}

export function adminSessionStatus(token: string, quizId: number, sessionId: number): SessionResponse | ErrorObject {
  const data: DataStore = getData();
  const validUser: UserData = verifySession(token);
  if (!validUser) {
    throw HTTPError(UNAUTHORIZED, 'Token is empty or invalid');
  }
  const quizFind: QuizData = data.quizzes.find(b => b.quizId === quizId);

  const tokenData = getTokens();
  const token1 = tokenData.tokenList.find(t => t.sessionId === token);
  const session = token1.sessions.find(s => s.quizSessionId === sessionId);

  // Token and Question Errors
  if (!quizFind) {
    throw HTTPError(UNAUTHORIZED, 'Quiz does not exist');
  } else if (quizFind.userId !== validUser.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  } else if (!session) {
    throw HTTPError(BAD_REQUEST, 'Session Id does not refer to a valid session within this quiz');
  }
  const playerNames = [];
  for (const player of session.players) {
    playerNames.push(player.name);
  }
  return {
    state: session.state,
    atQuestion: session.atQuestion,
    players: playerNames,
    metadata: {
      quizId: quizFind.quizId,
      name: quizFind.name,
      timeCreated: quizFind.timeCreated,
      timeLastEdited: quizFind.timeLastEdited,
      description: quizFind.description,
      numQuestions: quizFind.numQuestions,
      questions: quizFind.questions,
      duration: quizFind.duration,
      thumbnailUrl: quizFind.thumbnailUrl,
    }
  };
}

/**
 * Function that displays question results
 * Basic implementation that also returns error messages
 * @param {number} playerId
 * @param {number} questionposition
 * @returns {resultResponse}
 */

export function playerQuestionResults(playerId: number, questionposition : number): resultResponse | ErrorObject {
  const tokenData = getTokens();
  let gameSession: SessionsData;
  let playerFind: Player;
  for (const token of tokenData.tokenList) {
    for (const session of token.sessions) {
      playerFind = session.players.find(b => b.id === playerId);
      if (playerFind) {
        gameSession = session;
        break;
      }
    }
  }
  const numQuestions = gameSession.metadata.questions.length;

  // 400 Errors
  if (!playerFind) {
    throw HTTPError(BAD_REQUEST, 'player ID does not exist');
  } else if (questionposition > numQuestions) {
    throw HTTPError(BAD_REQUEST, 'question position is not valid for the session this player is in');
  } else if (gameSession.atQuestion !== questionposition) {
    throw HTTPError(BAD_REQUEST, 'session is not currently on this question');
  } else if (gameSession.state !== 'ANSWER_SHOW') {
    throw HTTPError(BAD_REQUEST, 'Session is not in ANSWER_SHOW');
  }

  const i = questionposition - 1;
  const sessionQuestion = gameSession.metadata.questions[i];
  const timeQuestionOpened = gameSession.questionResults[i].timeStarted;
  const timeQuestionClosed = gameSession.questionResults[i].timeEnded;

  // checks if the player answered or not
  let timeToAnswer;
  let totalAnswerTime = 0;
  let numPlayers = 0;
  const numCorrect = gameSession.questionResults[i].playersCorrectList.length;

  const playerTimeArray = [];
  // goes through all the players and gets their time
  for (const player of gameSession.players) {
    // correct
    if (gameSession.questionResults[i].playersCorrectList.includes(player.name)) {
      timeToAnswer = player.timeLastSubmitted - timeQuestionOpened;
      playerTimeArray.push({
        playerId: player.id,
        timeToAnswer: timeToAnswer,
      });
    } else if (player.timeLastSubmitted !== 0) { // wrong
      timeToAnswer = player.timeLastSubmitted - timeQuestionOpened;
    } else {
      timeToAnswer = timeQuestionClosed - timeQuestionOpened;
    }
    totalAnswerTime += timeToAnswer;
    numPlayers++;
  }
  const avgTime = totalAnswerTime / numPlayers;
  const roundedValue = parseFloat(avgTime.toFixed(1));
  gameSession.questionResults[i].averageAnswerTime = roundedValue;
  gameSession.questionResults[i].percentCorrect = numCorrect / numPlayers * 100;

  // sorts array of winners by the time they took
  playerTimeArray.sort((a, b) => a.timeToAnswer - b.timeToAnswer);

  // adding points to all winners
  for (const winnersIndex in playerTimeArray) {
    for (const player of gameSession.players) {
      if (player.id === playerTimeArray[winnersIndex].playerId) {
        player.score += sessionQuestion.points / (parseInt(winnersIndex) + 1);
        // Scaling P*S
      }
    }
  }

  // if 0 it means the person didnt answer
  for (const player of gameSession.players) {
    player.timeLastSubmitted = 0;
  }

  setTokens(tokenData);
  return {
    questionId: gameSession.questionResults[i].questionId,
    playersCorrectList: gameSession.questionResults[i].playersCorrectList,
    averageAnswerTime: gameSession.questionResults[i].averageAnswerTime,
    percentCorrect: gameSession.questionResults[i].percentCorrect,
  };
}

/**
 * Function that creates a question.
 * Basic implementation that also returns error messages
 * @param {number} playerId
 * @param {number} questionposition
 * @returns {QuestionInfoResponse}
 */

export function playerQuestionInfo(playerId: number, questionposition : number): QuestionInfoResponse | ErrorObject {
  const tokenData = getTokens();
  let sessionWithPlayer: SessionsData;
  let playerFind: Player;
  for (const token of tokenData.tokenList) {
    for (const session of token.sessions) {
      playerFind = session.players.find(b => b.id === playerId);
      if (playerFind) {
        sessionWithPlayer = session;
        break;
      }
    }
  }
  const numQuestions = sessionWithPlayer.metadata.questions.length;

  // 400 Errors
  if (!playerFind) {
    throw HTTPError(BAD_REQUEST, 'player ID does not exist');
  } else if (questionposition > numQuestions) {
    throw HTTPError(BAD_REQUEST, 'question position is not valid for the session this player is in');
  } else if (sessionWithPlayer.atQuestion !== questionposition) {
    throw HTTPError(BAD_REQUEST, 'session is not currently on this question');
  } else if (sessionWithPlayer.state === 'LOBBY' || sessionWithPlayer.state === 'END') {
    throw HTTPError(BAD_REQUEST, 'Session is in LOBBY or END state');
  }

  const questionIndex = questionposition - 1;
  const sessionQuestion = sessionWithPlayer.metadata.questions[questionIndex];

  const answerArray = [];
  for (const answer of sessionQuestion.answers) {
    const answerBody: InfoAnswerResponse = {
      answerId: answer.answerId,
      answer: answer.answer,
      colour: answer.colour,
    };
    answerArray.push(answerBody);
  }
  setTokens(tokenData);
  return {
    questionId: sessionQuestion.questionId,
    question: sessionQuestion.question,
    duration: sessionQuestion.duration,
    thumbnailUrl: sessionQuestion.thumbnailUrl,
    points: sessionQuestion.points,
    answers: answerArray,
  };
}

export function playerSubmitAnswer(playerId: number, questionposition : number, answerIds: number[]): Record<string, never> | ErrorObject {
  const tokenData = getTokens();
  let sessionWithPlayer: SessionsData;
  let playerFind: Player;
  for (const token of tokenData.tokenList) {
    for (const session of token.sessions) {
      playerFind = session.players.find(b => b.id === playerId);
      if (playerFind) {
        sessionWithPlayer = session;
        break;
      }
    }
  }
  const numQuestions = sessionWithPlayer.metadata.questions.length;

  // 400 Errors
  if (!playerFind) {
    throw HTTPError(BAD_REQUEST, 'player ID does not exist');
  } else if (questionposition > numQuestions) {
    throw HTTPError(BAD_REQUEST, 'question position is not valid for the session this player is in');
  } else if (sessionWithPlayer.atQuestion !== questionposition) {
    throw HTTPError(BAD_REQUEST, 'session is not currently on this question');
  } else if (sessionWithPlayer.state !== 'QUESTION_OPEN') {
    throw HTTPError(BAD_REQUEST, 'Session STATE is not in QUESTION_OPEN');
  }

  const playerName = playerFind.name;
  const questionIndex = questionposition - 1;
  const sessionQuestion = sessionWithPlayer.metadata.questions[questionIndex];

  // checking errors in answerId
  for (const answer of answerIds) {
    const answerFind = sessionQuestion.answers.find(b => b.answerId === answer);
    if (!answerFind) {
      throw HTTPError(BAD_REQUEST, 'Answer IDs are not valid for this particular question');
    }
  }
  if (hasDuplicates(answerIds) === true) {
    throw HTTPError(BAD_REQUEST, 'There are duplicate answer IDs provided');
  }
  if (answerIds.length === 0) {
    throw HTTPError(BAD_REQUEST, 'Less than 1 answer ID was submitted');
  }

  const arrayofCorrectAnswers = [];
  for (const answer of sessionQuestion.answers) {
    if (answer.correct === true) {
      arrayofCorrectAnswers.push(answer.answerId);
    }
  }

  playerFind.timeLastSubmitted = Math.floor(Date.now() / 1000);
  const playerAnswers = answerIds.slice().sort();
  const correctAnswers = arrayofCorrectAnswers.slice().sort();

  if (playerAnswers === correctAnswers) {
    if (!sessionWithPlayer.questionResults[questionIndex].playersCorrectList.includes(playerName)) {
      sessionWithPlayer.questionResults[questionIndex].playersCorrectList.push(playerName);
    }
  } else {
    if (sessionWithPlayer.questionResults[questionIndex].playersCorrectList.includes(playerName)) {
      const index = sessionWithPlayer.questionResults[questionIndex].playersCorrectList.findIndex(
        (a) => a === playerName
      );
      sessionWithPlayer.questionResults[questionIndex].playersCorrectList.splice(index, 1, playerName);
    }
  }
  setTokens(tokenData);
  return {};
}

/**
 * Function that creates a question.
 * Basic implementation that also returns error messages
 * @param {string} token
 * @param {QuestionBody} questionBody
 * @param {number} quizId
 * @returns {{quizzes: {quizId: number}}}
 */

export function adminQuestionCreate(token: string, questionBody: QuestionBody, quizId: number): QuestionId | ErrorObject {
  const data: DataStore = getData();
  const validUser: UserData = verifySession(token);

  const quizFind: QuizData = data.quizzes.find(b => b.quizId === quizId);

  const newTotalDuration = quizFind.duration + questionBody.duration;

  // Token and Question Errors
  if (!validUser) {
    throw HTTPError(UNAUTHORIZED, 'Token is empty or invalid');
  } else if (!quizFind) {
    throw HTTPError(UNAUTHORIZED, 'Quiz does not exist');
  } else if (quizFind.userId !== validUser.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  } else if (questionBody.question.length < minQuestionLength) {
    throw HTTPError(BAD_REQUEST, 'Question string is less than 5 characters in length');
  } else if (questionBody.question.length > maxQuestionLength) {
    throw HTTPError(BAD_REQUEST, 'Question string is greater than 50 characters in length');
  } else if (questionBody.answers.length > maxAnswersAmount) {
    throw HTTPError(BAD_REQUEST, 'The question has more than 6 answers');
  } else if (questionBody.answers.length < minAnswersAmount) {
    throw HTTPError(BAD_REQUEST, 'The question has less than 2 answers');
  } else if (questionBody.duration <= minDuration) {
    throw HTTPError(BAD_REQUEST, 'The question duration is not a positive number');
  } else if (newTotalDuration > maxTotalDuration) {
    throw HTTPError(BAD_REQUEST, 'The sum of the question durations in the quiz exceeds 3 minutes');
  } else if (questionBody.points > maxQuestionPoints || questionBody.points < minQuestionPoints) {
    throw HTTPError(BAD_REQUEST, 'The points awarded for the question are less than 1 or greater than 10');
  }
  try {
    const isValidImage = isJpegOrPng(questionBody.thumbnailUrl);
    if (!isValidImage) {
      throw new Error('error');
    }
  } catch (error) {
    throw HTTPError(BAD_REQUEST, 'the url must be a JPEG or PNG image or not an empty string');
  }

  let correctFlag = 0;
  for (const answer of questionBody.answers) {
    if (answer.answer.length < minAnswerLength || answer.answer.length > maxAnswerLength) {
      throw HTTPError(BAD_REQUEST, 'The length of any answer is shorter than 1 character long, or longer than 30 characters long');
    }
    if (answer.correct === true) {
      correctFlag = 1;
    }
  }
  if (correctFlag === 0) {
    throw HTTPError(BAD_REQUEST, 'There are no correct answers');
  }
  const seenAnswers: string[] = [];
  for (const answer of questionBody.answers) {
    if (seenAnswers.includes(answer.answer)) {
      throw HTTPError(BAD_REQUEST, 'Duplicate answer');
    }
    seenAnswers.push(answer.answer);
  }

  // Changing the quiz info
  quizFind.numQuestions++;
  quizFind.duration = newTotalDuration;
  quizFind.timeLastEdited = Math.floor(Date.now() / 1000);

  // Creating a question entity to be pushed to the quiz

  let questionIdExists;
  let QuestionID: number;
  // Creating the UNIQUE questionId
  do {
    const randomNumber = Math.floor(Math.random() * 1000000);
    questionIdExists = data.quizzes.some(quiz =>
      quiz.questions.some(question => question.questionId === randomNumber)
    );
    if (!questionIdExists) {
      QuestionID = randomNumber;
    }
  } while (questionIdExists);
  const id: number = QuestionID;

  const completeQuestionBody: QuestionData = {
    questionId: QuestionID,
    question: questionBody.question,
    duration: questionBody.duration,
    thumbnailUrl: questionBody.thumbnailUrl,
    points: questionBody.points,
    answers: [],
  };

  // Creating an answerId and colour for each answer in the answers array
  let existsInArray;
  for (const index in questionBody.answers) {
    let answerId: number;
    // checks if the answerid exists in any quiz question
    do {
      const randomNumber = Math.floor(Math.random() * 10000000);
      existsInArray = data.quizzes.some(quiz =>
        quiz.questions.some(question =>
          question.answers.some(answer => answer.answerId === randomNumber)
        )
      );
      if (!existsInArray) {
        answerId = randomNumber;
      }
    } while (existsInArray);

    const answersObject: AnswerData = {
      answerId: answerId,
      answer: questionBody.answers[index].answer,
      colour: colourArray[index],
      correct: questionBody.answers[index].correct
    };
    completeQuestionBody.answers.push(answersObject);
  }
  // Pushing the question to the quiz.
  quizFind.questions.push(completeQuestionBody);

  setData(data);
  return {
    questionId: id
  };
}

/**
 * Function that creates a question.
 * Basic implementation that also returns error messages
 * @param {string} token
 * @param {QuestionBody} questionBody
 * @param {number} quizId
 * @returns {{quizzes: {quizId: number}}}
 */

export function adminQuestionUpdate(token: string, quizId: number, questionId: number, questionBody: QuestionBody): Record<string, never> | ErrorObject {
  const data: DataStore = getData();
  const validUser: UserData = verifySession(token);
  const quizFind: QuizData = data.quizzes.find(b => b.quizId === quizId);

  // Token and Question Errors
  if (!validUser) {
    throw HTTPError(UNAUTHORIZED, 'Token is empty or invalid');
  } else if (!quizFind) {
    throw HTTPError(UNAUTHORIZED, 'Quiz does not exist');
  }
  // if quiz is real then we can find the question
  const question: QuestionBody = quizFind.questions.find(q => q.questionId === questionId);
  if (!question) {
    throw HTTPError(BAD_REQUEST, 'Question Id does not exist');
  }
  // if question is real then we can add the duration on
  const newTotalDuration = quizFind.duration + questionBody.duration;

  if (quizFind.userId !== validUser.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  } else if (questionBody.question.length < minQuestionLength) {
    throw HTTPError(BAD_REQUEST, 'Question string is less than 5 characters in length');
  } else if (questionBody.question.length > maxQuestionLength) {
    throw HTTPError(BAD_REQUEST, 'Question string is greater than 50 characters in length');
  } else if (questionBody.answers.length > maxAnswersAmount) {
    throw HTTPError(BAD_REQUEST, 'The question has more than 6 answers');
  } else if (questionBody.answers.length < minAnswersAmount) {
    throw HTTPError(BAD_REQUEST, 'The question has less than 2 answers');
  } else if (questionBody.duration <= minDuration) {
    throw HTTPError(BAD_REQUEST, 'The question duration is not a positive number');
  } else if (newTotalDuration > maxTotalDuration) {
    throw HTTPError(BAD_REQUEST, 'The sum of the question durations in the quiz exceeds 3 minutes');
  } else if (questionBody.points > maxQuestionPoints || questionBody.points < minQuestionPoints) {
    throw HTTPError(BAD_REQUEST, 'The points awarded for the question are less than 1 or greater than 10');
  }
  // thumbnail errors
  try {
    const isValidImage = isJpegOrPng(questionBody.thumbnailUrl);
    if (!isValidImage) {
      throw new Error('error');
    }
  } catch (error) {
    throw HTTPError(BAD_REQUEST, 'the url must be a JPEG or PNG image or not an empty string');
  }
  // Answer Errors
  let correctFlag = 0;
  for (const answer of questionBody.answers) {
    if (answer.answer.length < minAnswerLength || answer.answer.length > maxAnswerLength) {
      throw HTTPError(BAD_REQUEST, 'The length of any answer is shorter than 1 character long, or longer than 30 characters long');
    }
    if (answer.correct === true) {
      correctFlag = 1;
    }
  }
  if (correctFlag === 0) {
    throw HTTPError(BAD_REQUEST, 'There are no correct answers');
  }
  const seenAnswers: string[] = [];
  for (const answer of questionBody.answers) {
    if (seenAnswers.includes(answer.answer)) {
      throw HTTPError(BAD_REQUEST, 'Duplicate answer');
    }
    seenAnswers.push(answer.answer);
  }

  // Changing the quiz info
  quizFind.duration = quizFind.duration - question.duration + questionBody.duration;
  quizFind.timeLastEdited = Math.floor(Date.now() / 1000);

  // Creating a question entity to be pushed to the quiz
  const completeQuestionBody: QuestionData = {
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    thumbnailUrl: questionBody.thumbnailUrl,
    points: questionBody.points,
    answers: [],
  };

  // Creating an answerId and colour for each answer in the answers array
  let existsInArray;
  for (const index in questionBody.answers) {
    let answerId: number;
    // checks if the answerid exists in any quiz question
    do {
      const randomNumber = Math.floor(Math.random() * 10000000);
      existsInArray = data.quizzes.some(quiz =>
        quiz.questions.some(question =>
          question.answers.some(answer => answer.answerId === randomNumber)
        )
      );
      if (!existsInArray) {
        answerId = randomNumber;
      }
    } while (existsInArray);

    const answersArray: AnswerData = {
      answerId: answerId,
      answer: questionBody.answers[index].answer,
      colour: colourArray[index],
      correct: questionBody.answers[index].correct
    };
    completeQuestionBody.answers.push(answersArray);
  }
  // Pushing the question to the quiz.
  const questionIndex = quizFind.questions.findIndex(q => q.questionId === questionId);
  quizFind.questions[questionIndex] = completeQuestionBody;

  setData(data);
  return {};
}

/**
 * Update the description of the relevant quiz.
 *
 * @param {string} token
 * @param {number} quizId
 * @param {string} description
 * @returns {empty object}
 */
export function adminQuizDescriptionUpdate(
  token: string,
  quizId: number,
  description: string
): Record<string, never> | ErrorObject {
  const data: DataStore = getData();
  const user: UserData = verifySession(token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Invalid Token');
  }
  const quizFind: QuizData = data.quizzes.find(b => b.quizId === quizId);
  if (quizFind === undefined) {
    throw HTTPError(BAD_REQUEST, 'Quiz does not exist');
  } else if (description.length > maxDescriptionLength) {
    throw HTTPError(BAD_REQUEST, `Description is more than ${maxDescriptionLength} characters in length`);
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      // finds the quiz with the quizId
      if (quiz.userId === user.userId) {
        quiz.description = description;
        quiz.timeLastEdited = Math.floor(Date.now() / 1000);
      } else {
        throw HTTPError(BAD_REQUEST, 'Quiz is owned by someone else');
      }
    }
  }
  setData(data);
  return {};
}

/**
 * Function that creates a quiz.
 * Basic implementation that also returns error messages
 * @param {string} token
 * @param {string} name
 * @param {string} description
 * @returns {{quizzes: {quizId: number}}}
 */

export function adminQuizCreate(token: string, name: string, description: string): QuizId | ErrorObject {
  const dataStore: DataStore = getData();
  const validUser: UserData = verifySession(token);
  const duplicateChecker: QuizData = dataStore.quizzes.find(q => q.name === name && q.userId === validUser.userId);
  const alphanumeric = /^[a-zA-Z0-9 ]+$/;

  if (!validUser) {
    return {
      error: 'Invalid token',
    };
  } else if (name.length < minNameLength || name.length > maxNameLength) {
    return {
      error: `Name length must be between ${minNameLength} and ${maxNameLength} characters`,
    };
  } else if (description.length > maxDescriptionLength) {
    return {
      error: `Description is above ${maxDescriptionLength} characters`,
    };
  } else if (!alphanumeric.test(name)) {
    return {
      error: 'Name must only have alphanumeric characters',
    };
  } else if (duplicateChecker) {
    return {
      error: 'Duplicate name found',
    };
  }

  const trash: Trash = getTrash();
  let id = 1;
  while (dataStore.quizzes.some(q => q.quizId === id) || trash.quizzes.some(t => t.quizId === id)) {
    id++;
  }
  dataStore.quizzes.push({
    userId: validUser.userId,
    quizId: id,
    name: name,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    description: description,
    numQuestions: 0,
    questions: [],
    duration: 0,
    thumbnailUrl: ''
  });

  setData(dataStore);
  return {
    quizId: id,
  };
}

/**
 * Moves specific question to trash
 *
 * @param {string} token
 * @param {number} questionId
 * @param {number} quizId
 * @param {number} newPosition
 * @returns {}
 */

export function adminQuestionMove(token: string, questionId: number, quizId: number, newPosition: number):
  ErrorObject | Record<string, never> {
  const dataStore: DataStore = getData();
  const user = verifySession(token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Invalid Token');
  }

  // Find the quiz
  const quizFind: QuizData = dataStore.quizzes.find(b => b.quizId === quizId);
  // Find the index of the question
  const questionIndex = quizFind.questions.findIndex(a => a.questionId === questionId);
  const numQuestions = quizFind.numQuestions;
  const minNewPosition = 0;
  const maxNewPosition = numQuestions - 1;

  if (quizFind.userId !== user.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  } else if (quizFind === undefined) {
    throw HTTPError(BAD_REQUEST, 'Quiz does not exist');
  } else if (questionIndex === -1) {
    throw HTTPError(BAD_REQUEST, 'QuestionId does not exist in this quiz');
  } else if (newPosition < minNewPosition || newPosition > maxNewPosition) {
    throw HTTPError(BAD_REQUEST, 'New position not valid');
  } else if (questionIndex === newPosition) {
    throw HTTPError(BAD_REQUEST, 'New position is the same as the current question');
  }
  const moving = quizFind.questions.splice(questionIndex, 1);
  quizFind.questions.splice(newPosition, 0, moving[0]);
  setData(dataStore);
  return {};
}

/**
 * Moves specific question to trash
 *
 * @param {string} token
 * @param {number} questionId
 * @param {number} quizId
 * @returns {}
 */
export function adminQuestionRemove(token: string, questionId: number, quizId: number): ErrorObject | Record<string, never> {
  const dataStore: DataStore = getData();
  const user = verifySession(token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Invalid Token');
  }
  // Find the quiz
  const quizFind: QuizData = dataStore.quizzes.find(b => b.quizId === quizId);
  // Find the index of the question
  const questionIndex = quizFind.questions.findIndex(a => a.questionId === questionId);
  if (quizFind.userId !== user.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  } else if (quizFind === undefined) {
    throw HTTPError(FORBIDDEN, 'Quiz does not exist');
  } else if (questionIndex === -1) {
    throw HTTPError(BAD_REQUEST, 'QuestionId does not exist in this quiz');
  }

  quizFind.questions.splice(questionIndex, 1);
  setData(dataStore);
  return {};
}

/**
 * Moves specific quiz to trash
 *
 * @param {string} token
 * @param {number} quizId
 * @returns {}
 */

export function adminQuizRemove(token: string, quizId: number): ErrorObject | Record<string, never> {
  const dataStore: DataStore = getData();
  // function .find searches for userid in datastore
  const user = verifySession(token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Invalid Token');
  }
  // find index finds the index of the specific object
  const quizDelIndex: number = dataStore.quizzes.findIndex(q => q.quizId === quizId);
  // anyone wondering, findindex returns -1 when it cannot find the element
  if (quizDelIndex === notFound) {
    throw HTTPError(FORBIDDEN, 'Quiz does not exist');
  }
  const quiz: QuizData = dataStore.quizzes[quizDelIndex];
  if (quiz.userId !== user.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  }

  const trash = getTrash();
  trash.quizzes.push(quiz);
  setTrash(trash);
  dataStore.quizzes.splice(quizDelIndex, 1);
  setData(dataStore);
  return {};
}

/** Update the name of the relevant quiz.
 * @param {string} token
 * @param {number} quizId
 * @param {string} name
 * @returns {empty object}
 */

export function adminQuizNameUpdate(token: string, quizId: number, name: string): ErrorObject | Record<string, never> {
  const data: DataStore = getData();
  const user: UserData = verifySession(token);

  if (!user) {
    throw HTTPError(401, 'token is not valid');
  }

  const quizIdFind: QuizData = data.quizzes.find(a => a.quizId === quizId);
  if (quizIdFind === undefined) {
    throw HTTPError(401, 'Quiz ID does not refer to a valid quiz');
  }

  const quizIdindex: number = data.quizzes.findIndex(q => q.quizId === quizId);
  const quiz: QuizData = data.quizzes[quizIdindex];

  if (quiz.userId !== user.userId) {
    throw HTTPError(403, 'Quiz is owned by someone else');
  }

  if (name.length < minNameLength) {
    throw HTTPError(400, `Name is less than ${minNameLength} characters long.`);
  }
  if (name.length > maxNameLength) {
    throw HTTPError(400, `Name is more than ${maxNameLength} characters long.`);
  }

  const valid = /^[a-zA-Z0-9 ]+$/;
  if (!(valid.test(name))) {
    throw HTTPError(400, 'Name contains invalid characters.');
  }

  const userQuizzes: QuizData[] = data.quizzes.filter(quiz => quiz.userId === user.userId);
  const duplicateChecker: QuizData = userQuizzes.find(quiz => quiz.name === name);

  if (duplicateChecker) {
    throw HTTPError(400, 'Name is already used by the current logged in user for another quiz');
  }

  quizIdFind.name = name;
  quizIdFind.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

  return {};
}

/**
 * Provide a list of all quizzes
 * that are owned by the currently logged in user.
 *
 * @param {string} token
 * @returns {
 *  Array<{
 *     quizId: number,
 *     name: string
 *  }>
 * }
 */

export function adminQuizList(token: string): QuizListResponse | ErrorObject {
  const data: DataStore = getData();
  const user: Token = getTokens().tokenList.find(t => t.sessionId === token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Token is empty or invalid');
  }

  const quizzes: QuizListItem[] = [];
  data.quizzes.forEach((quiz) => {
    if (quiz.userId === user.userId) {
      quizzes.push({
        quizId: quiz.quizId,
        name: quiz.name,
      });
    }
  });

  return {
    quizzes: quizzes
  };
}

/**
 * Get all of the relevant information about the current quiz.
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {quizId: number, name: string, timeCreated: number,
 *           timeLastEdited: number, description: string,
 *           numQuestions: number, questions: QuestionData[],
 *           duration: number, thumbnailUrl: string}
 */

export function adminQuizInfo(token: string, quizId: number): QuizInfoResponse {
  const data: DataStore = getData();
  const user = getTokens();
  const tokenCheck = user.tokenList.find(element => element.sessionId === token);

  if (!tokenCheck) {
    throw HTTPError(UNAUTHORIZED, 'Invalid token');
  }

  const quizIdFind: QuizData = data.quizzes.find(a => a.quizId === quizId);
  if (quizIdFind === undefined) {
    throw HTTPError(FORBIDDEN, 'Quiz ID does not refer to a valid quiz');
  }

  if (quizIdFind.userId !== tokenCheck.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  }

  return {
    quizId: quizIdFind.quizId,
    name: quizIdFind.name,
    timeCreated: quizIdFind.timeCreated,
    timeLastEdited: quizIdFind.timeLastEdited,
    description: quizIdFind.description,
    numQuestions: quizIdFind.numQuestions,
    questions: quizIdFind.questions,
    duration: quizIdFind.duration,
    thumbnailUrl: quizIdFind.thumbnailUrl
  };
}

/**
 * View the quizzes that are currently in the trash for the logged in user
 *
 * @param {string} token
 * @returns {quizId: number, name: string}
 */
export function adminQuizTrash(token: string): QuizTrash | ErrorObject {
  const user: Token = getTokens().tokenList.find(t => t.sessionId === token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Token is empty or invalid');
  }
  const trash: QuizData[] = getTrash().quizzes;
  const userOwned: QuizData[] = trash.filter((quiz) => quiz.userId === user.userId);
  const res: QuizListItem[] = userOwned.map((quiz) => ({ quizId: quiz.quizId, name: quiz.name }));
  return { quizzes: res };
}

/**
 * Transfers a quiz to another user based on their email
 *
 * @param {number} quizId - id of a quiz
 * @param {string} token - unique uuid
 * @param {string} email - user email
 * @returns {} - empty object
 */
export function adminQuizTransfer(quizId: number, token: string, email: string): ErrorObject | Record<string, never> {
  const data = getData();
  const user = verifySession(token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Invalid Token');
  }
  const quizIndex = data.quizzes.findIndex(q => q.quizId === quizId);
  if (quizIndex === notFound) {
    throw HTTPError(FORBIDDEN, 'Quiz not found');
  }
  const quiz = data.quizzes[quizIndex];
  const owner = data.users.find(u => u.userId === quiz.userId);
  if (owner.userId !== user.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  }
  const receiver = data.users.find(u => u.email === email);
  if (!receiver) {
    throw HTTPError(BAD_REQUEST, 'Invalid email');
  }
  const duplicateTitles = data.quizzes.find(q => q.name === quiz.name && q.userId === receiver.userId);
  if (duplicateTitles) {
    throw HTTPError(BAD_REQUEST, 'Duplicate titles');
  }
  if (receiver.userId === user.userId) {
    throw HTTPError(BAD_REQUEST, 'User cannot be the receiver');
  }

  quiz.userId = receiver.userId;
  setData(data);
  return {};
}

/**
 * Restore a particular quiz from the trash back to an active quiz
 *
 * @param {string} token
 * @param {number} quizId
 * @returns {error: string, {}}
 */
export function adminQuizRestore(token: string, quizId: number): ErrorObject | Record<string, never> {
  const trash: Trash = getTrash();
  const data: DataStore = getData();
  const user = getTokens().tokenList.find(t => t.sessionId === token);

  if (!user) { // Token is empty or invalid
    throw HTTPError(UNAUTHORIZED, 'Token is empty or invalid');
  }
  // no quiz with given quizId
  if (
    !trash.quizzes.some(q => q.quizId === quizId) &&
    !data.quizzes.some(q => q.quizId === quizId)
  ) {
    throw HTTPError(FORBIDDEN, 'no quiz with given quizId');
  }
  // user is not an owner of this quiz
  if (
    !trash.quizzes.some(q => q.userId === user.userId) &&
    !data.quizzes.some(q => q.userId === user.userId)
  ) {
    throw HTTPError(FORBIDDEN, 'user does not own quiz');
  }
  // quiz is not currently in the trash
  if (!trash.quizzes.some(q => q.quizId === quizId)) {
    throw HTTPError(BAD_REQUEST, 'quiz not found in trash');
  }
  // quiz name already used
  const quiz: QuizData = trash.quizzes.find(q => q.quizId === quizId);
  if (data.quizzes.some(q => q.name === quiz.name)) {
    throw HTTPError(BAD_REQUEST, 'quiz name already used');
  }
  recycle(quizId);
  const newData: DataStore = getData();
  const restoredQuiz: QuizData = newData.quizzes.find(q => q.quizId === quizId);
  restoredQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(newData);
  return {};
}

export function adminQuizEmpty(token: string, quizIds: number[]): ErrorObject | Record<string, never> {
  const user: Token = getTokens().tokenList.find(t => t.sessionId === token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Token is empty or invalid');
  }
  const trash: Trash = getTrash();
  const data: DataStore = getData();
  // one or more quiz ids don't exist
  for (const quizId of quizIds) {
    if (
      !trash.quizzes.some(q => q.quizId === quizId) &&
      !data.quizzes.some(q => q.quizId === quizId)
    ) {
      throw HTTPError(FORBIDDEN, 'one or more quiz ids do not exist');
    }
  }

  // one or more quiz id refers to a quiz that the user does not own
  for (const quizId of quizIds) {
    if (
      !trash.quizzes.some(q => q.userId === user.userId && q.quizId === quizId) &&
      !data.quizzes.some(q => q.userId === user.userId && q.quizId === quizId)
    ) {
      throw HTTPError(FORBIDDEN, 'quiz id refers to a quiz that the user does not own');
    }
  }

  // one or more quiz id is not in the trash
  for (const quizId of quizIds) {
    if (!trash.quizzes.some(q => q.quizId === quizId)) {
      throw HTTPError(BAD_REQUEST, 'one or more quiz id is not in the trash');
    }
  }
  const newQuizzes: QuizData[] = trash.quizzes.filter(q => !quizIds.includes(q.quizId));
  trash.quizzes = newQuizzes;
  setTrash(trash);
  return {};
}

/**
 * Given a quizId and questionId, it duplicates a quiz next to its immediate position
 * with a different id
 *
 * @param {number} quizId
 * @param {number} questionId
 * @param {token}  token
 * @returns {questionId: number}
 *
 */
export function adminQuestionDuplicate(quizId: number, questionId: number, token: string): QuestionId | ErrorObject {
  const data = getData();
  const quizIndex = data.quizzes.findIndex(q => q.quizId === quizId);
  if (quizIndex === notFound) {
    throw HTTPError(UNAUTHORIZED, 'Invalid quiz');
  }

  const quiz = data.quizzes[quizIndex];
  const user = verifySession(token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Invalid token');
  }

  if (user.userId !== quiz.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  }

  const validQuestionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (validQuestionIndex === notFound) {
    throw HTTPError(BAD_REQUEST, 'Invalid question');
  }
  const validQuestion = quiz.questions[validQuestionIndex];
  const duplicate: QuestionData = JSON.parse(JSON.stringify(validQuestion));
  let questionIdExists = true; // assuming that it exists for now
  let newQuestionID;
  while (questionIdExists) {
    const randomNumber = Math.floor(Math.random() * 1000000);
    questionIdExists = data.quizzes.some(quiz =>
      quiz.questions.some(question => question.questionId === randomNumber)
    );
    if (!questionIdExists) {
      newQuestionID = randomNumber;
    }
  }
  duplicate.questionId = newQuestionID;
  const newPosition = validQuestionIndex + 1;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.questions.splice(newPosition, 0, duplicate);
  setData(data);
  return { questionId: newQuestionID };
}

/**
 *
 * @param {string} url - inputted url
 * @param {string} token - user token
 * @param {number} quizId - quizid number
 * @returns {imgUrl: url} - returns string that is url
 */
export function adminThumbnailUpdate(url: string, token: string, quizId: number): ThumbnailResponse | ErrorObject {
  const data = getData();
  const user = verifySession(token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Invalid token');
  }
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'Quiz is invalid');
  }
  if (quiz.userId !== user.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  }
  try {
    const isValidImage = isJpegOrPng(url);
    if (!isValidImage) {
      throw new Error('error');
    }
  } catch (error) {
    throw HTTPError(BAD_REQUEST, 'the url must be a JPEG or PNG image or not an empty string');
  }
  quiz.thumbnailUrl = url;
  setData(data);
  return {
    imgUrl: url
  };
}
/**
 *
 * @param {string} token - unique user authenticator
 * @param {number} quizId - quiz id reference
 * @param {number} autoStartNum - number of players for autostart
 * @returns {sessionId: id} - sessionId
 */
export function adminStartSession(token: string, quizId: number, autoStartNum: number): SessionId {
  const data = getData();
  const user = verifySession(token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Invalid token');
  }
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (quiz.userId !== user.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  }
  if (autoStartNum > maxAutoStartNum) {
    throw HTTPError(BAD_REQUEST, 'AutoStartNum exceeds max capacity of 50 players');
  }
  if (quiz.questions.length === noQuestions) {
    throw HTTPError(BAD_REQUEST, 'There are no questions in this quiz.');
  }
  const duplicate: QuizData = JSON.parse(JSON.stringify(quiz));
  const tokenData = getTokens();
  const tokenFind = tokenData.tokenList.find(t => t.sessionId === token);
  const sessionCount = tokenFind.sessions.filter(s => s.metadata.quizId === quizId && s.state !== 'END').length;
  if (sessionCount > maxSessions) {
    throw HTTPError(BAD_REQUEST, 'Sessions for quiz is already at maximum number at ten');
  }
  let id = 1;
  while (tokenFind.sessions.some(t => t.quizSessionId === id)) {
    id++;
  }

  const questionResultsPush = [];
  for (const question of quiz.questions) {
    const questionResult: QuestionResults = {
      questionId: question.questionId,
      playersCorrectList: [],
      averageAnswerTime: 0,
      percentCorrect: 0,
      timeStarted: 0,
      timeEnded: 0
    };
    questionResultsPush.push(questionResult);
  }

  const newSession: SessionsData = {
    quizSessionId: id,
    atQuestion: 0,
    state: 'LOBBY',
    questionResults: questionResultsPush,
    players: [],
    metadata: duplicate
  };
  tokenFind.sessions.push(newSession);
  setData(data);
  setTokens(tokenData);
  return { sessionId: id };
}

export function adminViewSessions(token: string, quizId: number) {
  const data = getData();
  const user = verifySession(token);
  if (!user) {
    throw HTTPError(UNAUTHORIZED, 'Invalid token');
  }
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'Invalid quiz');
  }
  if (quiz.userId !== user.userId) {
    throw HTTPError(FORBIDDEN, 'Quiz is owned by someone else');
  }
  const tokenData = getTokens();
  const tokenFind = tokenData.tokenList.find(t => t.sessionId === token);
  const activeSessions = tokenFind.sessions.filter(s => s.state !== 'END' && s.metadata.quizId === quizId).map(s => s.quizSessionId);
  const inactiveSessions = tokenFind.sessions.filter(s => s.state === 'END' && s.metadata.quizId === quizId).map(s => s.quizSessionId);
  const viewSessions = {
    activeSessions: activeSessions,
    inactiveSessions: inactiveSessions
  };
  console.log(viewSessions);
  setData(data);
  setTokens(tokenData);
  return viewSessions;
}

/**
 * Creates a randomly generated string with [5 letters][3 numbers]
 * (e.g. valid123, ifjru483, ofijr938)
 * where there are no repititions of numbers of chars within the string
 *
 * @returns {string}
 */

function randomNameGenerator(): string {
  const originalAlphas = [
    'a', 'b', 'c', 'd', 'e',
    'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y',
    'z'
  ];
  const originalNums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const alphas = [...originalAlphas];
  const nums = [...originalNums];

  let name = '';
  const numLetters = 5;
  const numNumbers = 3;

  while (name.length < numLetters) {
    const pos = Math.floor(Math.random() * alphas.length);
    name += alphas.splice(pos, 1)[0];
  }
  while (name.length < numLetters + numNumbers) {
    const pos = Math.floor(Math.random() * nums.length);
    name += nums.splice(pos, 1)[0];
  }
  return name;
}

/**
 * Allow a guest player to join a quiz session
 *
 * @param sessionId
 * @param name
 */
export function playerJoin(sessionId: number, name: string) {
  const tokenData = getTokens();
  const token = tokenData.tokenList.find(t => t.sessions.find(s => s.quizSessionId === sessionId));
  const session = token.sessions.find(s => s.quizSessionId === sessionId);

  if (session.state !== 'LOBBY') {
    throw HTTPError(BAD_REQUEST, 'Session is not in LOBBY state');
  } else if (session.players.some(p => p.name === name)) {
    throw HTTPError(BAD_REQUEST, 'Another player already has the same name');
  }

  let newPlayerId = 1;
  while (session.players.some(p => p.id === newPlayerId)) {
    newPlayerId++;
  }

  if (name === '') {
    name = randomNameGenerator();
  }
  session.players.push(
    {
      id: newPlayerId,
      name: name,
      score: 0,
      timeLastSubmitted: 0
    }
  );
  setTokens(tokenData);

  return {
    playerId: newPlayerId
  };
}

export function playerStatus(playerId: number): PlayerResponse {
  const tokenData = getTokens();
  const token = tokenData.tokenList.find(t => t.sessions.find(s => s.players.some(p => p.id === playerId)));
  if (!token) {
    throw HTTPError(BAD_REQUEST, 'player ID does not exist');
  }
  const session = token.sessions.find(s => s.players.some(p => p.id === playerId));
  return {
    state: session.state,
    numQuestions: session.metadata.numQuestions,
    atQuestion: session.atQuestion
  };
}
