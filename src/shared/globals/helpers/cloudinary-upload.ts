import  cloudinary , {UploadApiResponse , UploadApiErrorResponse} from 'cloudinary';

export function uploads(
  file: string,
  public_id?: string, // zato sto moze da overwrajtuje random generisan id na cloudinary-u ili ako neces ne mora (? sluzi da moze da ima to polje a i ne mora)
  overwrite?: boolean,
  invalidate?:boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve)=>{
    cloudinary.v2.uploader.upload(
      file,
      {
        public_id,
        overwrite,
        invalidate
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if(error) resolve(error);
        resolve(result);
      }
    );
  });
}
