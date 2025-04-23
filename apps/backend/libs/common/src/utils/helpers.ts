import * as bcryptjs from 'bcryptjs';

export function generateKafkaServiceMap(
  services: readonly {
    serviceName: string;
    clientId: string;
    groupId: string;
  }[],
): Record<string, { clientId: string; groupId: string }> {
  return services.reduce(
    (acc, curr) => {
      acc[curr.serviceName] = {
        clientId: curr.clientId,
        groupId: curr.groupId,
      };
      return acc;
    },
    {} as Record<string, { clientId: string; groupId: string }>,
  );
}

export const isValidPassword = (
  inputPassword: string,
  userPassword: string,
) => {
  return bcryptjs.compareSync(inputPassword, userPassword);
};

export const hashPassword = (password: string) => {
  return bcryptjs.hashSync(password, bcryptjs.genSaltSync());
};

export const generateOtp = (length = 6): string => {
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
};
