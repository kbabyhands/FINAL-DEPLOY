
import pako from 'pako';
import JSZip from 'jszip';

export interface ProcessedFile {
  data: ArrayBuffer;
  filename: string;
  type: 'ply';
}

export class FileProcessor {
  static async processFile(file: File): Promise<ProcessedFile> {
    const filename = file.name.toLowerCase();
    
    if (filename.endsWith('.zip')) {
      return this.processZipFile(file);
    } else if (filename.endsWith('.gz') || filename.endsWith('.ply.gz')) {
      return this.processGzipFile(file);
    } else if (filename.endsWith('.ply')) {
      const data = await file.arrayBuffer();
      return {
        data,
        filename: file.name,
        type: 'ply'
      };
    } else {
      throw new Error('Unsupported file format. Please upload .ply, .ply.gz, or .zip files.');
    }
  }

  private static async processZipFile(file: File): Promise<ProcessedFile> {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    // Find the first .ply file in the zip
    let targetFile: JSZip.JSZipObject | null = null;
    
    for (const filename in zipContent.files) {
      const zipFile = zipContent.files[filename];
      if (!zipFile.dir) {
        const lowerName = filename.toLowerCase();
        if (lowerName.endsWith('.ply')) {
          targetFile = zipFile;
          break;
        }
      }
    }
    
    if (!targetFile) {
      throw new Error('No .ply file found in the zip archive.');
    }
    
    const data = await targetFile.async('arraybuffer');
    return {
      data,
      filename: targetFile.name,
      type: 'ply'
    };
  }

  private static async processGzipFile(file: File): Promise<ProcessedFile> {
    const compressedData = await file.arrayBuffer();
    
    try {
      const decompressed = pako.ungzip(new Uint8Array(compressedData));
      return {
        data: decompressed.buffer,
        filename: file.name.replace('.gz', ''),
        type: 'ply'
      };
    } catch (error) {
      throw new Error('Failed to decompress .gz file. Please ensure it\'s a valid gzip archive.');
    }
  }
}
