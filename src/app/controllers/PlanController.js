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
    const { page = 1 } = req.query;

    const allPlans = await Plan.findAndCountAll();

    const per_page = 5;
    const total_list = allPlans.count;
    const total_pages = total_list / per_page;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(401).json({ error: 'Token was not provided.' });
    }

    /* if (page === undefined) {
      const plans = await Plan.findAll({
        attributes: ['id', 'title', 'duration', 'price'],
        order: ['duration'],
      });

      return res.json(plans);
    } */

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      order: ['duration'],
      limit: per_page,
      offset: (page - 1) * per_page,
    });

    return res.json({
      total_list,
      total_pages,
      plans,
    });
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
    const { page = 1 } = req.query;
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    await plan.destroy({ where: { id: plan.id } });

    const allPlans = await Plan.findAndCountAll();

    const per_page = 5;
    const total_list = allPlans.count;
    const total_pages = total_list / per_page;

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      order: ['duration'],
      limit: per_page,
      offset: (page - 1) * per_page,
    });

    return res.json({
      total_list,
      total_pages,
      plans,
    });
  }
}

export default new PlanController();
