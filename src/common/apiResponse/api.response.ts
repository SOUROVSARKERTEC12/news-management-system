export type SendSuccessParams<T> = {
  statusCode: number;
  payload: { [key: string]: T };
};

export const apiResponse = <T>({
  statusCode,
  payload = {},
}: SendSuccessParams<T>) => {
  return {
    statusCode,
    ...payload,
  };
};
