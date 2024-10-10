function gotoIndex(){
    localStorage.clear();
    window.location.href = '/';
}


function gotoLearning(){
    localStorage.removeItem('questions');
    localStorage.removeItem('answers');
    localStorage.removeItem('currentExpressionIndex');
    localStorage.removeItem('currentQuizIndex');
    window.location.href = '/learning-content';
}

function gotoQuiz() {
    localStorage.removeItem('questions');
    localStorage.removeItem('answers');
    localStorage.removeItem('currentExpressionIndex');
    localStorage.removeItem('currentQuizIndex');
    window.location.href = '/quiz';
}


function gotoShadowing(){
    window.location.href = '/shadowing';
}
