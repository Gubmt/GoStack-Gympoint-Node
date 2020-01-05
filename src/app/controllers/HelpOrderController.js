import * as Yup from 'yup';
import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const student = await Student.findOne({
      where: { id: req.params.id },
    });

    if (!student) {
      return res.status(401).json({ error: 'Student does not exists.' });
    }

    const { question } = req.body;

    await HelpOrder.create({
      student_id: student.id,
      question,
    });

    const help_order = await HelpOrder.findOne({
      where: {
        student_id: req.params.id,
        answer: null,
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'question', 'answer', 'answer_at', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(help_order);
  }

  async index(req, res) {
    const student = await Student.findOne({
      where: { id: req.params.id },
    });

    if (!student) {
      return res.status(401).json({ error: 'Student does not exists.' });
    }

    const help_order = await HelpOrder.findAll({
      where: { student_id: req.params.id },
      attributes: ['id', 'question', 'answer', 'answer_at', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(help_order);
  }
}

export default new HelpOrderController();
