import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getVolunteerHistory, postVolunteerHistory } from './src/backend/volunteerHistoryController.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/volunteerHistory', getVolunteerHistory);
app.post('/api/volunteerHistory', postVolunteerHistory);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
