# ocrlambda

Example implementation of an AWS lambda function that receives a URL to an image, reads the text from it and extracts the text.

## Testing locally

In order to test this offline, you need to have Docker, npm, and serverless installed.

Then run:

```
echo '{"url": "<image url>"}' | serverless invoke local -f getImageText
```