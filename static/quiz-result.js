document.addEventListener('DOMContentLoaded', function() {
    const questions = JSON.parse(localStorage.getItem('questions')) || [];
    const correctCount = parseInt(localStorage.getItem('correctCount')) || 0;
    let score = 0;
    let point = Math.floor(100/questions.length);
    
    // 점수 계산
    questions.forEach((question, index) => {
        const quizResult = localStorage.getItem(`quiz_${index}_result`);
        if (quizResult === '정답입니다') {
            score = score+point;
        }
    });

    // 점수를 로컬 스토리지에 저장 (선택 사항)
    localStorage.setItem('quizScore', score);

    const themeStyle = document.getElementById('theme-style');

    // 점수에 따라 CSS 파일을 선택
    if (score > 60) {
        themeStyle.href = "../static/styles/quiz-pass.css"; // 60점 이상일 때
    } else {
        themeStyle.href = "../static/styles/quiz-fail.css"; // 60점 미만일 때
    }

    // 점수와 메시지 설정
    
    if (score > 60) {
        document.querySelector('.score strong').textContent = `🥳 ${score}점 🥳`;
        document.querySelector('.message').textContent = 'GPT인 제가 한 수 배워야겠어요!';
    } else {
        document.querySelector('.score strong').textContent = `😲 ${score}점 😲`;
        document.querySelector('.message').textContent = '복습하고 다시 도전해볼까요?';
    }

    // 퀴즈 결과 리스트 표시
    const quizListContainer = document.querySelector('.quiz-list');
    
    questions.forEach((question, index) => {
        const quizResult = localStorage.getItem(`quiz_${index}_result`);
        const isCorrect = quizResult === '정답입니다';
        const itemClass = isCorrect ? 'correct' : 'incorrect';

        const quizItem = document.createElement('div');
        quizItem.className = `quiz-item ${itemClass}`;
        quizItem.textContent = question;

        quizListContainer.appendChild(quizItem);
    });
    
    //퀴즈 종료 화면으로 이동
    document.querySelector('.next-button').addEventListener('click', function() {
        window.location.href = '/end-quiz'; // '다른 영상으로 학습하기' 버튼을 클릭 시 /index로 이동
    });
});
