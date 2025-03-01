declare module 'diff' {
  export interface Change {
    value: string;
    added?: boolean;
    removed?: boolean;
  }

  export function diffLines(oldStr: string, newStr: string, options?: any): Change[];
  export function diffWords(oldStr: string, newStr: string, options?: any): Change[];
  export function diffChars(oldStr: string, newStr: string, options?: any): Change[];
  export function diffSentences(oldStr: string, newStr: string, options?: any): Change[];
  export function diffCss(oldStr: string, newStr: string, options?: any): Change[];
  export function diffJson(oldObj: any, newObj: any, options?: any): Change[];
  export function diffArrays(oldArr: any[], newArr: any[], options?: any): Change[];
  
  export function applyPatch(source: string, patch: string | object): string;
  export function applyPatches(patch: string | object[], options: { loadFile: (index: number, callback: (err: Error, data: string) => void) => void }): string;
  
  export function structuredPatch(oldFileName: string, newFileName: string, oldStr: string, newStr: string, oldHeader: string, newHeader: string, options?: any): object;
  export function createPatch(fileName: string, oldStr: string, newStr: string, oldHeader: string, newHeader: string, options?: any): string;
  export function createTwoFilesPatch(oldFileName: string, newFileName: string, oldStr: string, newStr: string, oldHeader: string, newHeader: string, options?: any): string;
  
  export function parsePatch(diffStr: string, options?: any): object[];
  
  export function convertChangesToDMP(changes: Change[]): Array<[number, string]>;
  export function convertChangesToXML(changes: Change[]): string;
}
