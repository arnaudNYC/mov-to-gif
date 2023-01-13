#!/usr/bin/env node
import { promisify } from "util";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);
const [input] = process.argv.slice(2);

if (!input || !fs.existsSync(input)) {
  console.error("Usage: mov_to_gif <input.mov>");
  process.exit(-1);
}

function rm(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

(async () => {
  try {
    await execAsync("ffmpeg -version");
  } catch (err) {
    console.error("ffmpeg not installed or missing from path");
    console.error("Download ffmpeg from https://ffmpeg.org");
  }

  const inputPath = path.resolve(input);
  const outputPath =
    inputPath.indexOf(".") === -1
      ? `${inputPath}.gif`
      : `${inputPath.slice(0, inputPath.indexOf("."))}.gif`;

  console.log(`Converting ${inputPath} to ${outputPath}`);
  try {
    rm("./palette.png");
    rm(outputPath);
    const interval = setInterval(() => {
      process.stdout.write(".");
    }, 200);
    await execAsync(
      `ffmpeg -y -i ${inputPath} -vf fps=10,scale=1024:-1:flags=lanczos,palettegen palette.png`
    );
    await execAsync(
      `ffmpeg -i ${inputPath} -i palette.png -filter_complex "fps=10,scale=1024:-1:flags=lanczos[x];[x][1:v]paletteuse" ${outputPath}`
    );
    rm("./palette.png");
    clearInterval(interval);
    console.log(`\nCompleted ${outputPath}`);
  } catch (error) {
    console.error(error);
  }
})();
