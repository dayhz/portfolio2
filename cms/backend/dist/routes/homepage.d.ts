import express from 'express';
declare const router: import("express-serve-static-core").Router;
declare const validateSection: (req: express.Request, res: express.Response, next: express.NextFunction) => express.Response<any, Record<string, any>> | undefined;
declare const validateSectionData: (req: express.Request, res: express.Response, next: express.NextFunction) => express.Response<any, Record<string, any>> | undefined;
declare const handleHomepageError: (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => express.Response<any, Record<string, any>> | undefined;
export { router as homepageRouter, validateSection, validateSectionData, handleHomepageError };
//# sourceMappingURL=homepage.d.ts.map