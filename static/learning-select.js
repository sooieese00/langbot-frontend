let selectedLevel = '';
let selectedQuantity = '';

function selectLevel(element) {
    if (selectedLevel !== '') {
        document.querySelector(`[data-level="${selectedLevel}"]`).classList.remove('selected');
    }
    selectedLevel = element.getAttribute('data-level');
    console.log("선택한 난이도", selectedLevel);
    element.classList.add('selected');
}

function selectQuantity(element) {
    if (selectedQuantity !== '') {
        document.querySelector(`[data-quantity="${selectedQuantity}"]`).classList.remove('selected');
    }
    selectedQuantity = element.getAttribute('data-quantity');
    console.log("몇개", selectedQuantity)
    element.classList.add('selected');
    const customQuantityInput = document.getElementById('custom-quantity');
    if (selectedQuantity === '직접 입력') {
        if (customQuantityInput) {
            customQuantityInput.style.display = 'block';
            customQuantityInput.addEventListener('input', validateCustomQuantity);
        }
    } else {
        if (customQuantityInput) {
            customQuantityInput.style.display = 'none';
            customQuantityInput.value = '';
            customQuantityInput.removeEventListener('input', validateCustomQuantity);
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

function goNext() {
    const path = window.location.pathname;
    if (path.includes('learning-level')) {
        if (!selectedLevel) {
            alert('학습 난이도를 선택해주세요.');
            return;
        }
        localStorage.setItem('selectedLevel', selectedLevel);
        console.log("선택한 난이도 : ", selectedLevel);
        window.location.href = '/learning-quantity';
    } else if (path.includes('learning-quantity')) {
        if (selectedQuantity === '') {
            alert('학습 어휘/구문 개수를 선택해주세요.');
            return;
        }
        if (selectedQuantity === '직접 입력') {
            const customQuantity = document.getElementById('custom-quantity').value;
            if (!customQuantity || customQuantity < 3 || customQuantity > 20) {
                alert('3 이상, 20 이하의 값을 입력해주세요.');
                return;
            }
            localStorage.setItem('selectedQuantity', customQuantity);
        } else {
            localStorage.setItem('selectedQuantity', selectedQuantity);
        }
        console.log("선택한 표현 개수 : ", selectedQuantity);
        window.location.href = '/learning-content';
    }
}

function goBack() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('learning-level')) {
        // 만약 로컬 스토리지에 이미 선택된 레벨이 있다면, 해당 레벨을 자동으로 선택
        const savedLevel = localStorage.getItem('selectedLevel');
        if (savedLevel) {
            const element = document.querySelector(`[data-level="${savedLevel}"]`);
            if (element) {
                selectLevel(element);
            }
        }
    } else if (window.location.pathname.includes('learning-quantity')) {
        // 만약 로컬 스토리지에 이미 선택된 개수가 있다면, 해당 개수를 자동으로 선택
        const savedQuantity = localStorage.getItem('selectedQuantity');
        if (savedQuantity) {
            const element = document.querySelector(`[data-quantity="${savedQuantity}"]`);
            if (element) {
                selectQuantity(element);
            } else if (savedQuantity === '직접 입력') {
                // '직접 입력'이 저장된 경우 커스텀 입력 필드 표시
                const customQuantityInput = document.getElementById('custom-quantity');
                if (customQuantityInput) {
                    customQuantityInput.style.display = 'block';
                    customQuantityInput.value = savedQuantity;
                }
            }
        }
    }
});
