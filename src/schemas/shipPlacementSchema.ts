import Joi from '@hapi/joi';
import Position from '../models/Position';

export default Joi.object({
  type: Joi.string().label('Ship type')
    .trim()
    .lowercase()
    .valid('battleship', 'cruiser', 'destroyer', 'submarine')
    .required(),
  position: Joi.object({
    x: Joi.number().label('Position x')
      .min(Position.min)
      .max(Position.max)
      .required(),
    y: Joi.number().label('Position y')
      .min(Position.min)
      .max(Position.max)
      .required(),
  }),
});
