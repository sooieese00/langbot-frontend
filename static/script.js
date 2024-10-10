const backendUrl = process.env.BACKEND_URL;
document.getElementById('next-button').addEventListener('click', async function() {
        //사용자에게 받은 url을 통해서 자막 가져오기
        const url = document.getElementById('youtube-url').value; // 유튜브 URL 가져오기
        const extractVideoId = (url) => {
            const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = url.match(regex);
            return match ? match[1] : null;
        };

        const videoId = extractVideoId(url);
        if (url) {
            try {
                console.log(videoId);
                
                // 서버로 연결해 자막 가져옴
                const response = await axios.post(`${backendUrl}/api/youtube/apicaptions/${videoId}`);
                console.log("유튜브 입력받음");
                console.log('받아온 유튜브 자막 정보 출력:', response.data); // 응답 로그
                const captionsWithTime = response.data.captions.captionsWithTime;
                const captions = response.data.captions.captions;
                console.log("자막만 추출해 따로 출력:", captions) // 응답에서 captions 추출
                console.log("시간정보도 데이터타입 확인 위해 출력:", captionsWithTime);
                localStorage.setItem('captions', JSON.stringify(captions)); // 로컬 스토리지에 저장
                localStorage.setItem('captionsWithTime', JSON.stringify(captionsWithTime));
                // 비디오 ID를 로컬 스토리지에 저장
                localStorage.setItem('videoId', videoId);
                
                // 다음 페이지로 이동
                window.location.href = '/learning-order';
            } catch (error) {
                console.error('에러 출력: ', error);
                alert('자막 데이터를 가져오는 데 실패했습니다.');
            }
        } else {
            alert('유효한 유튜브 URL을 입력해주세요.');
        }
    });

// 선택된 순서와 레벨, 개수를 저장할 변수들 선언
let selectedOrder = [];
const options = document.querySelectorAll('.option');
let selectedLevel = '';
let selectedQuantity = '';
let currentExpressionIndex = 0;
let expressions = []; // 여기에 학습할 표현들을 저장

// DOMContentLoaded 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    console.log("Current path:", path); // 현재 경로 출력하여 확인
    if (path.includes('learning-content')) {
        loadExpressions(); 
    }
});


// 학습 옵션 선택 함수
function selectOption(element) {
    const option = element.getAttribute('data-option'); // 선택된 옵션 가져오기
    if (selectedOrder.includes(option)) {
        // 이미 선택된 옵션인 경우, 선택 해제
        selectedOrder = selectedOrder.filter(item => item !== option);
        element.classList.remove('selected');
        element.querySelector('.order-number').textContent = '';
        updateOrderNumbers(); // 순서 번호 업데이트
    } else {
        // 새로운 옵션 선택
        selectedOrder.push(option);
        element.classList.add('selected');
        element.querySelector('.order-number').textContent = selectedOrder.length;
    }
}

// 순서 번호 업데이트 함수
function updateOrderNumbers() {
    selectedOrder.forEach((option, index) => {
        const element = document.querySelector(`.option[data-option="${option}"]`);
        element.querySelector('.order-number').textContent = index + 1;
    });
}

// 학습 난이도 선택 함수
function selectLevel(element) {
    if (selectedLevel !== '') {
        document.querySelector(`[data-level="${selectedLevel}"]`).classList.remove('selected');
    }
    selectedLevel = element.getAttribute('data-level');
    element.classList.add('selected');
}

// 학습 개수 선택 함수
function selectQuantity(element) {
    if (selectedQuantity !== '') {
        document.querySelector(`[data-quantity="${selectedQuantity}"]`).classList.remove('selected');
    }
    selectedQuantity = element.getAttribute('data-quantity');
    element.classList.add('selected');
    const customQuantityInput = document.getElementById('custom-quantity');
    if (selectedQuantity === '직접 입력') {
        if (customQuantityInput) {
            customQuantityInput.style.display = 'block';
        }
    }  else {
        if (customQuantityInput) {
            customQuantityInput.style.display = 'none';
            customQuantityInput.value = '';
            customQuantityInput.removeEventListener('input', validateCustomQuantity); // 이벤트 리스너 제거
            document.getElementById('error-message').style.display = 'none'; // 사용자 입력을 사용하지 않을 때 오류 메시지 숨기기
        }
    }
}

