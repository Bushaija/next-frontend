import { Program } from "./constants";

interface ProgramListProps {
  programs: Program[];
  onProgramClick?: (program: Program) => void;
}

export const ProgramList = ({ programs, onProgramClick }: ProgramListProps) => {
  if (!programs.length) {
    return (
      <div className="p-4 text-center text-muted-foreground" role="status">
        No programs available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4" role="list" aria-label="Available programs">
      {programs.map((program) => (
        <div
          key={program.id}
          className="flex flex-row justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer"
          onClick={() => onProgramClick?.(program)}
          role="listitem"
          tabIndex={0}
          aria-label={`${program.name} program`}
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">{program.name}</span>
            <span className="text-xs text-muted-foreground">
              {program.description}
            </span>
          </div>
          <div className="flex flex-row gap-2">
            {program.status === "active" ? (
              <span className="text-xs text-green-500" aria-label="Active program">
                Active
              </span>
            ) : (
              <span className="text-xs text-red-500" aria-label="Inactive program">
                Inactive
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 