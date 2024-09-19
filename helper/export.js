import fs from "fs";
import { unlink } from "fs/promises";
import fsExtra from "fs-extra";

const deployFolder = "../derkuba.github.io";

const main = async () => {
    try {
        await deleteFiles();
        await fsExtra.copy("./_site", deployFolder);
    } catch (error) {
        console.log("Something went wrong ", error);
    }
};

const deleteFiles = async () => {
    fs.readdirSync(deployFolder).forEach(async (file) => {
        if (file.startsWith("google") || file === "CNAME" || file === ".git") {
            return;
        }
        try {
            const fileWithPath = `${deployFolder}/${file}`;

            if (fs.statSync(fileWithPath).isDirectory()) {
                fs.rmdirSync(fileWithPath, { recursive: true });
            } else {
                await unlink(fileWithPath);
            }
        } catch (error) {
            console.log(error);
        }
    });
};

main();
