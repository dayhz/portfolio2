import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
export declare const uploadImage: multer.Multer;
export declare const uploadMedia: multer.Multer;
export declare const optimizeImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optimizeImages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateFileUrls: (req: Request, filename: string, thumbnailFilename?: string) => {
    url: string;
    thumbnailUrl: string | undefined;
};
//# sourceMappingURL=upload.d.ts.map