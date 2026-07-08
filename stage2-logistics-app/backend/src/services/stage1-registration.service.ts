const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export async function registerWithStage1(): Promise<void> {
  const stage1BaseUrl = process.env.STAGE1_RAW_UPDATES_URL?.replace(
    "/raw-updates",
    "",
  );
  const logisticsWebhookUrl = `http://localhost:${process.env.PORT}/webhooks/packages`;
  const logisticsApiKey = process.env.STAGE1_RAW_UPDATES_API_KEY;

  if (!stage1BaseUrl || !logisticsApiKey) {
    console.error(
      "[Stage1 Registration] Missing STAGE1_RAW_UPDATES_URL or STAGE1_RAW_UPDATES_API_KEY",
    );
    return;
  }

  const registrationUrl = `${stage1BaseUrl}/integrations/logistics-webhook`;
  const payload = {
    logisticsWebhookUrl,
    logisticsApiKey,
    isActive: true,
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `[Stage1 Registration] Attempt ${attempt}/${MAX_RETRIES}: Registering with ${registrationUrl}`,
      );

      const response = await fetch(registrationUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${await response.text()}`,
        );
      }

      const data = await response.json();
      console.log("[Stage1 Registration] Success:", data);
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `[Stage1 Registration] Attempt ${attempt} failed: ${lastError.message}`,
      );

      if (attempt < MAX_RETRIES) {
        console.log(`[Stage1 Registration] Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  console.error(
    `[Stage1 Registration] Failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`,
  );
}
