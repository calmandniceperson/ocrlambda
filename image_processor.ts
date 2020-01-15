// Author(s): Michael Koeppl

import { createWorker } from 'tesseract.js';

export class ImageProcessor {
  worker: Tesseract.Worker;

  constructor() {
    this.worker = createWorker();
  }

  private async loadAndInitWorker(worker: Tesseract.Worker): Promise<void> {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  }

  private getPriceFromImageText(imageText: string): string {
    if (imageText.indexOf('EUR ') > -1) {
      let euroPos = imageText.lastIndexOf('EUR ');
      let nextSpaceAfterEUR = imageText.indexOf(' ', euroPos + 4);
      let nextNewLineAfterEUR = imageText.indexOf('\n', euroPos + 4);
      let endPos = nextSpaceAfterEUR < nextNewLineAfterEUR ? nextSpaceAfterEUR : nextNewLineAfterEUR;
      return imageText.slice(euroPos, endPos);
    } else {
      return null;
    }
  }

  public async readPrice(url: string): Promise<string> {
    await this.loadAndInitWorker(this.worker);
    const { data: { text } } = await this.worker.recognize(url);
    await this.worker.terminate();
    return this.getPriceFromImageText(text);
  }
}