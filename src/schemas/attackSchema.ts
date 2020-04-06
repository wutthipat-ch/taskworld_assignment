import Joi from '@hapi/joi';
import positionSchema from './positionSchema';

export default Joi.object({ position: positionSchema });
