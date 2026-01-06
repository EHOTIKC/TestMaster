export default class TestEntity {
  constructor({
    title,
    description,
    topic,
    questions,
    creator,
    singleAttempt = false,
    showCorrectAnswers = false,
    createdAt = new Date(),
    testId = null,
    _id = null
  }) {
    this._id = _id;
    this.testId = testId;
    this.title = title;
    this.description = description;
    this.topic = topic;
    this.questions = questions;
    this.creator = creator;
    this.singleAttempt = singleAttempt;
    this.showCorrectAnswers = showCorrectAnswers;
    this.createdAt = createdAt;
  }
}
