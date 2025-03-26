// src/components/import-progress.tsx
import { useState, useEffect } from "react";
import { getImportStatus, ImportStatus } from "@/services/storage";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ImportProgressProps {
  importId: string;
  onComplete?: () => void;
}

export function ImportProgress({ importId, onComplete }: ImportProgressProps) {
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 30; // 5 minutes (10 seconds * 30)

    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const importStatus = await getImportStatus(importId);
        setStatus(importStatus);
        setError(null);

        // Check if import is completed or failed
        if (importStatus.status === 'completed' || importStatus.status === 'failed') {
          if (intervalId) {
            clearInterval(intervalId);
          }
          
          if (importStatus.status === 'completed' && onComplete) {
            onComplete();
          }
        }

        // Reset retry count on successful fetch
        retryCount = 0;
      } catch (err) {
        console.error("Error fetching import status:", err);
        retryCount++;
        
        if (retryCount >= MAX_RETRIES && intervalId) {
          clearInterval(intervalId);
          setError("Failed to get import status after multiple attempts. The import may still be processing.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling interval (every 10 seconds)
    intervalId = setInterval(fetchStatus, 10000);

    // Clean up interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [importId, onComplete]);

  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (!status) return 0;
    
    if (status.status === 'completed') return 100;
    if (status.totalRecords === 0) return 0;
    
    return Math.min(
      Math.round((status.processedRecords / status.totalRecords) * 100),
      99 // Cap at 99% until fully complete
    );
  };

  // Format errors for display
  const formatErrors = (): string => {
    if (!status || !status.errors || status.errors.length === 0) {
      return "No errors reported.";
    }
    
    return status.errors.join("\n");
  };

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error checking import status</span>
        </div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (isLoading && !status) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Initializing import...</span>
          <span>0%</span>
        </div>
        <Progress value={0} className="h-2" />
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const progressValue = calculateProgress();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2">
            {status.status === 'completed' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {status.status === 'failed' && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>
              {status.status === 'processing' && 'Processing import...'}
              {status.status === 'completed' && 'Import completed'}
              {status.status === 'failed' && 'Import failed'}
            </span>
          </div>
          <span>{progressValue}%</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>
      
      {status.totalRecords > 0 && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted p-2 rounded">
            <span className="text-muted-foreground">Total Records:</span>
            <span className="float-right font-medium">{status.totalRecords}</span>
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="text-muted-foreground">Processed:</span>
            <span className="float-right font-medium">{status.processedRecords}</span>
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="text-muted-foreground">Successful:</span>
            <span className="float-right font-medium text-green-600">{status.successfulRecords}</span>
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="text-muted-foreground">Failed:</span>
            <span className="float-right font-medium text-red-600">{status.failedRecords}</span>
          </div>
        </div>
      )}
      
      {status.status === 'failed' && status.errors && status.errors.length > 0 && (
        <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          <p className="font-medium mb-1">Errors:</p>
          <pre className="text-xs whitespace-pre-wrap">{formatErrors()}</pre>
        </div>
      )}
    </div>
  );
}
