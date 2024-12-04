import { IncomingMessage, ServerResponse } from 'http';

class BodyParser {
  public extractData = async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) => {
    const dataBinary: Buffer[] = [];
    return new Promise<void>((resolve, reject) => {
      req.on('data', (chunk: Buffer) => {
        dataBinary.push(chunk);
      });

      req.on('end', () => {
        req.body = this.parseData(req.headers['content-type'] as string, dataBinary);
        resolve();
        next();
      });

      req.on('error', (err) => {
        reject(err);
      });
    });
  };

  private parseData(contentType: string, dataBinary: Buffer[]) {
    const buffer = Buffer.concat(dataBinary);
    const stringdata = buffer.toString('utf8').trim();

    if (contentType === 'application/json') {
      try {
        return JSON.parse(stringdata);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid JSON format');
      }
    }
  }
}

export default new BodyParser();
