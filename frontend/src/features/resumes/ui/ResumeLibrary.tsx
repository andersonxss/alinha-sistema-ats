import type { ReactNode } from "react";
export function ResumeLibrary({
  onlyResume,
  children,
}: {
  onlyResume: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {onlyResume
              ? "SUA HISTÓRIA PROFISSIONAL"
              : "UMA NOVA POSSIBILIDADE"}
          </div>
          <h1>
            {onlyResume ? "Meus currículos" : "Vamos conhecer a oportunidade"}
          </h1>
          <p>
            Revise as informações. Uma boa análise começa com dados corretos.
          </p>
        </div>
      </div>
      {children}
    </>
  );
}
