import type { User } from "@prisma/client";
import type { Server as NetServer, Socket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as SocketIOServer } from "socket.io";

export type * as ApiMethod from "./api-methods";

export type ApiRequest = NextApiRequest & {
    params: Record<string, string>;
    user: User;
};

export type ApiResult<Result = unknown> =
    | {
          result: Result;
          error?: never;
      }
    | {
          result?: never;
          error: Error;
      };

export type ApiResponse<Result = unknown> = NextApiResponse<ApiResult<Result>> & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};
