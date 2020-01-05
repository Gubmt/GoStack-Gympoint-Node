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
    const { page } = req.query;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(401).json({ error: 'Token was not provided.' });
    }

    if (page === undefined) {
      const plans = await Plan.findAll({
        attributes: ['id', 'title', 'duration', 'price'],
        order: ['duration'],
      });

      return res.json(plans);
    }

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      order: ['duration'],
      limit: 5,
      offset: (page - 1) * 5,
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

  async delete(req, res) {
    const { page } = req.query;
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    await plan.destroy({ where: { id: plan.id } });

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      order: ['duration'],
      limit: 5,
      offset: (page - 1) * 5,
    });

    return res.json(plans);
  }
}

export default new PlanController();
