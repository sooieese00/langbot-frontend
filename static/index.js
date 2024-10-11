const backendUrl = window.backendUrl;
document.getElementById('next-button').addEventListener('click', async function() {
    localStorage.clear();
    const url = document.getElementById('youtube-url').value.trim();
    
    if (!url) {
        alert('유효한 유튜브 URL을 입력해주세요.');
        return;
    }
    
    const extractVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const videoId = extractVideoId(url);
    
    if (!videoId) {
        alert('유효한 유튜브 URL을 입력해주세요.');
        return;
    }

    try {
        console.log(videoId);
        const response = await axios.post(`${backendUrl}/api/youtube/apicaptions/${videoId}`);
        console.log("유튜브 입력받음");
        console.log('받아온 유튜브 자막 정보 출력:', response.data);
        const captionsWithTime = response.data.captions.captionsWithTime;
        const captions = response.data.captions.captions;
        console.log("자막만 추출해 따로 출력:", captions);
        console.log("시간정보도 데이터타입 확인 위해 출력:", captionsWithTime);
        localStorage.setItem('captions', JSON.stringify(captions));
        localStorage.setItem('captionsWithTime', JSON.stringify(captionsWithTime));
        localStorage.setItem('videoId', videoId);

        window.location.href = '/learning-order';
    } catch (error) {
        console.error('에러 출력: ', error);
        alert('자막 데이터를 가져오는 데 실패했습니다.');
    }
});
