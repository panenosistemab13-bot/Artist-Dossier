export type Format = 'SINGLE' | 'MIXTAPE' | 'EP' | 'ALBUM';
export type Status = 'SIM' | 'NÃO';
export type DistributorStatus = 'AO VIVO' | 'ENTREGUE' | 'INCOMPLETA' | 'EM ANALIZE';

export interface Track {
  id: string;
  order: number;
  name: string;
  audioUrl?: string;
  audioName?: string;
}

export interface Project {
  id: string;
  name: string;
  releaseDate: string;
  format: Format;
  artDone: Status;
  musicDone: Status;
  distributorStatus: DistributorStatus;
  coverUrl: string;
  tracks?: Track[];
}

export interface Artist {
  id: string;
  name: string;
  image: string;
}
