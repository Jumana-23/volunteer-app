import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/eventRoutes.js'; 

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/events', eventsRouter);

app.get('/', (req, res) => {
  res.send('Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
