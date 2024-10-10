const backendUrl = process.env.BACKEND_URL;
document.addEventListener('DOMContentLoaded', (event) => {
    const currentUrl = window.location.pathname;
    if (currentUrl === '/quiz') {
        
        const currentQuizIndex = parseInt(localStorage.getItem('currentQuizIndex')) || 0;
        // 로컬 스토리지에 questions가 이미 존재하는지 확인
        if (localStorage.getItem('questions')) {
            console.log("로컬 스토리지에서 퀴즈 데이터를 불러옵니다.");
            // 로컬 스토리지에 저장된 데이터를 이용해 퀴즈를 로드
           
            loadQuizFromLocalStorage(currentQuizIndex);
        } else {
        document.querySelector('.container').style.display = "none";
            console.log("로드퀴즈 시작");
            loadQuiz(currentQuizIndex);
        }
        const quizForm = document.getElementById('quiz-form');
        if (quizForm) {
        quizForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userAnswer = document.getElementById('input-box').value.trim();
            handleQuizSubmit(userAnswer);
        });

        } }else if (currentUrl === '/feedback') {
        const currentQuizIndex = parseInt(localStorage.getItem('currentQuizIndex')) || 0;
        const userAnswer = localStorage.getItem(`quiz_${currentQuizIndex}_userAnswer`) || '';
        const quizResult = localStorage.getItem(`quiz_${currentQuizIndex}_result`) || '';
        const descriptionFeedback = localStorage.getItem(`quiz_${currentQuizIndex}_description`) || '';
        const exampleFeedback = localStorage.getItem(`quiz_${currentQuizIndex}_example`) || '';
        const question = localStorage.getItem('question').replace(/"/g, '') || '';
        const correctAnswer = localStorage.getItem(`quiz_${currentQuizIndex}_correctAnswer`) || ''; // 정답을 로컬 스토리지에서 가져옴
        const sentence = localStorage.getItem(`quiz_${currentQuizIndex}_sentence`) || '';
        // 퀴즈 결과에 따라 색상을 변경하는 함수
        function updateColors(isCorrect) {
            const colorScheme = isCorrect ? {
                bgColor: '#d7ffb8', // correct 배경색
                textColor: '#489d26', // correct 텍스트 색상
                buttonColor: '#42c62f', // correct 버튼 배경색
                iconColor: '#489d26', // correct 아이콘 색상
                barColor: '#58cc02', // correct 진행 바 색상
                iconSrc: '../static/assets/check.png'
            } : {
                bgColor: '#ffdadc', // incorrect 배경색
                textColor: '#ee282d', // incorrect 텍스트 색상
                buttonColor: '#ff4347', // incorrect 버튼 배경색
                iconColor: '#ee282d', // incorrect 아이콘 색상
                barColor: '#ff4347', // incorrect 진행 바 색상
                iconSrc: '../static/assets/cross.png'
            };
       
            document.querySelector('.container').style.backgroundColor = '#ffffff'; // 기본 배경 색상 고정
            document.querySelector('.progress-bar').style.backgroundColor = colorScheme.barColor;
            document.querySelector('h1').style.color = colorScheme.textColor;
            document.querySelector('.footer').style.backgroundColor = colorScheme.bgColor;
            document.querySelector('.result').style.color = colorScheme.iconColor;
            document.querySelector('.next-button').style.backgroundColor = colorScheme.buttonColor;
            document.querySelector('.next-button').style.color = '#ffffff'; // 버튼 텍스트 색상 고정
            document.querySelector('.options').style.color = colorScheme.textColor;
            document.querySelector('.icon').src = colorScheme.iconSrc;
            document.getElementById('correctAnswer').style.color  = colorScheme.textColor;
        }
       
        if (quizResult === '정답입니다') {
            updateColors(true);
            document.getElementById('iscorrect').textContent = '✨정답이에요✨'
            document.getElementById('final-result').textContent = '대단해요!';
        } else {
            updateColors(false);
            document.getElementById('iscorrect').textContent = '😭오답이에요😭'
            document.getElementById('final-result').textContent = '다시 학습해볼까요?';
        }


        // 데이터를 HTML 요소에 할당
        document.getElementById('userAnswer').textContent = userAnswer;
        document.getElementById('question').textContent = question; // 문제를 표시
        document.getElementById('correctAnswer').textContent = correctAnswer;
        document.getElementById('description-feedback').textContent = descriptionFeedback.split('.').join('.\n');
        document.getElementById('example-feedback').textContent = exampleFeedback;
        document.getElementById('sentence-feedback').textContent = sentence;


        // 'next-quiz' 버튼에 대한 이벤트 리스너 추가
        const nextQuizButton = document.getElementById('next-quiz');
        if (nextQuizButton) {
            nextQuizButton.addEventListener('click', function() {
                console.log("다음 버튼을 눌렀습니다");
                nextQuizQuestion();
            });
        } else {
            console.error('next-quiz 버튼을 찾을 수 없습니다.');
        }
    }
});




// 전역 변수 선언
let questions = [];
let answers = [];
let currentExpressionIndex = 0;


