import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

import { clear } from './other';
import { createSession, verifySession } from './sessions';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminAuthLogout,
  adminUpdateUserDetails,
  adminUpdateUserPassword
} from './auth';
import {
  playerQuestionInfo,
  adminQuizDescriptionUpdate,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizTrash,
  adminQuestionCreate,
  adminQuizRestore,
  adminQuizEmpty,
  adminQuizTransfer,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuestionRemove,
  adminQuizInfo,
  adminQuestionDuplicate,
  adminQuestionMove,
  adminQuestionUpdate,
  adminThumbnailUpdate,
  adminSessionStatus,
  adminStartSession,
  adminViewSessions,
  playerSubmitAnswer,
  playerJoin,
  playerStatus,
  playerQuestionResults,
} from './quiz';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

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

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;
  const response = adminQuizRemove(token, quizId);
  if ('error' in response) {
    if (response.error === 'Invalid token') {
      return res.status(401).json(response);
    }
    if (response.error === 'Quiz is owned by someone else') {
      return res.status(403).json(response);
    }
    return res.status(400).json(response);
  }
  return res.json(response);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const nameFirst: string = req.body.nameFirst;
  const nameLast: string = req.body.nameLast;
  const ret = adminAuthRegister(email, password, nameFirst, nameLast);
  if ('error' in ret) {
    res.status(400);
  } else {
    const token = createSession(ret.authUserId);
    return res.json({ token: token });
  }
  return res.json(ret);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const objects = verifySession(token);
  if (objects === null) {
    return res.json(adminUserDetails(null));
  }
  return res.json(adminUserDetails(objects.userId));
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  res.json(adminQuizList(token));
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const ret = adminAuthLogin(email, password);
  if ('error' in ret) {
    res.status(400);
  } else {
    const token = createSession(ret.authUserId);
    return res.json({ token: token });
  }
  return res.json(ret);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.header('token');
  const oldPassword: string = req.body.oldPassword;
  const newPassword: string = req.body.newPassword;
  res.json(adminUpdateUserPassword(token, oldPassword, newPassword));
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const email: string = req.body.email;
  const nameFirst: string = req.body.nameFirst;
  const nameLast: string = req.body.nameLast;
  res.json(adminUpdateUserDetails(token, email, nameFirst, nameLast));
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, description } = req.body;
  const response = adminQuizCreate(token, name, description);
  if ('error' in response) {
    if (response.error === 'Invalid token') {
      return res.status(401).json(response);
    }
    return res.status(400).json(response);
  }
  return res.json(response);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const token: string = req.headers.token as string;
  const description = req.body.description;
  const quizid = parseInt(req.params.quizid);
  const ret = adminQuizDescriptionUpdate(token, quizid, description);
  return res.json(ret);
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  res.json(adminQuizRemove(token, quizId));
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.header('token');
  const questionBody: QuestionBody = req.body.questionBody;
  const quizId = parseInt(req.params.quizid);
  return res.json(adminQuestionCreate(token, questionBody, quizId));
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const name = req.body.name as string;
  res.json(adminQuizNameUpdate(token, quizId, name));
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  res.json(clear());
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  res.json(adminQuizTrash(token));
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(adminAuthLogout(token));
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const { userEmail } = req.body;
  return res.json(adminQuizTransfer(quizId, token, userEmail));
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token: string = req.headers.token as string;
  return res.json(adminQuizRestore(token, quizId));
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizIds = JSON.parse(decodeURIComponent(req.query.quizIds as string)) as number[];
  res.json(adminQuizEmpty(token, quizIds));
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const token: string = req.headers.token as string;
  return res.json(adminQuizInfo(token, quizid));
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token: string = req.body.token;
  const questionBody: QuestionBody = req.body.questionBody;
  const quizId = parseInt(req.params.quizid);
  return res.json(adminQuestionCreate(token, questionBody, quizId));
});

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.header('token');
  const questionId = parseInt(req.params.questionid);
  const quizId = parseInt(req.params.quizid);
  res.json(adminQuestionRemove(token, questionId, quizId));
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const newPosition = req.body.newPosition;
  const questionId = parseInt(req.params.questionid);
  const quizId = parseInt(req.params.quizid);
  res.json(adminQuestionMove(token, questionId, quizId, newPosition));
});

app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  res.json(adminQuestionDuplicate(quizId, questionId, token));
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const questionBody: QuestionBody = req.body.questionBody;
  const ret = adminQuestionUpdate(token, quizId, questionId, questionBody);
  return res.json(ret);
});

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const url = req.body.imgUrl;
  res.json(adminThumbnailUpdate(url, token, quizId));
});

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const autoStartNum = req.body.autoStartNum;
  const token = req.headers.token as string;
  res.json(adminStartSession(token, quizId, autoStartNum));
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  res.json(adminViewSessions(token, quizId));
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;
  res.json(adminSessionStatus(token, quizId, sessionId));
});

app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionposition = parseInt(req.params.questionposition);
  res.json(playerQuestionInfo(playerId, questionposition));
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionposition = parseInt(req.params.questionposition);
  const answerIds = req.body.answerIds;
  res.json(playerSubmitAnswer(playerId, questionposition, answerIds));
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const sessionId = parseInt(req.body.sessionId);
  const name = req.body.name as string;
  res.json(playerJoin(sessionId, name));
});

app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  res.json(playerStatus(playerId));
});

app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const questionposition = parseInt(req.params.questionposition);
  res.json(playerQuestionResults(playerId, questionposition));
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    404 Not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
