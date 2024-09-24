// learning-order.js
/*
let selectedOrder = [];
const options = document.querySelectorAll('.option');

function selectOption(element) {
    const option = element.getAttribute('data-option');
    if (selectedOrder.includes(option)) {
        selectedOrder = selectedOrder.filter(item => item !== option);
        element.classList.remove('selected');
        element.querySelector('.order-number').textContent = '';
        updateOrderNumbers();
    } else {
        selectedOrder.push(option);
        element.classList.add('selected');
        element.querySelector('.order-number').textContent = selectedOrder.length;
    }
}

function updateOrderNumbers() {
    selectedOrder.forEach((option, index) => {
        const element = document.querySelector(`.option[data-option="${option}"]`);
        element.querySelector('.order-number').textContent = index + 1;
    });
}
*/

function goNext() {

            window.location.href = '/learning-level';

    }

// "뒤로 가기" 버튼 클릭 시 이전 페이지로 이동 함수
function goBack() {
    window.history.back();
}