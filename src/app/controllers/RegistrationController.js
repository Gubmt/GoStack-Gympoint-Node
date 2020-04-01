import * as Yup from 'yup';
import { parseISO } from 'date-fns';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';

import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async store(req, res) {
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

    const { plan_id, startDate, endDate, price } = req.body;
    const plan = await Plan.findByPk(plan_id);

    const start_date = parseISO(startDate);
    const end_date = parseISO(endDate);

    await Registration.create({
      student_id: student.id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    await Queue.add(RegistrationMail.key, {
      student,
      plan,
      end_date,
      price,
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
      order: ['id'],
    });

    return res.json(registration);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    /* if (page === undefined) {
      const registrations = await Registration.findAll({
        attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
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
        order: ['id'],
      });

      return res.json(registrations);
    } */

    const allRegistrations = await Registration.findAndCountAll();

    const per_page = 5;
    const total_list = allRegistrations.count;
    const total_pages = total_list / per_page;

    const registrations = await Registration.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
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
      limit: per_page,
      offset: (page - 1) * per_page,
      order: ['id'],
    });
    return res.json({
      total_list,
      total_pages,
      registrations,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, startDate, endDate, price } = req.body;

    const registrations = await Registration.findOne({
      where: { id: req.params.id },
    });

    if (!registrations) {
      return res.status(400).json({ error: 'Registration does not exist.' });
    }

    const start_date = parseISO(startDate);
    const end_date = parseISO(endDate);

    await registrations.update({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
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
      order: ['id'],
    });

    return res.json(registration);
  }

  async delete(req, res) {
    const { page = 1 } = req.query;
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    await registration.destroy({ where: { id: registration.id } });

    const allRegistrations = await Plan.findAndCountAll();

    const per_page = 5;
    const total_list = allRegistrations.count;
    const total_pages = total_list / per_page;

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
      order: ['id'],
      limit: per_page,
      offset: (page - 1) * per_page,
    });

    return res.json({
      total_list,
      total_pages,
      registrations,
    });
  }
}

export default new RegistrationController();
