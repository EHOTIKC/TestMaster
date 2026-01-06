export class TestLogic {
  constructor(test) {
    this.test = test;
  }

  getQuestionType(question) {
    let type =
      question.model || question.type?.model || question.type?.name || "SingleChoiceQuestion";

    if (type === "одна відповідь") type = "SingleChoiceQuestion";
    if (type === "кілька відповідей") type = "MultipleChoiceQuestion";
    if (type === "співставлення") type = "MatchingQuestion";

    return type;
  }

  isAnswerValid(question, userAnswer) {
    const type = this.getQuestionType(question);
    if (type === "SingleChoiceQuestion") return !!userAnswer;
    if (type === "MultipleChoiceQuestion") return Array.isArray(userAnswer) && userAnswer.length > 0;
    if (type === "MatchingQuestion") {
      const pairs = question.options || [];
      return pairs.every((p) => userAnswer?.[p.text]);
    }
    return true;
  }

  calculateScore(answers) {
    let totalScore = 0;
    let maxScore = 0;

    this.test.questions.forEach((q) => {
      const userAnswer = answers[q._id];
      let qScore = 0;

      const qType = this.getQuestionType(q);

      if (qType === "SingleChoiceQuestion") {
        if (userAnswer && userAnswer === q.correctAnswer?.text) qScore = 1;
      } else if (qType === "MultipleChoiceQuestion") {
        const correctAnswers = (q.correctAnswers || []).map((a) => (a.text ? a.text : a));
        const numCorrect = correctAnswers.length;
        if (Array.isArray(userAnswer) && numCorrect > 0) {
          let score = 0;
          userAnswer.forEach((ans) => {
            if (correctAnswers.includes(ans)) score += 1 / numCorrect;
            else score -= 0.5 / numCorrect;
          });
          qScore = Math.min(Math.max(score, 0), 1);
        }
      } else if (qType === "MatchingQuestion") {
        const correctPairs = q.correctAnswers || [];
        const numPairs = correctPairs.length;
        if (userAnswer && numPairs > 0) {
          let score = 0;
          correctPairs.forEach((pair) => {
            const left = pair.text || pair.left;
            const right = pair.matchingKey || pair.right;
            if (userAnswer[left] === right) score += 1 / numPairs;
          });
          qScore = Math.min(score, 1);
        }
      }

      totalScore += qScore * (q.score || 1);
      maxScore += q.score || 1;
    });

    const scorePercent = parseFloat(((totalScore / maxScore) * 100).toFixed(2));
    return { totalScore, maxScore, scorePercent };
  }
}