// 사용자 입력 개수 유효성 검사 함수
function validateCustomQuantity() {
    const customQuantity = this.value;
    const errorMessage = document.getElementById('error-message');
    if (customQuantity < 3 || customQuantity > 50) {
        errorMessage.textContent = '3 이상, 50 이하의 값을 입력해주세요.';
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
}

// "다음" 버튼 클릭 시 페이지 이동 및 데이터 저장 처리 함수
function goNext() {
    const path = window.location.pathname;
    if (path.includes('learning-order')) {
        if (selectedOrder.length === 0) {
            alert('적어도 하나의 학습 항목을 선택해주세요.');
            return;
        }
        localStorage.setItem('selectedOrder', JSON.stringify(selectedOrder));
        window.location.href = '/learning-level';
    } else if (path.includes('learning-level')) {
        if (!selectedLevel) {
            alert('학습 난이도를 선택해주세요.');
            return;
        }
        localStorage.setItem('selectedLevel', selectedLevel);
        console.log("선택한 난이도 개수 : ",selectedLevel )
        window.location.href = '/learning-quantity';
    } else if (path.includes('learning-quantity')) {
        if (selectedQuantity === '') {
            alert('학습 어휘/구문 개수를 선택해주세요.');
            return;
        }
        if (selectedQuantity === '직접 입력') {
            const customQuantity = document.getElementById('custom-quantity').value;
            if (!customQuantity || customQuantity < 3 || customQuantity > 50) {
                alert('3 이상, 50 이하의 값을 입력해주세요.');
                return;
            }
            localStorage.setItem('selectedQuantity', customQuantity);
            
        } else {
            localStorage.setItem('selectedQuantity', selectedQuantity);
        }
        console.log("선택한 표현 개수 : ",selectedQuantity )
        window.location.href = '/learning-content';
        loadExpressions();
    } else if (path.includes('learning-content')) {  // 현재 페이지가 학습 페이지인 경우
        if (currentExpressionIndex >= expressions.length - 1) {  // 마지막 학습 표현인 경우
            window.location.href = '/quiz';  // 퀴즈 페이지로 이동
        } else {
            currentExpressionIndex++;  // 다음 학습 표현으로 이동
            displayExpression();  // 다음 학습 표현을 화면에 표시
        }
    }
}
// "뒤로 가기" 버튼 클릭 시 이전 페이지로 이동 함수
function goBack() {
    window.history.back();
}



async function loadExpressions() {
    console.log("로드익스프레션");
    const captions = JSON.parse(localStorage.getItem('captions'));
    const videoId = localStorage.getItem('videoId');
    const expressionLevel = localStorage.getItem('selectedLevel');
    const expressionNumber = localStorage.getItem('selectedQuantity');

    try {
        const response = await axios.post(`http://localhost:5000/api/openai/expressions/${videoId}`, {
            captions,
            expressionLevel,
            expressionNumber
        });

        console.log("object 확인해보고", response.data.expressions);
        expressions = response.data.expressions; // 전역 변수로 선언된 expressions에 저장
        localStorage.setItem('expressions', JSON.stringify(expressions));
        populateExpressionList();
    } catch (error) {
        console.error("로드익스프레션 오류", error);
    }
}

function displayExpression(expression) {
    console.log("display 함수 : 표현 데이터:", expression);
    if (!expression) {
        console.error('표현 데이터가 없습니다.');
        alert('표현 데이터를 불러오는 데 문제가 발생했습니다.');
        goBack();
        return;
    }

    document.getElementById('expression-title').textContent = expression.title;
    console.log("표현 제목 출력", expression.title);
    document.getElementById('original-sentence').textContent = expression.originalSentence;
    document.getElementById('meaning').textContent = expression.meaning;
    document.getElementById('important-point').textContent = expression.importantPoint;
    document.getElementById('new-example').textContent = expression.newExample;
    document.getElementById('new-example-translation').textContent = expression.newExampleTranslation || '';

    const captionsWithTime = JSON.parse(localStorage.getItem('captionsWithTime'));
    const { startTime, endTime } = findExpressionTimeRange(captionsWithTime, expression.originalSentence);
    playVideoAtTimeRange(startTime, endTime);
}

function goNextExpression() {
    if (currentExpressionIndex < expressions.length - 1) {
        currentExpressionIndex += 1;
        displayExpression(expressions[currentExpressionIndex]);
    } else {
        window.location.href = '/quiz';
    }
}

function goBackExpression() {
    if (currentExpressionIndex > 0) {
        currentExpressionIndex -= 1;
        displayExpression(expressions[currentExpressionIndex]);
    } else {
        alert('첫 번째 표현입니다.');
    }
}

function populateExpressionList() {
    console.log("사이드 바 시작");
    try {
        const captionsWithTime = JSON.parse(localStorage.getItem('captionsWithTime'));
        console.log("사이드 바에서 출력", captionsWithTime);
        const expressionList = document.getElementById('expression-list'); // 사이드바에 있는 표현 목록 요소를 가져옴
        expressionList.innerHTML = ''; // 기존 목록 초기화
        expressions.forEach((expression, index) => { // 각 표현에 대해 목록 항목을 생성
            const listItem = document.createElement('li'); // 새로운 목록 항목 생성
            listItem.textContent = expression.title; // 항목에 표현 제목 설정
            listItem.addEventListener('click', () => { // 항목 클릭 시 해당 표현을 화면에 표시
                currentExpressionIndex = index; // 클릭한 표현의 인덱스로 설정
                displayExpression(expression); // 선택한 표현 데이터를 displayExpression에 전달
                const { startTime, endTime } = findExpressionTimeRange(captionsWithTime, expression.originalSentence);
                console.log("사이드바에서 비디오 재생 시간 찾기 시작");
                playVideoAtTimeRange(startTime, endTime);
            });
            expressionList.appendChild(listItem); // 목록에 항목 추가
        });
    } catch (error) {
        console.error("populateExpressionList 오류 발생:", error);
    }
}

let player;
function findExpressionTimeRange(captionsWithTime, originalSentence) {
    const words = originalSentence.split(' ');
    const firstTwoWords = words.slice(0, 1).join(' ').toLowerCase();
    console.log("유튜브 재생 시간 찾기 : 처음 두 단어", firstTwoWords);
    const lastTwoWords = words.slice(-1).join(' ').replace(/[^a-zA-Z\s]/g, '');
    console.log("유튜브 재생 시간 찾기 : 마지막 두 단어", lastTwoWords);

    let startTime, endTime;


    for (let i = 0; i < captionsWithTime.length; i++) {
        if (captionsWithTime[i].text.includes(firstTwoWords)) {
            startTime = captionsWithTime[i].startTime;
            console.log("찾은 시작 시간 : ", startTime);
            break;
        }
    }

    for (let i = 0; i < captionsWithTime.length; i++) {
        if (captionsWithTime[i].text.includes(lastTwoWords)) {
            const potentialEndTime = captionsWithTime[i].startTime + captionsWithTime[i].duration;
            if (potentialEndTime > startTime) {
                endTime = potentialEndTime;
                console.log("찾은 끝 시간 : ", endTime);
                break;
            }
        }
    }

    return { startTime, endTime };
}

// 유튜브 플레이어 초기화 함수
function initYouTubePlayer(videoId) {
    player = new YT.Player('videoPlayer', {
        videoId: videoId, // 비디오 ID 설정
        events: {
            'onReady': function (event) {
                console.log("플레이어 준비 완료");
            },
            'onError': function(event) {
                console.error("플레이어 초기화 중 오류가 발생했습니다.", event.data);
            }
        },
        playerVars: {
            modestbranding: 1, // YouTube 브랜딩 최소화
            rel: 0, // 관련 동영상 표시 안함
            iv_load_policy: 3 // 주석 표시 안함
        }
    });
}

// 특정 시간 범위에서 비디오 재생 함수
function playVideoAtTimeRange(startTime, endTime) {
    console.log("playVideoAtTimeRange 함수 시작");
    if (player && player.seekTo) {
        player.seekTo(startTime);
        player.playVideo();
        setTimeout(() => {
            player.pauseVideo();
        }, (endTime - startTime) * 1000);
    } else {
        console.error("플레이어가 초기화되지 않았습니다.");
    }

}
// 페이지가 로드될 때 YouTube Player를 초기화
window.onload = function() {
    const videoId = localStorage.getItem('videoId');
    console.log("window.onload에서 videoId: ", videoId);
    if (typeof YT !== 'undefined' && YT && YT.Player) {
        initYouTubePlayer(videoId);
    } else {
        console.log("YT 객체가 아직 정의되지 않았습니다. API 준비를 기다립니다.");
        window.onYouTubeIframeAPIReady = function() {
            initYouTubePlayer(videoId);
        };
    }
};
// YouTube IFrame API가 준비되었을 때 호출되는 함수
function onYouTubeIframeAPIReady() {
    const videoId = localStorage.getItem('videoId');
    initYouTubePlayer(videoId); // 플레이어 초기화
}




// 사이드바를 토글(보이기/숨기기)하는 함수
function toggleSidebar() {
    console.log('사이드바 토글 함수 시작');
    const sidebar = document.getElementById('sidebar'); // 사이드바 요소를 가져옴
    sidebar.classList.toggle('show'); // 사이드바에 'show' 클래스를 추가하거나 제거하여 토글
    console.log('사이드바의 현재 클래스 확인 : ', sidebar.classList);
}





// 학습 순서에 따른 다음 페이지 URL을 반환하는 함수
function getNextStepUrl(step) {
    switch (step) { // 선택된 학습 단계에 따라 URL 반환
        case '학습하기':
            return '/learning-level'; // '학습하기' 선택 시 학습 난이도 설정 페이지로 이동
        case '쉐도잉 하기':
            return '/shadowing'; // '쉐도잉 하기' 선택 시 쉐도잉 페이지로 이동 (추가 구현 필요)
        case '퀴즈 풀기':
            return '/quiz'; // '퀴즈 풀기' 선택 시 퀴즈 페이지로 이동 (추가 구현 필요)
        default:
            return '/'; // 기본적으로 홈으로 이동
    }
}