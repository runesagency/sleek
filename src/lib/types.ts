import type { User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import type { ZodError } from "zod";

export type APIMethodFunction<BodySchema, Result> = (user: User, body: BodySchema) => Promise<APIMethodResult<Result, BodySchema>>;

export type APIMethodResult<Result, SchemaType = unknown> =
    | {
          result: Result;
          error?: never;
      }
    | {
          result?: never;
          error: ZodError<SchemaType>;
      };

export type ApiRequest = NextApiRequest & {
    params: Record<string, string>;
    user: User;
};

export type APIResponse = NextApiResponse<{
    result?: unknown;
    error?: unknown;
}>;
