import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

export function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (file) {
      await onUpload(file);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-8 transition-all duration-300',
          isDragging
            ? 'border-secondary bg-secondary/5 scale-[1.02]'
            : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30',
          file && 'border-success/40 bg-success/5'
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center gap-4 text-center">
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
            file
              ? 'bg-success/10 text-success'
              : isDragging
                ? 'bg-secondary/10 text-secondary scale-110'
                : 'bg-primary/10 text-primary'
          )}>
            {file ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </div>
          
          {!file ? (
            <>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Drop your PDF here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB • PDF only
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="ml-2 rounded-full p-1 hover:bg-destructive/10 transition-colors"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || isLoading}
        variant="hero"
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Application...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            Upload & Analyze Application
          </>
        )}
      </Button>
    </div>
  );
}
