const parseFeedback = (text) => {
  if (!text) return { checking: '', description: '',  example: '' , correctAnswer: '', sentence: ''};

  const feedback = {
      checking: '',
      description: '',
      example: '',
      correctAnswer : '',
      sentence: ''
  };

  // 정규식을 사용하여 각 항목을 파싱, 단어 사이의 공백을 유연하게 처리
  const checkingMatch = text.match(/정답\s*여부\s*:\s*(.*)/);
  const descriptionMatch= text.match(/피드백\s*:\s*(.*)/);
  const exampleMatch = text.match(/유사\s*표현\s*제안\s*:\s*(.*)/);
  const correctAnswerMatch = text.match(/모범\s*답안\s*:\s*(.*)/);
  const sentenceMatch = text.match(/원본\s*문장\s*:\s*(.*)/);

  // 파싱된 내용을 feedback 객체에 저장
  if (checkingMatch) feedback.checking = checkingMatch[1].trim();
  if (descriptionMatch) feedback.description = descriptionMatch[1].trim();
  if (exampleMatch) feedback.example = exampleMatch[1].trim();
  if (correctAnswerMatch) feedback.correctAnswer = correctAnswerMatch[1].trim();
  if (sentenceMatch) feedback.sentence = sentenceMatch[1].trim();
  return feedback;
};
// Example usage:
const text = `
정답여부: 정답입니다
피드백: 답안은 거의 맞았지만, "loopy"라는 표현은 "혼란스러운"이 아니라 "어리둥절한"이라는 뜻입니다. 또한 "after surgery"보다는 "post-surgery"를 사용하는 것이 더  자연스러운 표현입니다. 더 자세한 설명과 함께 표현을 잘 활용하려면 주의해야 합니다.
유사표현 제안: Are you a little disoriented after surgery? / Are you feeling a bit confused after surgery? / Are you feeling a bit disoriented after surgery?     
모범답안: Are you feeling a bit disoriented after surgery?
원본문장: hihihi

`;

console.log(parseFeedback(text));
