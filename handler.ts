import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

import { createWorker } from 'tesseract.js';

const worker = createWorker({});

export const ocr: APIGatewayProxyHandler = async (event, _context) => {
  let url = event['url'];
  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing \'url\' parameter',
      }, null, 0),
    };
  }

  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(url);
  await worker.terminate();

  if (text.indexOf('EUR ') > -1) {
    let euroPos = text.lastIndexOf('EUR ');

    let nextSpaceAfterEUR = text.indexOf(' ', euroPos + 4);
    let nextNewLineAfterEUR = text.indexOf('\n', euroPos + 4);
    let endPos = nextSpaceAfterEUR < nextNewLineAfterEUR ? nextSpaceAfterEUR : nextNewLineAfterEUR;

    let price = text.slice(euroPos, endPos);

    return {
      statusCode: 200,
      body: JSON.stringify({
        price: price,
      }, null, 0),
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Price not found",
      }, null, 0),
    };
  }
}
