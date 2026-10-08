/** Settle only the form instance that initiated the request. */
export async function settleEnquiryResponse(
  request: () => Promise<Response>,
  isCurrent: () => boolean,
  onSuccess: () => void,
  onError: () => void,
): Promise<void> {
  try {
    const response = await request();
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error("Submission failed");
    if (isCurrent()) onSuccess();
  } catch {
    if (isCurrent()) onError();
  }
}
