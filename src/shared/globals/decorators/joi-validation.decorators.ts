import { JoiRequestValidationError } from '../helpers/error-handler';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (
  target: object,
  key: string,
  descriptor: PropertyDescriptor
) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target: object, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const request = args[0] as Request;
      const { error } = schema.validate(request.body);
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
