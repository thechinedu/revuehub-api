type GenerateValidationMessagesParams = {
  field: string;
  label?: string;
  min?: string;
  overrides?: Record<string, Record<string, string>>;
};

export const generateValidationMessages = ({
  field,
  label = field,
  min = '8',
  overrides,
}: GenerateValidationMessagesParams) => ({
  'any.invalid': { [field]: `${label} is invalid` },
  'any.required': { [field]: `No ${label.toLowerCase()} provided` },

  'number.base': { [field]: `${label} must be a number` },
  'number.greater': { [field]: `${label} is not valid` },

  'string.base': { [field]: `${label} must be a string` },
  'string.email': {
    [field]: `The provided ${label.toLowerCase()} is not valid`,
  },
  'string.empty': { [field]: `${label} cannot be empty` },
  'string.min': {
    [field]: `${label} should be a minimum of ${min} characters`,
  },
  ...overrides,
});
