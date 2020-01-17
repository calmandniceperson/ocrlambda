// Author(s): Michael Koeppl

import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ResponseBuilder } from './response';
import { ImageProcessor } from './image_processor';
import 'source-map-support/register';

class OCRHandler {
  responseBuilder: ResponseBuilder;
  imageProcessor: ImageProcessor;

  constructor() {
    this.imageProcessor = new ImageProcessor()
    this.responseBuilder = new ResponseBuilder();
  }

  public async getImageText(event: APIGatewayEvent, _: Context): Promise<APIGatewayProxyResult> {
    let url = event['url'];
    if (!url) {
      return this.responseBuilder.getResponse(400, { error: 'Missing \'url\' parameter' });
    }

    let price = await this.imageProcessor.readPrice(url);
    if (price) {
      return this.responseBuilder.getResponse(200, { price: price });
    } else {
      return this.responseBuilder.getResponse(404, { error: 'Price not found' });
    }
  }
}

export const handler = new OCRHandler();
export const getImageText = handler.getImageText.bind(handler);