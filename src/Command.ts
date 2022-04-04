import Pop3Connection, { IPop3ConnectionOptions } from "./Connection.js";

import { stream2String, listify } from "./helper.js";

class Pop3Command extends Pop3Connection {
  user: string;
  password: string;
  _PASSInfo: string;
  static stream2String: (stream: any) => Promise<unknown>;
  static listify: (str: string) => string[][];
  constructor(options: IPop3ConnectionOptions) {
    super(options);
    this.user = options.user;
    this.password = options.password;
    this._PASSInfo = "";
  }

  async _connect() {
    if (this._socket) {
      return this._PASSInfo;
    }
    await super.connect();
    await super.command("USER", this.user);
    const [info] = await super.command("PASS", this.password);
    this._PASSInfo = info;
    return this._PASSInfo;
  }

  async UIDL(msgNumber = "") {
    await this._connect();
    const [, stream] = await super.command("UIDL", msgNumber);
    const str = await stream2String(stream);
    const list = listify(str);
    return msgNumber ? list[0] : list;
  }

  async NOOP() {
    await this._connect();
    await super.command("NOOP");
    return;
  }

  async LIST(msgNumber = "") {
    await this._connect();
    const [, stream] = await super.command("LIST", msgNumber);
    const str = await stream2String(stream);
    const list = listify(str);
    return msgNumber ? list[0] : list;
  }

  async RSET() {
    await this._connect();
    const [info] = await super.command("RSET");
    return info;
  }

  async RETR(msgNumber: string | number) {
    await this._connect();
    const [, stream] = await super.command("RETR", msgNumber);
    return stream2String(stream);
  }

  async DELE(msgNumber: string | number) {
    await this._connect();
    const [info] = await super.command("DELE", msgNumber);
    return info;
  }

  async STAT() {
    await this._connect();
    const [info] = await super.command("STAT");
    return info;
  }

  async TOP(msgNumber: string | number, n = 0) {
    await this._connect();
    const [, stream] = await super.command("TOP", msgNumber, n);
    return stream2String(stream);
  }

  async QUIT() {
    if (!this._socket) {
      this._PASSInfo = "" || "Bye";
      return this._PASSInfo;
    }
    const [info] = await super.command("QUIT");
    this._PASSInfo = info || "";
    return this._PASSInfo;
  }
}

Pop3Command.stream2String = stream2String;
Pop3Command.listify = listify;

export default Pop3Command;