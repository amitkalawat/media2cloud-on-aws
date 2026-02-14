import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropZone } from './DropZone';
import { MetadataForm } from './MetadataForm';
import { AnalysisConfig } from './AnalysisConfig';
import { UploadReview } from './UploadReview';
import { useUpload } from '@/hooks/useUpload';
import { cn } from '@/lib/utils';

const steps = ['Select Files', 'Metadata', 'Analysis', 'Review & Upload'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                idx < currentStep
                  ? 'bg-accent text-white'
                  : idx === currentStep
                    ? 'bg-accent text-white ring-4 ring-accent/20'
                    : 'border-2 border-border text-text-secondary'
              )}
            >
              {idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
            </div>
            <span className={cn(
              'mt-2 text-xs',
              idx <= currentStep ? 'text-text font-medium' : 'text-text-secondary'
            )}>
              {label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'mx-3 h-px w-12 sm:w-20',
                idx < currentStep ? 'bg-accent' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function UploadWizard() {
  const [step, setStep] = useState(0);
  const {
    files,
    setRawFiles,
    groupName,
    setGroupName,
    attributes,
    setAttributes,
    analysisConfig,
    setAnalysisConfig,
    isUploading,
    computeChecksums,
    uploadAll,
    overallProgress,
  } = useUpload();

  const rawFiles = files.map((f) => f.file);

  // Compute checksums when entering review step
  useEffect(() => {
    if (step === 3 && files.some((f) => f.md5Status === 'pending')) {
      computeChecksums();
    }
  }, [step]);

  const canProceed = () => {
    if (step === 0) return rawFiles.length > 0;
    return true;
  };

  return (
    <div>
      <StepIndicator currentStep={step} />

      <div className="rounded-xl border border-border bg-surface p-6">
        {step === 0 && (
          <DropZone
            files={rawFiles}
            onFilesChange={setRawFiles}
          />
        )}

        {step === 1 && (
          <MetadataForm
            groupName={groupName}
            onGroupNameChange={setGroupName}
            attributes={attributes}
            onAttributesChange={setAttributes}
          />
        )}

        {step === 2 && (
          <AnalysisConfig
            config={analysisConfig}
            onChange={(key, enabled) =>
              setAnalysisConfig((prev) => ({ ...prev, [key]: enabled }))
            }
          />
        )}

        {step === 3 && (
          <UploadReview
            files={files}
            analysisConfig={analysisConfig}
            groupName={groupName}
            isUploading={isUploading}
            overallProgress={overallProgress}
            onUpload={uploadAll}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 0 || isUploading}
        >
          Back
        </Button>

        {step < 3 && (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
