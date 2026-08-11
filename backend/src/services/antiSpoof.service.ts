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
  throw new Error(`Python file not found: ${pythonPath}`);
}

    const python = spawn("py", [
      "-3.11",
      pythonPath,
    ]);

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
      reject(err);
    });

    python.on("close", (code) => {

      console.log("Python Exit Code:", code);
      console.log("Python Output:", output);
      console.log("Python Error:", error);

      if (code !== 0) {
        reject(new Error(error));
        return;
      }

      try {
  const lines = output
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  // Last line should be the JSON
  const jsonLine = lines[lines.length - 1];

  resolve(JSON.parse(jsonLine));
} catch (err) {
  console.log("Raw Python Output:\n", output);
  reject(new Error("Invalid JSON returned from Python"));
}

    });

  });
};