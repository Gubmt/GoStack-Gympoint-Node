import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { student, plan, end_date, totalPrice } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matricula efetuada',
      template: 'registration',
      context: {
        student: student.name,
        plan: plan.title,
        end_date: format(parseISO(end_date), 'dd/MM/yy', { locale: pt }),
        price: totalPrice,
      },
    });
  }
}

export default new RegistrationMail();
