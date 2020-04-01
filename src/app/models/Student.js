import Sequelize, { Model } from 'sequelize';

class Student extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        age: Sequelize.INTEGER,
        weight: Sequelize.INTEGER,
        height: Sequelize.FLOAT,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.hasOne(models.Registration, {
      foreignKey: 'student_id',
      as: 'registrations',
    });
  }
}

export default Student;
