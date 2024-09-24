

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.container').style.display = "none";
});

window.onload = loadFixedCaption;

// 정확한 대본으로 만들기
async function loadFixedCaption() {
    const expression = localStorage.getItem('expressions');
    const expressionArray = JSON.parse(expression);
    const captions = expressionArray.map(expression => expression.originalSentence);

    try {
        const response = await axios.post(`http://localhost:5000/api/openai/captions`, {
            captions
        });

        fixedCaption = response.data.fixedcaption;
        //로딩화면 중단
        document.getElementById('loading-screen').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        
        localStorage.setItem('captions', JSON.stringify(fixedCaption));

        captionList = fixedCaption.split(".");

        document.getElementById('caption-text').textContent = captionList[0]+".";
        captionList.splice(0,1); 

        // 첫 번째 문장이 준비되면 TTS 호출
        document.getElementById('playTTS-Button').addEventListener('click', async () =>{
            try{
                const text = document.getElementById('caption-text').textContent;
                await playTTS(text);
            } catch (error) {
                console.error("shadowing.js TTS호출 오류:", error);
            }});
    
        
    }catch(error){
    console.error("fixed자막 오류", error);
}}

// Azure TTS 호출 함수
async function playTTS(text) {
    console.log(text);
    try {
        const ttsResponse = await axios.post('http://localhost:5000/api/azure/tts', { text }, {
            responseType: 'arraybuffer'
        });

        // 오디오 데이터로 Blob 생성
        const audioBlob = new Blob([ttsResponse.data], { type: 'audio/mpeg' });
        console.log("audioBlob", audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log(audioUrl, "audioUrl");
        const audio = new Audio(audioUrl);

        // 오디오 재생
        audio.play();
        audio.onended = () => {
            console.log("오디오 재생 완료")
        };
    } catch (error) {
        console.error("TTS 호출 오류:", error);
    }
}


//stt
let mediaRecorder;
let recordedChunks = [];
let speechRecognizer;
let correctCaption = ""; 


document.getElementById('record-button').addEventListener('click', startSTTfirst);
async function startSTTfirst() {
    try {
        console.log("시작");
        document.getElementById('user-stt').innerText = "";
        // 백엔드에서 subscriptionKey 가져오기
        const response = await fetch('http://localhost:5000/api/azure/key');
        const { subscriptionKey: key } = await response.json();
        subscriptionKey = key;

        if (!subscriptionKey) {
            throw new Error('키를 가져올 수 없음');
        }

        // 브라우저에서 마이크 입력 허용 및 MediaRecorder 설정
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];

        // 녹음 시작
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.start();
        console.log('Recording started');

        // Azure Speech SDK 설정 및 STT 시작
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, "southeastasia");
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        speechRecognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        // 실시간 STT 이벤트 설정
        speechRecognizer.recognizing = (s, e) => {
            console.log("Recognizing: " + e.result.text);
            document.getElementById('user-stt').innerText = e.result.text;
        };

        speechRecognizer.recognized = (s, e) => {
            console.log("Recognized: " + e.result.text);
        };

        // STT 시작
        speechRecognizer.startContinuousRecognitionAsync();

        document.getElementById('ok-button').disabled = false;
    } catch (error) {
        console.error('STT 시작 오류:', error);
    }
}

document.getElementById('ok-button').addEventListener('click', async () => {
    try {
        // 녹음 및 STT 종료
        mediaRecorder.stop();
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' }); // 오디오 Blob 생성

        // FormData에 오디오 파일과 참조 텍스트 추가
        const formData = new FormData();
        formData.append('audioFile', audioBlob, 'audio.webm'); // 파일을 FormData로 추가
        formData.append('referenceText', document.getElementById('caption-text').innerText); // 참조 텍스트 추가
        formData.append('region', 'southeastasia'); // Azure Speech API의 region 값
        
        console.log(formData);
        // 백엔드로 폼 데이터 전송
        const response = await fetch('http://localhost:5000/api/azure/evaluation', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log("Evaluation result:", result);
        document.getElementById('accuracyscore').innerText = `-정확도: ${result.AccuracyScore} /25점`;
        document.getElementById('fluencyscore').innerText = `-유창성: ${result.FluencyScore} /25점`;
        document.getElementById('completenesscore').innerText = `-텍스트와의 유사도: ${result.CompletenessScore} /25점`;
        document.getElementById('pronscore').innerText = `-종합 점수: ${result.PronScore} /25점`;

    };
    } catch (error) {
        console.error('Error during evaluation:', error);
    }
});


let previousCaptions = []; 
function nextCaption() {
    console.log("nextCaption함수 시작");
    
    previousCaptions.push(
        document.getElementById("caption-text").innerText
    );
    
    // 다음 문장 텍스트 설정 및 TTS 호출
    if (captionList.length >= 1) {
        const nextCaptions = captionList[0]+".";
        document.getElementById("caption-text").innerText = nextCaptions;
        document.getElementById("user-stt").innerText = "왼쪽 버튼을 눌러, 녹음을 시작하세요"
        captionList.splice(0, 2);
    }else if (captionList.length<1){
        document.getElementById("caption-text").innerText = "영상 전체에 대한 섀도잉이 끝났습니다!";
        document.getElementById("user-stt").innerText = "잘했어요~"
    }
}

function previousCaption() {
    console.log("previousCaption함수 시작");

    if (previousCaptions.length > 0) {
        const lastCaption = previousCaptions.pop(); // 마지막으로 저장한 문장을 꺼냄
        document.getElementById("caption-text").innerText = lastCaption;
        document.getElementById("user-stt").innerText = "왼쪽 버튼을 눌러, 녹음을 시작하세요";
    } else {
        console.log("이전 문장이 없습니다.");
    }
}
