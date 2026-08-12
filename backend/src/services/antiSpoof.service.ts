export const checkSpoof = async (
  image: string
): Promise<any> => {
  try {
    const pythonUrl = process.env.ANTI_SPOOF_URL;

    if (!pythonUrl) {
      throw new Error(
        "ANTI_SPOOF_URL is not configured"
      );
    }

    console.log("===== ANTI SPOOF REQUEST =====");
    console.log("Python Service:", pythonUrl);
    console.log("Image exists:", !!image);
    console.log("Image length:", image?.length);

    const response = await fetch(
      `${pythonUrl}/anti-spoof`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
        }),
      }
    );

    const responseText = await response.text();

    console.log(
      "Python Status:",
      response.status
    );

    console.log(
      "Python Response:",
      responseText
    );

    let result: any;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Invalid response from Python: ${responseText}`
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
        `Python service returned ${response.status}`
      );
    }

    return result;

  } catch (error: any) {

    console.error(
      "Anti-spoof request failed:",
      error
    );

    throw new Error(
      error?.message ||
      "Unable to connect to anti-spoof service"
    );
  }
};