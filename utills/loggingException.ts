import { BACKEND_URL } from '@/lib/constants';

interface ErrorLogData {
  Module: string;
  Log_User: string;
  Error_Line_No: string;
  Error_MSG: string;
  Error_Type: string;
  Error_Location: string;
  User_Host_IP: string;
  Application_Type: string;
}

export async function logError(errorMessageFromClient: string, error: Error | string, module: string, user: string): Promise<void> {
  try {
    // Determine error details based on the type of error
    let errorMessage: string;
    let errorType: string;
    let errorStack: string = '';
    let errorLineNo: string = 'Unknown';
    let errorLocation: string = 'Unknown';

    if (typeof error === 'string') {
      errorMessage = error;
      errorType = 'StringError';
    } else {
      errorMessage = error.message;
      errorType = error.name || error.constructor.name;
      errorStack = error.stack || '';

      // Extract line number from stack trace
      const lineMatch: RegExpMatchArray | null = errorStack.match(/:(\d+):\d+\)?$/m);
      errorLineNo = lineMatch ? lineMatch[1] : 'Unknown';

      // Get location (file path) from stack trace
      const locationMatch: RegExpMatchArray | null = errorStack.match(/\((.*?):\d+:\d+\)/);
      errorLocation = locationMatch ? locationMatch[1] : 'Unknown';
    }

    // Get client IP (Note: this will be the server's IP in SSR)
    const hostIp: string = await fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then((data: { ip: string }) => data.ip)
      .catch(() => 'Unknown');

    const logData: ErrorLogData = {
      Module: module,
      Log_User: user,
      Error_Line_No: errorLineNo,
      Error_MSG: errorMessageFromClient,
      Error_Type: errorType,
      Error_Location: errorLocation,
      User_Host_IP: hostIp,
      Application_Type: 'Web'
    };

    // Send log data to backend
    const response: Response = await fetch(`${BACKEND_URL}/api/logging/insert-exception`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      console.error('Failed to log error:', await response.text());
    }
  } catch (loggingError) {
    console.error('Error in error logging:', loggingError);
  }
}
