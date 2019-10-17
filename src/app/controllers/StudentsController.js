import * as Yup from 'yup';

import Student from '../models/Student';
import User from '../models/User';

class StudentController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(401).json({ error: 'Token not provided.' });
    }

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

    const student = await Student.create(req.body);

    return res.json(student);
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

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(401).json({ error: 'Token not provided.' });
    }

    const existsStudent = await Student.findByPk(req.params.id);

    const student = await existsStudent.update(req.body);

    return res.json(student);
  }
}

export default new StudentController();
