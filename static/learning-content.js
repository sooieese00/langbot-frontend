let expressions = [];
let currentExpressionIndex = 0;
let player;
const videoId = localStorage.getItem('videoId'); 
const backendUrl = window.backendUrl;

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    console.log("Current path:", path);
    if (path.includes('learning-content')) {
        loadExpressions(); 
    }
    document.querySelector('.container').style.display = "none";
});

window.onload = function() {
    if (typeof YT !== 'undefined' && YT && YT.Player) {
        initYouTubePlayer(videoId);
    } else {
        window.onYouTubeIframeAPIReady = function() {
            initYouTubePlayer(videoId);
        };
    }
};

async function loadExpressions() {
    const captions = JSON.parse(localStorage.getItem('captions'));
    const expressionLevel = localStorage.getItem('selectedLevel');
    const expressionNumber = localStorage.getItem('selectedQuantity');

    try {
        const response = await axios.post(`${backendUrl}/api/openai/expressions/${videoId}`, {
            captions,
            expressionLevel,
            expressionNumber
        });

        expressions = response.data.expressions;
        localStorage.setItem('expressions', JSON.stringify(expressions));
        populateExpressionList();

        document.getElementById('loading-screen').style.display = 'none';
        document.querySelector('.container').style.display = 'block';

    } catch (error) {
        console.error("로드익스프레션 오류:", error);
    }
}

function displayExpression(expression) {
    if (!expression) {
        alert('표현 데이터를 불러오는 데 문제가 발생했습니다.');
        goBack();
        return;
    }

    document.getElementById('expression-title').textContent = expression.title;
    document.getElementById('expression-meaning').textContent = expression.expressionMeaning;
    document.getElementById('original-sentence').textContent = expression.originalSentence;
    document.getElementById('meaning').textContent = expression.meaning;
    document.getElementById('important-point').textContent = expression.importantPoint;
    document.getElementById('new-example').textContent = expression.newExample;
    document.getElementById('new-example-translation').textContent = expression.newExampleTranslation || '';

    const captionsWithTime = JSON.parse(localStorage.getItem('captionsWithTime'));
    const { startTime, endTime } = findExpressionTimeRange(captionsWithTime, expression.title);
    playVideoAtTimeRange(startTime, endTime);
}

function populateExpressionList() {
    console.log("사이드 바 시작");
    try {
        const captionsWithTime = JSON.parse(localStorage.getItem('captionsWithTime'));
        const expressionList = document.getElementById('expression-list');
        expressionList.innerHTML = '';
        expressions.forEach((expression, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = expression.title;
            listItem.addEventListener('click', () => {
                currentExpressionIndex = index;
                displayExpression(expression);
                const { startTime, endTime } = findExpressionTimeRange(captionsWithTime, expression.title);
                playVideoAtTimeRange(startTime, endTime);
            });
            expressionList.appendChild(listItem);
        });

        if (expressions.length > 0) {
            currentExpressionIndex = 0;
            displayExpression(expressions[currentExpressionIndex]);
        }
    } catch (error) {
        console.error("populateExpressionList 오류 발생:", error);
    }
}

function initYouTubePlayer(videoId) {
    if (player) return; // 이미 초기화된 경우, 다시 초기화하지 않음

    player = new YT.Player('videoPlayer', {
        videoId: videoId,
        events: {
            'onReady': function (event) {
                console.log("플레이어 준비 완료");
            },
            'onError': function(event) {
                console.error("플레이어 초기화 중 오류가 발생했습니다.", event.data);
            }
        },
        playerVars: {
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3
        }
    });
}

function playVideoAtTimeRange(startTime, endTime) {
    console.log("playVideoAtTimeRange 함수 시작");
    if (player && player.seekTo) {
        player.seekTo(startTime);
        player.playVideo();
        setTimeout(() => {
            player.pauseVideo();
        }, (endTime - startTime) * 1000);
    } else {
        console.error("playVideoAtTimeRange 에러: 플레이어가 초기화되지 않았습니다.");
    }
}
  
  
function findExpressionTimeRange(captionsWithTime, originalSentence) {
    const words = originalSentence.split(' ');
    console.log(originalSentence);
    const wordObjects = {};

    // 앞 2~4번째 단어와 뒤 2~4번째 단어만 선택
    const selectedWords = [
        ...words.slice(1, Math.min(4, words.length)),
    ];
    
    // 모든 단어를 처리하여 시간 목록을 구성
    selectedWords.forEach((word, index) => {
        const lowerCaseWord = word.toLowerCase();
        wordObjects[`word${index}`] = {
            text: lowerCaseWord,
            startTimes: []
        };

        // 캡션에서 단어를 찾아 시간 목록에 추가
        for (let j = 0; j < captionsWithTime.length; j++) {
            if (captionsWithTime[j].text.includes(lowerCaseWord)) {
                wordObjects[`word${index}`].startTimes.push(captionsWithTime[j].startTime);
            }
        }
    });
    console.log("선택된 단어들 출력", wordObjects);

    // 단어 쌍을 비교하여 조건에 맞지 않는 시간들을 제거
    for (let i = 0; i < selectedWords.length - 1; i++) {
        let currentWordTimes = wordObjects[`word${i}`].startTimes;
        let nextWordTimes = wordObjects[`word${i + 1}`].startTimes;
        if (currentWordTimes.length > 0 && nextWordTimes.length > 0) {
            const maxNextTime = Math.max(...nextWordTimes);
            currentWordTimes = currentWordTimes.filter(time => time <= maxNextTime);

            const minCurrentTime = Math.min(...currentWordTimes);
            nextWordTimes = nextWordTimes.filter(time => time >= minCurrentTime);

            wordObjects[`word${i}`].startTimes = currentWordTimes;
            wordObjects[`word${i + 1}`].startTimes = nextWordTimes;
        }
    }

    let timeArray = [];
    for (let i = 0; i < selectedWords.length; i++) {
        timeArray.push(...wordObjects[`word${i}`].startTimes);
    }

    if (timeArray.length > 0) {
        timeArray.sort((a, b) => a - b);
        if(timeArray.length > 1 && timeArray[1]-timeArray[0]>10){
            timeArray.shift();
        }
        if(timeArray.length > 1 && timeArray[timeArray.length-1]- timeArray[timeArray.length-2]>10){
            timeArray.pop();
        }
        const startTime = Math.min(...timeArray);

        // 종료 시간 설정
        let lastTime = Math.max(...timeArray);
        const endTime = lastTime-firstTime>15 ? startTime+15 : endTime;
        
        console.log(startTime, endTime);
        return { startTime, endTime };
    }
    return null;
}
  
function goNext() {
    const path = window.location.pathname;
    if (path.includes('learning-content')) {
        if (currentExpressionIndex >= expressions.length - 1) {
            window.location.href = '/end-learning';
        } else {
            currentExpressionIndex++;
            displayExpression(expressions[currentExpressionIndex]);
        }
    }
}

function goNextExpression() {
    if (currentExpressionIndex < expressions.length - 1) {
        currentExpressionIndex += 1;
        displayExpression(expressions[currentExpressionIndex]);
    } else {
        window.location.href = '/end-learning';
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

function goBack() {
    window.history.back();
}
