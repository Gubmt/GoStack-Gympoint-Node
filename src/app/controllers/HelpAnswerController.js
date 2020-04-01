import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';

import Student from '../models/Student';

import HelpAnswerMail from '../jobs/HelpAnswerMail';
import Queue from '../../lib/Queue';

class HelpAnswerController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const allHelps = await HelpOrder.findAndCountAll({
      where: { answer: null },
    });

    const per_page = 5;
    const total_list = allHelps.count;
    const total_pages = total_list / per_page;

    const help_order = await HelpOrder.findAll({
      where: { answer: null },
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: per_page,
      offset: (page - 1) * per_page,
    });

    return res.json({
      total_list,
      total_pages,
      help_order,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { answer } = req.body;

    const help_order = await HelpOrder.findOne({
      where: { id: req.params.id, answer: null },
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!help_order) {
      return res.status(401).json({ error: 'Help not found.' });
    }

    await help_order.update({
      answer,
      answer_at: new Date(),
    });

    const help_answer = await HelpOrder.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    await Queue.add(HelpAnswerMail.key, {
      help_answer,
      answer,
    });

    return res.json(help_answer);
  }
}

export default new HelpAnswerController();
