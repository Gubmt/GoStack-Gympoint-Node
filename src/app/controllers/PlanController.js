import * as Yup from 'yup';
import User from '../models/User';
import Plan from '../models/Plan';

class PlanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const existPlan = await Plan.findOne({
      where: { title: req.body.title },
    });
    if (existPlan) {
      return res.status(400).json({ error: 'Name of plan already exists.' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({ id, title, duration, price });
  }

  async index(req, res) {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(401).json({ error: 'Token was not provided.' });
    }

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      order: ['id'],
    });

    return res.json(plans);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const existPlans = await Plan.findByPk(req.params.id);

    const { id, title, duration, price } = await existPlans.update(req.body);

    return res.json({ id, title, duration, price });
  }
}

export default new PlanController();
