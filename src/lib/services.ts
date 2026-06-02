import { ref as dbRef, onValue, set, remove, update, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Project, Artist } from '../types';
import { initialProjects } from '../data';

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const fileReference = storageRef(storage, path);
  await uploadBytes(fileReference, file);
  return await getDownloadURL(fileReference);
};

export const subscribeToArtists = (callback: (artists: Artist[]) => void) => {
  const artistsRef = dbRef(db, 'artists');
  
  // Seed first artist if db empty
  get(artistsRef).then((snapshot) => {
    if (!snapshot.exists()) {
      const updates: Record<string, any> = {};
      const initialArtist = {
        name: 'Jeff Diss',
        image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=300&h=300'
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
        });
      });
    }
    callback(artists);
  });
};

export const saveArtist = async (artist: Artist) => {
  await update(dbRef(db, `artists/${artist.id}`), {
    name: artist.name,
    image: artist.image
  });
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
