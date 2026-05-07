import toast from 'react-hot-toast';

export async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 10000, 
  errorMessage: string = 'A operação demorou muito. Tente novamente.'
): Promise<T> {
  let timeoutId: any;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result as T;
  } catch (error: any) {
    if (error.message === 'TIMEOUT') {
      toast.error(errorMessage);
      console.error("[STABILITY_TIMEOUT]", errorMessage);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
