import fs from "fs/promises";
import fsExtra from "fs-extra";
import path from "path";

const deployFolder = "../derkuba.github.io";

const main = async () => {
    try {
        console.log("Starting export process...");
        await deleteFiles();
        console.log("Copying _site to deployment folder...");
        await fsExtra.copy("./_site", deployFolder);
        console.log("Export completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Export failed:", error);
        process.exit(1);
    }
};

const deleteFiles = async () => {
    const files = await fs.readdir(deployFolder);
    const preservedFiles = ["google", "CNAME", ".git"];

    const deletePromises = files
        .filter((file) => {
            return !preservedFiles.some((preserved) =>
                file.startsWith(preserved) || file === preserved
            );
        })
        .map(async (file) => {
            const fileWithPath = path.join(deployFolder, file);
            try {
                const stats = await fs.stat(fileWithPath);
                if (stats.isDirectory()) {
                    await fs.rm(fileWithPath, { recursive: true, force: true });
                    console.log(`Deleted directory: ${file}`);
                } else {
                    await fs.unlink(fileWithPath);
                    console.log(`Deleted file: ${file}`);
                }
            } catch (error) {
                console.error(`Failed to delete ${file}:`, error.message);
                throw error;
            }
        });

    await Promise.all(deletePromises);
};

main();
