import * as Yup from 'yup';
import { Op } from 'sequelize';

import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const existsStudents = await Student.findOne({
      where: { email: req.body.email },
    });

    if (existsStudents) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const existsStudent = await Student.findByPk(req.params.id);

    const { id, name, email, age, weight, height } = await existsStudent.update(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }

  async index(req, res) {
    const { page } = req.query;
    const name = `${req.query.name}%`;

    const student = await Student.findOne({
      where: { name: { [Op.like]: name } },
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
    });

    if (
      name !== ' %' &&
      name !== '%' &&
      name !== 'undefined%' &&
      student !== null
    )
      return res.json(student);

    if (page === undefined) {
      const students = await Student.findAll({
        attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
        order: ['id'],
      });

      return res.json(students);
    }

    const students = await Student.findAll({
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
      limit: 5,
      offset: (page - 1) * 5,
      order: ['id'],
    });

    return res.json(students);
  }

  async delete(req, res) {
    const { page = 1 } = req.query;

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    await Student.destroy({ where: { id: student.id } });

    const students = await Student.findAll({
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
      limit: 5,
      offset: (page - 1) * 5,
      order: ['id'],
    });

    return res.json(students);
  }
}

export default new StudentController();
