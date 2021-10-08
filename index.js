const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.json());
app.use(
	morgan((tokens, req, res) => {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, 'content-length'),
			'-',
			tokens['response-time'](req, res),
			'ms',
			tokens.data(req, res),
		].join(' ');
	})
);

morgan.token('data', (request) => {
	return request.method === 'POST' ? JSON.stringify(request.body) : null;
});

let persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '39-44-5323523',
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '12-43-234345',
	},
	{
		id: 4,
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
	},
];

app.get('/api/persons/:id', (request, response, next) => {
	const id = Number(request.params.id);
	const person = persons.find((person) => person.id === id);

	if (person) {
		response.json(person);
	} else {
		response.status(404).end();
	}
});

app.get('/api/persons', (request, response) => {
	response.json(persons);
});

app.get('/info', (request, response) => {
	response.send(
		`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
	);
});

const generateId = () => {
	return Math.round(Math.random() * 100);
};

app.post('/api/persons', (request, response, next) => {
	const body = request.body;

	if (!body.number) {
		return response.status(400).json({ error: 'number missing' });
	}

	if (!body.name) {
		return response.status(400).json({ error: 'name missing' });
	}

	const people = persons.filter((person) => person.name === body.name);

	if (people.length > 0) {
		return response.status(400).json({
			error: people,
		});
	}

	const person = {
		name: body.name,
		number: body.number,
		id: generateId(),
	};

	persons = persons.concat(person);

	response.json(person);
});

app.delete('/api/persons/:id', (request, response, next) => {
	const id = Number(request.params.id);
	const people = persons.filter((person) => person.id !== id);

	response.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
