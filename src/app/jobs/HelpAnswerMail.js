import Mail from '../../lib/Mail';

class HelpAnswerMail {
  get key() {
    return 'HelpAnswerMail';
  }

  async handle({ data }) {
    const { help_answer, answer } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${help_answer.student.name} <${help_answer.student.email}>`,
      subject: 'Respondendo suas dúvidas',
      template: 'helpOrder',
      context: {
        student: help_answer.student.name,
        question: help_answer.question,
        answer,
      },
    });
  }
}

export default new HelpAnswerMail();
