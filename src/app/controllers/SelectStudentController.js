import Student from '../models/Student';

class SelectStudentController {
  async index(req, res) {
    const allStudents = await Student.findAll({
      include: [{ association: 'registrations' }],
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
      order: ['id'],
    });

    const students = allStudents.filter(item => item.registrations === null);

    return res.json(students);
  }
}

export default new SelectStudentController();
