const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const { response } = require('express');
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.unsubscribe(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Publications';

app.get('/', (request, response) => { response.send('Hello, Publications');
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

// Retrieve an array of all our papers 
app.get('/api/v1/papers', (request, response) => {
  database('papers').select()
  .then((papers) => {
    response.status(200).json(papers);
  })
  .catch((error) => {
    response.status(500).json({ error});
  });
});

// Retrieve all footnotes 
app.get('/api/v1/footnotes', (request, response) => {
  database('footnotes').select()
  .then((footnotes) => {
    response.status(200).json(footnotes);
  })
  .catch((error) => {
    response.status(500).json({ error});
  });
});

// Add new paper to the database 
app.post('/api/v1/papers', (request, response) => {
  const paper = request.body;

  for (let requiredParameter of ['title', 'author']) {
    if (!paper[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { title: <String>, author: <String> }. You're missing a "${requiredParameter}" property.`});
    }
  }

  database('papers').insert(paper, 'id')
    .then(paper => {
      response.status(201).json({ id: paper[0] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

// Add new footnote to the database 
app.post('/api/v1/footnotes', (request, response) => {
  const footnote = request.body;

  for (let requiredParameter of ['note', 'paper_id']) {
    if (!footnote[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { note: <String>, paper_id: <Integer> }. You're missing a "${requiredParameter}" property.`});
    }
  }

  database('footnotes').insert(footnote, 'id')
    .then(footnote => {
      response.status(201).json({ id: footnote[0] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

// Get a specific paper 
app.get('/api/v1/papers/:id', (request, response) => {
  database('papers').where('id', request.params.id).select()
  .then(papers => {
    if (papers.length) {
      response.status(200).json(papers);
    } else {
      response.status(404).json({ error: `Could not find papers with id ${request.params.id}`
    });
    }
  })
  .catch(error => {
    response.status(500).json({ error });
  });
});

// Get all footnotes for a pre-existing paper
app.get('/api/v1/papers/:id/footnotes', (request, response) => {
  database('footnotes').where('paper_id', request.params.id).select()
  .then(footnotes => {
    if (footnotes.length) {
      response.status(200).json(footnotes);
    } else {
      response.status(404).json({ error: `Could not find footnotes with a paper_id of ${request.params.id}`
    });
    }
  })
  .catch(error => {
    response.status(500).json({ error });
  });
});