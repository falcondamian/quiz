var models = require('../models/models.js');

// funcion de load
exports.load = function(req, res, next, quizId) {

	models.Quiz.find({
            where: {
                id: Number(quizId)
            },
            include: [{
                model: models.Comment
            }]
        }).then(function (quiz) {
		if (quiz) {
			req.quiz = quiz;
			next();
		} else {
			next(new Error('No existe el quiz con id : ' + quizId));
		}
	}).catch(function (error) {next(error);});
};

// GET /quizes
exports.index = function(req, res) {

	if (req.query.search) {
		req.query.search = req.query.search.replace(/\s/g,"%");
	} else {
		req.query.search = '';
	}	

	models.Quiz.findAll({where: ["pregunta like ?", '%' + req.query.search + '%']}).then(function (quizes) {
		
		res.render('quizes/index.ejs', {quizes: quizes});

	}).catch(function (error) {next(error);});
};

// GET /quizes/:id
exports.show = function(req, res) {
		
	res.render('quizes/show', {quiz: req.quiz});	
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {	
	
	var resultado = 'Incorrecto';
	if (req.query.respuesta && req.query.respuesta.toUpperCase() === req.quiz.respuesta.toUpperCase())  {

		resultado = 'Correcto';
	}

	res.render('quizes/answer', {quiz: req.quiz, respuesta:resultado});
};

// GET /quizes/new
exports.new = function(req, res) {

	var quiz = 	models.Quiz.build({pregunta : 'Pregunta', respuesta : 'Respuesta'});

	console.log('Build quiz ' + quiz);

	res.render('quizes/new', {quiz: quiz});	
};

// POST /quizes/create
exports.create = function(req, res) {

	var quiz = 	models.Quiz.build(req.body.quiz);

	quiz.validate().then(function (err) {

		if (err) {

			res.render('quizes/new', {quiz : quiz, errors : err.errors});

		} else {

			quiz.save({fields : ['pregunta','respuesta','tematica']}).then(function () {

				res.redirect('/quizes');
			});	
		}
	});		
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
		
	res.render('quizes/edit', {quiz: req.quiz});	
};

// PUT /quizes/update
exports.update = function(req, res) {

	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tematica = req.body.quiz.tematica;

	req.quiz.validate().then(function (err) {

		if (err) {

			res.render('quizes/edit', {quiz : req.quiz, errors : err.errors});

		} else {

			req.quiz.save({fields : ['pregunta','respuesta','tematica']}).then(function () {

				res.redirect('/quizes');
			});	
		}
	});		
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {

  req.quiz.destroy().then( function() {

    res.redirect('/quizes');
    
  }).catch(function(error){next(error)});
};