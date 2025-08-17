interface Email {
  value: string;
  verified: boolean;
}

interface Photo {
  value: string;
}

export interface GoogleProfileResponse {
  id: string;
  displayName: string;
  emails: Array<Email>;
  photos: Array<Photo>;
}
