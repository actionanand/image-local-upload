export interface ImageItem {
  id: string;
  name: string;
  base64: string;
  type: string;
  date: Date;
}

export interface ConfirmationRequest {
  message: string;
  resolve: (result: boolean) => void;
}
