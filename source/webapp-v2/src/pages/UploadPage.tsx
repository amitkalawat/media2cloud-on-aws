import { UploadWizard } from '@/components/upload/UploadWizard';

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl mb-8">Upload Media</h1>
      <UploadWizard />
    </div>
  );
}
