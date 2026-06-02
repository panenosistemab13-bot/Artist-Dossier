import React from 'react';
import { Disc3 } from 'lucide-react';
import { Project } from '../types';
import { Badge } from './Badge';
import { useResolvedUrl } from '../lib/services';

interface ProjectGridProps {
  projects: Project[];
  onEdit: (project: Project) => void;
}

export function ProjectGrid({ projects, onEdit }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400">
        <Disc3 className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-sans text-sm">Nenhum projeto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectGridItem key={project.id} project={project} onEdit={onEdit} />
      ))}
    </div>
  );
}

interface ProjectGridItemProps {
  project: Project;
  onEdit: (project: Project) => void;
}

const ProjectGridItem: React.FC<ProjectGridItemProps> = ({ project, onEdit }) => {
  const resolvedCoverUrl = useResolvedUrl(project.coverUrl);

  return (
    <div
      onClick={() => onEdit(project)}
      className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-200 flex flex-col gap-4 relative"
    >
      <div className="aspect-square w-full bg-stone-100 rounded-2xl overflow-hidden relative">
        {project.coverUrl ? (
          <img
            src={resolvedCoverUrl}
            alt={`Capa ${project.name}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Disc3 className="w-10 h-10 text-stone-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge value={project.format} type="format" />
        </div>
      </div>

      <div className="flex flex-col gap-1 px-2 pt-1 pb-2">
        <h3
          className="font-bold text-stone-800 text-lg leading-tight group-hover:text-amber-600 transition-colors line-clamp-1"
          title={project.name}
        >
          {project.name}
          {project.feats && project.feats.length > 0 && (
            <span className="text-xs font-normal text-stone-500 font-sans block mt-0.5 lowercase">
              feat. {project.feats.join(', ')}
            </span>
          )}
        </h3>
        <p className="text-[11px] text-stone-500 font-mono tracking-wider font-medium">
          {project.releaseDate || 'Lançamento a definir'}
        </p>

        <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Arte</span>
            <Badge value={project.artDone} type="status" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Música</span>
            <Badge value={project.musicDone} type="status" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Situação</span>
            <Badge value={project.distributorStatus} type="distributor" />
          </div>
        </div>
      </div>
    </div>
  );
}
