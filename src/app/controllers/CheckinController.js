import { parseISO, startOfDay, endOfDay } from 'date-fns';
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

    const checkCheckin = await Checkin.findAndCountAll({
      where: { student_id: req.params.id },
    });

    console.log(checkCheckin.count);

    if (checkCheckin.count % 5 === 0) {
      const listCheckin = await Checkin.findAll({
        where: { student_id: req.params.id },
      });

      const numberDays = differenceInDays(parseISO(listCheckin), new Date());
      console.log(listCheckin);
      if (numberDays < 7) {
        return res
          .status(400)
          .json({ error: 'Only 5 checkins allowed within 7 days.' });
      }
    }

    const checkin = await Checkin.create({
      student_id: req.params.id,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
