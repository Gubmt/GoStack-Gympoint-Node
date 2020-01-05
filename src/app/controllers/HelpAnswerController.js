import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';

import Student from '../models/Student';

import HelpAnswerMail from '../jobs/HelpAnswerMail';
import Queue from '../../lib/Queue';

class HelpAnswerController {
  async index(req, res) {
    const { page } = req.query;

    if (page === undefined) {
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
      });

      return res.json(help_order);
    }

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
      limit: 5,
      offset: (page - 1) * 5,
    });

    return res.json(help_order);
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
