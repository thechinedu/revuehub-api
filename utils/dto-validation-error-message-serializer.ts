import { ValidationErrorItem } from 'joi';

type ValidationMessage = {
  [key: string]: string;
};

type ValidationMessages = {
  [key: string]: ValidationMessage;
};

type Messages = {
  [key: string]: ValidationMessages;
};

export const dtoValidationErrorMessageSerializer =
  (messages: Messages) => (errorDetails: ValidationErrorItem[]) => {
    const acc = {};

    errorDetails.forEach((details) => {
      const { context, type } = details;
      let messageRecord: Record<string, string> | ValidationErrorItem;

      if (context?.key) {
        const key = messages[context.key];
        messageRecord = key?.[type as keyof typeof key];
      } else {
        messageRecord = details;
      }

      Object.assign(acc, messageRecord);
    });

    return { data: acc };
  };
