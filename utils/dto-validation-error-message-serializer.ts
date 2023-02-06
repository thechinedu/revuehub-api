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

      const key = messages[context?.key as string];
      messageRecord = key?.[type];

      if (!messageRecord) {
        messageRecord = {
          [details.context?.key || 'message']: details.message.replace(
            /["]/g,
            '',
          ),
        };
      }

      Object.assign(acc, messageRecord);
    });

    return { data: acc };
  };
