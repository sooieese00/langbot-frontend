const backendUrl = window.backendUrl;
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.container').style.display = "none";
    localStorage.removeItem('currentCaptionIndex');
});

window.onload = loadFixedCaption;

// 정확한 대본으로 만들기
async function loadFixedCaption() {
    const expression = localStorage.getItem('expressions');
    const expressionArray = JSON.parse(expression);
    const captions = expressionArray.map(expression => expression.originalSentence);

    try {
        const response = await axios.post(`${backendUrl}/api/openai/captions`, {
            captions
        });

        fixedCaption = response.data.fixedcaption;
        //로딩화면 중단
        document.getElementById('loading-screen').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        
        localStorage.setItem('captions', JSON.stringify(fixedCaption));

        captionList = fixedCaption.split(/[.?!"]/).filter(caption => caption);

        document.getElementById('caption-text').textContent = captionList[0]+".";
        localStorage.setItem('currentCaptionIndex', 0);
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
        const ttsResponse = await axios.post(`${backendUrl}/api/azure/tts`, { text }, {
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
        const response = await fetch(`${backendUrl}/api/azure/key`);
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

async function convertWebMtoWAV(audioBlob) {
    // Web Audio API를 사용하여 WebM 파일을 디코딩
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // WAV 파일 헤더 생성
    function encodeWAV(audioBuffer) {
        const numOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16; // 16비트

        const numOfSamples = audioBuffer.length * numOfChannels;
        const buffer = new ArrayBuffer(44 + numOfSamples * 2);
        const view = new DataView(buffer);

        // RIFF 헤더
        view.setUint32(0, 1380533830, false); // 'RIFF'
        view.setUint32(4, 36 + numOfSamples * 2, true); // 전체 크기
        view.setUint32(8, 1463899717, false); // 'WAVE'

        // fmt 서브체크
        view.setUint32(12, 1718449184, false); // 'fmt '
        view.setUint32(16, 16, true); // fmt 서브체크 크기
        view.setUint16(20, format, true); // 오디오 포맷 (PCM)
        view.setUint16(22, numOfChannels, true); // 채널 수
        view.setUint32(24, sampleRate, true); // 샘플레이트
        view.setUint32(28, sampleRate * numOfChannels * bitDepth / 8, true); // 초당 바이트 수
        view.setUint16(32, numOfChannels * bitDepth / 8, true); // 블록 정렬
        view.setUint16(34, bitDepth, true); // 비트 깊이

        // data 서브체크
        view.setUint32(36, 1684108385, false); // 'data'
        view.setUint32(40, numOfSamples * 2, true); // 데이터 크기

        // PCM 데이터
        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numOfChannels; channel++) {
                let sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
                sample = sample < 0 ? sample * 32768 : sample * 32767; // 16비트 샘플
                view.setInt16(offset, sample, true);
                offset += 2;
            }
        }

        return new Blob([view], { type: 'audio/wav' });
    }

    // WAV 파일로 인코딩
    const wavBlob = encodeWAV(audioBuffer);
    return wavBlob;
}

document.getElementById('ok-button').addEventListener('click', async () => {
    try {
        // 녹음 및 STT 종료
        // 녹음 및 STT 종료
        mediaRecorder.stop();
        if (speechRecognizer) {
            speechRecognizer.stopContinuousRecognitionAsync(
                () => {
                    console.log('Speech recognition stopped successfully.');
                },
                (error) => {
                    console.error('Error stopping speech recognition:', error);
                }
            );
        }
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });// 오디오 Blob 생성
            // WebM을 WAV로 변환
            const wavBlob = await convertWebMtoWAV(audioBlob);

            // FormData에 변환된 WAV 파일 추가
            const formData = new FormData();
            formData.append('audioFile', wavBlob, 'audio.wav'); // 변환된 WAV 파일 추가
            formData.append('referenceText', document.getElementById('caption-text').innerText); // 참조 텍스트 추가
            formData.append('region', 'southeastasia'); // Azure Speech API의 region 값

        // 백엔드로 폼 데이터 전송
        const response = await fetch(`${backendUrl}/api/azure/evaluation`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log("Evaluation result:", result);
        document.getElementById('accuracyscore').innerText = `✔️정확도: ${result.AccuracyScore/4} /25점`;
        document.getElementById('fluencyscore').innerText = `🎤유창성: ${result.FluencyScore/4} /25점`;
        document.getElementById('completenesscore').innerText = `📝텍스트와 유사도: ${result.CompletenessScore/4} /25점`;
        document.getElementById('pronscore').innerText = `-🏆종합 점수: ${result.PronScore} /100점`;

    };
    } catch (error) {
        console.error('Error during evaluation:', error);
    }
});

function nextCaption() {
    console.log("nextCaption함수 시작");
    // 인덱스++
    let currentCaptionIndex = localStorage.getItem('currentCaptionIndex');
    currentCaptionIndex = parseInt(currentCaptionIndex, 10);
    currentCaptionIndex += 1;
    localStorage.setItem('currentCaptionIndex', currentCaptionIndex)

    // 다음 문장 텍스트 설정 및 TTS 호출
    if (captionList.length >= currentCaptionIndex+1) {
        const nextCaptions = captionList[currentCaptionIndex]+".";
        document.getElementById("caption-text").innerText = nextCaptions;
        document.getElementById("user-stt").innerText = "왼쪽 버튼을 눌러, 녹음을 시작하세요"
    }else{
        alert("마지막 문장입니다. 종료 화면으로 이동합니다.");
        localStorage.setItem('currentCaptionIndex', captionList.length-1)
        window.location.href = '/end-shadowing';
    }
}

function previousCaption() {
    console.log("previousCaption함수 시작");
        // 인덱스--
        let currentCaptionIndex = localStorage.getItem('currentCaptionIndex');
        currentCaptionIndex = parseInt(currentCaptionIndex, 10);
        currentCaptionIndex -= 1;
        localStorage.setItem('currentCaptionIndex', currentCaptionIndex);

        if (currentCaptionIndex<0) {
            localStorage.setItem('currentCaptionIndex', 0)
            alert("현재 문장이 첫 문장입니다.");
        }else {
            const previousCaptions = captionList[currentCaptionIndex]+".";
            document.getElementById("caption-text").innerText = previousCaptions;
            document.getElementById("user-stt").innerText = "왼쪽 버튼을 눌러, 녹음을 시작하세요"
}}
