import { isAfter, subDays } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const existStudent = await Student.findOne({
      where: { id: req.params.id },
    });
    if (!existStudent) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const check_checkin = await Checkin.findAndCountAll({
      where: {
        student_id: req.params.id,
        created_at: { [Op.gt]: subDays(new Date(), 7) },
      },
    });

    if (check_checkin.count > 4) {
      return res.json({ error: 'Only 5 checkins in 7 days' });
    }

    const checkin = await Checkin.create({
      student_id: req.params.id,
    });

    return res.json(checkin);
  }

  async index(req, res) {
    const existStudent = await Student.findOne({
      where: { id: req.params.id },
    });
    if (!existStudent) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const checkin = await Checkin.findAll({
      where: { student_id: req.params.id },
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
