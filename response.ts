import { APIGatewayProxyResult } from 'aws-lambda';

export class ResponseBuilder {
  public getResponse(statusCode: number, body: any): APIGatewayProxyResult {
    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(body, null, 0)
    };
  }
}