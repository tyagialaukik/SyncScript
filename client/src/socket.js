import { io } from "socket.io-client";

const socket = io("https://syncscript-uwpi.onrender.com", {
  autoConnect: false,
});

export default socket;
