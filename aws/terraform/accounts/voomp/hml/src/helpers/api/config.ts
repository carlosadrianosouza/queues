import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Logger from "../logger";
import { CustomError } from "../../exceptions/CustomError";
import { DateTime } from "luxon";

let started_at: number;

export const validateStatus = (status: number) =>
  (status >= 200 && status < 300) || status === 422;

export const configRequest = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  started_at = DateTime.now().toSeconds();
  await Logger.info("Request started");
  return config;
};

export const configResponseSuccess = async (
  response: AxiosResponse
): Promise<AxiosResponse> => {
  const finishedInSeconds = DateTime.now().toSeconds() - started_at;

  await Logger.info("Request completed successfully", {
    finishedInSeconds,
    response: {
      status: response.status,
      statusText: response.statusText,
    },
  });

  return response;
};

export const configResponseError = async (error: AxiosError) => {
  const finishedInSeconds = DateTime.now().toSeconds() - started_at;

  throw new CustomError(
    `Request ended with error: (${error.code}) - "${error.message}"`,
    {
      finishedInSeconds,
    }
  );
};
