import type { ApiRequest, APIResponse } from "@/lib/types";
import type { Http2SecureServer } from "http2";
import type { Server as NetServer } from "net";

import { createRouter } from "next-connect";
import { Server as SocketIO } from "socket.io";

const router = createRouter<ApiRequest, APIResponse>();

router.all((req, res) => {
    if (!res.socket.server.io) {
        const httpServer: NetServer = res.socket.server;
        const io = new SocketIO(httpServer as Http2SecureServer);

        res.socket.server.io = io;

        io.on("connection", (socket) => {
            socket.on("send-message", (obj) => {
                io.emit("receive-message", obj);
            });
        });

        console.log("Initialized socket.io");
    }

    return res.status(200).end();
});