async function loadQuiz(currentIndex) {
    console.log("로컬말고 새로 요청해서 퀴즈 받아옴")
    localStorage.removeItem('currentExpressionIndex');
    localStorage.removeItem('currentQuizIndex');
    const expressions = JSON.parse(localStorage.getItem('expressions'));
    const expressionNumber = localStorage.getItem('selectedQuantity');


    try {
        const response = await axios.post(`${backendUrl}/api/openai/expressionQuiz`, {
            expressions,
            quizNumber: expressionNumber
        });


        const quizData = response.data.quiz;
        questions = quizData.map(item => item.question);
        answers = quizData.map(item => item.answer);
        console.log("문제", questions)
        console.log("답", answers);
        localStorage.setItem('questions', JSON.stringify(questions));
        localStorage.setItem('answers', JSON.stringify(answers));


        currentExpressionIndex = currentIndex;
        console.log("몇번?" , currentExpressionIndex)
        document.getElementById('loading-screen').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        displayQuizQuestion(); // 첫 번째 문제 표시
    } catch (error) {
        console.error("로드퀴즈 오류", error);
    }
}




function loadQuizFromLocalStorage(currentIndex) {
    console.log("로컬스토리지에서 로드")
    questions = JSON.parse(localStorage.getItem('questions'));
    answers = JSON.parse(localStorage.getItem('answers'));
    console.log("문제", questions)
    console.log("답", answers);
    currentExpressionIndex = currentIndex;
    console.log("몇 번?", currentExpressionIndex)
    document.getElementById('loading-screen').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
    displayQuizQuestion(); // 첫 번째 문제 표시
}


// 현재 퀴즈 문제를 화면에 표시하는 함수
function displayQuizQuestion() {
    if (currentExpressionIndex >= questions.length) { // 모든 문제를 푼 경우
        window.location.href = '/quiz-result'; // 퀴즈 결과 페이지로 이동
        return;
    }


    const question = questions[currentExpressionIndex]; // 현재 퀴즈 문제를 가져옴
    localStorage.setItem('question', JSON.stringify(question));
    document.getElementById('expression-text').textContent = question; // 문제를 화면에 표시
    document.getElementById('input-box').value = ''; // 사용자의 답안 입력 필드를 초기화
}


// 사용자가 답안을 제출했을 때 호출되는 함수
function handleQuizSubmit(userAnswer){
    const captions = JSON.parse(localStorage.getItem('captions'));
    const currentQuestion = questions[currentExpressionIndex];
   
    // 답안을 서버로 전송
    fetch('http://localhost:5000/api/openai/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            captions:captions,
            question: currentQuestion,
            userAnswer: userAnswer
        })
    })
    .then(response => response.json())
    .then(data => {
        // 서버로부터 피드백 받으면 처리
        console.log('서버 응답:', data);
        const formatteddescription = data.description.split('.').join('.\n');
        localStorage.setItem('currentQuizIndex', currentExpressionIndex); // 현재 퀴즈 인덱스를 저장
        localStorage.setItem(`quiz_${currentExpressionIndex}_result`, data.result); // 정답 여부를 저장
        localStorage.setItem(`quiz_${currentExpressionIndex}_description`, formatteddescription); // 피드백을 저장
        localStorage.setItem(`quiz_${currentExpressionIndex}_example`, data.example);
        localStorage.setItem(`quiz_${currentExpressionIndex}_correctAnswer`, data.correctAnswer); // 피드백을 저장
        localStorage.setItem(`quiz_${currentExpressionIndex}_userAnswer`, userAnswer); // 사용자의 답안을 저장
        localStorage.setItem(`quiz_${currentExpressionIndex}_sentence`, data.sentence);
        console.log("정답여부", data.result);
        window.location.href = '/feedback';
    })
    .catch(error => {
        console.error("답안 제출 오류", error);
    });
};



document.getElementById('next-quiz').addEventListener('click', function() {
    console.log("다음 버튼을 눌렀습니다");
    // 다음 퀴즈 문제로 이동
    nextQuizQuestion();
});


function nextQuizQuestion() {
    console.log("nextQuizQuestion 함수 시작");
    let currentQuizIndex = parseInt(localStorage.getItem('currentQuizIndex')) || 0;
    const questions = JSON.parse(localStorage.getItem('questions'));


    if (currentQuizIndex < questions.length - 1) {
        currentQuizIndex++; // 다음 문제로 이동
        console.log("더해진 인덱스 번호", currentQuizIndex);
        localStorage.setItem('currentQuizIndex', currentQuizIndex); // 인덱스를 로컬 스토리지에 저장
        window.location.href = '/quiz';
    } else {
        window.location.href = '/quiz-result'; // 모든 문제를 완료했으면 결과 페이지로 이동
    }
}




// 이전 퀴즈 문제로 돌아가는 함수
function previousQuizQuestion() {
    if (currentExpressionIndex > 0) { // 이전 문제로 돌아갈 수 있는지 확인
        currentExpressionIndex--; // 이전 문제로 이동
        displayQuizQuestion(); // 이전 문제를 화면에 표시
    }
}


// 퀴즈 결과를 계산하고 결과 페이지로 이동하는 함수
function calculateResult() {
    let correctCount = 0;
    // 여기서 사용자가 맞춘 문제의 수를 계산할 수 있음
    localStorage.setItem('correctCount', correctCount); // 정답 개수를 로컬 스토리지에 저장
    window.location.href = '/quiz-result'; // 결과 페이지로 이동
}

