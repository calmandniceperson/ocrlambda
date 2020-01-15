import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ResponseBuilder } from './response';
import 'source-map-support/register';

import { createWorker } from 'tesseract.js';

class OCRHandler {
  responseBuilder: ResponseBuilder;
  worker: Tesseract.Worker;

  constructor() {
    this.worker = createWorker();
    this.responseBuilder = new ResponseBuilder();
  }

  async loadAndInitWorker(worker: Tesseract.Worker): Promise<void> {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  }

  getPriceFromImage(imageText: string): string {
    let euroPos = imageText.lastIndexOf('EUR ');
    let nextSpaceAfterEUR = imageText.indexOf(' ', euroPos + 4);
    let nextNewLineAfterEUR = imageText.indexOf('\n', euroPos + 4);
    let endPos = nextSpaceAfterEUR < nextNewLineAfterEUR ? nextSpaceAfterEUR : nextNewLineAfterEUR;
    return imageText.slice(euroPos, endPos);
  }

  public async getImageText(event: APIGatewayEvent, _: Context): Promise<APIGatewayProxyResult> {
    let url = event['url'];
    if (!url) {
      return this.responseBuilder.getResponse(400, { error: 'Missing \'url\' parameter' });
    }

    await this.loadAndInitWorker(this.worker);
    const { data: { text } } = await this.worker.recognize(url);
    await this.worker.terminate();

    if (text.indexOf('EUR ') > -1) {
      return this.responseBuilder.getResponse(200, { price: this.getPriceFromImage(text) });
    } else {
      return this.responseBuilder.getResponse(404, { error: 'Price not found' });
    }
  }
}

export const handler = new OCRHandler();
export const getImageText = handler.getImageText.bind(handler);