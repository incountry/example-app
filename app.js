import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const contactsDB = {};

const app = express();
const {
  BORDER_URL, NODE_PORT: port = 3000,
} = process.env;

if (!BORDER_URL) {
  console.log('Missing one of the required ENV variables. BORDER_URL is required');
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  res.render('index', { BORDER_URL });
});

app.get('/contacts', async (req, res) => {
  res.json(Object.values(contactsDB));
});

app.get('/contacts/:id', async (req, res) => {
  if (req.params.id in contactsDB) {
    return res.json(contactsDB[req.params.id]);
  }
  return res.sendStatus(404);
});

app.post('/contacts', async (req, res) => {
  const id = uuidv4();
  contactsDB[id] = { ...req.body, id };
  res.json(contactsDB[id]);
});

app.patch('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  if (id in contactsDB) {
    contactsDB[req.params.id] = { ...contactsDB[id], ...req.body };
    return res.json(contactsDB[id]);
  }
  return res.sendStatus(404);
});

app.delete('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  if (id in contactsDB) {
    delete contactsDB[id];
  }
  return res.json({ deletedId: id });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
