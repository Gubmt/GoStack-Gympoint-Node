import * as Yup from 'yup';
import { addMonths } from 'date-fns';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';

import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async store(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const student = await Student.findOne({
      where: { id: req.params.id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    const existRegistration = await Registration.findOne({
      where: { student_id: req.params.id },
    });
    if (existRegistration) {
      return res
        .status(400)
        .json({ error: 'Student already has registration.' });
    }

    const { plan_id } = req.body;
    const plan = await Plan.findByPk(plan_id);

    const start_date = new Date();
    const end_date = addMonths(start_date, plan.duration);
    const totalPrice = plan.price * plan.duration;

    await Registration.create({
      student_id: student.id,
      plan_id,
      start_date,
      end_date,
      price: totalPrice,
    });

    await Queue.add(RegistrationMail.key, {
      student,
      plan,
      end_date,
      totalPrice,
    });

    const registration = await Registration.findOne({
      where: { student_id: req.params.id },
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'price'],
        },
      ],
    });

    return res.json(registration);
  }

  async index(req, res) {
    const registrations = await Registration.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'price'],
        },
      ],
    });
    return res.json(registrations);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { plan_id } = req.body;

    const student = await Student.findOne({
      where: { id: req.params.id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    const studentReg = await Registration.findOne({
      where: { student_id: req.params.id },
    });

    if (!studentReg) {
      return res
        .status(400)
        .json({ error: 'Student does not have registration.' });
    }

    const plan = await Plan.findByPk(plan_id);
    const start_date = new Date();
    const end_date = addMonths(start_date, plan.duration);
    const totalPrice = plan.price * plan.duration;

    await studentReg.update({
      student_id: student.id,
      plan_id,
      start_date,
      end_date,
      price: totalPrice,
    });

    const registration = await Registration.findOne({
      where: { student_id: req.params.id },
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'price'],
        },
      ],
    });

    return res.json(registration);
  }
}

export default new RegistrationController();
