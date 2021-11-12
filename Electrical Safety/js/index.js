function ticketPrint() {
    window.print();
  }

(function () {
    var storage = {};
    var template = {};
    var view = {};
    var controller = {};

    // import value
    var tickets = window.tickets;
    var ticketRandom = Math.floor(Math.random() * tickets.length);
    var testname = window.name;

    storage.userName = '';
    storage.testnames = testname;
    storage.ticket = tickets[ticketRandom] || {};
    storage.questions = storage.ticket.list;
    storage.currentIndex = 0;
    storage.answerIds = [];

    template.questionCounter = function (current, total) {
        return '<h3>Вопрос ' + current + ' из ' + total + ':</h3>';
    };

    template.questionText = function (text) {
        return '<p class="question-text">' + text + '</p>';
    };

    template.answerOption = function (id, text) {
        return '<div class="question-answer">' + '<input type="radio" name="quiz" value="' + id + '">' + text + '</div>';
    };

    template.ticketName = function (testnames) {
        return '<h2>' + testname + '</h2>';
    };

    template.ticketInfo = function (ticket) {
        return '<h2>' + ticket.title + '</h2>';
    };

    template.answerCounter = function (counter) {
        return '<h2 style="text-transform: capitalize">' + '</h2>' + '<h2>' + storage.userName + ', количество правильных ответов: ' + counter + '</h2>';
    };

    template.answerResult = function (answer, correctId, index) {
        // ищем правильный ответ, чтобы покрасить в соответствующий цвет
        var additionalClass = answer.id == correctId ? 'correct' : 'wrong';
        // ищем наш ответ и если совпадает, то отметим
        var checked = answer.id == storage.answerIds[index] ? 'checked' : '';
        var input = '<input type="radio" name="quiz-' + index + '" disabled ' + checked + '>' + answer.text;

        return '<div class="question-answer ' + additionalClass + '">' + input + '</div>'
    };

    template.answerGrade = function (grade) {
        return '<h4 class="question-grade">Ваша оценка: ' + grade  + '</h4>';
    };

    template.nextButton = function () {
        return '<div class="button green" onclick="controller.checkAnswer();">Следующий</div>';
    };

    view.hideRules = function () {
        storage.$introduce.style.display = 'none';
    };

    view.hideQuestion = function () {
        storage.$question.style.display = 'none';
    };

    controller.setView = function () {
        storage.$introduce = document.querySelector('.introduce');
        storage.$question = document.querySelector('.question');
        storage.$result = document.querySelector('.result');
        storage.$name = document.querySelector('.name');
    };

    controller.startQuiz = function () {
        storage.userName = storage.$name.value.trim();

        if (storage.userName) {
            controller.hideIntroduce();
            controller.process();
        } else {
            alert('Введите ваше имя!');
        }
    };

    controller.process = function () {
        var currentQuestion = storage.questions[storage.currentIndex];

        storage.currentIndex++;

        if (currentQuestion) {
            controller.nextQuestion(currentQuestion);
        } else {
            controller.result();
        }
    };

    controller.nextQuestion = function (question) {
        var answerOptions = '';

        question.answers.forEach(function (answer) {
            answerOptions += template.answerOption(answer.id, answer.text);
        });

        storage.$question.innerHTML = '<div class="question-item">' +
            template.questionCounter(storage.currentIndex, storage.questions.length) +
            template.questionText(question.text) +
            answerOptions +
            template.nextButton() +
            '</div>';
    };

    controller.hideIntroduce = function () {
        view.hideRules();
    };

    controller.hideQuestion = function () {
        view.hideQuestion();
    };

    controller.checkAnswer = function () {
        var $list = document.querySelectorAll('input[name="quiz"]');
        var id = 0;

        for (var i = 0; i < $list.length; i++) {
            var $item = $list[i];

            if ($item.checked) {
                id = $item.value;
            }
        }

        if (id) {
            controller.setAnswerId(id);
            controller.process();
        } else {
            alert('Выберите вариант ответа!');
        }
    };

    controller.setAnswerId = function (id) {
        storage.answerIds.push(id);
    };

    controller.result = function () {
        controller.hideQuestion();

        var rightAnswers = 0;
        var resultHtml = '';

        storage.questions.forEach(function (question, index) {
            if (storage.answerIds[index] == question.correctId) {
                rightAnswers++;
            }

            var answersHtml = '';

            question.answers.forEach(function (answer) {
                answersHtml += template.answerResult(answer, question.correctId, index);
            });

            resultHtml += '<div class="question-item">' +
                template.questionText(question.text) +
                answersHtml +
                '</div>';
        });

        var grade = controller.calculationGrade(rightAnswers, storage.questions.length);

        storage.$result.innerHTML = template.ticketName(storage.testname) + template.ticketInfo(storage.ticket) + template.answerCounter(rightAnswers) + resultHtml;
        //storage.$result.innerHTML = template.answerCounter(rightAnswers) + template.answerGrade(grade) + resultHtml;
    };

    controller.calculationGrade = function (value, total) {
        var rate = value / total * 100;
        var grade = 'Неудовлетворительно';

        if (rate >= 80) {
            grade = 'Отлично';
        } else if (rate >= 60) {
            grade = 'Хорошо';
        } else if (rate >= 40) {
            grade = 'Удовлетворительно';
        }

        return grade;
    };

    // launch code
    controller.setView();

    // import
    window.controller = controller;
})();