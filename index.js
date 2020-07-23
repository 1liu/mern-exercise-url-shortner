const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const yup = require('yup');
const { nanoid } = require('nanoid');
const mongoose = require('mongoose');
const monk = require('monk');

const app = express();
require('dotenv').config();

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build/')));


/* const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully")
}) */

const db = monk(process.env.ATLAS_URI);
const urls = db.get('urls');
//urls.createIndex({alisa: 1},{unique: true});
urls.createIndex('name');
app.get('/:id', async (req, res, next) => {
  // find and redirect to the url
  const { id: alias } = req.params;
  try {
    const url = await urls.findOne({ alias });
    if (url) {
      return res.redirect(url.url);
    }
    return res.redirect(`/?error=${alias} not found`);
  } catch (err) {
    res.redirect(`/?error=Link Not Found`);
  }
});

app.get('/url/:id', async (req, res, next) => {
  // retrive the url
  const { id: alias } = req.params;
  console.log('params', alias);
  try {
    const url = await urls.findOne({ alias });
    if (url) {
      return res.status(200).json(url);
    }
    res.status(500).json({
      message: "Link Not Found"
    })
  } catch (err) {
    next(err);
  }

});

const schema = yup.object().shape({
  alias: yup.string().trim().matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required()
})

app.post('/url', async (req, res, next) => {
  // create a short url
  let { alias, url } = req.body;
  try {
    await schema.validate({
      alias,
      url
    });
    if (!alias) {
      alias = nanoid(6);
    } else {
      const existing = await urls.findOne({ alias });
      if (existing) {
        throw new Error('Alias exists');
      }
    }
    const newUrl = {
      url,
      alias
    };
    const created = await urls.insert(newUrl);
    res.json({ created })

  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({
      error: 'an unexpected error occurred',
      stack: err.stack,
    });
  }
});

const port = process.env.SERVER_PORT | 6000;
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`)
})
