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

  // Try up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {

    try {

      console.log(`Anti-spoof attempt ${attempt}/3`);

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 120000);

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

      clearTimeout(timeout);

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

      // Python/Render returned an HTTP error
     if (!response.ok) {
  console.log(`Python service returned HTTP ${response.status}`);

  if (response.status === 429) {
    throw new Error(
      "Python anti-spoof service is temporarily rate limited (HTTP 429)"
    );
  }

  lastError = new Error(
    `Python service returned HTTP ${response.status}`
  );

  if (attempt < 3) {
    await new Promise(resolve =>
      setTimeout(resolve, 3000)
    );
  }

  continue;
}

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

    } catch (error: any) {

      console.error(
        `Anti-spoof attempt ${attempt} failed:`,
        error
      );

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