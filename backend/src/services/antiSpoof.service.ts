export const checkSpoof = async (
  image: string
): Promise<any> => {

  const pythonUrl = process.env.ANTI_SPOOF_URL;

  if (!pythonUrl) {
    throw new Error("ANTI_SPOOF_URL is not configured");
  }

  const url = `${pythonUrl.replace(/\/$/, "")}/anti-spoof`;

  console.log("========== ANTI SPOOF REQUEST ==========");
  console.log("Python URL:", url);
  console.log("Image exists:", !!image);
  console.log("Image length:", image?.length);

  let lastError: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {

    try {

      console.log(`Anti-spoof attempt ${attempt}/3`);

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 120000);

      try {

        const response = await fetch(url, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            image,
          }),

          signal: controller.signal,
        });

        const responseText = await response.text();

        console.log(
          "Python Status:",
          response.status
        );

        console.log(
          "Python Content-Type:",
          response.headers.get("content-type")
        );

        console.log(
          "Python Response:",
          responseText.substring(0, 1000)
        );

        // ============================
        // HTTP 429
        // ============================

        if (response.status === 429) {

          console.error(
            "🚨 Python service returned HTTP 429"
          );

          throw new Error(
            "Python anti-spoof service is temporarily rate limited (HTTP 429)"
          );
        }

        // ============================
        // Other HTTP errors
        // ============================

        if (!response.ok) {

          lastError = new Error(
            `Python service returned HTTP ${response.status}`
          );

          console.log(
            `Attempt ${attempt} failed`
          );

          if (attempt < 3) {

            await new Promise(resolve =>
              setTimeout(resolve, 3000)
            );

          }

          continue;
        }

        // ============================
        // Parse JSON
        // ============================

        let result: any;

        try {

          result = JSON.parse(responseText);

        } catch {

          lastError = new Error(
            "Python returned an invalid JSON response"
          );

          if (attempt < 3) {

            await new Promise(resolve =>
              setTimeout(resolve, 3000)
            );

          }

          continue;
        }

        console.log(
          "Anti-spoof result:",
          result
        );

        return result;

      } finally {

        clearTimeout(timeout);

      }

    } catch (error: any) {

      console.error(
        `Anti-spoof attempt ${attempt} failed:`,
        error
      );

      // =================================
      // IMPORTANT:
      // NEVER retry HTTP 429
      // =================================

      if (
        error?.message?.includes("HTTP 429")
      ) {

        throw error;
      }

      lastError = error;

      if (attempt < 3) {

        await new Promise(resolve =>
          setTimeout(resolve, 3000)
        );

      }
    }
  }

  throw new Error(
    lastError?.message ||
    "Unable to connect to anti-spoof service"
  );
};