import Joi from '@hapi/joi';
import positionSchema from './positionSchema';

export default Joi.object({
  type: Joi.string().label('Ship type')
    .trim()
    .lowercase()
    .valid('battleship', 'cruiser', 'destroyer', 'submarine')
    .required(),
  position: positionSchema,
});
