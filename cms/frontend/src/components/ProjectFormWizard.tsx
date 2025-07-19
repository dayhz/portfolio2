import { useState } from 'react';
import { ProjectFormStep1, ProjectStep1Data } from './ProjectFormStep1';
import { ProjectFormStep2 } from './ProjectFormStep2';
import { EditorBlock } from './NotionEditor';
import { AdvancedProject } from './ProjectFormAdvanced';

export interface ProjectFormWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: AdvancedProject;
  onSubmit: (data: {
    step1Data: ProjectStep1Data & { heroImageFile?: File };
    contentBlocks: EditorBlock[];
  }) => Promise<void>;
}

type WizardStep = 'step1' | 'step2';

export function ProjectFormWizard({ open, onOpenChange, project, onSubmit }: ProjectFormWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('step1');
  const [step1Data, setStep1Data] = useState<ProjectStep1Data & { heroImageFile?: File } | null>(null);

  // Préparer les données initiales si on édite un projet
  const initialStep1Data = project ? {
    title: project.title,
    subtitle: project.subtitle,
    category: project.category,
    status: project.status,
    client: project.client,
    year: project.year,
    duration: project.duration,
    industry: project.industry,
    scope: project.scope,
    projectUrl: project.projectUrl,
    challenge: project.challenge,
    approach: project.approach,
    testimonial: project.testimonial,
  } : undefined;

  const handleStep1Next = (data: ProjectStep1Data & { heroImageFile?: File }) => {
    setStep1Data(data);
    setCurrentStep('step2');
  };

  const handleStep2Back = () => {
    setCurrentStep('step1');
  };

  const handleStep2Complete = async (contentBlocks: EditorBlock[]) => {
    if (!step1Data) return;
    
    await onSubmit({
      step1Data,
      contentBlocks
    });
    
    // Reset wizard
    setCurrentStep('step1');
    setStep1Data(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    // Reset wizard state when closing
    setCurrentStep('step1');
    setStep1Data(null);
    onOpenChange(false);
  };

  return (
    <>
      <ProjectFormStep1
        open={open && currentStep === 'step1'}
        onOpenChange={handleClose}
        initialData={initialStep1Data}
        heroImage={project?.heroImage}
        onNext={handleStep1Next}
      />
      
      {step1Data && (
        <ProjectFormStep2
          open={open && currentStep === 'step2'}
          onOpenChange={handleClose}
          step1Data={step1Data}
          initialBlocks={project?.contentBlocks}
          onBack={handleStep2Back}
          onComplete={handleStep2Complete}
          isEditing={!!project}
        />
      )}
    </>
  );
}