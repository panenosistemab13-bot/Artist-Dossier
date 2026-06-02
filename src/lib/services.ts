import { ref as dbRef, onValue, set, remove, update, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Project, Artist } from '../types';
import { initialProjects } from '../data';

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const fileReference = storageRef(storage, path);
    // Timeout of 1200ms to avoid long pending states in restricted/unconfigured storage
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage upload timeout')), 1200)
    );
    const uploadOperation = (async () => {
      await uploadBytes(fileReference, file);
      return await getDownloadURL(fileReference);
    })();
    return await Promise.race([uploadOperation, timeoutPromise]);
  } catch (error) {
    console.warn('Firebase Storage upload failed or timed out, falling back to Base64 data URL:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to Base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
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
