
import pako from 'pako';
import JSZip from 'jszip';

export interface ProcessedFile {
  data: ArrayBuffer;
  filename: string;
  type: 'ply' | 'splat';
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
    } else if (filename.endsWith('.splat')) {
      const data = await file.arrayBuffer();
      return {
        data,
        filename: file.name,
        type: 'splat'
      };
    } else {
      throw new Error('Unsupported file format. Please upload .ply, .ply.gz, .splat, or .zip files.');
    }
  }

  private static async processZipFile(file: File): Promise<ProcessedFile> {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    // Find the first .ply or .splat file in the zip
    let targetFile: JSZip.JSZipObject | null = null;
    let fileType: 'ply' | 'splat' = 'ply';
    
    for (const filename in zipContent.files) {
      const zipFile = zipContent.files[filename];
      if (!zipFile.dir) {
        const lowerName = filename.toLowerCase();
        if (lowerName.endsWith('.ply')) {
          targetFile = zipFile;
          fileType = 'ply';
          break;
        } else if (lowerName.endsWith('.splat')) {
          targetFile = zipFile;
          fileType = 'splat';
          break;
        }
      }
    }
    
    if (!targetFile) {
      throw new Error('No .ply or .splat file found in the zip archive.');
    }
    
    const data = await targetFile.async('arraybuffer');
    return {
      data,
      filename: targetFile.name,
      type: fileType
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
