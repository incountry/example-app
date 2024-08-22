import express from 'express';
import cors from 'cors';
import axios from 'axios';
import bodyParser from 'body-parser';

let idAutoincrement = 1;

const contactsDB = {};

const app = express();
const port = process.env.NODE_PORT;

const {
  ENV_ID, CLIENT_ID, CLIENT_SECRET, AUTH_URL, RESTAPI_URL, STORAGE_URL,
} = process.env;

if (!(ENV_ID && CLIENT_ID && CLIENT_SECRET && AUTH_URL && RESTAPI_URL && STORAGE_URL)) {
  console.log('Missing one of the required ENV variables. ENV_ID, CLIENT_ID, CLIENT_SECRET, AUTH_URL, REST_API_URL, STORAGE_URL are all required');
  process.exit(1);
}

app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.render('index', { RESTAPI_URL });
});

app.post('/get_token', async (req, res) => {
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    responseType: 'json',
    auth: {
      username: CLIENT_ID,
      password: CLIENT_SECRET,
    },
  };

  try {
    const response = await axios.post(AUTH_URL, {
      grant_type: 'client_credentials',
      audience: `${RESTAPI_URL} ${STORAGE_URL}`,
      scope: ENV_ID,
    }, config);
    res.json(response.data);
  } catch (err) {
    console.log('Failed to retrieve Access Token: ', err.message);
    res.sendStatus(500);
  }
});

app.get('/contacts', async (req, res) => res.json(Object.values(contactsDB)));

app.get('/contacts/:id`', async (req, res) => {
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
  console.log(`Example app listening on port ${port} facing InCountry Storage ${RESTAPI_URL}`);
});
