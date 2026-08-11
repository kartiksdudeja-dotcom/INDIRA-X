import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const checkSpoof = (
  image: string
): Promise<any> => {
  return new Promise((resolve, reject) => {

    const pythonPath = path.resolve(
      process.cwd(),
      "python",
      "anti_spoof.py"
    );

    console.log("Python File:", pythonPath);

    if (!fs.existsSync(pythonPath)) {
      reject(new Error(`Python file not found: ${pythonPath}`));
      return;
    }

    // Windows: py -3.11
    // Render/Linux: python3
    const pythonCommand =
      process.platform === "win32" ? "py" : "python3";

    const pythonArgs =
      process.platform === "win32"
        ? ["-3.11", pythonPath]
        : [pythonPath];

    console.log("Python Command:", pythonCommand);
    console.log("Python Args:", pythonArgs);

    const python = spawn(pythonCommand, pythonArgs);

    let output = "";
    let error = "";

    console.log("Sending image to Python...");
    console.log("Image length:", image?.length);

    python.stdin.write(
      JSON.stringify({
        image,
      })
    );

    python.stdin.end();

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    python.on("error", (err) => {
      console.error("Python spawn error:", err);
      reject(err);
    });

    python.on("close", (code) => {
      console.log("Python Exit Code:", code);
      console.log("Python Output:", output);
      console.log("Python Error:", error);

      if (code !== 0) {
        reject(
          new Error(
            error || `Python process exited with code ${code}`
          )
        );
        return;
      }

      try {
        const lines = output
          .trim()
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "");

        const jsonLine = lines[lines.length - 1];

        resolve(JSON.parse(jsonLine));
      } catch (err) {
        console.log("Raw Python Output:\n", output);
        reject(new Error("Invalid JSON returned from Python"));
      }
    });
  });
};