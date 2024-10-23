import fs from 'fs';

export interface passwords {
  password: string;
}

export interface UserData{
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  past_password: passwords[]
}

export interface AnswerData {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface QuestionData {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: AnswerData[];
}

export interface Player {
  id: number;
  name: string;
  score: number;
  timeLastSubmitted: number;
}

export interface QuestionResults {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
  timeStarted: number;
  timeEnded: number;
}

export interface SessionsData {
  quizSessionId: number;
  atQuestion: number;
  state: string;
  questionResults: QuestionResults[];
  players: Player[];
  metadata: QuizData;
}

export interface QuizData {
  userId: number;
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

export interface DataStore {
  users: UserData[];
  quizzes: QuizData[];
}

export interface Token {
  userId: number;
  sessionId: string;
  sessions: SessionsData[];
}

export interface Tokens {
  tokenList: Token[];
}

let tokens: Tokens = {
  tokenList: []
};

let data: DataStore = {
  users: [
  ],
  quizzes: [
  ],
};

// for putting quizzes in the trash
export interface Trash {
  quizzes: QuizData[];
}

let trash: Trash = {
  quizzes: []
};

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() : DataStore {
  if (fs.existsSync('./database.json')) {
    const database = fs.readFileSync('./database.json');
    data = JSON.parse(String(database));
  }
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore): void {
  const jsonstr = JSON.stringify(newData);
  fs.writeFileSync('./database.json', jsonstr);
}

function getTokens() : Tokens {
  if (fs.existsSync('./tokens.json')) {
    const database = fs.readFileSync('./tokens.json');
    tokens = JSON.parse(String(database));
  }
  return tokens;
}

function setTokens(newToken: Tokens): void {
  const jsonstr = JSON.stringify(newToken);
  fs.writeFileSync('./tokens.json', jsonstr);
}

function getTrash() : Trash {
  if (fs.existsSync('./trash.json')) {
    const database = fs.readFileSync('./trash.json');
    trash = JSON.parse(String(database));
  }
  return trash;
}

function setTrash(newTrash: Trash): void {
  const jsonstr = JSON.stringify(newTrash);
  fs.writeFileSync('./trash.json', jsonstr);
}

function emptyTrash() : void {
  setTrash({ quizzes: [] });
}

// moves given quiz from trash to datastore
function recycle(quizId: number) : void {
  const trash: Trash = getTrash();
  const trashQuizIndex: number = trash.quizzes.findIndex((quiz) => quiz.quizId === quizId);

  const data: DataStore = getData();
  data.quizzes.push(trash.quizzes[trashQuizIndex]);
  setData(data);

  trash.quizzes.splice(trashQuizIndex, 1);
  setTrash(trash);
}

export { getData, setData, getTokens, setTokens, getTrash, setTrash, emptyTrash, recycle };
