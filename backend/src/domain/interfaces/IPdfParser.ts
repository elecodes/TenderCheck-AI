export interface IPdfParser {
  parse(buffer: Buffer): Promise<string>;
  parsePages(buffer: Buffer): Promise<string[]>;
  getPageCount(buffer: Buffer): Promise<number>;
}
