import { ref as dbRef, onValue, set, remove, update, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Project, Artist } from '../types';
import { initialProjects } from '../data';
import { useState, useEffect } from 'react';

// Native IndexedDB setup for secure local storage fallback of large files (audio/images)
const DB_NAME = 'ArtistDossierLocalFiles';
const STORE_NAME = 'files';

function getIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalFile(id: string, file: Blob | string): Promise<string> {
  const db = await getIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(file, id);
    request.onsuccess = () => resolve(`local-file:${id}`);
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalFile(id: string): Promise<Blob | string | null> {
  const db = await getIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// React hook to convert local-file: ID or Base64 string into a high-performance Blob Object URL
export function useResolvedUrl(url: string | undefined): string | undefined {
  const [resolved, setResolved] = useState<string | undefined>(() => {
    if (!url) return undefined;
    if (url.startsWith('local-file:')) {
      return undefined;
    }
    return url;
  });

  useEffect(() => {
    if (!url) {
      setResolved(undefined);
      return;
    }

    if (url.startsWith('local-file:')) {
      const id = url.replace('local-file:', '');
      let isMounted = true;
      let objectUrl: string | null = null;

      getLocalFile(id).then((fileData) => {
        if (!isMounted) return;
        if (fileData) {
          const isBlob = fileData && typeof fileData === 'object' && (
            fileData instanceof Blob ||
            (fileData as any).constructor?.name === 'Blob' ||
            (fileData as any).constructor?.name === 'File' ||
            ('size' in (fileData as any) && 'type' in (fileData as any))
          );
          if (isBlob) {
            objectUrl = URL.createObjectURL(fileData as Blob);
            setResolved(objectUrl);
          } else if (typeof fileData === 'string') {
            setResolved(fileData);
          }
        } else {
          setResolved(undefined);
        }
      }).catch((err) => {
        console.error('Error loading local file from IndexedDB:', err);
        setResolved(url); // fallback to original input
      });

      return () => {
        isMounted = false;
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    } else {
      setResolved(url);
    }
  }, [url]);

  return resolved;
}

const resizeImageTo3000px = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 3000;
          canvas.height = 3000;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // Calculate clipping path to auto-crop central square of the image safely
          const size = Math.min(img.width, img.height);
          const xOffset = (img.width - size) / 2;
          const yOffset = (img.height - size) / 2;

          // Draw and scale to exactly 3000x3000px
          ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, 3000, 3000);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.95);
        } catch (e) {
          console.warn('Canvas resizing to 3000px failed, falling back to original file:', e);
          resolve(file);
        }
      };
      img.onerror = () => {
        resolve(file);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      resolve(file);
    };
    reader.readAsDataURL(file);
  });
};

const resizeImageToPreview = (file: File | Blob, targetSize: number = 800, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          const size = Math.min(img.width, img.height);
          const xOffset = (img.width - size) / 2;
          const yOffset = (img.height - size) / 2;

          ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, targetSize, targetSize);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        } catch (e) {
          console.warn('Canvas resizing to preview failed, returning original file:', e);
          resolve(file);
        }
      };
      img.onerror = () => {
        resolve(file);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      resolve(file);
    };
    reader.readAsDataURL(file);
  });
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
  let dataToUpload: File | Blob = file;
  const isImage = file.type.startsWith('image/');

  if (isImage) {
    try {
      dataToUpload = await resizeImageTo3000px(file);
    } catch (e) {
      console.warn('Could not resize image to 3000x3000px:', e);
    }
  }

  try {
    const fileReference = storageRef(storage, path);
    // Timeout of 15000ms (15 seconds) to give ample space for upload before fallback
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage upload timeout')), 15000)
    );
    const uploadOperation = (async () => {
      await uploadBytes(fileReference, dataToUpload);
      return await getDownloadURL(fileReference);
    })();
    return await Promise.race([uploadOperation, timeoutPromise]);
  } catch (error) {
    console.warn('Firebase Storage upload failed or timed out, falling back:', error);

    // If it is an image, fall back to a highly compressed optimized Base64 string for cross-device sync
    if (isImage) {
      console.log('Falling back to optimized Base64 representation for image sync across desktop and mobile');
      try {
        const previewBlob = await resizeImageToPreview(dataToUpload, 800, 0.8);
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to convert optimized preview image to Base64'));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(previewBlob);
        });
      } catch (base64Error) {
        console.error('Failed to create optimized Base64, falling back to original file as Base64:', base64Error);
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to convert original file to Base64'));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      }
    }

    // For audio files (or any other files) under 12MB, we fall back to Base64 to ensure cross-device synchronization.
    // This allows the audio to be synchronized and played across desktop, mobile, and web devices
    // even if Firebase Storage uploads fail or are blocked by security rules.
    if (dataToUpload.size < 12 * 1024 * 1024) {
      console.log('Firebase Storage upload failed/timed out inside uploadFile. Falling back to Base64 representation to enable cross-device play.');
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert file to Base64'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(dataToUpload);
      });
    }

    // Audio files larger than 12MB continue to fall back to Local IndexedDB to prevent database inflation
    const fileId = crypto.randomUUID();
    try {
      const dbUrl = await saveLocalFile(fileId, dataToUpload);
      return dbUrl;
    } catch (idbError) {
      console.error('IndexedDB save failed, falling back to Base64 for audio:', idbError);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert audio to Base64'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(dataToUpload);
      });
    }
  }
};

export const subscribeToArtists = (callback: (artists: Artist[]) => void) => {
  const artistsRef = dbRef(db, 'artists');
  
  // Seed first artist if db empty
  get(artistsRef).then((snapshot) => {
    if (!snapshot.exists()) {
      const updates: Record<string, any> = {};
      const initialArtist = {
        name: 'Jeff Diss',
        image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=300&h=300',
        password: '36356918'
      };
      updates['jeff-diss'] = initialArtist;
      update(artistsRef, updates).then(() => {
        const projectsRef = dbRef(db, 'artists/jeff-diss/projects');
        const projUpdates: Record<string, any> = {};
        initialProjects.forEach(p => { projUpdates[p.id] = p; });
        update(projectsRef, projUpdates);
      });
    }
  }).catch(console.error);

  return onValue(artistsRef, (snapshot) => {
    const artists: Artist[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const val = child.val();
        artists.push({
          id: child.key as string,
          name: val.name,
          image: val.image || '',
          password: val.password || (child.key === 'jeff-diss' ? '36356918' : undefined),
        });
      });
    }
    callback(artists);
  });
};

export const saveArtist = async (artist: Artist) => {
  const data: Record<string, any> = {
    name: artist.name,
    image: artist.image
  };
  if (artist.password !== undefined) {
    data.password = artist.password;
  }
  await update(dbRef(db, `artists/${artist.id}`), data);
};

export const removeArtist = async (id: string) => {
  await remove(dbRef(db, `artists/${id}`));
};

export const subscribeToProjects = (artistId: string, callback: (projects: Project[]) => void) => {
  const projectsRef = dbRef(db, `artists/${artistId}/projects`);

  return onValue(projectsRef, (snapshot) => {
    const projects: Project[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        projects.push(childSnapshot.val() as Project);
      });
    }
    callback(projects);
  });
};

export const saveProject = async (artistId: string, project: Project) => {
  await set(dbRef(db, `artists/${artistId}/projects/${project.id}`), project);
};

export const deleteProject = async (artistId: string, id: string) => {
  await remove(dbRef(db, `artists/${artistId}/projects/${id}`));
};
