import Joi from '@hapi/joi';
import HttpStatus from 'http-status-codes';
import _ from 'lodash';

enum ValidatedPart{ BODY, QUERY }

function validateByValidatedPart(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any,
  schema: Joi.ObjectSchema,
  validatedPart: ValidatedPart,
): Joi.ValidationResult {
  let data;
  switch (validatedPart) {
    case ValidatedPart.BODY: {
      data = req.body;
      break;
    }
    case ValidatedPart.QUERY: {
      data = req.query;
      break;
    }
    default: {
      data = req.body;
      break;
    }
  }
  return schema.validate(data);
}

function validateRequest(
  schema: Joi.ObjectSchema,
  part: ValidatedPart,
): Function {
  return function validateWrapper(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-param-reassign
    descriptor.value = function descriptorWrapper(...args: any[]): any {
      const req = args[0];
      const res = args[1];
      const validateResult = validateByValidatedPart(req, schema, part);
      const isValid = _.isNil(validateResult.error);
      if (!isValid) {
        res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          error: _.head(validateResult.error?.details)?.message,
        });
        return null;
      }
      // Modify the requestBody, using filtered validateResult value instead.
      req.body = validateResult.value;
      const result = originalMethod.apply(this, args);
      return result;
    };
    // for nested decorator, chaining
    return descriptor;
  };
}

export const validateRequestBody = _.curryRight(validateRequest)(ValidatedPart.BODY);
export const validateRequestQuery = _.curryRight(validateRequest)(ValidatedPart.QUERY);
export default {
  validateRequestBody,
  validateRequestQuery,
};
