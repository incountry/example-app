import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

let idAutoincrement = 1;

const contactsDB = {};

const app = express();
const port = process.env.NODE_PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/contacts', async (req, res) => res.json(Object.values(contactsDB)));

app.get('/contacts/:id', async (req, res) => {
  if (req.params.id in contactsDB) {
    return res.json(contactsDB[req.params.id]);
  }
  return res.sendStatus(404);
});

app.post('/contacts', async (req, res) => {
  contactsDB[idAutoincrement] = { ...req.body, id: idAutoincrement };
  res.json(contactsDB[idAutoincrement]);
  idAutoincrement += 1;
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
